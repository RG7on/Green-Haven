import { Router } from 'express'
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  seedProducts
} from '../controllers/productController.js'
import { protect } from '../middleware/authMiddleware.js'
import { adminOnly } from '../middleware/adminMiddleware.js'

export const productsRouter = Router()

// Public routes
productsRouter.get('/', getAllProducts)
productsRouter.get('/:id', getProductById)

// Admin-only routes
productsRouter.post('/seed', protect, adminOnly, seedProducts)
productsRouter.post('/', protect, adminOnly, createProduct)
productsRouter.put('/:id', protect, adminOnly, updateProduct)
productsRouter.delete('/:id', protect, adminOnly, deleteProduct)
productsRouter.patch('/:id/toggle', protect, adminOnly, toggleProductStatus)

