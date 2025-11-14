import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdPeople, MdShoppingCart, MdInventory, MdAttachMoney } from 'react-icons/md'
import AdminLayout from '../../components/layout/AdminLayout'

function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    users: { total: 0, recent: 0 },
    orders: { total: 0, pending: 0, revenue: 0 },
    products: { total: 0, active: 0 },
    loading: true
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const user = localStorage.getItem('user')
      if (!user) return
      const { token } = JSON.parse(user)

      // Fetch user stats
      const userStatsRes = await fetch('/api/users/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const userStatsData = await userStatsRes.json()

      // Fetch order stats
      const orderStatsRes = await fetch('/api/orders/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const orderStatsData = await orderStatsRes.json()

      // Fetch products
      const productsRes = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const productsData = await productsRes.json()
      const productsArray = productsData.data || productsData
      const activeProducts = productsArray.filter(p => p.isActive !== false)

      setStats({
        users: {
          total: userStatsData.data?.totalUsers || 0,
          recent: userStatsData.data?.recentRegistrations || 0
        },
        orders: {
          total: orderStatsData.data?.totalOrders || 0,
          pending: orderStatsData.data?.ordersByStatus?.pending || 0,
          revenue: orderStatsData.data?.totalRevenue || 0
        },
        products: {
          total: productsArray.length,
          active: activeProducts.length
        },
        loading: false
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      subtitle: `${stats.users.recent} new this month`,
      icon: MdPeople,
      color: 'var(--color-primary)',
      onClick: () => navigate('/admin/users')
    },
    {
      title: 'Total Orders',
      value: stats.orders.total,
      subtitle: `${stats.orders.pending} pending`,
      icon: MdShoppingCart,
      color: '#2196F3',
      onClick: () => navigate('/admin/orders')
    },
    {
      title: 'Products',
      value: stats.products.total,
      subtitle: `${stats.products.active} active`,
      icon: MdInventory,
      color: '#FF9800',
      onClick: () => navigate('/admin/products')
    },
    {
      title: 'Revenue',
      value: `${stats.orders.revenue.toFixed(3)} OMR`,
      subtitle: 'From delivered orders',
      icon: MdAttachMoney,
      color: '#4CAF50',
      onClick: null
    }
  ]

  return (
    <AdminLayout>
      {/* Stats Grid */}
      {stats.loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
          Loading statistics...
        </div>
      ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap: '1.5rem'
            }}
          >
            {statCards.map((card, index) => {
              const Icon = card.icon
              return (
                <div
                  key={index}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    cursor: card.onClick ? 'pointer' : 'default',
                    border: '1px solid var(--color-border)'
                  }}
                  onClick={card.onClick}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: `${card.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={24} color={card.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
                        {card.title}
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--color-text)' }}>
                        {card.value}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                    {card.subtitle}
                  </div>
                </div>
              )
            })}
          </div>
        )}
    </AdminLayout>
  )
}

export default Dashboard
