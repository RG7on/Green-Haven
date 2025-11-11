import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { fetchOrders } from '../redux/slices/ordersSlice'
import { MdShoppingBag, MdCheckCircle, MdLocalShipping, MdHourglassEmpty } from 'react-icons/md'

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

  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])

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
    <div className="container stack" style={{paddingTop:'2rem', maxWidth:900}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', marginBottom:'1.5rem'}}>
        <MdShoppingBag style={{fontSize:'2rem', color:'var(--color-primary)'}} />
        <h2 className="display" style={{textAlign:'center', color:'var(--color-primary)', margin:0}}>Order History</h2>
      </div>

      <div className="stack" style={{gap:'1.5rem'}}>
        {orders.map(order => (
          <div key={order._id} className="card" style={{padding:'1.5rem'}}>
            {/* Order Header */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'1rem'}}>
              <div>
                <p style={{color:'var(--color-muted)', fontSize:'0.9rem', marginBottom:'0.25rem'}}>
                  Order ID: {order._id.slice(-8).toUpperCase()}
                </p>
                <p style={{color:'var(--color-text)', fontSize:'0.85rem'}}>
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div style={{
                display:'flex',
                alignItems:'center',
                gap:'0.5rem',
                padding:'0.5rem 1rem',
                borderRadius:'var(--radius-md)',
                background:'var(--color-surface-2)',
                color: statusColors[order.status],
                fontWeight:600,
                fontSize:'0.9rem'
              }}>
                {statusIcons[order.status]}
                <span style={{textTransform:'capitalize'}}>{order.status}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="stack" style={{gap:'0.75rem', marginBottom:'1rem'}}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                  <img 
                    src={item.image || '/vite.svg'} 
                    alt={item.name} 
                    style={{
                      width:60, 
                      height:60, 
                      objectFit:'contain', 
                      background:'#fff', 
                      borderRadius:'var(--radius-sm)', 
                      border:'1px solid var(--color-border)',
                      padding:'0.25rem'
                    }} 
                  />
                  <div style={{flex:1}}>
                    <p style={{color:'var(--color-text)', fontWeight:500, marginBottom:'0.25rem'}}>{item.name}</p>
                    <p style={{color:'var(--color-muted)', fontSize:'0.85rem'}}>
                      Quantity: {item.quantity} × {item.price.toFixed(2)} OMR
                    </p>
                  </div>
                  <p style={{color:'var(--color-primary)', fontWeight:700}}>
                    {(item.price * item.quantity).toFixed(2)} OMR
                  </p>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div style={{
              borderTop:'1px solid var(--color-border)', 
              paddingTop:'1rem', 
              display:'flex', 
              justifyContent:'space-between',
              alignItems:'center'
            }}>
              <div style={{color:'var(--color-muted)', fontSize:'0.9rem'}}>
                <p style={{marginBottom:'0.25rem'}}>Subtotal: {order.subtotal.toFixed(2)} OMR</p>
                <p style={{marginBottom:'0.25rem'}}>Tax: {order.tax.toFixed(2)} OMR</p>
                <p>Shipping: {order.shippingCost.toFixed(2)} OMR</p>
              </div>
              <div style={{textAlign:'right'}}>
                <p style={{color:'var(--color-muted)', fontSize:'0.9rem', marginBottom:'0.25rem'}}>Total</p>
                <p style={{color:'var(--color-primary)', fontSize:'1.5rem', fontWeight:700}}>
                  {order.totalPrice.toFixed(2)} OMR
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div style={{
                marginTop:'1rem', 
                padding:'1rem', 
                background:'var(--color-surface-2)', 
                borderRadius:'var(--radius-md)',
                fontSize:'0.85rem'
              }}>
                <p style={{fontWeight:600, marginBottom:'0.5rem', color:'var(--color-text)'}}>Shipping Address:</p>
                <p style={{color:'var(--color-muted)'}}>{order.shippingAddress.fullName}</p>
                <p style={{color:'var(--color-muted)'}}>{order.shippingAddress.address}</p>
                <p style={{color:'var(--color-muted)'}}>
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p style={{color:'var(--color-muted)'}}>{order.shippingAddress.country}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
