import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { MdShoppingCart, MdRemoveRedEye } from 'react-icons/md'
import Button from '../components/common/Button'
import Toast from '../components/common/Toast'
import { addToCartAsync } from '../redux/slices/cartSlice'
import { selectProduct, loadProducts } from '../redux/slices/productsSlice'
import ProductModal from '../components/ProductModal'

function ProductCard({ product, onAddToCart }) {
  const dispatch = useDispatch()
  const openDetails = () => dispatch(selectProduct(product))
  const onKeyOpen = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openDetails()
    }
  }
  
  const handleQuickAdd = async (e) => {
    e.stopPropagation()
    const result = await dispatch(addToCartAsync({productId: product._id, quantity: 1}))
    if (result.type === 'cart/addToCart/fulfilled') {
      onAddToCart?.(product.name)
    }
  }
  
  return (
    <div
      className="card"
      style={{
        padding:'0',
        borderRadius:'16px',
        width:'min(100%, 320px)',
        overflow:'hidden',
        position:'relative'
      }}
    >
      {/* Image Container */}
      <div 
        role="button"
        tabIndex={0}
        onKeyDown={onKeyOpen}
        onClick={openDetails}
        style={{
          position:'relative',
          background:'#fff',
          height:240,
          cursor:'pointer',
          overflow:'hidden'
        }}
      >
        <img 
          src={product.image || '/vite.svg'} 
          alt={product.name} 
          style={{
            width:'100%',
            height:'100%',
            objectFit:'cover'
          }} 
        />
        
        {/* Quick View Overlay */}
        <div 
          style={{
            position:'absolute',
            top:0,
            left:0,
            right:0,
            bottom:0,
            background:'rgba(0,0,0,0.4)',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            opacity:0,
            transition:'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
        >
          <Button 
            onClick={(e) => { e.stopPropagation(); openDetails() }}
            style={{
              background:'white',
              color:'var(--color-primary)',
              padding:'0.75rem 1.5rem',
              fontWeight:600,
              display:'flex',
              alignItems:'center',
              gap:'0.5rem'
            }}
          >
            <MdRemoveRedEye style={{fontSize:'1.2rem'}} />
            View Details
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div style={{padding:'1rem'}}>
        <h3 style={{
          fontSize:'1rem',
          fontWeight:600,
          color:'var(--color-text)',
          marginBottom:'0.5rem',
          minHeight:'3rem',
          lineHeight:1.4
        }}>
          {product.name}
        </h3>
        
        <div style={{
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          marginTop:'0.75rem'
        }}>
          <div style={{
            fontWeight:700,
            fontSize:'1.25rem',
            color:'var(--color-primary)'
          }}>
            {product.price} {product.currency}
          </div>
          
          <Button 
            onClick={handleQuickAdd}
            style={{
              background:'var(--color-primary)',
              color:'white',
              padding:'0.6rem 1rem',
              display:'flex',
              alignItems:'center',
              gap:'0.5rem',
              fontWeight:600,
              fontSize:'0.9rem'
            }}
          >
            <MdShoppingCart style={{fontSize:'1.1rem'}} />
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { items: products, status, error, selected } = useSelector(s => s.products)
  const user = useSelector(s => s.auth.user)
  const dispatch = useDispatch()
  const [toast, setToast] = useState(null)
  
  useEffect(() => {
    if (status === 'idle') dispatch(loadProducts())
  }, [status, dispatch])
  
  const handleAddToCart = (productName) => {
    setToast(`${productName} added to cart!`)
  }
  
  // Filter products - only show active products to all users
  const displayProducts = products.filter(p => p.isActive !== false)
  
  return (
    <div className="container">
      <h1 className="display" style={{textAlign:'center', marginBottom:'1.5rem', color:'var(--color-primary)'}}>Greene Heaven</h1>
      {status === 'loading' && <p style={{textAlign:'center'}}>Loading products...</p>}
      {status === 'failed' && <p style={{textAlign:'center', color:'var(--color-danger)'}}>Failed: {error}</p>}
      <div style={{display:'flex', flexWrap:'wrap', gap:'1.5rem', justifyContent:'center'}}>
        {displayProducts.map(p => <ProductCard key={p._id || p.id} product={p} onAddToCart={handleAddToCart} />)}
      </div>
      {selected && (
        <ProductModal product={selected} onClose={()=>dispatch(selectProduct(null))} />
      )}
      {toast && (
        <Toast message={toast} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
