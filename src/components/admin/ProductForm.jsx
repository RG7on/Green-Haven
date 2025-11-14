import { useState, useEffect } from 'react'
import Input from '../common/Input'
import Button from '../common/Button'
import { MdClose } from 'react-icons/md'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
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

      if (!res.ok) {
        setError(data.message || 'Failed to save product')
        setLoading(false)
        return
      }

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
          maxWidth: '600px',
          width: '100%',
          padding: '2rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--color-primary)', margin: 0 }}>
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: 'var(--color-text)',
              display: 'flex'
            }}
          >
            <MdClose size={24} />
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Product Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Large Ceramic Plant"
          />

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)', fontWeight: '500' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows="3"
              placeholder="Product description..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <Input
              label="Price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.001"
              min="0"
              placeholder="0.000"
            />

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text)', fontWeight: '500' }}>
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="OMR">OMR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <Input
            label="Image URL"
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="/src/assets/..."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Stock"
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              placeholder="0"
            />

            <Input
              label="Category"
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Indoor Plants"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label
              htmlFor="isActive"
              style={{ color: 'var(--color-text)', cursor: 'pointer', userSelect: 'none' }}
            >
              Product is active and visible to customers
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{ flex: 1 }}
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
