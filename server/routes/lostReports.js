import express from 'express'
import { verifyToken, isStudent, isAuthority, isAuthorityOrAdmin, isAdmin } from '../middleware/authMiddleware.js'
import {
    checkMatches,
    createLostReport,
    getAllLostReports,
    getMyLostReports,
    getLostReportById,
    closeLostReportByStudent,
    updateLostReportStatus,
    deleteLostReport,
} from '../controllers/lostReportController.js'

const router = express.Router()

// All routes require auth
router.use(verifyToken)

// Student: check for similar reports & inventory matches (before submitting)
router.post('/check-matches', isStudent, checkMatches)

// Student: submit a lost report
router.post('/', isStudent, createLostReport)

// Student: view their own reports
router.get('/mine', isStudent, getMyLostReports)

// Authority/Admin: view ALL reports (with ?status= and ?search= filters)
router.get('/', isAuthorityOrAdmin, getAllLostReports)

// Any auth: view single report (controller enforces student-only-own-reports)
router.get('/:id', getLostReportById)

// Student: self-close their own report
router.patch('/:id/close', isStudent, closeLostReportByStudent)

// Authority/Admin: change status (CLOSED / REJECTED)
router.patch('/:id/status', isAuthorityOrAdmin, updateLostReportStatus)

// Admin only: delete fake/spam reports
router.delete('/:id', isAdmin, deleteLostReport)

export default router
