import express from 'express'
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUserRole,
    resetUserPassword,
    deleteUser,
} from '../controllers/adminController.js'

const router = express.Router()

// All admin routes require auth + admin role
router.use(verifyToken, isAdmin)

router.get('/users', getAllUsers)        // GET  /api/admin/users?role=&search=
router.get('/users/:id', getUserById)       // GET  /api/admin/users/:id
router.post('/users', createUser)        // POST /api/admin/users
router.patch('/users/:id/role', updateUserRole)    // PATCH /api/admin/users/:id/role
router.patch('/users/:id/reset-password', resetUserPassword) // PATCH /api/admin/users/:id/reset-password
router.delete('/users/:id', deleteUser)        // DELETE /api/admin/users/:id

export default router
