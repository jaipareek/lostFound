import { supabase } from '../lib/supabase.js'

// ─────────────────────────────────────
// POST /api/claims
// Student: submit a claim for a found item
// Also auto-detects disputes (2+ claims on same item)
// ─────────────────────────────────────
export const submitClaim = async (req, res) => {
    const { foundItemId, uniqueMarks, ownershipProof, extraDetails, proofImageUrl } = req.body
    const userId = req.user.id

    if (!foundItemId || !uniqueMarks || !ownershipProof) {
        return res.status(400).json({ message: 'Found item ID, unique marks, and ownership proof are required' })
    }

    // Verify item exists and is AVAILABLE
    const { data: item } = await supabase
        .from('found_items')
        .select('id, status')
        .eq('id', foundItemId)
        .single()

    if (!item) return res.status(404).json({ message: 'Found item not found' })
    if (item.status !== 'AVAILABLE') return res.status(400).json({ message: 'This item is no longer available for claiming' })

    // Insert claim (unique constraint: one claim per student per item)
    const { data: claim, error } = await supabase
        .from('claims')
        .insert({
            found_item_id: foundItemId,
            claimed_by: userId,
            unique_marks: uniqueMarks,
            ownership_proof: ownershipProof,
            extra_details: extraDetails || null,
            proof_image_url: proofImageUrl || null,
            status: 'PENDING',
        })
        .select(`
      *,
      claimant:profiles!claimed_by(full_name, student_id, email)
    `)
        .single()

    if (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'You have already submitted a claim for this item' })
        }
        console.error('submitClaim error:', error)
        return res.status(500).json({ message: 'Failed to submit claim' })
    }

    // ── Dispute auto-detection ──
    const { count } = await supabase
        .from('claims')
        .select('id', { count: 'exact', head: true })
        .eq('found_item_id', foundItemId)
        .eq('status', 'PENDING')

    if (count >= 2) {
        // Upsert dispute record (unique constraint on found_item_id)
        await supabase
            .from('disputes')
            .upsert({ found_item_id: foundItemId, status: 'OPEN' }, { onConflict: 'found_item_id' })
    }

    await supabase.from('activity_logs').insert({
        action: 'CLAIM_SUBMITTED',
        performed_by: userId,
        target_id: foundItemId,
        target_type: 'claim',
        metadata: { claim_id: claim.id, dispute_flagged: count >= 2 },
    })

    res.status(201).json({
        message: 'Claim submitted successfully',
        claim,
        disputeFlagged: count >= 2,
    })
}

// ─────────────────────────────────────
// GET /api/claims/mine
// Student: view all their own claims
// ─────────────────────────────────────
export const getMyClaims = async (req, res) => {
    const { data, error } = await supabase
        .from('claims')
        .select(`
      *,
      found_item:found_items(item_name, image_url, status, found_location)
    `)
        .eq('claimed_by', req.user.id)
        .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ message: 'Failed to fetch claims' })

    // Fetch activity_logs for these claims where action is 'CLAIM_INFO_REQUESTED'
    const claimIds = data.map(c => c.id)
    let infoRequestedLogs = []

    if (claimIds.length > 0) {
        const { data: logs } = await supabase
            .from('activity_logs')
            .select('target_id, action')
            .in('target_id', claimIds)
            .eq('action', 'CLAIM_INFO_REQUESTED')
            .eq('target_type', 'claim')

        if (logs) {
            infoRequestedLogs = logs
        }
    }

    // Add info_requested flag
    const formattedClaims = data.map(claim => {
        const hasInfoRequest = infoRequestedLogs.some(log => log.target_id === claim.id)
        return {
            ...claim,
            info_requested: hasInfoRequest
        }
    })

    res.json({ claims: formattedClaims })
}

// ─────────────────────────────────────
// PUT /api/claims/:id
// Student: update their own pending claim
// ─────────────────────────────────────
export const updateClaim = async (req, res) => {
    const { id } = req.params
    const { uniqueMarks, ownershipProof, extraDetails, proofImageUrl } = req.body
    const userId = req.user.id

    // Check if claim exists and belongs to user
    const { data: claim, error: fetchError } = await supabase
        .from('claims')
        .select('id, claimed_by, status, found_item_id')
        .eq('id', id)
        .single()

    if (fetchError || !claim) return res.status(404).json({ message: 'Claim not found' })
    if (claim.claimed_by !== userId) return res.status(403).json({ message: 'Not authorized to edit this claim' })
    if (claim.status !== 'PENDING') return res.status(400).json({ message: `Cannot edit a claim that is ${claim.status}` })

    // Update claim
    const updateData = {
        unique_marks: uniqueMarks !== undefined ? uniqueMarks : claim.unique_marks,
        ownership_proof: ownershipProof !== undefined ? ownershipProof : claim.ownership_proof,
        extra_details: extraDetails !== undefined ? extraDetails : claim.extra_details,
        proof_image_url: proofImageUrl !== undefined ? proofImageUrl : claim.proof_image_url
    }

    const { data: updatedClaim, error: updateError } = await supabase
        .from('claims')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (updateError) {
        console.error('updateClaim error:', updateError)
        return res.status(500).json({ message: 'Failed to update claim' })
    }

    // Delete any 'CLAIM_INFO_REQUESTED' logs for this claim so it doesn't stay flagged
    await supabase.from('activity_logs')
        .delete()
        .eq('target_type', 'claim')
        .eq('target_id', id)
        .eq('action', 'CLAIM_INFO_REQUESTED')

    await supabase.from('activity_logs').insert({
        action: 'CLAIM_UPDATED',
        performed_by: userId,
        target_id: claim.found_item_id,
        target_type: 'claim',
        metadata: { claim_id: id }
    })

    res.json({ message: 'Claim updated successfully', claim: updatedClaim })
}

// ─────────────────────────────────────
// GET /api/claims/:foundItemId
// Authority: view all claims for a specific found item
// ─────────────────────────────────────
export const getClaimsForItem = async (req, res) => {
    const { foundItemId } = req.params

    const { data, error } = await supabase
        .from('claims')
        .select(`
      *,
      claimant:profiles!claimed_by(full_name, student_id, email)
    `)
        .eq('found_item_id', foundItemId)
        .order('created_at', { ascending: true })

    if (error) return res.status(500).json({ message: 'Failed to fetch claims' })
    res.json({ claims: data, total: data.length })
}

// ─────────────────────────────────────
// PATCH /api/claims/:id/approve
// Authority: approve one claim →
//   - Mark found item CLOSED
//   - Reject all other claims for same item
//   - Resolve dispute if open
// ─────────────────────────────────────
export const approveClaim = async (req, res) => {
    const { id } = req.params
    const reviewerId = req.user.id

    // Get claim details
    const { data: claim } = await supabase
        .from('claims')
        .select('id, found_item_id, claimed_by, status')
        .eq('id', id)
        .single()

    if (!claim) return res.status(404).json({ message: 'Claim not found' })
    if (claim.status !== 'PENDING') {
        return res.status(400).json({ message: `Claim is already ${claim.status}` })
    }

    // 1. Approve this claim
    await supabase
        .from('claims')
        .update({ status: 'APPROVED', reviewed_by: reviewerId })
        .eq('id', id)

    // 2. Reject all other PENDING claims for the same item
    await supabase
        .from('claims')
        .update({ status: 'REJECTED', reviewed_by: reviewerId })
        .eq('found_item_id', claim.found_item_id)
        .eq('status', 'PENDING')
        .neq('id', id)

    // 3. Mark found item as CLOSED
    await supabase
        .from('found_items')
        .update({ status: 'CLOSED', closed_at: new Date().toISOString() })
        .eq('id', claim.found_item_id)

    // 4. Resolve dispute if one exists
    await supabase
        .from('disputes')
        .update({
            status: 'RESOLVED',
            resolved_by: reviewerId,
            winning_claim_id: id,
            resolved_at: new Date().toISOString(),
        })
        .eq('found_item_id', claim.found_item_id)
        .eq('status', 'OPEN')

    await supabase.from('activity_logs').insert({
        action: 'CLAIM_APPROVED',
        performed_by: reviewerId,
        target_id: claim.found_item_id,
        target_type: 'claim',
        metadata: { winning_claim_id: id, claimant_id: claim.claimed_by },
    })

    // ─── NOTIFICATIONS ───
    // Get item name for the notification message
    const { data: foundItem } = await supabase
        .from('found_items')
        .select('item_name')
        .eq('id', claim.found_item_id)
        .single()
    const itemName = foundItem?.item_name || 'an item'

    // Notify the approved claimant
    await supabase.from('notifications').insert({
        user_id: claim.claimed_by,
        type: 'CLAIM_APPROVED',
        title: '🎉 Claim Approved!',
        message: `Your claim for "${itemName}" has been approved! Please visit the Lost & Found office to collect your item.`,
        metadata: { claim_id: id, found_item_id: claim.found_item_id },
    })

    // Notify auto-rejected claimants
    const { data: rejectedClaims } = await supabase
        .from('claims')
        .select('claimed_by')
        .eq('found_item_id', claim.found_item_id)
        .eq('status', 'REJECTED')
        .neq('id', id)

    if (rejectedClaims?.length > 0) {
        const rejectNotifs = rejectedClaims.map(rc => ({
            user_id: rc.claimed_by,
            type: 'CLAIM_REJECTED',
            title: '❌ Claim Rejected',
            message: `Your claim for "${itemName}" was not approved. The item has been claimed by another student.`,
            metadata: { claim_id: id, found_item_id: claim.found_item_id },
        }))
        await supabase.from('notifications').insert(rejectNotifs)
    }

    res.json({ message: 'Claim approved. Item marked as CLOSED and other claims rejected.' })
}

// ─────────────────────────────────────
// PATCH /api/claims/:id/reject
// Authority: reject a single claim
// ─────────────────────────────────────
export const rejectClaim = async (req, res) => {
    const { id } = req.params

    const { data: claim } = await supabase
        .from('claims')
        .select('id, status')
        .eq('id', id)
        .single()

    if (!claim) return res.status(404).json({ message: 'Claim not found' })
    if (claim.status !== 'PENDING') {
        return res.status(400).json({ message: `Claim is already ${claim.status}` })
    }

    const { data, error } = await supabase
        .from('claims')
        .update({ status: 'REJECTED', reviewed_by: req.user.id })
        .eq('id', id)
        .select()
        .single()

    if (error) return res.status(500).json({ message: 'Failed to reject claim' })

    await supabase.from('activity_logs').insert({
        action: 'CLAIM_REJECTED',
        performed_by: req.user.id,
        target_id: id,
        target_type: 'claim',
    })

    // ─── NOTIFICATION ───
    const { data: claimDetail } = await supabase
        .from('claims')
        .select('claimed_by, found_item_id, found_item:found_items(item_name)')
        .eq('id', id)
        .single()

    if (claimDetail) {
        await supabase.from('notifications').insert({
            user_id: claimDetail.claimed_by,
            type: 'CLAIM_REJECTED',
            title: '❌ Claim Rejected',
            message: `Your claim for "${claimDetail.found_item?.item_name || 'an item'}" has been rejected by the authority.`,
            metadata: { claim_id: id, found_item_id: claimDetail.found_item_id },
        })

        // ─── AUTO-RESOLVE DISPUTE if no PENDING claims remain ───
        const { count } = await supabase
            .from('claims')
            .select('id', { count: 'exact', head: true })
            .eq('found_item_id', claimDetail.found_item_id)
            .eq('status', 'PENDING')

        if (count === 0) {
            await supabase
                .from('disputes')
                .update({
                    status: 'RESOLVED',
                    resolved_by: req.user.id,
                    resolved_at: new Date().toISOString(),
                })
                .eq('found_item_id', claimDetail.found_item_id)
                .eq('status', 'OPEN')
        }
    }

    res.json({ message: 'Claim rejected', claim: data })
}

// ─────────────────────────────────────
// PATCH /api/claims/:id/request-info
// Authority: request more info for a single claim
// ─────────────────────────────────────
export const requestMoreInfo = async (req, res) => {
    const { id } = req.params

    const { data: claim } = await supabase
        .from('claims')
        .select('id, status')
        .eq('id', id)
        .single()

    if (!claim) return res.status(404).json({ message: 'Claim not found' })
    if (claim.status !== 'PENDING') {
        return res.status(400).json({ message: `Claim is already ${claim.status}` })
    }

    // We keep status as PENDING, but create an Activity Log that acts as the flag
    await supabase.from('activity_logs').insert({
        action: 'CLAIM_INFO_REQUESTED',
        performed_by: req.user.id,
        target_id: id,
        target_type: 'claim',
    })

    // ─── NOTIFICATION ───
    const { data: claimDetail } = await supabase
        .from('claims')
        .select('claimed_by, found_item_id, found_item:found_items(item_name)')
        .eq('id', id)
        .single()

    if (claimDetail) {
        await supabase.from('notifications').insert({
            user_id: claimDetail.claimed_by,
            type: 'CLAIM_INFO_REQUESTED',
            title: 'ℹ️ More Info Requested',
            message: `The authority needs more information about your claim for "${claimDetail.found_item?.item_name || 'an item'}". Please update your claim with additional details.`,
            metadata: { claim_id: id, found_item_id: claimDetail.found_item_id },
        })
    }

    res.json({ message: 'Requested additional information. The student has been notified.', claim })
}

// ─────────────────────────────────────
// GET /api/disputes
// Authority: view all open disputes
// ─────────────────────────────────────
export const getAllDisputes = async (req, res) => {
    const { data, error } = await supabase
        .from('disputes')
        .select(`
      *,
      found_item:found_items(
        id, item_name, image_url, found_location, storage_location,
        claims:claims(
          id, unique_marks, ownership_proof, extra_details, status, created_at,
          claimant:profiles!claimed_by(full_name, student_id, email)
        )
      )
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('getAllDisputes error:', error)
        return res.status(500).json({ message: 'Failed to fetch disputes' })
    }

    // Flatten claims from nested found_item for frontend compatibility
    const formatted = data.map(dispute => ({
        ...dispute,
        claims: dispute.found_item?.claims || []
    }))

    res.json({ disputes: formatted, total: formatted.length })
}
// ─────────────────────────────────────
// GET /api/claims/requests (Authority)
// Fetches items that have at least one PENDING claim
// ─────────────────────────────────────
export const getPendingClaimsGrouped = async (req, res) => {
    // 1. Get all found_items IDs that have PENDING claims
    const { data: itemsWithPending } = await supabase
        .from('claims')
        .select('found_item_id')
        .in('status', ['PENDING'])

    if (!itemsWithPending || itemsWithPending.length === 0) {
        return res.json({ items: [] })
    }

    const itemIds = [...new Set(itemsWithPending.map(c => c.found_item_id))]

    // 2. Fetch those items with their PENDING claims
    const { data, error } = await supabase
        .from('found_items')
        .select(`
            *,
            category:categories(name, icon),
            claims:claims(
                id, unique_marks, ownership_proof, extra_details, proof_image_url, status, created_at,
                claimant:profiles!claimed_by(full_name, student_id, email)
            )
        `)
        .in('id', itemIds)
        .in('claims.status', ['PENDING']) // This filters the nested claims!
        .order('created_at', { ascending: false })

    if (error) {
        console.error('getPendingClaimsGrouped error:', error)
        return res.status(500).json({ message: 'Failed to fetch claim requests' })
    }

    // Collect all claim IDs across all items
    const allClaimIds = []
    data.forEach(item => {
        if (item.claims) {
            item.claims.forEach(c => allClaimIds.push(c.id))
        }
    })

    let infoRequestedLogs = []
    if (allClaimIds.length > 0) {
        const { data: logs } = await supabase
            .from('activity_logs')
            .select('target_id, action')
            .in('target_id', allClaimIds)
            .eq('action', 'CLAIM_INFO_REQUESTED')
            .eq('target_type', 'claim')

        if (logs) {
            infoRequestedLogs = logs
        }
    }

    // Process nested claims to add info_requested flag
    const formattedData = data.map(item => {
        return {
            ...item,
            claims: item.claims ? item.claims.map(claim => {
                const hasInfoRequest = infoRequestedLogs.some(log => log.target_id === claim.id)
                return {
                    ...claim,
                    info_requested: hasInfoRequest
                }
            }) : []
        }
    })

    res.json({ items: formattedData })
}
