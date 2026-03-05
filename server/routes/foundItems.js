import express from 'express'
import { verifyToken, isAuthority, isAuthorityOrAdmin } from '../middleware/authMiddleware.js'
import { checkLostReportMatches, createFoundItem, getAllFoundItems, getFoundItemById, updateFoundItem, deleteFoundItem } from '../controllers/foundItemController.js'

const router = express.Router()

router.use(verifyToken)

// Authority: check lost reports for matching items (before adding)
router.post('/check-matches', isAuthorityOrAdmin, checkLostReportMatches)

// Everyone sees inventory (students, authority, admin)
router.get('/', getAllFoundItems)
router.get('/:id', getFoundItemById)

// Authority/Admin only
router.post('/', isAuthorityOrAdmin, createFoundItem)
router.patch('/:id', isAuthorityOrAdmin, updateFoundItem)
router.delete('/:id', isAuthorityOrAdmin, deleteFoundItem)

export default router
