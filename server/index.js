import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import User from './models/User.js'
import { Product } from './models/Product.js'
import Cart from './models/Cart.js'
import Order from './models/Order.js'
import { validateOmanAddress, getGovernorateById, getWilayatById } from './utils/omanLocations.js'

// Load environment variables
dotenv.config()

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    const allowedOrigins = [
      /\.onrender\.com$/,
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/
    ]
    const isAllowed = allowedOrigins.some(pattern => pattern.test(origin))
    callback(null, isAllowed || true)
  },
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Serve static images
app.use('/images', express.static(path.join(__dirname, '../client/public/images')))

// Database Connection
// NOTE: Create your database manually in MongoDB first, then provide connection string here
try {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/greenhaven'
  mongoose.connect(mongoURI)
  console.log('Database Connected..')
} catch (error) {
  console.log('Database connection error..' + error)
}

// Start Server
const PORT = process.env.APP_PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server connected at port number ${PORT}..`)
})

// ============================================
// AUTH MIDDLEWARE
// ============================================
const protect = async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
      req.user = await User.findById(decoded.id).select('-password')
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' })
      }
      next()
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' })
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' })
  }
}

// Helper: Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' })
}

// Helper: Get location from IP
const getLocationFromIP = async (ip) => {
  try {
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000)
        const ipResponse = await fetch('https://api.ipify.org?format=json', { signal: controller.signal })
        clearTimeout(timeout)
        const ipData = await ipResponse.json()
        ip = ipData.ip
      } catch (error) {
        return 'Local Development'
      }
    }
    const apiKey = 'dbc3a12f2fbf4f0cba71898ea3e43398'
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`, { signal: controller.signal })
    clearTimeout(timeout)
    const data = await response.json()
    if (data.city && data.country_name) return `${data.city}, ${data.country_name}`
    else if (data.country_name) return data.country_name
    return 'Unknown Location'
  } catch (error) {
    return 'Location Unavailable'
  }
}

// ============================================
// AUTH ROUTES
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address } = req.body

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' })
    }

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const ip = req.ip || req.connection.remoteAddress
    const registrationLocation = await getLocationFromIP(ip)

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      registrationLocation
    })

    const token = generateToken(user._id)
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        registrationLocation: user.registrationLocation,
        token
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message })
  }
})

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    // Update login info
    try {
      user.lastLogin = new Date()
      const ip = req.ip || req.connection.remoteAddress
      user.lastLoginLocation = await getLocationFromIP(ip)
      if (!user.loginHistory) user.loginHistory = []
      user.loginHistory.push({ timestamp: new Date(), location: user.lastLoginLocation })
      if (user.loginHistory.length > 10) user.loginHistory = user.loginHistory.slice(-10)
      await user.save()
    } catch (saveError) {
      console.error('Error updating user login info:', saveError)
      // Continue anyway - don't fail login if we can't update login history
    }

    const token = generateToken(user._id)
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        registrationLocation: user.registrationLocation,
        lastLogin: user.lastLogin,
        lastLoginLocation: user.lastLoginLocation,
        token
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message })
  }
})

// Get Current User
app.get('/api/auth/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
})

// Update Profile
app.put('/api/auth/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.firstName = firstName || user.firstName
    user.lastName = lastName || user.lastName
    user.phone = phone || user.phone
    user.address = address || user.address
    await user.save()

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
})

// ============================================
// PRODUCT ROUTES
// ============================================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ isActive: { $ne: false } }).lean()
    res.status(200).json({ success: true, data: products })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching products', error: error.message })
  }
})

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    res.status(200).json({ success: true, data: product })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching product', error: error.message })
  }
})

// ============================================
// CART ROUTES
// ============================================

// Get user's cart
app.get('/api/cart', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product')
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] })
    }
    res.status(200).json({ success: true, data: cart })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching cart', error: error.message })
  }
})

// Add to cart
app.post('/api/cart/items', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    if (!product.isActive) {
      return res.status(400).json({ success: false, message: 'Product is not available' })
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' })
    }

    let cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] })
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId)
    if (existingItem) {
      existingItem.quantity += quantity
      existingItem.price = product.price
    } else {
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
    res.status(200).json({ success: true, data: cart })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while adding to cart', error: error.message })
  }
})

// Update cart item
app.put('/api/cart/items/:productId', protect, async (req, res) => {
  try {
    const { quantity } = req.body

    if (!quantity || quantity < 0) {
      return res.status(400).json({ success: false, message: 'Valid quantity is required' })
    }

    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' })
    }

    const item = cart.items.find(item => item.product.toString() === req.params.productId)
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' })
    }

    if (quantity === 0) {
      cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId)
    } else {
      const product = await Product.findById(req.params.productId)
      if (product && product.stock < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' })
      }
      item.quantity = quantity
    }

    await cart.save()
    await cart.populate('items.product')
    res.status(200).json({ success: true, data: cart })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while updating cart', error: error.message })
  }
})

// Remove from cart
app.delete('/api/cart/items/:productId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' })
    }

    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId)
    await cart.save()
    await cart.populate('items.product')
    res.status(200).json({ success: true, data: cart })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while removing item', error: error.message })
  }
})

// Clear cart
app.delete('/api/cart', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' })
    }

    cart.items = []
    await cart.save()
    res.status(200).json({ success: true, data: cart })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while clearing cart', error: error.message })
  }
})

// ============================================
// ORDER ROUTES
// ============================================

// Create order
app.post('/api/orders', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, tax, shippingCost, totalPrice, deliveryOption } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' })
    }

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' })
    }

    if (shippingAddress.governorateId && shippingAddress.wilayatId) {
      const addressErrors = validateOmanAddress(shippingAddress)
      if (addressErrors.length > 0) {
        return res.status(400).json({ success: false, message: 'Invalid shipping address', errors: addressErrors })
      }

      const governorate = getGovernorateById(shippingAddress.governorateId)
      const wilayat = getWilayatById(shippingAddress.governorateId, shippingAddress.wilayatId)
      if (governorate) shippingAddress.governorate = governorate.name
      if (wilayat) shippingAddress.wilayat = wilayat.name
    }

    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment method is required' })
    }

    for (const item of items) {
      const product = await Product.findById(item.product)
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` })
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` })
      }
      product.stock -= item.quantity
      await product.save()
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      tax,
      shippingCost,
      totalPrice,
      deliveryOption: deliveryOption || 'standard',
      status: 'pending',
      paymentStatus: 'pending'
    })

    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] })
    res.status(201).json({ success: true, data: order })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while creating order', error: error.message })
  }
})

// Get user's orders
app.get('/api/orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.status(200).json({ success: true, data: orders })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching orders', error: error.message })
  }
})

// Get single order
app.get('/api/orders/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this order' })
    }
    res.status(200).json({ success: true, data: order })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching order', error: error.message })
  }
})

// Cancel order
app.put('/api/orders/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' })
    }
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot cancel this order' })
    }

    for (const item of order.items) {
      const product = await Product.findById(item.product)
      if (product) {
        product.stock += item.quantity
        await product.save()
      }
    }

    order.status = 'cancelled'
    order.paymentStatus = 'refunded'
    order.cancelledAt = new Date()
    await order.save()

    res.status(200).json({ success: true, data: order })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while cancelling order', error: error.message })
  }
})

// Confirm delivery
app.put('/api/orders/:id/confirm-delivery', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this order' })
    }
    if (order.deliveryConfirmed) {
      return res.status(400).json({ success: false, message: 'Order is already confirmed as delivered' })
    }

    order.deliveryConfirmed = true
    order.deliveryConfirmedAt = new Date()
    order.status = 'delivered'
    order.deliveredAt = new Date()
    await order.save()

    res.status(200).json({ success: true, data: order })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while confirming delivery', error: error.message })
  }
})

// Submit feedback
app.put('/api/orders/:id/feedback', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body
    
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this order' })
    }

    order.feedback = {
      rating: rating || 5,
      comment: comment || '',
      submittedAt: new Date()
    }
    await order.save()

    res.status(200).json({ success: true, data: order })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while submitting feedback', error: error.message })
  }
})

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }))
