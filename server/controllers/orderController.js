import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import { Product } from '../models/Product.js'

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      tax,
      shippingCost,
      totalPrice
    } = req.body

    // Validation - Check required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      })
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      })
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      })
    }

    // Business Logic - Validate all products exist and prices match
    for (const item of items) {
      const product = await Product.findById(item.product)
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name} not found`
        })
      }

      // Verify price hasn't changed
      if (product.price !== item.price) {
        return res.status(400).json({
          success: false,
          message: `Price for ${product.name} has changed. Please refresh your cart.`
        })
      }
    }

    // Data Processing - Calculate totals on server side for security
    const calculatedSubtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    )

    // Business Logic - Apply tax calculation (5%)
    const calculatedTax = calculatedSubtotal * 0.05

    // Business Logic - Flat shipping cost (3 OMR)
    const calculatedShipping = 3

    const calculatedTotal = calculatedSubtotal + calculatedTax + calculatedShipping

    // Verify client calculations match server calculations (within 1 cent tolerance)
    if (Math.abs(calculatedTotal - totalPrice) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Price calculation mismatch. Please refresh and try again.',
        serverCalculation: {
          subtotal: calculatedSubtotal,
          tax: calculatedTax,
          shippingCost: calculatedShipping,
          total: calculatedTotal
        }
      })
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      shippingCost: calculatedShipping,
      totalPrice: calculatedTotal
    })

    // Clear user's cart after successful order
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] }
    )

    res.status(201).json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while creating order',
      error: error.message
    })
  }
}

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
      error: error.message
    })
  }
}

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'firstName lastName email')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    // Verify order belongs to user
    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      })
    }

    res.status(200).json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order',
      error: error.message
    })
  }
}

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin only - but simplified for now)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      })
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      })
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    // Verify order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      })
    }

    order.status = status

    // Update delivery status
    if (status === 'delivered') {
      order.isDelivered = true
      order.deliveredAt = Date.now()
    }

    await order.save()

    res.status(200).json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating order',
      error: error.message
    })
  }
}
