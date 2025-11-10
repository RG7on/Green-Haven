import { Router } from 'express'
import { Product } from '../models/Product.js'

export const productsRouter = Router()

// GET /api/products - list all products
productsRouter.get('/', async (req, res, next) => {
  try {
    const items = await Product.find().lean()
    res.json(items)
  } catch (err) { next(err) }
})

// POST /api/products/seed - seed sample data if empty
productsRouter.post('/seed', async (req, res, next) => {
  try {
    const count = await Product.countDocuments()
    if (count > 0) return res.status(200).json({ message: 'Already seeded', count })
    const samples = [
      { name: 'Large Ceramic Caladium Potted Plant', price: 7.5, currency: 'OMR', description: 'Beautiful Caladium plant with vibrant leaves, perfect for indoor decoration.', image: '/src/assets/test_palceholders/1.png' },
      { name: 'Euphorbia Natural Cactus Potted Plant', price: 22, currency: 'OMR', description: 'Low-maintenance cactus that adds a touch of desert beauty to your space.', image: '/src/assets/test_palceholders/2.png' },
      { name: 'Alocasia Natural Polly Plant In White Pot', price: 45, currency: 'OMR', description: 'Stunning Alocasia Polly with dramatic arrow-shaped leaves.', image: '/src/assets/test_palceholders/3.png' },
    ]
    const created = await Product.insertMany(samples)
    res.status(201).json({ inserted: created.length })
  } catch (err) { next(err) }
})
