import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Route imports
import authRoutes from './routes/auth.js'
import lostReports from './routes/lostReports.js'
import foundItems from './routes/foundItems.js'
import claims from './routes/claims.js'
import categories from './routes/categories.js'
import logs from './routes/logs.js'
import adminRoutes from './routes/admin.js'
import uploadRoute from './routes/upload.js'
import locations from './routes/locations.js'
import notifications from './routes/notifications.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Middleware
app.use(cors({
    origin: (process.env.CLIENT_URL || 'http://localhost:3000').split(',').map(s => s.trim()),
    credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/lost-reports', lostReports)
app.use('/api/found-items', foundItems)
app.use('/api/claims', claims)
app.use('/api/categories', categories)
app.use('/api/locations', locations)
app.use('/api/notifications', notifications)
app.use('/api/logs', logs)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoute)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Lost & Found API is running', timestamp: new Date().toISOString() })
})

// ─── Serve React frontend in production ───
const clientDist = path.join(__dirname, '..', 'client', 'dist')
app.use(express.static(clientDist))

// SPA catch-all: any non-API route serves index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
})

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err.message)
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`)
})
