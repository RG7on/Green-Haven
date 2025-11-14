import { useState, useEffect } from 'react'
import { MdFilterList, MdSearch } from 'react-icons/md'
import AdminLayout from '../../components/layout/AdminLayout'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    let filtered = orders

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(order => {
        const userName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.toLowerCase()
        const userEmail = (order.user?.email || '').toLowerCase()
        const phone = (order.shippingAddress?.phone || '').toLowerCase()
        const orderId = (order._id || '').toLowerCase()
        
        return userName.includes(term) || 
               userEmail.includes(term) || 
               phone.includes(term) || 
               orderId.includes(term)
      })
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [statusFilter, searchTerm, orders])

  const fetchOrders = async () => {
    try {
      const user = localStorage.getItem('user')
      if (!user) return
      const { token } = JSON.parse(user)

      const res = await fetch('/api/orders/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setOrders(data.data || [])
      setFilteredOrders(data.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const user = localStorage.getItem('user')
      if (!user) return
      const { token } = JSON.parse(user)

      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      processing: '#2196F3',
      shipped: '#9C27B0',
      delivered: '#4CAF50',
      cancelled: '#F44336'
    }
    return colors[status] || '#757575'
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          Orders Management
        </h1>
        <p style={{ color: 'var(--color-muted)' }}>
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
        </p>
      </div>

        {/* Filters */}
        <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 250px' }}>
              <MdSearch size={20} color="var(--color-muted)" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or order ID..."
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
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-muted)' }}>No orders found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredOrders.map((order) => (
              <div key={order._id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
                      Order #{order._id.slice(-8)}
                    </div>
                    <div style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                      {order.user?.firstName} {order.user?.lastName}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                      {order.user?.email}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600', fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                      {order.totalPrice.toFixed(3)} {order.items[0]?.currency || 'OMR'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                    Items ({order.items.length}):
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx}>
                        {item.name} × {item.quantity} ({item.price} {item.currency})
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                    Shipping Address:
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                    {order.shippingAddress.fullName}<br />
                    {order.shippingAddress.phoneNumber && `${order.shippingAddress.phoneNumber}`}<br />
                    {order.shippingAddress.address}, {order.shippingAddress.city}<br />
                    {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text)' }}>
                    Status:
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="input"
                    style={{
                      width: 'auto',
                      minWidth: '150px',
                      borderColor: getStatusColor(order.status),
                      color: getStatusColor(order.status),
                      fontWeight: '500'
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
    </AdminLayout>
  )
}

export default AdminOrders
