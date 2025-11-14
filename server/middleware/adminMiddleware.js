// Middleware to check if user is admin
// Must be used after the protect middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    })
  }
}
