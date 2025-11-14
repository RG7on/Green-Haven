import { useNavigate, useLocation } from 'react-router-dom'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const getActiveButton = () => {
    if (location.pathname === '/admin') return 'overview'
    if (location.pathname === '/admin/products') return 'products'
    if (location.pathname === '/admin/orders') return 'orders'
    if (location.pathname === '/admin/users') return 'users'
    return 'overview'
  }

  const activeButton = getActiveButton()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingTop: '30px' }}>
      <div className="container" style={{ maxWidth: '1400px', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--color-muted)' }}>
            Manage your Green Haven store
          </p>
        </div>

        {/* Navigation Buttons - Always Visible */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/admin')}
            className={activeButton === 'overview' ? 'btn btn-primary' : 'btn'}
          >
            Overview
          </button>
          <button
            onClick={() => navigate('/admin/products')}
            className={activeButton === 'products' ? 'btn btn-primary' : 'btn'}
          >
            Manage Products
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className={activeButton === 'orders' ? 'btn btn-primary' : 'btn'}
          >
            View Orders
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className={activeButton === 'users' ? 'btn btn-primary' : 'btn'}
          >
            View Users
          </button>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}
