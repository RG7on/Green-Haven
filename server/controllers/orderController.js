import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import { Product } from '../models/Product.js'
import { validateOmanAddress, getGovernorateById, getWilayatById } from '../utils/omanLocations.js'

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

    // Validate new Oman address format if provided
    if (shippingAddress.governorateId && shippingAddress.wilayatId) {
      const addressErrors = validateOmanAddress(shippingAddress)
      if (addressErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid shipping address',
          errors: addressErrors
        })
      }

      // Enrich with governorate and wilayat names
      const governorate = getGovernorateById(shippingAddress.governorateId)
      const wilayat = getWilayatById(shippingAddress.governorateId, shippingAddress.wilayatId)
      
      if (governorate) {
        shippingAddress.governorateName = governorate.name
      }
      if (wilayat) {
        shippingAddress.wilayatName = wilayat.name
      }
      shippingAddress.country = 'Oman'
    } else {
      // Legacy address validation
      if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city) {
        return res.status(400).json({
          success: false,
          message: 'Please provide complete shipping address'
        })
      }
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
// @access  Private/Admin
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

    // Only admin can update order status
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required to update order status'
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

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'firstName lastName email')
      .populate('items.product')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    })
  } catch (error) {
    console.error('Get all orders error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
      error: error.message
    })
  }
}

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments()
    const pendingOrders = await Order.countDocuments({ status: 'pending' })
    const processingOrders = await Order.countDocuments({ status: 'processing' })
    const shippedOrders = await Order.countDocuments({ status: 'shipped' })
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' })
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' })

    // Calculate total revenue from delivered orders
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ])
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        ordersByStatus: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        totalRevenue
      }
    })
  } catch (error) {
    console.error('Get order stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order statistics',
      error: error.message
    })
  }
}

// @desc    Confirm delivery by user
// @route   PUT /api/orders/:id/confirm-delivery
// @access  Private
export const confirmDelivery = async (req, res) => {
  try {
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
        message: 'Not authorized to confirm this order'
      })
    }

    // Check if already confirmed
    if (order.deliveryConfirmed) {
      return res.status(400).json({
        success: false,
        message: 'Order delivery already confirmed'
      })
    }

    // Update delivery confirmation
    order.deliveryConfirmed = true
    order.deliveryConfirmedAt = new Date()
    await order.save()

    res.status(200).json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('Confirm delivery error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while confirming delivery',
      error: error.message
    })
  }
}

// @desc    Submit feedback for order
// @route   PUT /api/orders/:id/feedback
// @access  Private
export const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body

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
        message: 'Not authorized to provide feedback for this order'
      })
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      })
    }

    // Update feedback
    order.feedback = {
      rating,
      comment: comment || '',
      createdAt: new Date()
    }
    await order.save()

    res.status(200).json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('Submit feedback error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while submitting feedback',
      error: error.message
    })
  }
}
