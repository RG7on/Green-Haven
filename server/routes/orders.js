import express from 'express'
import {
  createOrder,
  getUserOrders,
  getOrderById,
  confirmDelivery,
  submitFeedback
} from '../controllers/orderController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// All order routes require authentication
router.use(protect)

// User routes
router.post('/', createOrder)
router.get('/', getUserOrders)
router.get('/:id', getOrderById)
router.put('/:id/confirm-delivery', confirmDelivery)
router.put('/:id/feedback', submitFeedback)

export { router as ordersRouter }
