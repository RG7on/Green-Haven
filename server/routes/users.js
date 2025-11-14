import express from 'express'
import { getAllUsers, getUserStats, updateUserRole } from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'
import { adminOnly } from '../middleware/adminMiddleware.js'

const router = express.Router()

// All user admin routes require authentication and admin privileges
router.use(protect)
router.use(adminOnly)

// User management routes
router.get('/admin/all', getAllUsers)
router.get('/admin/stats', getUserStats)
router.patch('/:id/role', updateUserRole)

export { router as usersRouter }
