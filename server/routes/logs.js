import express from 'express'
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'
import { supabase } from '../lib/supabase.js'

const router = express.Router()

router.use(verifyToken, isAdmin)

// GET /api/logs?limit=50&action=&userId=
router.get('/', async (req, res) => {
    const { limit = 50, action, userId } = req.query

    let query = supabase
        .from('activity_logs')
        .select(`
      *,
      performer:profiles!performed_by(full_name, role)
    `)
        .order('created_at', { ascending: false })
        .limit(Number(limit))

    if (action) query = query.eq('action', action)
    if (userId) query = query.eq('performed_by', userId)

    const { data, error } = await query
    if (error) return res.status(500).json({ message: 'Failed to fetch activity logs' })
    res.json({ logs: data, total: data.length })
})

export default router
