import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded // { id, email, role }
        next()
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token' })
    }
}

export const isStudent = (req, res, next) => {
    if (req.user?.role !== 'student') {
        return res.status(403).json({ message: 'Access denied: Students only' })
    }
    next()
}

export const isAuthority = (req, res, next) => {
    if (req.user?.role !== 'authority') {
        return res.status(403).json({ message: 'Access denied: Authority only' })
    }
    next()
}

export const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin only' })
    }
    next()
}

export const isAuthorityOrAdmin = (req, res, next) => {
    if (!['authority', 'admin'].includes(req.user?.role)) {
        return res.status(403).json({ message: 'Access denied' })
    }
    next()
}
