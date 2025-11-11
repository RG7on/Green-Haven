import express from 'express'
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/orderController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// All order routes are protected (require authentication)
router.use(protect)

// Order operations
router.post('/', createOrder)
router.get('/', getUserOrders)
router.get('/:id', getOrderById)
router.put('/:id/status', updateOrderStatus)

export { router as ordersRouter }
