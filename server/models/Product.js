import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  currency: { type: String, default: 'OMR' },
  image: { type: String },
}, { timestamps: true })

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema)
