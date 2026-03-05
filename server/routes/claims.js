import express from 'express'
import { verifyToken, isStudent, isAuthorityOrAdmin } from '../middleware/authMiddleware.js'
import {
    submitClaim,
    getMyClaims,
    getClaimsForItem,
    approveClaim,
    rejectClaim,
    getAllDisputes,
    getPendingClaimsGrouped,
    updateClaim,
    requestMoreInfo,
} from '../controllers/claimController.js'

const router = express.Router()

router.use(verifyToken)

// Student
router.post('/', isStudent, submitClaim)
router.get('/mine', isStudent, getMyClaims)
router.put('/:id', isStudent, updateClaim)

// Authority/Admin
router.get('/requests', isAuthorityOrAdmin, getPendingClaimsGrouped)
router.get('/disputes', isAuthorityOrAdmin, getAllDisputes)
router.get('/item/:foundItemId', isAuthorityOrAdmin, getClaimsForItem)
router.patch('/:id/approve', isAuthorityOrAdmin, approveClaim)
router.patch('/:id/reject', isAuthorityOrAdmin, rejectClaim)
router.patch('/:id/request-info', isAuthorityOrAdmin, requestMoreInfo)

export default router
