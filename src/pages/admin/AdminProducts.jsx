import { useState, useEffect } from 'react'
import { MdAdd, MdEdit, MdDelete, MdToggleOff, MdToggleOn, MdFilterList, MdSearch } from 'react-icons/md'
import ProductForm from '../../components/admin/ProductForm'
import AdminLayout from '../../components/layout/AdminLayout'

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    let filtered = products

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) ||
        (product.description || '').toLowerCase().includes(term) ||
        (product.category || '').toLowerCase().includes(term)
      )
    }

    // Filter by status
    if (statusFilter === 'enabled') {
      filtered = filtered.filter(p => p.isActive === true)
    } else if (statusFilter === 'disabled') {
      filtered = filtered.filter(p => p.isActive === false)
    }

    setFilteredProducts(filtered)
  }, [statusFilter, searchTerm, products])

  const fetchProducts = async () => {
    try {
      const user = localStorage.getItem('user')
      if (!user) return
      const { token } = JSON.parse(user)

      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setProducts(data.data || data)
      setFilteredProducts(data.data || data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setLoading(false)
    }
  }

  const handleToggleStatus = async (productId) => {
    try {
      const user = localStorage.getItem('user')
      if (!user) return
      const { token } = JSON.parse(user)

      const res = await fetch(`/api/products/${productId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (res.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Failed to toggle product status:', error)
    }
  }

  const handleDelete = (product) => {
    setDeleteConfirm(product)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      const user = localStorage.getItem('user')
      if (!user) return
      const { token } = JSON.parse(user)

      const res = await fetch(`/api/products/${deleteConfirm._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        fetchProducts()
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
      setDeleteConfirm(null)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  const handleFormSuccess = () => {
    handleCloseForm()
    fetchProducts()
  }

  return (
    <AdminLayout>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
          Loading products...
        </div>
      ) : (
        <>
          {/* Page Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ color: 'var(--color-primary)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                Product Management
              </h1>
              <p style={{ color: 'var(--color-muted)' }}>
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} {statusFilter !== 'all' && `(filtered from ${products.length})`}
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <MdAdd size={20} />
              Add Product
            </button>
          </div>

          {/* Filters */}
          <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Search Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 250px' }}>
                <MdSearch size={20} color="var(--color-muted)" />
                <input
                  type="text"
                  placeholder="Search by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input"
                  style={{ flex: 1, margin: 0 }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="btn"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MdFilterList size={20} color="var(--color-muted)" />
                <span style={{ color: 'var(--color-text)', fontWeight: '500' }}>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                  style={{ width: 'auto', minWidth: '150px', margin: 0 }}
                >
                  <option value="all">All Products</option>
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Table */}
          {filteredProducts.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1rem' }}>
                {statusFilter !== 'all' ? `No ${statusFilter} products found` : 'No products found'}
              </p>
              {statusFilter === 'all' && (
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                  Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--color-text)' }}>Product</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--color-text)' }}>Price</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--color-text)' }}>Stock</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--color-text)' }}>Category</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--color-text)' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--color-text)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                  <tr key={product._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: '500', color: 'var(--color-text)' }}>{product.name}</div>
                          {product.description && (
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
                              {product.description.substring(0, 50)}{product.description.length > 50 ? '...' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-text)' }}>
                      {product.price} {product.currency}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-text)' }}>
                      {product.stock || 0}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-text)' }}>
                      {product.category || 'Uncategorized'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          background: product.isActive ? '#4CAF5020' : '#F4433620',
                          color: product.isActive ? '#4CAF50' : '#F44336'
                        }}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(product)}
                          style={{
                            padding: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-primary)',
                            borderRadius: 'var(--radius-sm)'
                          }}
                          title="Edit"
                        >
                          <MdEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(product._id)}
                          style={{
                            padding: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: product.isActive ? '#4CAF50' : '#F44336',
                            borderRadius: 'var(--radius-sm)'
                          }}
                          title={product.isActive ? 'Disable' : 'Enable'}
                        >
                          {product.isActive ? <MdToggleOn size={24} /> : <MdToggleOff size={24} />}
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          style={{
                            padding: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-danger)',
                            borderRadius: 'var(--radius-sm)'
                          }}
                          title="Delete"
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSuccess={handleFormSuccess}
          onClose={handleCloseForm}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
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
            padding: '1rem'
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="card"
            style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>
              Delete Product?
            </h2>
            <p style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
            </p>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={confirmDelete}
                className="btn"
                style={{ 
                  flex: 1, 
                  background: 'var(--color-danger)', 
                  color: 'white',
                  border: 'none'
                }}
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminProducts
