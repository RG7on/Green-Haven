import { useEffect, useRef, useState } from 'react'
import { MdClose } from 'react-icons/md'
import Button from './common/Button'
import QuantitySelector from './common/QuantitySelector'
import Toast from './common/Toast'
import { useDispatch } from 'react-redux'
import { addToCartAsync } from '../redux/slices/cartSlice'
import { useNavigate } from 'react-router-dom'

export default function ProductModal({ product, onClose }) {
  const [qty, setQty] = useState(1)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const backdropRef = useRef(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleBackdrop = (e) => {
    if (e.target === backdropRef.current) onClose?.()
  }

  const onAdd = async () => {
    setLoading(true)
    const result = await dispatch(addToCartAsync({ productId: product._id, quantity: qty }))
    setLoading(false)
    if (result.type === 'cart/addToCart/fulfilled') {
      setToast(`${qty}x ${product.name} added to cart!`)
    } else {
      setToast(`Error: ${result.payload || 'Failed to add to cart'}`)
    }
  }

  const onBuyNow = async () => {
    setLoading(true)
    const result = await dispatch(addToCartAsync({ productId: product._id, quantity: qty }))
    setLoading(false)
    if (result.type === 'cart/addToCart/fulfilled') {
      onClose?.()
      navigate('/cart')
    } else {
      setToast(`Error: ${result.payload || 'Failed to add to cart'}`)
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`Product details for ${product.name}`}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        display: 'grid', placeItems: 'center', padding: '1rem', zIndex: 50
      }}
    >
      <div className="card" style={{
        position:'relative',
        width: 'min(900px, 100%)',
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
        padding: '1.25rem'
      }}>
        <button
          aria-label="close"
          onClick={onClose}
          style={{
            position:'absolute', top:'10px', right:'10px',
            background:'transparent', border:'none', cursor:'pointer',
            color:'var(--color-text)'
          }}
        >
          <MdClose style={{fontSize:'1.75rem', fontWeight:800}} />
        </button>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', alignItems:'center'}}>
          <div className="card" style={{padding:'1rem', background:'#fff'}}>
            <img src={product.image || '/vite.svg'} alt="" style={{width:'100%', objectFit:'contain'}} />
          </div>
          <div className="stack">
            <h2 className="display" style={{color:'var(--color-primary)'}}>{product.name}</h2>
            <p style={{color:'var(--color-text)'}}>{product.description}</p>
            <div style={{fontWeight:700, fontSize:'1.25rem', color:'var(--color-primary)'}}>{product.price} {product.currency}</div>
            <div style={{display:'flex', gap:16, alignItems:'center', flexWrap:'wrap'}}>
              <QuantitySelector value={qty} onChange={setQty} />
              <Button variant="primary" onClick={onAdd} disabled={loading}>
                {loading ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button variant="dark" onClick={onBuyNow} disabled={loading}>
                {loading ? 'Processing...' : 'Buy Now'}
              </Button>
            </div>
          </div>
        </div>
        {toast && (
          <Toast message={toast} onClose={() => setToast(null)} />
        )}
      </div>
    </div>
  )
}
