import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import { productsRouter } from './routes/products.js'
import { authRouter } from './routes/auth.js'
import { cartRouter } from './routes/cart.js'
import { ordersRouter } from './routes/orders.js'
import { usersRouter } from './routes/users.js'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const app = express()

// CORS configuration - allow requests from Render frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)
    
    // Allow any Render.com domain or localhost
    const allowedOrigins = [
      /\.onrender\.com$/,
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/
    ]
    
    const isAllowed = allowedOrigins.some(pattern => pattern.test(origin))
    if (isAllowed) {
      callback(null, true)
    } else {
      console.log('CORS blocked origin:', origin)
      callback(null, true) // Allow anyway for now
    }
  },
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  console.log('Origin:', req.get('origin') || 'none')
  console.log('Content-Type:', req.get('content-type') || 'none')
  next()
})

// Ensure all API responses have JSON content-type
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  next()
})

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/users', usersRouter)

const PORT = process.env.APP_PORT || 5000

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => console.log(`API running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })
