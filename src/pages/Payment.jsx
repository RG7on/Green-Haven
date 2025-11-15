import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { createOrder } from '../redux/slices/ordersSlice'
import { updateProfile } from '../redux/slices/authSlice'
import { clearCart } from '../redux/slices/cartSlice'
import mastercardLogo from '../assets/payment_method_logos/Mastercard_Symbol_1.png'
import paypalLogo from '../assets/payment_method_logos/PayPal_Logo_Alternative_1.png'
import checkoutPlant from '../assets/payment_method_logos/checkout_palnt.png'
import AddressForm from '../components/common/AddressForm'
import { MdPayment, MdShoppingCart, MdLocalShipping } from 'react-icons/md'
import { getGovernorateById, getWilayatById } from '../utils/omanLocations'

export default function Payment() {
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [saveAsDefault, setSaveAsDefault] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryOption, setDeliveryOption] = useState('standard') // 'standard' or 'express'
  
  // Shipping address data
  const [addressData, setAddressData] = useState({
    fullName: '',
    phone: '',
    governorateId: '',
    wilayatId: '',
    houseNumber: '',
    additionalInfo: ''
  })
  
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items } = useSelector(s => s.cart)
  const { user } = useSelector(s => s.auth)

  // Autofill from user's saved address
  useEffect(() => {
    if (user?.address) {
      setAddressData({
        fullName: user.address.fullName || '',
        phone: user.address.phone || '',
        governorateId: user.address.governorateId || '',
        wilayatId: user.address.wilayatId || '',
        houseNumber: user.address.houseNumber || '',
        additionalInfo: user.address.additionalInfo || ''
      })
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
    
    if (!addressData.fullName || !addressData.phone || !addressData.governorateId || 
        !addressData.wilayatId || !addressData.houseNumber) {
      setError('Please fill in all required shipping address fields')
      return
    }
    
    setProcessing(true)
    setError(null)
    
    // Convert IDs to numbers for server validation
    const processedAddress = {
      ...addressData,
      governorateId: Number(addressData.governorateId),
      wilayatId: Number(addressData.wilayatId)
    }
    
    // Save address as default if checkbox is checked
    if (saveAsDefault && user) {
      await dispatch(updateProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        address: processedAddress
      }))
    }
    
    // Get governorate and wilayat names
    const governorate = getGovernorateById(processedAddress.governorateId)
    const wilayat = getWilayatById(processedAddress.governorateId, processedAddress.wilayatId)
    
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
        fullName: processedAddress.fullName,
        phone: processedAddress.phone,
        governorateId: processedAddress.governorateId,
        governorateName: governorate?.name || '',
        wilayatId: processedAddress.wilayatId,
        wilayatName: wilayat?.name || '',
        houseNumber: processedAddress.houseNumber,
        additionalInfo: processedAddress.additionalInfo || '',
        country: 'Oman'
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
      // Clear the cart immediately
      dispatch(clearCart())
      
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
              
              <AddressForm 
                value={addressData}
                onChange={setAddressData}
                disabled={processing}
              />
              
              {/* Save as default checkbox */}
              <label style={{
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                padding: '0.75rem',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
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
                  <span style={{fontSize: '0.95rem', color: 'var(--color-text)' }}>
                    Save this as my default shipping address
                  </span>
                </label>
                
              {/* Delivery Options - Radio Buttons */}
              <div style={{marginTop: '1.5rem'}}>
                <h3 style={{fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.75rem'}}>
                  Delivery Speed
                </h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    padding: '0.75rem',
                    background: deliveryOption === 'standard' ? 'var(--color-surface-2)' : 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: deliveryOption === 'standard' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)'
                  }}>
                    <input 
                      type="radio"
                      name="deliveryOption"
                      value="standard"
                      checked={deliveryOption === 'standard'}
                      onChange={(e) => setDeliveryOption(e.target.value)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: 'var(--color-primary)'
                      }}
                    />
                    <span style={{fontSize: '0.95rem', color: 'var(--color-text)', flex: 1}}>
                      Standard Delivery (3-5 business days) - Free
                    </span>
                  </label>
                  
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    padding: '0.75rem',
                    background: deliveryOption === 'express' ? 'var(--color-surface-2)' : 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: deliveryOption === 'express' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)'
                  }}>
                    <input 
                      type="radio"
                      name="deliveryOption"
                      value="express"
                      checked={deliveryOption === 'express'}
                      onChange={(e) => setDeliveryOption(e.target.value)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: 'var(--color-primary)'
                      }}
                    />
                    <span style={{fontSize: '0.95rem', color: 'var(--color-text)', flex: 1}}>
                      Express Delivery (1-2 business days) - 5 OMR
                    </span>
                  </label>
                </div>
              </div>
              
              {/* Preferred Delivery Date - Date Input */}
              <div style={{marginTop: '1.5rem'}}>
                <label style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  marginBottom: '0.5rem'
                }}>
                  Preferred Delivery Date (Optional)
                </label>
                <input 
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow minimum
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                />
                <p style={{fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '0.25rem'}}>
                  Select your preferred delivery date
                </p>
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
