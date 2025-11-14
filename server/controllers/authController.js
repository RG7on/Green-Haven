import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Helper function to get location from IP with timeout
const getLocationFromIP = async (ip) => {
  try {
    // For development/localhost, try to get real public IP
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      // Get public IP first with timeout
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000) // 3s timeout
        const ipResponse = await fetch('https://api.ipify.org?format=json', { signal: controller.signal })
        clearTimeout(timeout)
        const ipData = await ipResponse.json()
        ip = ipData.ip
      } catch (error) {
        console.error('Failed to get public IP:', error)
        return 'Local Development'
      }
    }

    // Get location from IP using ipgeolocation.io with timeout
    const apiKey = 'dbc3a12f2fbf4f0cba71898ea3e43398'
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000) // 3s timeout
    const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`, { signal: controller.signal })
    clearTimeout(timeout)
    const data = await response.json()
    
    if (data.city && data.country_name) {
      return `${data.city}, ${data.country_name}`
    } else if (data.country_name) {
      return data.country_name
    }
    return 'Unknown Location'
  } catch (error) {
    console.error('IP geolocation error:', error)
    return 'Location Unavailable'
  }
}

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  })
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body

    // Validation - Check if all fields are provided
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      })
    }

    // Business Logic - Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      })
    }

    // Business Logic - Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      })
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() })
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Data Processing - Hash password before storing
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Auto-assign admin role if email is admin@gmail.com
    const role = email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user'

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role
    })

    // Generate token
    const token = generateToken(user._id)

    // Return user data (excluding password)
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        address: user.address,
        token
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation - Check if all fields are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Data Processing - Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Get client IP address
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress

    // Get location from IP (non-blocking - continues even if it fails)
    let location = 'Unknown'
    try {
      location = await getLocationFromIP(clientIP)
    } catch (error) {
      console.error('Location lookup failed, continuing login:', error)
      location = 'Location Unavailable'
    }

    // Update last login information
    try {
      user.lastLogin = {
        date: new Date(),
        ip: clientIP,
        location: location
      }
      await user.save()
    } catch (error) {
      console.error('Failed to save last login info:', error)
      // Continue login even if this fails
    }

    // Generate token
    const token = generateToken(user._id)

    // Return user data and token (excluding password)
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        address: user.address,
        token
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    })
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private (requires token)
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
}

// @desc    Make first user admin (setup only)
// @route   POST /api/auth/setup-admin
// @access  Public (one-time use)
export const setupAdmin = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      })
    }

    // Check if any admin exists
    const adminExists = await User.findOne({ role: 'admin' })
    if (adminExists) {
      return res.status(403).json({
        success: false,
        message: 'Admin already exists. Use MongoDB to create additional admins.'
      })
    }

    // Find user and make them admin
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.role = 'admin'
    await user.save()

    res.status(200).json({
      success: true,
      message: `${user.firstName} ${user.lastName} is now an admin!`,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Setup admin error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private (requires token)
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, address } = req.body

    // Validation - Check if fields are provided
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide first name and last name'
      })
    }

    // Business Logic - Validate name lengths
    if (firstName.length < 2 || lastName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Names must be at least 2 characters long'
      })
    }

    // Find and update user
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.firstName = firstName.trim()
    user.lastName = lastName.trim()
    
    // Update address if provided
    if (address) {
      user.address = {
        fullName: address.fullName?.trim() || '',
        phoneNumber: address.phoneNumber?.trim() || '',
        address: address.address?.trim() || '',
        city: address.city?.trim() || '',
        postalCode: address.postalCode?.trim() || '',
        country: address.country?.trim() || ''
      }
    }
    
    await user.save()

    // Return updated user data (excluding password)
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        address: user.address
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: error.message
    })
  }
}
