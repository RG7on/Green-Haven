import { Product } from '../models/Product.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const demoProducts = [
  {
    name: 'Monstera Deliciosa',
    description: 'Beautiful Swiss Cheese Plant with stunning split leaves. Perfect for indoor spaces with bright, indirect light. Easy to care for and grows vigorously.',
    price: 12.5,
    currency: 'OMR',
    image: '/images/plants/Monstera_Deliciosa.jpg',
    stock: 25,
    category: 'Indoor Plants',
    isActive: true
  },
  {
    name: 'Snake Plant (Sansevieria)',
    description: 'Low-maintenance air-purifying plant that thrives on neglect. Perfect for beginners and low-light conditions. Extremely hardy and drought-tolerant.',
    price: 8.0,
    currency: 'OMR',
    image: '/images/plants/Snake_Plant.jpg',
    stock: 40,
    category: 'Indoor Plants',
    isActive: true
  },
  {
    name: 'Pothos Golden',
    description: 'Trailing vine with heart-shaped golden-green leaves. Excellent air purifier and very easy to propagate. Thrives in various light conditions.',
    price: 6.5,
    currency: 'OMR',
    image: '/images/plants/Pothos_Golden.jpg',
    stock: 35,
    category: 'Indoor Plants',
    isActive: true
  },
  {
    name: 'Fiddle Leaf Fig',
    description: 'Trendy statement plant with large, violin-shaped leaves. Prefers bright indirect light and consistent watering. A stunning focal point for any room.',
    price: 25.0,
    currency: 'OMR',
    image: '/images/plants/Fiddle_Leaf_Fig.jpg',
    stock: 15,
    category: 'Indoor Plants',
    isActive: true
  },
  {
    name: 'Aloe Vera',
    description: 'Medicinal succulent with healing gel inside thick leaves. Drought-tolerant and loves bright light. Great for skincare and burns.',
    price: 7.5,
    currency: 'OMR',
    image: '/images/plants/Aloe_Vera.jpg',
    stock: 30,
    category: 'Succulents',
    isActive: true
  },
  {
    name: 'Peace Lily',
    description: 'Elegant plant with glossy leaves and white flowers. Excellent air purifier and thrives in low to medium light. Shows when it needs water by drooping.',
    price: 10.0,
    currency: 'OMR',
    image: '/images/plants/Peace_Lily.jpg',
    stock: 20,
    category: 'Indoor Plants',
    isActive: true
  },
  {
    name: 'Rubber Plant',
    description: 'Bold plant with large, glossy burgundy leaves. Low-maintenance and grows tall, making it a perfect statement piece. Prefers bright indirect light.',
    price: 15.0,
    currency: 'OMR',
    image: '/images/plants/Rubber_Plant.jpg',
    stock: 18,
    category: 'Indoor Plants',
    isActive: true
  },
  {
    name: 'ZZ Plant',
    description: 'Incredibly resilient plant with waxy, dark green leaves. Thrives on neglect and tolerates low light. Drought-tolerant and virtually indestructible.',
    price: 9.5,
    currency: 'OMR',
    image: '/images/plants/ZZ_Plant.jpg',
    stock: 28,
    category: 'Indoor Plants',
    isActive: true
  },
  {
    name: 'Spider Plant',
    description: 'Classic hanging plant with arching striped leaves and baby plantlets. Excellent air purifier and easy to propagate. Perfect for hanging baskets.',
    price: 5.5,
    currency: 'OMR',
    image: '/images/plants/Spider_Plant.jpg',
    stock: 45,
    category: 'Indoor Plants',
    isActive: true
  }
]

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB Connected')
    
    console.log('🌱 Checking existing products...')
    const existingCount = await Product.countDocuments()
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing products.`)
      console.log('🗑️  Clearing database...')
      await Product.deleteMany({})
      console.log('✅ Database cleared!')
    }
    
    console.log('📦 Inserting demo products...')
    const inserted = await Product.insertMany(demoProducts)
    
    console.log(`✅ Successfully seeded ${inserted.length} products!`)
    console.log('\n📋 Products added:')
    inserted.forEach((product, i) => {
      console.log(`   ${i + 1}. ${product.name} - ${product.price} ${product.currency}`)
    })
    
    console.log('\n🎉 Database seeding complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
