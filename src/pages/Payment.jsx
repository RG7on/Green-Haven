import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { createOrder } from '../redux/slices/ordersSlice'
import mastercardLogo from '../assets/payment_method_logos/Mastercard_Symbol_1.png'
import paypalLogo from '../assets/payment_method_logos/PayPal_Logo_Alternative_1.png'
import plantsDecor from '../assets/payment_method_logos/plants_payment_buttom.png'
import checkoutPlant from '../assets/payment_method_logos/checkout_palnt.png'
import Input from '../components/common/Input'

export default function Payment() {
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState(null)
  
  // Shipping address form
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('Oman')
  
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items } = useSelector(s => s.cart)
  
  // Calculate totals from cart items (backend format)
  const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0)
  const tax = subtotal * 0.10 // 10% tax
  const shippingCost = subtotal > 50 ? 0 : 5 // Free shipping over 50 OMR
  const total = subtotal + tax + shippingCost

  // Available payment methods shown as buttons below

  const handlePayment = async (e) => {
    e.preventDefault()
    
    if (!selectedMethod) {
      setError('Please select a payment method')
      return
    }
    
    if (!fullName || !address || !city || !postalCode || !country) {
      setError('Please fill in all shipping address fields')
      return
    }
    
    setProcessing(true)
    setError(null)
    
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
      <div style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
          padding: '2rem'
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            color: 'var(--color-primary)',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            ✅ Order Placed Successfully!
          </h1>
        
          <p style={{
            color: 'var(--color-text)',
            fontSize: '1.15rem',
            textAlign: 'center',
          maxWidth: '400px',
          lineHeight: '1.6'
        }}>
          Your home is about to feel more like green heaven soon !
        </p>
        
        <img 
          src={checkoutPlant} 
          alt="Happy plant"
          style={{
            width: '180px',
            height: 'auto',
            marginBottom: '2rem'
          }}
        />
        
        <p style={{
          color: 'var(--color-text)',
          fontSize: '1.1rem',
          fontWeight: 600
        }}>
          Share with us your experience!
        </p>
        
        <p style={{color: 'var(--color-muted)', marginTop: '2rem', fontSize: '0.9rem'}}>
            Redirecting to orders page...
        </p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1rem 140px 1rem',
      position: 'relative'
    }}>
      <form onSubmit={handlePayment} style={{width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {/* Order Summary */}
        <div className="card" style={{
          padding: '0.75rem',
          marginBottom: '1.5rem',
          maxWidth: '350px',
          width: '100%'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.95rem',
            color: 'var(--color-text)',
            marginBottom: '0.6rem'
          }}>
            Order Summary
          </h2>
          <div style={{borderTop: '1px solid var(--color-border)', paddingTop: '0.6rem'}}>
            {items.map(item => (
              <div key={item.product?._id || item.product} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.35rem',
                color: 'var(--color-text)',
                fontSize: '0.85rem'
              }}>
                <span>{item.name} × {item.quantity}</span>
                <span style={{fontWeight: 600}}>
                  {(item.price * item.quantity).toFixed(2)} OMR
                </span>
              </div>
            ))}
            <div style={{marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid var(--color-border)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem'}}>
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} OMR</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem'}}>
                <span>Tax (10%)</span>
                <span>{tax.toFixed(2)} OMR</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem'}}>
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : `${shippingCost.toFixed(2)} OMR`}</span>
              </div>
            </div>
            <div style={{
              borderTop: '2px solid var(--color-border)',
              marginTop: '0.6rem',
              paddingTop: '0.6rem',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-primary)'
            }}>
              <span>Total</span>
              <span>{total.toFixed(2)} OMR</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="card" style={{padding: '1.5rem', marginBottom: '1.5rem', width: '100%', maxWidth: '500px'}}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            color: 'var(--color-primary)',
            marginBottom: '1rem'
          }}>
            Shipping Address
          </h2>
          <div className="stack">
            <Input 
              label="Full Name" 
              value={fullName} 
              onChange={e => setFullName(e.target.value)} 
              required
            />
            <Input 
              label="Address" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              required
            />
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <Input 
                label="City" 
                value={city} 
                onChange={e => setCity(e.target.value)} 
                required
              />
              <Input 
                label="Postal Code" 
                value={postalCode} 
                onChange={e => setPostalCode(e.target.value)} 
                required
              />
            </div>
            <Input 
              label="Country" 
              value={country} 
              onChange={e => setCountry(e.target.value)} 
              required
            />
          </div>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--color-danger)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            width: '100%',
            maxWidth: '500px'
          }}>
            {error}
          </div>
        )}

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.6rem',
          color: 'var(--color-text)',
          marginBottom: '1.25rem',
          textAlign: 'center'
        }}>
          Choose your Payment method
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          width: '100%',
          maxWidth: '500px',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => setSelectedMethod('credit_card')}
            style={{
              padding: '1rem',
              border: selectedMethod === 'credit_card' ? '2.5px solid var(--color-primary)' : '2px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: selectedMethod === 'credit_card' ? 'rgba(46, 125, 50, 0.08)' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <img 
              src={mastercardLogo} 
              alt="Credit Card" 
              style={{width: '80px', height: 'auto', objectFit: 'contain'}}
            />
            <span style={{color: 'var(--color-text)', fontSize: '0.95rem'}}>Credit Card</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod('paypal')}
            style={{
              padding: '1rem',
              border: selectedMethod === 'paypal' ? '2.5px solid var(--color-primary)' : '2px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: selectedMethod === 'paypal' ? 'rgba(46, 125, 50, 0.08)' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <img 
              src={paypalLogo} 
              alt="PayPal" 
              style={{width: '80px', height: 'auto', objectFit: 'contain'}}
            />
            <span style={{color: 'var(--color-text)', fontSize: '0.95rem'}}>PayPal</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod('cash_on_delivery')}
            style={{
              padding: '1rem',
              border: selectedMethod === 'cash_on_delivery' ? '2.5px solid var(--color-primary)' : '2px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: selectedMethod === 'cash_on_delivery' ? 'rgba(46, 125, 50, 0.08)' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{fontSize: '2.5rem'}}>💵</span>
            <span style={{color: 'var(--color-text)', fontSize: '0.95rem'}}>Cash on Delivery</span>
          </button>
        </div>

        <button
          type="submit"
          disabled={!selectedMethod || processing}
          className="btn btn-primary"
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            opacity: (!selectedMethod || processing) ? 0.6 : 1,
            cursor: (!selectedMethod || processing) ? 'not-allowed' : 'pointer'
          }}
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="btn"
          style={{
            marginTop: '1rem',
            marginBottom: '1.5rem',
            background: 'transparent',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)'
          }}
        >
          Back to Cart
        </button>
      </form>

      <img 
        src={plantsDecor} 
        alt="Decorative plants"
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '1200px',
          height: 'auto',
          maxHeight: '100px',
          objectFit: 'contain',
          objectPosition: 'bottom',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
    </div>
  )
}
