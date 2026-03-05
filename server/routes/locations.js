import express from 'express'
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'
import { supabase } from '../lib/supabase.js'

const router = express.Router()

// GET /api/locations — public, no auth needed for reading
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('sort_order')
    if (error) return res.status(500).json({ message: 'Failed to fetch locations' })
    res.json({ locations: data })
})

// Below require admin
router.use(verifyToken, isAdmin)

// POST — create location
router.post('/', async (req, res) => {
    const { name, icon, sort_order } = req.body
    if (!name) return res.status(400).json({ message: 'Location name is required' })
    const { data, error } = await supabase.from('locations')
        .insert({ name, icon: icon || '📍', sort_order: sort_order || 0 })
        .select().single()
    if (error) return res.status(500).json({ message: 'Failed to create location' })
    res.status(201).json({ location: data })
})

// PATCH /:id — update location
router.patch('/:id', async (req, res) => {
    const { name, icon, sort_order } = req.body
    const updates = {}
    if (name !== undefined) updates.name = name
    if (icon !== undefined) updates.icon = icon
    if (sort_order !== undefined) updates.sort_order = sort_order
    const { data, error } = await supabase
        .from('locations').update(updates).eq('id', req.params.id).select().single()
    if (error) return res.status(500).json({ message: 'Failed to update location' })
    res.json({ location: data })
})

// DELETE /:id — delete location
router.delete('/:id', async (req, res) => {
    const { error } = await supabase.from('locations').delete().eq('id', req.params.id)
    if (error) return res.status(500).json({ message: 'Failed to delete location' })
    res.json({ message: 'Location deleted' })
})

export default router
