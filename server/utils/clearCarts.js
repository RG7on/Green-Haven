import Cart from '../models/Cart.js'
import { connectDB } from '../config/db.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function clearAllCarts() {
  try {
    await connectDB(process.env.MONGO_URI)
    console.log('🗑️  Clearing all carts...')
    
    const result = await Cart.deleteMany({})
    
    console.log(`✅ Deleted ${result.deletedCount} carts`)
    console.log('🎉 All carts cleared!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

clearAllCarts()
