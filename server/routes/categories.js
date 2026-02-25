import express from 'express'
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'
import { supabase } from '../lib/supabase.js'

const router = express.Router()

// GET /api/categories — public, no auth needed for reading
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
    if (error) return res.status(500).json({ message: 'Failed to fetch categories' })
    res.json({ categories: data })
})

// Below require admin
router.use(verifyToken, isAdmin)

// POST — create category
router.post('/', async (req, res) => {
    const { name, icon } = req.body
    if (!name) return res.status(400).json({ message: 'Category name is required' })
    const { data, error } = await supabase.from('categories').insert({ name, icon }).select().single()
    if (error) return res.status(500).json({ message: 'Failed to create category' })
    res.status(201).json({ category: data })
})

// PATCH /:id — update category
router.patch('/:id', async (req, res) => {
    const { name, icon } = req.body
    const { data, error } = await supabase
        .from('categories').update({ name, icon }).eq('id', req.params.id).select().single()
    if (error) return res.status(500).json({ message: 'Failed to update category' })
    res.json({ category: data })
})

// DELETE /:id — delete category
router.delete('/:id', async (req, res) => {
    const { error } = await supabase.from('categories').delete().eq('id', req.params.id)
    if (error) return res.status(500).json({ message: 'Failed to delete category' })
    res.json({ message: 'Category deleted' })
})

export default router
