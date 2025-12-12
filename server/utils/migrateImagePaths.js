import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import { Product } from '../models/Product.js'
import { connectDB } from '../config/db.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function migrateImagePaths() {
  try {
    await connectDB(process.env.MONGO_URI)
    console.log('🔄 Starting image path migration...')

    // Get all products for matching
    const products = await Product.find({})
    const productMap = new Map()
    products.forEach(p => {
      productMap.set(p.name, p._id)
    })

    // Update Orders
    const orders = await Order.find({})
    let ordersUpdated = 0
    
    for (const order of orders) {
      let modified = false
      
      order.items = order.items.map(item => {
        if (item.image && item.image.startsWith('/plants/')) {
          item.image = item.image.replace('/plants/', '/images/plants/')
          modified = true
        }
        // Ensure product ID exists by matching name
        if (!item.product && item.name && productMap.has(item.name)) {
          item.product = productMap.get(item.name)
          modified = true
        }
        return item
      })
      
      if (modified) {
        await order.save()
        ordersUpdated++
      }
    }
    
    console.log(`✅ Updated ${ordersUpdated} orders`)

    // Update Carts
    const carts = await Cart.find({})
    let cartsUpdated = 0
    
    for (const cart of carts) {
      let modified = false
      
      cart.items = cart.items.map(item => {
        if (item.image && item.image.startsWith('/plants/')) {
          item.image = item.image.replace('/plants/', '/images/plants/')
          modified = true
        }
        // Ensure product ID exists by matching name
        if (!item.product && item.name && productMap.has(item.name)) {
          item.product = productMap.get(item.name)
          modified = true
        }
        return item
      })
      
      if (modified) {
        await cart.save()
        cartsUpdated++
      }
    }
    
    console.log(`✅ Updated ${cartsUpdated} carts`)
    console.log('🎉 Migration complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

migrateImagePaths()
