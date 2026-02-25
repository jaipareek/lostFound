import express from 'express'
import multer from 'multer'
import { verifyToken } from '../middleware/authMiddleware.js'
import { supabase } from '../lib/supabase.js'

const router = express.Router()

// Store file in memory (buffer) — we pass it directly to Supabase
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'))
        }
        cb(null, true)
    },
})

// POST /api/upload  — requires auth
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file provided' })
    }

    const ext = req.file.originalname.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Upload using service role key — bypasses RLS
    const { error } = await supabase.storage
        .from('item-images')
        .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            cacheControl: '3600',
            upsert: false,
        })

    if (error) {
        console.error('Storage upload error:', error)
        return res.status(500).json({ message: 'Upload failed: ' + error.message })
    }

    // Get public URL
    const { data } = supabase.storage.from('item-images').getPublicUrl(fileName)

    res.json({ url: data.publicUrl })
})

export default router
