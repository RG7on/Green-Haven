import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user'],
    default: 'user'
  },
  address: {
    // Legacy fields (kept for backward compatibility)
    fullName: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' },
    // New Oman-specific fields
    phone: { type: String }, // Oman phone number
    governorateId: { type: Number }, // 1-11
    governorateName: { type: String },
    wilayatId: { type: Number }, // e.g., 101-1103
    wilayatName: { type: String },
    houseNumber: { type: String },
    additionalInfo: { type: String } // Optional additional address line
  },
  lastLogin: {
    date: { type: Date },
    ip: { type: String },
    location: { type: String }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

const User = mongoose.model('User', userSchema)

export default User
