import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { createOrder } from '../redux/slices/ordersSlice'
import { updateProfile } from '../redux/slices/authSlice'
import mastercardLogo from '../assets/payment_method_logos/Mastercard_Symbol_1.png'
import paypalLogo from '../assets/payment_method_logos/PayPal_Logo_Alternative_1.png'
import checkoutPlant from '../assets/payment_method_logos/checkout_palnt.png'
import Input from '../components/common/Input'
import { MdPayment, MdShoppingCart, MdLocalShipping } from 'react-icons/md'

export default function Payment() {
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [saveAsDefault, setSaveAsDefault] = useState(false)
  
  // Shipping address form
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('Oman')
  
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items } = useSelector(s => s.cart)
  const { user } = useSelector(s => s.auth)

  // Autofill from user's saved address
  useEffect(() => {
    if (user?.address) {
      setFullName(user.address.fullName || '')
      setPhoneNumber(user.address.phoneNumber || '')
      setAddress(user.address.address || '')
      setCity(user.address.city || '')
      setPostalCode(user.address.postalCode || '')
      setCountry(user.address.country || 'Oman')
    }
  }, [user])
  
  // Calculate totals from cart items (backend format)
  const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0)
  const tax = subtotal * 0.05 // 5% tax
  const shippingCost = 3 // Flat 3 OMR shipping
  const total = subtotal + tax + shippingCost

  // Available payment methods shown as buttons below

  const handlePayment = async (e) => {
    e.preventDefault()
    
    if (!selectedMethod) {
      setError('Please select a payment method')
      return
    }
    
    if (!fullName || !phoneNumber || !address || !city || !postalCode || !country) {
      setError('Please fill in all shipping address fields')
      return
    }
    
    setProcessing(true)
    setError(null)
    
    // Save address as default if checkbox is checked
    if (saveAsDefault && user) {
      await dispatch(updateProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        address: {
          fullName,
          phoneNumber,
          address,
          city,
          postalCode,
          country
        }
      }))
    }
    
    // Prepare order data matching backend schema
    const orderData = {
      items: items.map(item => ({
        product: item.product?._id || item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      shippingAddress: {
        fullName,
        phoneNumber,
        address,
        city,
        postalCode,
        country
      },
      paymentMethod: selectedMethod,
      subtotal,
      tax,
      shippingCost,
      totalPrice: total
    }
    
    // Create order in database
    const result = await dispatch(createOrder(orderData))
    
    setProcessing(false)
    
    if (result.type === 'orders/createOrder/fulfilled') {
      setShowSuccess(true)
      
      // Redirect to orders page after 3 seconds
      setTimeout(() => {
        navigate('/orders')
      }, 3000)
    } else {
      setError(result.payload || 'Failed to create order. Please try again.')
    }
  }
  
  // Redirect if cart is empty
  if (items.length === 0 && !showSuccess) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <h2 style={{fontFamily: 'var(--font-display)', color: 'var(--color-text)', marginBottom: '1rem'}}>
          Your cart is empty
        </h2>
        <button 
          onClick={() => navigate('/home')} 
          className="btn btn-primary"
        >
          Continue Shopping
        </button>
      </div>
    )
  }
  
  // Success screen
  if (showSuccess) {
    return (
      <div className="container" style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          {/* Image on top */}
          <img 
            src={checkoutPlant} 
            alt="Success"
            style={{
              width: '200px',
              height: 'auto',
              marginBottom: '0.1rem'
            }}
          />

          {/* Success message */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '0.35rem'
          }}>
            <span style={{fontSize: '3rem'}}>✅</span>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              color: 'var(--color-primary)',
              margin: 0
            }}>
              Order Placed Successfully!
            </h1>
          </div>

          <p style={{
            color: 'var(--color-text)',
            fontSize: '1.05rem',
            lineHeight: '1.5'
          }}>
            Thank you for your purchase! Your order has been confirmed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{
      paddingTop: '1.5rem',
      paddingBottom: '2rem'
    }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.75rem',
        color: 'var(--color-primary)',
        marginBottom: '1.5rem',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        <MdPayment /> Checkout
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
        gap: '1.5rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Left Column - Order Summary (Scrollable items only) */}
        <div>
          <div className="card" style={{
            padding: '1.25rem',
            background: 'var(--color-surface-2)',
            border: '2px solid var(--color-border)',
            maxHeight: '600px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              color: 'var(--color-primary)',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexShrink: 0
            }}>
              <MdShoppingCart /> Order Summary
            </h2>
            
            {/* Scrollable Items List */}
            <div style={{
              marginBottom: '0.75rem',
              overflowY: 'auto',
              flexGrow: 1,
              paddingRight: '0.5rem'
            }}>
              {items.map(item => (
                <div key={item.product?._id || item.product} style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--color-border)'
                }}>
                  <img 
                    src={item.image || '/vite.svg'} 
                    alt={item.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      objectFit: 'contain',
                      background: 'white',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      padding: '0.25rem',
                      flexShrink: 0
                    }}
                  />
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{
                      color: 'var(--color-text)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      marginBottom: '0.15rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.name}
                    </div>
                    <div style={{
                      color: 'var(--color-muted)',
                      fontSize: '0.8rem'
                    }}>
                      Quantity: {item.quantity}
                    </div>
                    <div style={{
                      color: 'var(--color-primary)',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      marginTop: '0.15rem'
                    }}>
                      {(item.price * item.quantity).toFixed(2)} OMR
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fixed Price Breakdown */}
            <div style={{
              borderTop: '2px solid var(--color-border)',
              paddingTop: '0.75rem',
              fontSize: '0.9rem',
              flexShrink: 0
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: 'var(--color-text)'}}>
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} OMR</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: 'var(--color-text)'}}>
                <span>Tax (10%)</span>
                <span>{tax.toFixed(2)} OMR</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--color-text)'}}>
                <span>Shipping</span>
                <span style={{color: shippingCost === 0 ? 'var(--color-primary)' : 'inherit', fontWeight: shippingCost === 0 ? 600 : 400}}>
                  {shippingCost === 0 ? 'FREE' : `${shippingCost.toFixed(2)} OMR`}
                </span>
              </div>
              
              {subtotal < 50 && (
                <div style={{
                  padding: '0.6rem',
                  background: 'rgba(58, 107, 49, 0.1)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  color: 'var(--color-text)',
                  marginBottom: '0.75rem',
                  border: '1px solid var(--color-primary)'
                }}>
                  💡 Add {(50 - subtotal).toFixed(2)} OMR more for free shipping!
                </div>
              )}

              <div style={{
                borderTop: '2px solid var(--color-primary)',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--color-primary)'
              }}>
                <span>Total</span>
                <span>{total.toFixed(2)} OMR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form Section (No scroll) */}
        <div>
          <form onSubmit={handlePayment} className="stack" style={{gap: '1.5rem'}}>
            {/* Shipping Address Section */}
            <div className="card" style={{padding: '1.25rem'}}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                color: 'var(--color-primary)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <MdLocalShipping /> Shipping Address
              </h2>
              <div className="stack" style={{gap: '0.85rem'}}>
                <Input 
                  label="Full Name" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  required
                  placeholder="Enter your full name"
                />
                <Input 
                  label="Phone Number" 
                  value={phoneNumber} 
                  onChange={e => setPhoneNumber(e.target.value)} 
                  required
                  type="tel"
                  placeholder="Phone number"
                />
                <Input 
                  label="Address" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  required
                  placeholder="Street address, P.O. box"
                />
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem'}}>
                  <Input 
                    label="City" 
                    value={city} 
                    onChange={e => setCity(e.target.value)} 
                    required
                    placeholder="City"
                  />
                  <Input 
                    label="Postal Code" 
                    value={postalCode} 
                    onChange={e => setPostalCode(e.target.value)} 
                    required
                    placeholder="Postal code"
                  />
                </div>
                <Input 
                  label="Country" 
                  value={country} 
                  onChange={e => setCountry(e.target.value)} 
                  required
                  placeholder="Country"
                />
                
                {/* Save as default checkbox */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.75rem',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  marginTop: '0.5rem'
                }}>
                  <input 
                    type="checkbox"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: 'var(--color-primary)'
                    }}
                  />
                  <span style={{fontSize: '0.95rem', color: 'var(--color-text)'}}>
                    Save this as my default shipping address
                  </span>
                </label>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="card" style={{padding: '1.25rem'}}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                color: 'var(--color-primary)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <MdPayment /> Payment Method
              </h2>

              {error && (
                <div style={{
                  padding: '0.85rem',
                  backgroundColor: 'var(--color-danger)',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.9rem'
                }}>
                  {error}
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.85rem',
                marginBottom: '1.25rem'
              }}>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('credit_card')}
                  style={{
                    padding: '1rem',
                    border: selectedMethod === 'credit_card' ? '3px solid var(--color-primary)' : '2px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    background: selectedMethod === 'credit_card' ? 'rgba(58, 107, 49, 0.1)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    minHeight: '120px',
                    boxShadow: selectedMethod === 'credit_card' ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                  }}
                >
                  <div style={{height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <img 
                      src={mastercardLogo} 
                      alt="Credit Card" 
                      style={{width: '70px', height: '50px', objectFit: 'contain'}}
                    />
                  </div>
                  <span style={{color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 600}}>Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('paypal')}
                  style={{
                    padding: '1rem',
                    border: selectedMethod === 'paypal' ? '3px solid var(--color-primary)' : '2px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    background: selectedMethod === 'paypal' ? 'rgba(58, 107, 49, 0.1)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    minHeight: '120px',
                    boxShadow: selectedMethod === 'paypal' ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                  }}
                >
                  <div style={{height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <img 
                      src={paypalLogo} 
                      alt="PayPal" 
                      style={{width: '94px', height: '67px', objectFit: 'contain'}}
                    />
                  </div>
                  <span style={{color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 600}}>PayPal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('cash_on_delivery')}
                  style={{
                    padding: '1rem',
                    border: selectedMethod === 'cash_on_delivery' ? '3px solid var(--color-primary)' : '2px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    background: selectedMethod === 'cash_on_delivery' ? 'rgba(58, 107, 49, 0.1)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    minHeight: '120px',
                    boxShadow: selectedMethod === 'cash_on_delivery' ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                  }}
                >
                  <div style={{height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <span style={{fontSize: '3rem', lineHeight: 1}}>💵</span>
                  </div>
                  <span style={{color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 600}}>Cash on Delivery</span>
                </button>
              </div>

              <div style={{display: 'flex', gap: '0.85rem', flexWrap: 'wrap'}}>
                <button
                  type="submit"
                  disabled={!selectedMethod || processing}
                  className="btn btn-primary"
                  style={{
                    flex: '1 1 180px',
                    padding: '0.85rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    opacity: (!selectedMethod || processing) ? 0.6 : 1,
                    cursor: (!selectedMethod || processing) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <MdPayment /> {processing ? 'Processing...' : 'Place Order'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="btn"
                  style={{
                    flex: '1 1 180px',
                    padding: '0.85rem 1.5rem',
                    background: 'white',
                    color: 'var(--color-text)',
                    border: '2px solid var(--color-border)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <MdShoppingCart /> Back to Cart
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
