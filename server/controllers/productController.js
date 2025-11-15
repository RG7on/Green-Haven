import { Product } from '../models/Product.js'

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    // Fetch all active products only (admin features removed)
    const products = await Product.find({ isActive: { $ne: false } }).lean()
    
    res.status(200).json({
      success: true,
      data: products
    })
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message
    })
  }
}

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message
    })
  }
}
