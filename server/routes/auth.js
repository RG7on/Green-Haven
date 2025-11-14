import express from 'express'
import { registerUser, loginUser, getCurrentUser, updateProfile, setupAdmin } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/setup-admin', setupAdmin)  // One-time admin setup
router.post('/make-me-admin', async (req, res) => {
  // Quick dev endpoint - remove in production
  try {
    const { email, password } = req.body
    const User = (await import('../models/User.js')).default
    const bcrypt = (await import('bcryptjs')).default
    
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' })
    }
    
    user.role = 'admin'
    await user.save()
    
    res.json({ success: true, message: `${user.email} is now admin!` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Protected routes
router.get('/me', protect, getCurrentUser)
router.put('/profile', protect, updateProfile)

export { router as authRouter }
