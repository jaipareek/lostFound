import express from 'express'
import { verifyToken } from '../middleware/authMiddleware.js'
import { supabase } from '../lib/supabase.js'

const router = express.Router()

router.use(verifyToken)

// GET /api/notifications — get all notifications for current user
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    if (error) return res.status(500).json({ message: 'Failed to fetch notifications' })
    res.json({ notifications: data })
})

// GET /api/notifications/unread-count — quick count for badge
router.get('/unread-count', async (req, res) => {
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.user.id)
        .eq('is_read', false)

    if (error) return res.status(500).json({ message: 'Failed to count notifications' })
    res.json({ count: count || 0 })
})

// PATCH /api/notifications/:id/read — mark single notification as read
router.patch('/:id/read', async (req, res) => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)

    if (error) return res.status(500).json({ message: 'Failed to mark as read' })
    res.json({ message: 'Notification marked as read' })
})

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', async (req, res) => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', req.user.id)
        .eq('is_read', false)

    if (error) return res.status(500).json({ message: 'Failed to mark all as read' })
    res.json({ message: 'All notifications marked as read' })
})

export default router
