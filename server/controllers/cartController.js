import Cart from '../models/Cart.js'
import { Product } from '../models/Product.js'

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product')
    
    // If cart doesn't exist, create an empty one
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: []
      })
    }

    res.status(200).json({
      success: true,
      data: cart
    })
  } catch (error) {
    console.error('Get cart error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
      error: error.message
    })
  }
}

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      })
    }

    // Business Logic - Verify product exists
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    // Business Logic - Validate quantity
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      })
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: []
      })
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    )

    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image
      })
    }

    await cart.save()
    await cart.populate('items.product')

    res.status(200).json({
      success: true,
      data: cart
    })
  } catch (error) {
    console.error('Add to cart error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while adding to cart',
      error: error.message
    })
  }
}

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params
    const { quantity } = req.body

    // Validation
    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      })
    }

    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      })
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    )

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      })
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1)
    } else {
      cart.items[itemIndex].quantity = quantity
    }

    await cart.save()
    await cart.populate('items.product')

    res.status(200).json({
      success: true,
      data: cart
    })
  } catch (error) {
    console.error('Update cart item error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart',
      error: error.message
    })
  }
}

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params

    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      })
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    )

    await cart.save()
    await cart.populate('items.product')

    res.status(200).json({
      success: true,
      data: cart
    })
  } catch (error) {
    console.error('Remove from cart error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while removing from cart',
      error: error.message
    })
  }
}

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      })
    }

    cart.items = []
    await cart.save()

    res.status(200).json({
      success: true,
      data: cart
    })
  } catch (error) {
    console.error('Clear cart error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart',
      error: error.message
    })
  }
}
