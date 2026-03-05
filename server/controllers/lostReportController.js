import { supabase } from '../lib/supabase.js'

// ─────────────────────────────────────
// POST /api/lost-reports/check-matches
// Student: check for similar reports & inventory matches
// before submitting a new report
// ─────────────────────────────────────
export const checkMatches = async (req, res) => {
    const { itemName, categoryId } = req.body

    if (!itemName || itemName.trim().length < 3) {
        return res.json({ similarReports: [], inventoryMatches: [] })
    }

    // Split item name into keywords (ignore short words like "a", "my", "the")
    const stopWords = new Set(['a', 'an', 'the', 'my', 'is', 'of', 'in', 'at', 'to', 'for', 'and', 'or'])
    const keywords = itemName
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length >= 2 && !stopWords.has(w))

    if (keywords.length === 0) {
        return res.json({ similarReports: [], inventoryMatches: [] })
    }

    // Build OR filter: item_name matches ANY keyword
    const ilikeFilters = keywords.map(kw => `item_name.ilike.%${kw}%`).join(',')

    try {
        // 1. Check similar lost reports (status = REPORTED, not by this user)
        let reportQuery = supabase
            .from('lost_reports')
            .select('id, item_name, lost_location, created_at, category:categories(name, icon)')
            .eq('status', 'REPORTED')
            .neq('reported_by', req.user.id)
            .or(ilikeFilters)
            .order('created_at', { ascending: false })
            .limit(5)

        if (categoryId) {
            reportQuery = reportQuery.eq('category_id', categoryId)
        }

        // 2. Check inventory matches (status = AVAILABLE)
        let inventoryQuery = supabase
            .from('found_items')
            .select('id, item_name, found_location, image_url, date_found, category:categories(name, icon)')
            .eq('status', 'AVAILABLE')
            .or(ilikeFilters)
            .order('created_at', { ascending: false })
            .limit(5)

        if (categoryId) {
            inventoryQuery = inventoryQuery.eq('category_id', categoryId)
        }

        // Run both queries in parallel
        const [reportResult, inventoryResult] = await Promise.all([reportQuery, inventoryQuery])

        res.json({
            similarReports: reportResult.data || [],
            inventoryMatches: inventoryResult.data || [],
        })
    } catch (err) {
        console.error('checkMatches error:', err)
        res.json({ similarReports: [], inventoryMatches: [] })
    }
}

// ─────────────────────────────────────
// POST /api/lost-reports
// Student submits a lost item report
// ─────────────────────────────────────
export const createLostReport = async (req, res) => {
    const { itemName, categoryId, description, lostLocation, locationId, lostDatetime, imageUrl } = req.body
    const userId = req.user.id

    if (!itemName || !lostLocation || !lostDatetime) {
        return res.status(400).json({ message: 'Item name, location, and date/time are required' })
    }

    const { data, error } = await supabase
        .from('lost_reports')
        .insert({
            item_name: itemName,
            category_id: categoryId || null,
            description: description || null,
            lost_location: lostLocation,
            location_id: locationId || null,
            lost_datetime: lostDatetime,
            image_url: imageUrl || null,
            reported_by: userId,
            status: 'REPORTED',
        })
        .select(`
      *,
      category:categories(name, icon),
      reporter:profiles!reported_by(full_name, student_id)
    `)
        .single()

    if (error) {
        console.error('createLostReport error:', error)
        return res.status(500).json({ message: 'Failed to submit report' })
    }

    // Log activity
    await supabase.from('activity_logs').insert({
        action: 'LOST_REPORT_SUBMITTED',
        performed_by: userId,
        target_id: data.id,
        target_type: 'lost_report',
        metadata: { item_name: itemName },
    })

    res.status(201).json({ message: 'Report submitted successfully', report: data })
}

// ─────────────────────────────────────
// GET /api/lost-reports
// Authority/Admin: view ALL reports
// ─────────────────────────────────────
export const getAllLostReports = async (req, res) => {
    const { status, search } = req.query

    let query = supabase
        .from('lost_reports')
        .select(`
      *,
      category:categories(name, icon),
      reporter:profiles!reported_by(full_name, student_id, email)
    `)
        .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (search) query = query.ilike('item_name', `%${search}%`)

    const { data, error } = await query

    if (error) {
        console.error('getAllLostReports error:', error)
        return res.status(500).json({ message: 'Failed to fetch reports' })
    }

    res.json({ reports: data, total: data.length })
}

// ─────────────────────────────────────
// GET /api/lost-reports/mine
// Student: view only their own reports
// ─────────────────────────────────────
export const getMyLostReports = async (req, res) => {
    const userId = req.user.id

    const { data, error } = await supabase
        .from('lost_reports')
        .select(`
      *,
      category:categories(name, icon)
    `)
        .eq('reported_by', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('getMyLostReports error:', error)
        return res.status(500).json({ message: 'Failed to fetch your reports' })
    }

    res.json({ reports: data })
}

// ─────────────────────────────────────
// GET /api/lost-reports/:id
// Get single report detail
// ─────────────────────────────────────
export const getLostReportById = async (req, res) => {
    const { id } = req.params

    const { data, error } = await supabase
        .from('lost_reports')
        .select(`
      *,
      category:categories(name, icon),
      reporter:profiles!reported_by(full_name, student_id, email)
    `)
        .eq('id', id)
        .single()

    if (error || !data) {
        return res.status(404).json({ message: 'Report not found' })
    }

    // Students can only see their own
    if (req.user.role === 'student' && data.reported_by !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' })
    }

    res.json({ report: data })
}

// ─────────────────────────────────────
// PATCH /api/lost-reports/:id/close  (student closes their own)
// ─────────────────────────────────────
export const closeLostReportByStudent = async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    // Verify ownership
    const { data: report } = await supabase
        .from('lost_reports')
        .select('id, reported_by, status')
        .eq('id', id)
        .single()

    if (!report) return res.status(404).json({ message: 'Report not found' })
    if (report.reported_by !== userId) return res.status(403).json({ message: 'Access denied' })
    if (report.status === 'CLOSED') return res.status(400).json({ message: 'Report already closed' })

    const { data, error } = await supabase
        .from('lost_reports')
        .update({ status: 'CLOSED', closed_by: userId })
        .eq('id', id)
        .select()
        .single()

    if (error) return res.status(500).json({ message: 'Failed to close report' })

    await supabase.from('activity_logs').insert({
        action: 'LOST_REPORT_CLOSED_BY_STUDENT',
        performed_by: userId,
        target_id: id,
        target_type: 'lost_report',
    })

    res.json({ message: 'Report closed successfully', report: data })
}

// ─────────────────────────────────────
// PATCH /api/lost-reports/:id/status  (authority changes status)
// Body: { status: 'CLOSED' | 'REJECTED', notes: '...' }
// ─────────────────────────────────────
export const updateLostReportStatus = async (req, res) => {
    const { id } = req.params
    const { status, notes } = req.body
    const userId = req.user.id

    if (!['CLOSED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: 'Status must be CLOSED or REJECTED' })
    }

    const { data: existing } = await supabase
        .from('lost_reports')
        .select('id, status')
        .eq('id', id)
        .single()

    if (!existing) return res.status(404).json({ message: 'Report not found' })
    if (existing.status !== 'REPORTED') {
        return res.status(400).json({ message: `Report is already ${existing.status}` })
    }

    const { data, error } = await supabase
        .from('lost_reports')
        .update({ status, closed_by: userId, notes: notes || null })
        .eq('id', id)
        .select(`
      *,
      category:categories(name, icon),
      reporter:profiles!reported_by(full_name, student_id, email)
    `)
        .single()

    if (error) return res.status(500).json({ message: 'Failed to update status' })

    await supabase.from('activity_logs').insert({
        action: `LOST_REPORT_${status}`,
        performed_by: userId,
        target_id: id,
        target_type: 'lost_report',
        metadata: { old_status: 'REPORTED', new_status: status, notes },
    })

    res.json({ message: `Report ${status.toLowerCase()} successfully`, report: data })
}

// ─────────────────────────────────────
// DELETE /api/lost-reports/:id  (admin only)
// ─────────────────────────────────────
export const deleteLostReport = async (req, res) => {
    const { id } = req.params

    // 1. Get report to find image URL
    const { data: report, error: fetchError } = await supabase
        .from('lost_reports')
        .select('item_name, image_url')
        .eq('id', id)
        .single()

    if (fetchError || !report) return res.status(404).json({ message: 'Report not found' })

    // 2. Cleanup storage
    if (report.image_url) {
        const fileName = report.image_url.split('/').pop()
        await supabase.storage.from('item-images').remove([fileName])
    }

    // 3. Delete from DB
    const { error } = await supabase
        .from('lost_reports')
        .delete()
        .eq('id', id)

    if (error) return res.status(500).json({ message: 'Failed to delete report' })

    await supabase.from('activity_logs').insert({
        action: 'LOST_REPORT_DELETED',
        performed_by: req.user.id,
        target_id: id,
        target_type: 'lost_report',
        metadata: { item_name: report.item_name },
    })

    res.json({ message: 'Report deleted and storage cleared' })
}
