import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { fetchCart, updateCartItemAsync, removeFromCartAsync, clearCartAsync } from '../redux/slices/cartSlice'
import QuantitySelector from '../components/common/QuantitySelector'
import Button from '../components/common/Button'
import { MdShoppingCart, MdDelete, MdPayment, MdDeleteSweep } from 'react-icons/md'

export default function Cart() {
  const { items, status } = useSelector(s => s.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Fetch cart when component loads
  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  // Calculate total from cart items
  const subtotal = items.reduce((acc, item) => {
    return acc + (item.price || 0) * (item.quantity || 0)
  }, 0)
  const tax = subtotal * 0.05 // 5% tax
  const shippingCost = 3 // Flat 3 OMR shipping
  const total = subtotal + tax + shippingCost

  const handleQuantityChange = async (productId, quantity) => {
    await dispatch(updateCartItemAsync({ productId, quantity }))
  }

  const handleRemoveItem = async (productId) => {
    await dispatch(removeFromCartAsync(productId))
  }

  const handleClearCart = async () => {
    await dispatch(clearCartAsync())
  }

  if (status === 'loading') {
    return (
      <div className="container stack" style={{paddingTop:'3rem', textAlign:'center', alignItems:'center'}}>
        <p>Loading cart...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container stack" style={{paddingTop:'3rem', textAlign:'center', alignItems:'center'}}>
        <MdShoppingCart style={{fontSize:'5rem', color:'var(--color-border)'}} />
        <h2 className="display" style={{color:'var(--color-primary)'}}>Your Cart is Empty</h2>
        <p style={{color:'var(--color-muted)'}}>Add some plants to get started!</p>
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
        <MdShoppingCart /> Shopping Cart
      </h2>

      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
        gap:'1.5rem',
        maxWidth:'1400px',
        margin:'0 auto'
      }}>
        {/* Left Column - Cart Items (Scrollable) */}
        <div>
          <div style={{
            maxHeight:'600px',
            overflowY:'auto',
            paddingRight:'0.5rem'
          }}>
            <div className="stack" style={{gap:'1rem'}}>
              {items.map((item, index) => {
                const productId = item.product?._id || item.product
                // Use a combination of productId and index to ensure unique keys
                const uniqueKey = productId || `item-${index}`
                return (
                  <div key={uniqueKey} className="card" style={{
                    display:'grid',
                    gridTemplateColumns:'100px 1fr auto',
                    gap:'1rem',
                    padding:'1rem',
                    alignItems:'center'
                  }}>
                    <img 
                      src={item.image || '/images/general/vite.svg'} 
                      alt={item.name} 
                      style={{
                        width:100,
                        height:100,
                        objectFit:'contain',
                        background:'#fff',
                        borderRadius:'var(--radius-md)',
                        border:'1px solid var(--color-border)'
                      }} 
                    />
                    <div className="stack" style={{gap:'0.5rem'}}>
                      <strong style={{color:'var(--color-text)', fontSize:'1.05rem'}}>{item.name}</strong>
                      <div style={{color:'var(--color-primary)', fontWeight:700, fontSize:'1.2rem'}}>
                        {item.price} OMR
                      </div>
                      <QuantitySelector 
                        value={item.quantity} 
                        onChange={(v) => handleQuantityChange(productId, v)} 
                      />
                    </div>
                    <button 
                      aria-label="remove" 
                      onClick={() => handleRemoveItem(productId)} 
                      style={{
                        background:'var(--color-danger)',
                        border:'none',
                        cursor:'pointer',
                        fontSize:'1.5rem',
                        color:'white',
                        borderRadius:'50%',
                        width:40,
                        height:40,
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        transition:'transform 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <MdDelete />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Cart Summary */}
        <div>
          <div className="card" style={{
            padding:'1.5rem',
            background:'var(--color-surface-2)',
            border:'2px solid var(--color-border)',
            position:'sticky',
            top:'20px'
          }}>
            <h3 style={{
              fontFamily:'var(--font-display)',
              fontSize:'1.3rem',
              color:'var(--color-primary)',
              marginBottom:'1rem'
            }}>
              Order Summary
            </h3>

            <div style={{
              borderTop:'2px solid var(--color-border)',
              paddingTop:'1rem',
              marginBottom:'1rem'
            }}>
              <div style={{
                display:'flex',
                justifyContent:'space-between',
                marginBottom:'0.5rem',
                fontSize:'0.95rem',
                color:'var(--color-text)'
              }}>
                <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                <span>{subtotal.toFixed(2)} OMR</span>
              </div>

              <div style={{
                display:'flex',
                justifyContent:'space-between',
                marginBottom:'0.5rem',
                fontSize:'0.95rem',
                color:'var(--color-text)'
              }}>
                <span>Tax (5%)</span>
                <span>{tax.toFixed(2)} OMR</span>
              </div>

              <div style={{
                display:'flex',
                justifyContent:'space-between',
                marginBottom:'1rem',
                fontSize:'0.95rem',
                color:'var(--color-text)'
              }}>
                <span>Shipping</span>
                <span>{shippingCost.toFixed(2)} OMR</span>
              </div>

              <div style={{
                borderTop:'2px solid var(--color-primary)',
                paddingTop:'1rem',
                display:'flex',
                justifyContent:'space-between',
                fontSize:'1.4rem',
                fontWeight:700,
                color:'var(--color-primary)'
              }}>
                <span>Total</span>
                <span>{total.toFixed(2)} OMR</span>
              </div>
            </div>

            <div className="stack" style={{gap:'0.85rem'}}>
              <Button 
                variant="primary" 
                onClick={() => navigate('/payment')} 
                style={{
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  gap:'0.5rem',
                  width:'100%',
                  padding:'1rem',
                  fontSize:'1.05rem'
                }}
              >
                <MdPayment /> Continue To Payment
              </Button>
              <Button 
                variant="dark" 
                onClick={handleClearCart} 
                style={{
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  gap:'0.5rem',
                  width:'100%',
                  padding:'0.85rem',
                  fontSize:'0.95rem'
                }}
              >
                <MdDeleteSweep /> Clear Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
