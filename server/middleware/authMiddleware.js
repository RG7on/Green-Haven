import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Middleware to protect routes (verify JWT token)
export const protect = async (req, res, next) => {
  let token

  // Check if token is in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password')

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        })
      }

      next()
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      })
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    })
  }
}
