import { Product } from '../models/Product.js'

// @desc    Get all products (includes inactive for admin)
// @route   GET /api/products
// @access  Public (filters to active only for non-admin)
export const getAllProducts = async (req, res) => {
  try {
    // Always show all products (both active and inactive)
    // Frontend will handle filtering based on user role
    const products = await Product.find({}).lean()
    
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

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, currency, image, stock, category, isActive } = req.body

    // Validation - Check required fields
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product name and price'
      })
    }

    // Business Logic - Validate price
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      })
    }

    // Business Logic - Validate stock if provided
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative'
      })
    }

    // Create product
    const product = await Product.create({
      name,
      description: description || '',
      price,
      currency: currency || 'OMR',
      image: image || '',
      stock: stock || 0,
      category: category || 'Uncategorized',
      isActive: isActive !== undefined ? isActive : true
    })

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    })
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: error.message
    })
  }
}

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, currency, image, stock, category, isActive } = req.body

    // Find product
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    // Business Logic - Validate price if being updated
    if (price !== undefined && price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      })
    }

    // Business Logic - Validate stock if being updated
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative'
      })
    }

    // Update fields
    if (name !== undefined) product.name = name
    if (description !== undefined) product.description = description
    if (price !== undefined) product.price = price
    if (currency !== undefined) product.currency = currency
    if (image !== undefined) product.image = image
    if (stock !== undefined) product.stock = stock
    if (category !== undefined) product.category = category
    if (isActive !== undefined) product.isActive = isActive

    await product.save()

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    })
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating product',
      error: error.message
    })
  }
}

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    await Product.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
      error: error.message
    })
  }
}

// @desc    Toggle product active status
// @route   PATCH /api/products/:id/toggle
// @access  Private/Admin
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    product.isActive = !product.isActive
    await product.save()

    res.status(200).json({
      success: true,
      data: product,
      message: `Product ${product.isActive ? 'enabled' : 'disabled'} successfully`
    })
  } catch (error) {
    console.error('Toggle product status error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while toggling product status',
      error: error.message
    })
  }
}

// @desc    Seed sample products
// @route   POST /api/products/seed
// @access  Private/Admin
export const seedProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments()
    if (count > 0) {
      return res.status(200).json({
        success: true,
        message: 'Database already seeded',
        count
      })
    }

    const samples = [
      {
        name: 'Large Ceramic Caladium Potted Plant',
        price: 7.5,
        currency: 'OMR',
        description: 'Beautiful Caladium plant with vibrant leaves, perfect for indoor decoration.',
        image: '/src/assets/test_palceholders/1.png',
        stock: 15,
        category: 'Indoor Plants',
        isActive: true
      },
      {
        name: 'Euphorbia Natural Cactus Potted Plant',
        price: 22,
        currency: 'OMR',
        description: 'Low-maintenance cactus that adds a touch of desert beauty to your space.',
        image: '/src/assets/test_palceholders/2.png',
        stock: 8,
        category: 'Cacti & Succulents',
        isActive: true
      },
      {
        name: 'Alocasia Natural Polly Plant In White Pot',
        price: 45,
        currency: 'OMR',
        description: 'Stunning Alocasia Polly with dramatic arrow-shaped leaves.',
        image: '/src/assets/test_palceholders/3.png',
        stock: 5,
        category: 'Indoor Plants',
        isActive: true
      },
    ]

    const created = await Product.insertMany(samples)

    res.status(201).json({
      success: true,
      message: 'Sample products seeded successfully',
      inserted: created.length,
      data: created
    })
  } catch (error) {
    console.error('Seed products error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while seeding products',
      error: error.message
    })
  }
}
