import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { fetchOrders } from '../redux/slices/ordersSlice'
import { MdShoppingBag, MdCheckCircle, MdLocalShipping, MdHourglassEmpty, MdFilterList, MdSort, MdExpandMore, MdExpandLess } from 'react-icons/md'

const statusIcons = {
  pending: <MdHourglassEmpty style={{color: '#ff9800'}} />,
  processing: <MdHourglassEmpty style={{color: '#2196f3'}} />,
  shipped: <MdLocalShipping style={{color: '#9c27b0'}} />,
  delivered: <MdCheckCircle style={{color: '#4caf50'}} />,
  cancelled: <MdCheckCircle style={{color: '#f44336'}} />
}

const statusColors = {
  pending: '#ff9800',
  processing: '#2196f3',
  shipped: '#9c27b0',
  delivered: '#4caf50',
  cancelled: '#f44336'
}

export default function Orders() {
  const { orders, status, error } = useSelector(s => s.orders)
  const dispatch = useDispatch()
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [expandedOrders, setExpandedOrders] = useState({})

  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])

  // Filter orders by status
  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' ? true : order.status === filterStatus
  )

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch(sortBy) {
      case 'date-desc':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'date-asc':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'total-desc':
        return b.totalPrice - a.totalPrice
      case 'total-asc':
        return a.totalPrice - b.totalPrice
      default:
        return 0
    }
  })

  const toggleOrderTracking = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  // Get tracking timeline based on order status
  const getTrackingTimeline = (order) => {
    const timeline = [
      { status: 'pending', label: 'Order Placed', completed: true, date: order.createdAt },
      { status: 'processing', label: 'Processing', completed: false, date: null },
      { status: 'shipped', label: 'Shipped', completed: false, date: null },
      { status: 'delivered', label: 'Delivered', completed: false, date: null }
    ]

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered']
    const currentIndex = statusOrder.indexOf(order.status)
    
    timeline.forEach((step, idx) => {
      if (idx <= currentIndex && order.status !== 'cancelled') {
        step.completed = true
      }
    })

    return timeline
  }

  if (status === 'loading') {
    return (
      <div className="container stack" style={{paddingTop:'3rem', textAlign:'center', alignItems:'center'}}>
        <p>Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container stack" style={{paddingTop:'3rem', textAlign:'center', alignItems:'center'}}>
        <p style={{color:'var(--color-danger)'}}>Error: {error}</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container stack" style={{paddingTop:'3rem', textAlign:'center', alignItems:'center'}}>
        <MdShoppingBag style={{fontSize:'5rem', color:'var(--color-border)'}} />
        <h2 className="display" style={{color:'var(--color-primary)'}}>No Orders Yet</h2>
        <p style={{color:'var(--color-muted)'}}>Your order history will appear here</p>
      </div>
    )
  }

  return (
    <div className="container" style={{paddingTop:'2rem', paddingBottom:'2rem'}}>
      <h2 style={{
        fontFamily:'var(--font-display)',
        fontSize:'1.75rem',
        color:'var(--color-primary)',
        marginBottom:'1.5rem',
        textAlign:'center',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        gap:'0.5rem'
      }}>
        <MdShoppingBag /> Order History
      </h2>

      {/* Filter and Sort Controls */}
      <div style={{
        maxWidth:'1400px',
        margin:'0 auto 1.5rem',
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
        gap:'1rem',
        padding:'1rem',
        background:'var(--color-surface)',
        borderRadius:'var(--radius-md)',
        border:'1px solid var(--color-border)'
      }}>
        {/* Filter by Status */}
        <div>
          <label style={{
            display:'flex',
            alignItems:'center',
            gap:'0.5rem',
            color:'var(--color-text)',
            fontSize:'0.9rem',
            fontWeight:600,
            marginBottom:'0.5rem'
          }}>
            <MdFilterList /> Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width:'100%',
              padding:'0.6rem',
              borderRadius:'var(--radius-md)',
              border:'1px solid var(--color-border)',
              background:'white',
              color:'var(--color-text)',
              fontSize:'0.95rem',
              cursor:'pointer'
            }}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label style={{
            display:'flex',
            alignItems:'center',
            gap:'0.5rem',
            color:'var(--color-text)',
            fontSize:'0.9rem',
            fontWeight:600,
            marginBottom:'0.5rem'
          }}>
            <MdSort /> Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width:'100%',
              padding:'0.6rem',
              borderRadius:'var(--radius-md)',
              border:'1px solid var(--color-border)',
              background:'white',
              color:'var(--color-text)',
              fontSize:'0.95rem',
              cursor:'pointer'
            }}
          >
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="total-desc">Total (Highest First)</option>
            <option value="total-asc">Total (Lowest First)</option>
          </select>
        </div>

        {/* Results Count */}
        <div style={{
          display:'flex',
          alignItems:'flex-end',
          justifyContent:'center',
          color:'var(--color-muted)',
          fontSize:'0.95rem'
        }}>
          Showing {sortedOrders.length} of {orders.length} orders
        </div>
      </div>

      <div className="stack" style={{gap:'1.5rem', maxWidth:'1400px', margin:'0 auto'}}>
        {sortedOrders.map(order => (
          <div key={order._id} className="card" style={{padding:'1.5rem', overflow:'hidden'}}>
            {/* Order Header */}
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap:'1rem',
              marginBottom:'1.5rem',
              paddingBottom:'1rem',
              borderBottom:'2px solid var(--color-primary)'
            }}>
              <div>
                <p style={{color:'var(--color-muted)', fontSize:'0.8rem', marginBottom:'0.25rem', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                  Order ID
                </p>
                <p style={{color:'var(--color-text)', fontSize:'1rem', fontWeight:600}}>
                  #{order._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div>
                <p style={{color:'var(--color-muted)', fontSize:'0.8rem', marginBottom:'0.25rem', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                  Order Date
                </p>
                <p style={{color:'var(--color-text)', fontSize:'0.95rem'}}>
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div style={{
                display:'flex',
                alignItems:'center',
                justifyContent:'flex-start',
                gap:'0.5rem'
              }}>
                <div style={{
                  display:'flex',
                  alignItems:'center',
                  gap:'0.5rem',
                  padding:'0.6rem 1.2rem',
                  borderRadius:'var(--radius-md)',
                  background:'var(--color-surface-2)',
                  border:`2px solid ${statusColors[order.status]}`,
                  color: statusColors[order.status],
                  fontWeight:600,
                  fontSize:'0.9rem',
                  width:'fit-content'
                }}>
                  {statusIcons[order.status]}
                  <span style={{textTransform:'capitalize'}}>{order.status}</span>
                </div>
              </div>
            </div>

            {/* Two Column Layout - Order Details & Shipping Address */}
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
              gap:'2rem'
            }}>
              {/* Left Column - Order Items & Total */}
              <div>
                <h3 style={{
                  fontSize:'1rem',
                  fontWeight:600,
                  color:'var(--color-text)',
                  marginBottom:'1rem',
                  textTransform:'uppercase',
                  letterSpacing:'0.5px'
                }}>
                  Order Items
                </h3>
                
                {/* Order Items */}
                <div className="stack" style={{gap:'1rem', marginBottom:'1.5rem'}}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{
                      display:'flex',
                      alignItems:'center',
                      gap:'1rem',
                      padding:'0.75rem',
                      background:'var(--color-surface)',
                      borderRadius:'var(--radius-md)',
                      border:'1px solid var(--color-border)'
                    }}>
                      <img 
                        src={item.image || '/vite.svg'} 
                        alt={item.name} 
                        style={{
                          width:70, 
                          height:70, 
                          objectFit:'contain', 
                          background:'#fff', 
                          borderRadius:'var(--radius-sm)', 
                          border:'1px solid var(--color-border)',
                          padding:'0.5rem'
                        }} 
                      />
                      <div style={{flex:1}}>
                        <p style={{color:'var(--color-text)', fontWeight:600, marginBottom:'0.25rem', fontSize:'0.95rem'}}>
                          {item.name}
                        </p>
                        <p style={{color:'var(--color-muted)', fontSize:'0.85rem'}}>
                          Qty: {item.quantity} × {item.price.toFixed(2)} OMR
                        </p>
                      </div>
                      <p style={{color:'var(--color-primary)', fontWeight:700, fontSize:'1.1rem'}}>
                        {(item.price * item.quantity).toFixed(2)} OMR
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div style={{
                  background:'var(--color-surface-2)',
                  padding:'1.25rem',
                  borderRadius:'var(--radius-md)',
                  border:'2px solid var(--color-primary)'
                }}>
                  <div style={{marginBottom:'0.75rem'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', fontSize:'0.95rem'}}>
                      <span style={{color:'var(--color-text)'}}>Subtotal:</span>
                      <span style={{color:'var(--color-text)', fontWeight:500}}>{order.subtotal.toFixed(2)} OMR</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', fontSize:'0.95rem'}}>
                      <span style={{color:'var(--color-text)'}}>Tax:</span>
                      <span style={{color:'var(--color-text)', fontWeight:500}}>{order.tax.toFixed(2)} OMR</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.95rem'}}>
                      <span style={{color:'var(--color-text)'}}>Shipping:</span>
                      <span style={{color:'var(--color-text)', fontWeight:500}}>{order.shippingCost.toFixed(2)} OMR</span>
                    </div>
                  </div>
                  <div style={{
                    borderTop:'2px solid var(--color-primary)',
                    paddingTop:'0.75rem',
                    display:'flex',
                    justifyContent:'space-between',
                    alignItems:'center'
                  }}>
                    <span style={{color:'var(--color-primary)', fontSize:'1.1rem', fontWeight:700}}>Total:</span>
                    <span style={{color:'var(--color-primary)', fontSize:'1.75rem', fontWeight:700}}>
                      {order.totalPrice.toFixed(2)} OMR
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column - Shipping Address */}
              {order.shippingAddress && (
                <div style={{height:'fit-content'}}>
                  <h3 style={{
                    fontSize:'1rem',
                    fontWeight:600,
                    color:'var(--color-text)',
                    marginBottom:'1rem',
                    textTransform:'uppercase',
                    letterSpacing:'0.5px'
                  }}>
                    Delivery Details
                  </h3>
                  <div style={{
                    padding:'1.5rem', 
                    background:'var(--color-surface-2)', 
                    borderRadius:'var(--radius-md)',
                    border:'1px solid var(--color-border)'
                  }}>
                    <div style={{marginBottom:'1rem'}}>
                      <p style={{color:'var(--color-muted)', fontSize:'0.8rem', marginBottom:'0.25rem', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                        Recipient
                      </p>
                      <p style={{color:'var(--color-text)', fontWeight:600, fontSize:'1rem'}}>
                        {order.shippingAddress.fullName}
                      </p>
                    </div>
                    <div>
                      <p style={{color:'var(--color-muted)', fontSize:'0.8rem', marginBottom:'0.25rem', textTransform:'uppercase', letterSpacing:'0.5px'}}>
                        Address
                      </p>
                      <p style={{color:'var(--color-text)', lineHeight:1.6, fontSize:'0.95rem'}}>
                        {order.shippingAddress.address}<br/>
                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br/>
                        {order.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
