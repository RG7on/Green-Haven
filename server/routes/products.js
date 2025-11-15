import { Router } from 'express'
import {
  getAllProducts,
  getProductById
} from '../controllers/productController.js'

export const productsRouter = Router()

// Public routes
productsRouter.get('/', getAllProducts)
productsRouter.get('/:id', getProductById)

