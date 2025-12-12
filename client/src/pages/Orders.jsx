import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { fetchOrders } from '../redux/slices/ordersSlice'
import { MdShoppingBag, MdCheckCircle, MdLocalShipping, MdHourglassEmpty, MdSort, MdExpandMore, MdExpandLess, MdStar, MdStarBorder, MdClose } from 'react-icons/md'
import Button from '../components/common/Button'

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
  const [sortBy, setSortBy] = useState('date-desc')
  const [expandedOrders, setExpandedOrders] = useState({})
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [rating, setRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState('')

  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])

  // Sort orders (no filtering)
  const sortedOrders = [...orders].sort((a, b) => {
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

  const handleConfirmDelivery = async (orderId) => {
    try {
      const user = localStorage.getItem('user')
      if (!user) {
        console.error('No user found in localStorage')
        return
      }
      const userData = JSON.parse(user)
      
      console.log('Confirming delivery for order:', orderId)
      
      const response = await fetch(`/api/orders/${orderId}/confirm-delivery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        }
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        // Show feedback modal
        const order = orders.find(o => o._id === orderId)
        setSelectedOrder(order)
        setShowFeedbackModal(true)
        // Refresh orders
        await dispatch(fetchOrders())
      } else {
        const errorData = await response.json()
        console.error('Error confirming delivery:', errorData)
        alert('Failed to confirm delivery: ' + (errorData.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to confirm delivery:', error)
      alert('Failed to confirm delivery. Please try again.')
    }
  }

  const handleSubmitFeedback = async () => {
    if (!selectedOrder || rating === 0) return
    
    try {
      const user = localStorage.getItem('user')
      if (!user) return
      const userData = JSON.parse(user)
      
      const response = await fetch(`/api/orders/${selectedOrder._id}/feedback`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          rating,
          comment: feedbackComment
        })
      })
      
      if (response.ok) {
        setShowFeedbackModal(false)
        setRating(0)
        setFeedbackComment('')
        setSelectedOrder(null)
        dispatch(fetchOrders())
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  const handleFeedbackLater = () => {
    setShowFeedbackModal(false)
    setRating(0)
    setFeedbackComment('')
    setSelectedOrder(null)
  }

  const openFeedbackModal = (order) => {
    setSelectedOrder(order)
    setShowFeedbackModal(true)
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

      {/* Sort Controls */}
      <div style={{
        maxWidth:'1400px',
        margin:'0 auto 1.5rem',
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between',
        gap:'1rem',
        padding:'1rem',
        background:'var(--color-surface)',
        borderRadius:'var(--radius-md)',
        border:'1px solid var(--color-border)'
      }}>
        {/* Sort Options */}
        <div style={{flex:1, maxWidth:'400px'}}>
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
          color:'var(--color-muted)',
          fontSize:'0.95rem',
          fontWeight:500
        }}>
          {sortedOrders.length} {sortedOrders.length === 1 ? 'order' : 'orders'}
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
              borderBottom:'2px solid var(--color-primary)',
              position:'relative'
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
              
              {/* Confirm Delivery Button in header */}
              {!order.deliveryConfirmed && (
                <div style={{
                  position:'absolute',
                  top:'0.5rem',
                  right:0
                }}>
                  <Button
                    onClick={() => handleConfirmDelivery(order._id)}
                    style={{
                      padding:'0.6rem 1.2rem',
                      display:'flex',
                      alignItems:'center',
                      gap:'0.5rem',
                      fontSize:'0.9rem'
                    }}
                  >
                    <MdCheckCircle />
                    Confirm Delivery
                  </Button>
                </div>
              )}
              
              {/* Delivery Confirmed Badge */}
              {order.deliveryConfirmed && (
                <div style={{
                  position:'absolute',
                  top:'0.5rem',
                  right:0,
                  display:'flex',
                  alignItems:'center',
                  gap:'0.5rem',
                  padding:'0.6rem 1.2rem',
                  borderRadius:'var(--radius-md)',
                  background:'var(--color-surface-2)',
                  border:'2px solid #4caf50',
                  color:'#4caf50',
                  fontWeight:600,
                  fontSize:'0.9rem'
                }}>
                  <MdCheckCircle />
                  <span>Delivered</span>
                </div>
              )}
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
                        src={item.image || '/images/general/vite.svg'} 
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
                        {/* New Oman format with governorate/wilayat */}
                        {order.shippingAddress.governorateId ? (
                          <>
                            {order.shippingAddress.phone && (
                              <>Phone: {order.shippingAddress.phone}<br/></>
                            )}
                            House No: {order.shippingAddress.houseNumber}<br/>
                            {order.shippingAddress.wilayatName}, {order.shippingAddress.governorateName}<br/>
                            {order.shippingAddress.additionalInfo && (
                              <>{order.shippingAddress.additionalInfo}<br/></>
                            )}
                            Oman
                          </>
                        ) : (
                          /* Legacy address format */
                          <>
                            {order.shippingAddress.phoneNumber && (
                              <>Phone: {order.shippingAddress.phoneNumber}<br/></>
                            )}
                            {order.shippingAddress.address}<br/>
                            {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br/>
                            {order.shippingAddress.country}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Feedback Button (if delivery confirmed but no feedback) */}
                  {order.deliveryConfirmed && !order.feedback && (
                    <div style={{marginTop:'1rem'}}>
                      <Button
                        onClick={() => openFeedbackModal(order)}
                        style={{
                          width:'100%',
                          padding:'0.75rem',
                          display:'flex',
                          alignItems:'center',
                          justifyContent:'center'
                        }}
                      >
                        <MdStar style={{marginRight:'0.5rem'}} />
                        Leave Feedback
                      </Button>
                    </div>
                  )}

                  {/* Feedback Submitted */}
                  {order.feedback && (
                    <div style={{
                      marginTop:'1rem',
                      padding:'1rem',
                      background:'#f0f9ff',
                      borderRadius:'var(--radius-md)',
                      border:'1px solid #bae6fd'
                    }}>
                      <p style={{color:'var(--color-text)', fontWeight:600, marginBottom:'0.5rem', fontSize:'0.9rem'}}>
                        Your Feedback
                      </p>
                      <div style={{display:'flex', gap:'0.25rem', marginBottom:'0.5rem'}}>
                        {[1,2,3,4,5].map(star => (
                          star <= order.feedback.rating ? 
                            <MdStar key={star} style={{color:'#fbbf24', fontSize:'1.2rem'}} /> :
                            <MdStarBorder key={star} style={{color:'#d1d5db', fontSize:'1.2rem'}} />
                        ))}
                      </div>
                      {order.feedback.comment && (
                        <p style={{color:'var(--color-muted)', fontSize:'0.85rem', fontStyle:'italic'}}>
                          "{order.feedback.comment}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div style={{
          position:'fixed',
          top:0,
          left:0,
          right:0,
          bottom:0,
          background:'rgba(0,0,0,0.6)',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          zIndex:1000,
          padding:'1rem'
        }}
        onClick={handleFeedbackLater}
        >
          <div 
            className="card" 
            style={{
              maxWidth:500,
              width:'100%',
              padding:'2rem',
              position:'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleFeedbackLater}
              style={{
                position:'absolute',
                top:'1rem',
                right:'1rem',
                background:'none',
                border:'none',
                cursor:'pointer',
                color:'var(--color-muted)',
                fontSize:'1.5rem',
                padding:'0.25rem'
              }}
            >
              <MdClose />
            </button>

            <h2 style={{
              fontFamily:'var(--font-display)',
              fontSize:'1.5rem',
              color:'var(--color-primary)',
              marginBottom:'1.5rem',
              textAlign:'center'
            }}>
              How was your experience?
            </h2>

            {selectedOrder && (
              <p style={{
                color:'var(--color-muted)',
                fontSize:'0.9rem',
                textAlign:'center',
                marginBottom:'1.5rem'
              }}>
                Order #{selectedOrder._id.slice(-8).toUpperCase()}
              </p>
            )}

            {/* Star Rating */}
            <div style={{
              display:'flex',
              justifyContent:'center',
              gap:'0.5rem',
              marginBottom:'1.5rem'
            }}>
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background:'none',
                    border:'none',
                    cursor:'pointer',
                    padding:'0.25rem',
                    fontSize:'2.5rem',
                    transition:'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {star <= rating ? 
                    <MdStar style={{color:'#fbbf24'}} /> :
                    <MdStarBorder style={{color:'#d1d5db'}} />
                  }
                </button>
              ))}
            </div>

            {/* Feedback Comment */}
            <div style={{marginBottom:'1.5rem'}}>
              <label style={{
                display:'block',
                color:'var(--color-text)',
                fontSize:'0.9rem',
                fontWeight:600,
                marginBottom:'0.5rem'
              }}>
                Tell us more (optional)
              </label>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Share your experience with this order..."
                rows={4}
                style={{
                  width:'100%',
                  padding:'0.75rem',
                  borderRadius:'var(--radius-md)',
                  border:'1px solid var(--color-border)',
                  fontSize:'0.95rem',
                  fontFamily:'inherit',
                  resize:'vertical'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{
              display:'flex',
              gap:'0.75rem',
              flexDirection:'column'
            }}>
              <Button
                onClick={handleSubmitFeedback}
                disabled={rating === 0}
                style={{
                  width:'100%',
                  padding:'0.75rem',
                  opacity: rating === 0 ? 0.5 : 1,
                  cursor: rating === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                Submit Feedback
              </Button>
              <Button
                onClick={handleFeedbackLater}
                style={{
                  width:'100%',
                  padding:'0.75rem',
                  background:'var(--color-surface)',
                  color:'var(--color-text)',
                  border:'1px solid var(--color-border)'
                }}
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
