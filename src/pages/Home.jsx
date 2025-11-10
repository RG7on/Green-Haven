import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import Button from '../components/common/Button'
import { addToCart } from '../redux/slices/cartSlice'
import { selectProduct, loadProducts } from '../redux/slices/productsSlice'
import ProductModal from '../components/ProductModal'

function ProductCard({ product }) {
  const dispatch = useDispatch()
  const openDetails = () => dispatch(selectProduct(product))
  const onKeyOpen = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openDetails()
    }
  }
  return (
    <div
      className="card"
      role="button"
      tabIndex={0}
      onKeyDown={onKeyOpen}
      onClick={openDetails}
      style={{padding:'1rem', borderRadius:'16px', width:'min(100%, 320px)', cursor:'pointer'}}
    >
      <div style={{background:'#fff', borderRadius:'12px', padding:'0.5rem', border:'1px solid var(--color-border)'}}>
        <img src={product.image || '/vite.svg'} alt={product.name} style={{width:'100%', height:220, objectFit:'contain'}} />
      </div>
      <div className="stack" style={{padding:'0.75rem'}}>
        <div style={{minHeight:56, color:'var(--color-text)'}}>{product.name}</div>
        <div style={{fontWeight:700, color:'var(--color-primary)'}}>{product.price} {product.currency}</div>
        <div style={{display:'flex', gap:8}}>
          <Button onClick={(e)=>{ e.stopPropagation(); openDetails() }}>View Details</Button>
          <Button aria-label="quick add" onClick={(e)=>{ e.stopPropagation(); dispatch(addToCart({productId: product.id}))}}>+ Cart</Button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { items: products, status, error, selected } = useSelector(s => s.products)
  const dispatch = useDispatch()
  
  useEffect(() => {
    if (status === 'idle') dispatch(loadProducts())
  }, [status, dispatch])
  
  return (
    <div className="container">
      <h1 className="display" style={{textAlign:'center', marginBottom:'1.5rem', color:'var(--color-primary)'}}>Greene Heaven</h1>
      {status === 'loading' && <p style={{textAlign:'center'}}>Loading products...</p>}
      {status === 'failed' && <p style={{textAlign:'center', color:'var(--color-danger)'}}>Failed: {error}</p>}
      <div style={{display:'flex', flexWrap:'wrap', gap:'1.5rem', justifyContent:'center'}}>
        {products.map(p => <ProductCard key={p._id || p.id} product={p} />)}
      </div>
      {selected && (
        <ProductModal product={selected} onClose={()=>dispatch(selectProduct(null))} />
      )}
    </div>
  )
}
