import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  currency: { type: String, default: 'OMR' },
  image: { type: String },
  stock: { type: Number, default: 0 },
  category: { type: String, default: 'Uncategorized' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema)
