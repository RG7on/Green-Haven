import { useState, useEffect } from 'react'
import Input from '../common/Input'
import Button from '../common/Button'
import { MdClose, MdCloudUpload, MdImage } from 'react-icons/md'

function ProductForm({ product, onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'OMR',
    image: '',
    stock: '0',
    category: '',
    isActive: true
  })
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Predefined categories
  const categories = [
    'Indoor Plants',
    'Outdoor Plants',
    'Cacti & Succulents',
    'Flowering Plants',
    'Trees & Shrubs',
    'Herbs & Vegetables',
    'Seeds',
    'Pots & Planters',
    'Gardening Tools',
    'Soil & Fertilizers',
    'Other'
  ]

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        currency: product.currency || 'OMR',
        image: product.image || '',
        stock: product.stock?.toString() || '0',
        category: product.category || '',
        isActive: product.isActive !== undefined ? product.isActive : true
      })
      setImagePreview(product.image || '')
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setImagePreview(base64String)
        setFormData(prev => ({ ...prev, image: base64String }))
        setError('')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = localStorage.getItem('user')
      if (!user) {
        setError('No authentication token')
        setLoading(false)
        return
      }
      const { token } = JSON.parse(user)

      const url = product
        ? `/api/products/${product._id}`
        : '/api/products'
      
      const method = product ? 'PUT' : 'POST'

      console.log('Submitting product:', { method, url, formData })

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10)
        })
      })

      const data = await res.json()
      console.log('Server response:', { status: res.status, data })

      if (!res.ok) {
        setError(data.message || 'Failed to save product')
        setLoading(false)
        return
      }

      // Success
      onSuccess()
    } catch (err) {
      console.error('Form submission error:', err)
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '800px',
          width: '100%',
          padding: '2.5rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid var(--color-border)' }}>
          <div>
            <h2 style={{ color: 'var(--color-primary)', margin: 0, marginBottom: '0.25rem' }}>
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', margin: 0 }}>
              Fill in the details below to {product ? 'update' : 'create'} a product
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: 'var(--color-text)',
              display: 'flex',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text)'}
          >
            <MdClose size={28} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: '1rem',
              background: 'var(--color-danger)20',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Basic Information Section */}
          <div>
            <h3 style={{ color: 'var(--color-text)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600' }}>
              Basic Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)', fontWeight: '500', fontSize: '0.9rem' }}>
                  Product Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Large Ceramic Potted Plant"
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)', fontWeight: '500', fontSize: '0.9rem' }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input"
                  rows="4"
                  placeholder="Detailed description of the product..."
                  style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div>
            <h3 style={{ color: 'var(--color-text)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600' }}>
              Pricing & Inventory
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)', fontWeight: '500', fontSize: '0.9rem' }}>
                  Price <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.001"
                  min="0"
                  placeholder="0.000"
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)', fontWeight: '500', fontSize: '0.9rem' }}>
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="input"
                  style={{ width: '100%' }}
                >
                  <option value="OMR">OMR (Omani Rial)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)', fontWeight: '500', fontSize: '0.9rem' }}>
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)', fontWeight: '500', fontSize: '0.9rem' }}>
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                  style={{ width: '100%' }}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <h3 style={{ color: 'var(--color-text)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600' }}>
              Product Image
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {imagePreview && (
                <div style={{ 
                  width: '100%', 
                  maxWidth: '300px', 
                  height: '200px', 
                  background: '#fff',
                  borderRadius: 'var(--radius-md)', 
                  border: '2px solid var(--color-border)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain' 
                    }} 
                  />
                </div>
              )}
              
              <div>
                <label 
                  htmlFor="imageUpload"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    border: '2px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: 'var(--color-surface)',
                    transition: 'all 0.2s',
                    gap: '0.75rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                    e.currentTarget.style.background = 'var(--color-primary)10'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    e.currentTarget.style.background = 'var(--color-surface)'
                  }}
                >
                  {imagePreview ? (
                    <>
                      <MdImage size={32} color="var(--color-primary)" />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: 'var(--color-text)', fontWeight: '500' }}>
                          Click to change image
                        </div>
                        <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                          Max size: 5MB
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <MdCloudUpload size={48} color="var(--color-primary)" />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: 'var(--color-text)', fontWeight: '500' }}>
                          Click to upload product image
                        </div>
                        <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                          PNG, JPG, GIF up to 5MB
                        </div>
                      </div>
                    </>
                  )}
                </label>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div>
            <h3 style={{ color: 'var(--color-text)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600' }}>
              Availability
            </h3>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '1rem',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
              }}
            >
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label
                htmlFor="isActive"
                style={{ color: 'var(--color-text)', cursor: 'pointer', userSelect: 'none', flex: 1 }}
              >
                <div style={{ fontWeight: '500' }}>Product is active</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
                  Active products are visible to customers on the store
                </div>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginTop: '1rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--color-border)'
          }}>
            <Button type="submit" disabled={loading} style={{ flex: 1, padding: '0.875rem' }}>
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{ flex: 1, padding: '0.875rem' }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm
