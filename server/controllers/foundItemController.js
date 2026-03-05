import { supabase } from '../lib/supabase.js'

// ─────────────────────────────────────
// POST /api/found-items/check-matches
// Authority: check lost reports for matching items
// before adding a new found item to inventory
// ─────────────────────────────────────
export const checkLostReportMatches = async (req, res) => {
    const { itemName, categoryId } = req.body

    if (!itemName || itemName.trim().length < 3) {
        return res.json({ matchingReports: [] })
    }

    const stopWords = new Set(['a', 'an', 'the', 'my', 'is', 'of', 'in', 'at', 'to', 'for', 'and', 'or'])
    const keywords = itemName
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length >= 2 && !stopWords.has(w))

    if (keywords.length === 0) {
        return res.json({ matchingReports: [] })
    }

    const ilikeFilters = keywords.map(kw => `item_name.ilike.%${kw}%`).join(',')

    try {
        let query = supabase
            .from('lost_reports')
            .select('id, item_name, lost_location, lost_datetime, created_at, description, category:categories(name, icon), reporter:profiles!reported_by(full_name, student_id)')
            .eq('status', 'REPORTED')
            .or(ilikeFilters)
            .order('created_at', { ascending: false })
            .limit(5)

        if (categoryId) {
            query = query.eq('category_id', categoryId)
        }

        const { data, error } = await query

        if (error) {
            console.error('checkLostReportMatches error:', error)
            return res.json({ matchingReports: [] })
        }

        res.json({ matchingReports: data || [] })
    } catch (err) {
        console.error('checkLostReportMatches error:', err)
        res.json({ matchingReports: [] })
    }
}

// ─────────────────────────────────────
// POST /api/found-items
// Authority: add a found item to inventory
// ─────────────────────────────────────
export const createFoundItem = async (req, res) => {
    const { itemName, categoryId, description, foundLocation, locationId, dateFound, imageUrl, storageLocation } = req.body
    const userId = req.user.id

    if (!itemName || !foundLocation || !dateFound) {
        return res.status(400).json({ message: 'Item name, found location, and date found are required' })
    }

    const { data, error } = await supabase
        .from('found_items')
        .insert({
            item_name: itemName,
            category_id: categoryId || null,
            description: description || null,
            found_location: foundLocation,
            location_id: locationId || null,
            date_found: dateFound,
            image_url: imageUrl || null,
            storage_location: storageLocation || null,
            status: 'AVAILABLE',
            added_by: userId,
        })
        .select(`
      *,
      category:categories(name, icon),
      added_by_profile:profiles!added_by(full_name)
    `)
        .single()

    if (error) {
        console.error('createFoundItem error:', error)
        return res.status(500).json({ message: 'Failed to add item' })
    }

    await supabase.from('activity_logs').insert({
        action: 'FOUND_ITEM_ADDED',
        performed_by: userId,
        target_id: data.id,
        target_type: 'found_item',
        metadata: { item_name: itemName },
    })

    res.status(201).json({ message: 'Item added to inventory', item: data })
}

// ─────────────────────────────────────
// GET /api/found-items
// All authenticated users: view inventory
// Supports ?status= ?search= ?categoryId=
// ─────────────────────────────────────
export const getAllFoundItems = async (req, res) => {
    const { status, search, categoryId, locationId } = req.query

    let query = supabase
        .from('found_items')
        .select(`
      *,
      category:categories(name, icon),
      location:locations(name, icon)
    `)
        .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (categoryId) query = query.eq('category_id', categoryId)
    if (locationId) query = query.eq('location_id', locationId)
    if (search) query = query.ilike('item_name', `%${search}%`)

    const { data, error } = await query

    if (error) {
        console.error('getAllFoundItems error:', error)
        return res.status(500).json({ message: 'Failed to fetch inventory' })
    }

    res.json({ items: data, total: data.length })
}

// ─────────────────────────────────────
// GET /api/found-items/:id
// Single item detail
// ─────────────────────────────────────
export const getFoundItemById = async (req, res) => {
    const { id } = req.params

    const { data, error } = await supabase
        .from('found_items')
        .select(`
      *,
      category:categories(name, icon),
      added_by_profile:profiles!added_by(full_name)
    `)
        .eq('id', id)
        .single()

    if (error || !data) return res.status(404).json({ message: 'Item not found' })

    res.json({ item: data })
}

// ─────────────────────────────────────
// PATCH /api/found-items/:id
// Authority: update item details or status
// ─────────────────────────────────────
export const updateFoundItem = async (req, res) => {
    const { id } = req.params
    const { itemName, categoryId, description, foundLocation, storageLocation, imageUrl, status } = req.body

    // 1. Handle image cleanup if image is being updated
    if (imageUrl !== undefined) {
        const { data: existing } = await supabase
            .from('found_items')
            .select('image_url')
            .eq('id', id)
            .single()

        // If replacing an old image with a new one (or null), delete the old one
        if (existing?.image_url && existing.image_url !== imageUrl) {
            const oldFileName = existing.image_url.split('/').pop()
            await supabase.storage.from('item-images').remove([oldFileName])
        }
    }

    if (status && !['AVAILABLE', 'CLOSED'].includes(status)) {
        return res.status(400).json({ message: 'Status must be AVAILABLE or CLOSED' })
    }

    const updates = {}
    if (itemName) updates.item_name = itemName
    if (categoryId) updates.category_id = categoryId
    if (description !== undefined) updates.description = description
    if (foundLocation) updates.found_location = foundLocation
    if (storageLocation !== undefined) updates.storage_location = storageLocation
    if (imageUrl !== undefined) updates.image_url = imageUrl
    if (status) updates.status = status
    if (status === 'CLOSED') updates.closed_at = new Date().toISOString()

    const { data, error } = await supabase
        .from('found_items')
        .update(updates)
        .eq('id', id)
        .select(`
      *,
      category:categories(name, icon)
    `)
        .single()

    if (error) return res.status(500).json({ message: 'Failed to update item' })

    await supabase.from('activity_logs').insert({
        action: status ? `FOUND_ITEM_${status}` : 'FOUND_ITEM_UPDATED',
        performed_by: req.user.id,
        target_id: id,
        target_type: 'found_item',
        metadata: updates,
    })

    res.json({ message: 'Item updated', item: data })
}

// ─────────────────────────────────────
// DELETE /api/found-items/:id
// Authority/Admin: delete a found item + its image
// ─────────────────────────────────────
export const deleteFoundItem = async (req, res) => {
    const { id } = req.params

    // 1. Get the item to find its image URL
    const { data: item, error: fetchError } = await supabase
        .from('found_items')
        .select('item_name, image_url')
        .eq('id', id)
        .single()

    if (fetchError || !item) return res.status(404).json({ message: 'Item not found' })

    // 2. Delete the image from storage if it exists
    if (item.image_url) {
        const fileName = item.image_url.split('/').pop()
        const { error: storageError } = await supabase.storage
            .from('item-images')
            .remove([fileName])

        if (storageError) {
            console.error('Storage cleanup failed on delete:', storageError)
            // We continue anyway so the DB record is deleted
        }
    }

    // 3. Delete from DB
    const { error } = await supabase
        .from('found_items')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('DeleteFoundItem error:', error)
        return res.status(500).json({ message: 'Failed to delete item' })
    }

    // 4. Log activity
    await supabase.from('activity_logs').insert({
        action: 'FOUND_ITEM_DELETED',
        performed_by: req.user.id,
        target_id: id,
        target_type: 'found_item',
        metadata: { item_name: item.item_name },
    })

    res.json({ message: 'Item deleted and storage cleared' })
}
