import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { clearCart } from '../redux/slices/cartSlice'
import mastercardLogo from '../assets/payment_method_logos/Mastercard_Symbol_1.png'
import visaLogo from '../assets/payment_method_logos/Visa Inc._idDUM8TcN7_1.png'
import paypalLogo from '../assets/payment_method_logos/PayPal_Logo_Alternative_1.png'
import plantsDecor from '../assets/payment_method_logos/plants_payment_buttom.png'
import checkoutPlant from '../assets/payment_method_logos/checkout_palnt.png'

export default function Payment() {
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const items = useSelector(s => s.cart.items)
  const products = useSelector(s => s.products.items)
  
  const enriched = items.map(i => ({...i, product: products.find(p => p._id === i.productId)}))
  const total = enriched.reduce((a,c) => a + (c.product?.price || 0) * c.qty, 0)

  const paymentMethods = [
    { id: 'mastercard', name: 'MasterCard', logo: mastercardLogo },
    { id: 'visa', name: 'Visa', logo: visaLogo },
    { id: 'paypal', name: 'PayPal', logo: paypalLogo }
  ]

  const handlePayment = async () => {
    if (!selectedMethod) return
    
    setProcessing(true)
    
    // Simulate payment processing delay (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate successful payment
    setProcessing(false)
    setShowSuccess(true)
    
    // Clear cart after successful payment
    dispatch(clearCart())
    
    // Redirect to home after 3 seconds
    setTimeout(() => {
      navigate('/home')
    }, 3000)
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
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          color: 'var(--color-text)',
          marginBottom: '0.5rem'
        }}>
          Thank you
        </h1>
        <p style={{
          color: 'var(--color-text)',
          fontSize: '1.1rem',
          marginBottom: '2rem',
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
          Redirecting to home...
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
      padding: '3rem 1rem 200px 1rem',
      position: 'relative'
    }}>
      <div className="card" style={{
        padding: '0.75rem',
        marginBottom: '1.25rem',
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
          {enriched.map(item => (
            <div key={item.productId} style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.35rem',
              color: 'var(--color-text)',
              fontSize: '0.85rem'
            }}>
              <span>{item.product?.name} × {item.qty}</span>
              <span style={{fontWeight: 600}}>
                {((item.product?.price || 0) * item.qty).toFixed(2)} OMR
              </span>
            </div>
          ))}
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
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '3rem'
      }}>
        {paymentMethods.map(method => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            style={{
              width: '150px',
              height: '100px',
              border: selectedMethod === method.id 
                ? '3px solid var(--color-primary)' 
                : '2px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'white',
              cursor: 'pointer',
              padding: '1rem',
              transition: 'all 0.3s ease',
              boxShadow: selectedMethod === method.id 
                ? 'var(--shadow-md)' 
                : 'var(--shadow-sm)',
              transform: selectedMethod === method.id ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <img 
              src={method.logo} 
              alt={method.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </button>
        ))}
      </div>

      {selectedMethod && (
        <button
          onClick={handlePayment}
          disabled={processing}
          className="btn btn-primary"
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            marginTop: '1.5rem',
            opacity: processing ? 0.6 : 1,
            cursor: processing ? 'not-allowed' : 'pointer',
            minWidth: '200px',
            zIndex: 10,
            position: 'relative'
          }}
        >
          {processing ? 'Processing...' : `Pay ${total.toFixed(2)} OMR`}
        </button>
      )}
      
      <button
        onClick={() => navigate('/cart')}
        className="btn"
        style={{
          marginTop: '1rem',
          marginBottom: '2rem',
          background: 'transparent',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          zIndex: 10,
          position: 'relative'
        }}
      >
        Back to Cart
      </button>

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
          maxHeight: '120px',
          objectFit: 'contain',
          objectPosition: 'bottom',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
    </div>
  )
}
