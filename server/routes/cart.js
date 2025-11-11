import express from 'express'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// All cart routes are protected (require authentication)
router.use(protect)

// Cart operations
router.get('/', getCart)
router.post('/items', addToCart)
router.put('/items/:productId', updateCartItem)
router.delete('/items/:productId', removeFromCart)
router.delete('/', clearCart)

export { router as cartRouter }
