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
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/users', usersRouter)

const PORT = process.env.APP_PORT || 5000

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })
