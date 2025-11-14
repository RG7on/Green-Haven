import express from 'express'
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getOrderStats
} from '../controllers/orderController.js'
import { protect } from '../middleware/authMiddleware.js'
import { adminOnly } from '../middleware/adminMiddleware.js'

const router = express.Router()

// All order routes require authentication
router.use(protect)

// Admin-only routes (must come before /:id routes to avoid conflicts)
router.get('/admin/all', adminOnly, getAllOrders)
router.get('/admin/stats', adminOnly, getOrderStats)
router.put('/:id/status', adminOnly, updateOrderStatus)

// User routes
router.post('/', createOrder)
router.get('/', getUserOrders)
router.get('/:id', getOrderById)

export { router as ordersRouter }
