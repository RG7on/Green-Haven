import { useSelector, useDispatch } from 'react-redux'
import Button from '../components/common/Button'
import { addToCart } from '../redux/slices/cartSlice'
import { selectProduct } from '../redux/slices/productsSlice'
import ProductModal from '../components/ProductModal'

function ProductCard({ product }) {
  const dispatch = useDispatch()
  return (
    <div className="card" style={{padding:'1rem', borderRadius:'16px'}}>
      <div style={{background:'#fff', borderRadius:'12px', padding:'0.5rem', border:'1px solid var(--color-border)'}}>
        <img src={product.image || '/vite.svg'} alt="" style={{width:'100%', height:220, objectFit:'contain'}} />
      </div>
      <div className="stack" style={{padding:'0.75rem'}}>
        <div style={{minHeight:56, color:'var(--color-text)'}}>{product.name}</div>
        <div style={{fontWeight:700, color:'var(--color-primary)'}}>{product.price} {product.currency}</div>
        <div style={{display:'flex', gap:8}}>
          <Button onClick={()=>dispatch(selectProduct(product))}>View Details</Button>
          <Button aria-label="quick add" onClick={()=>dispatch(addToCart({productId: product.id}))}>+ Cart</Button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const products = useSelector(s => s.products.items)
  const selected = useSelector(s => s.products.selected)
  const dispatch = useDispatch()
  return (
    <div className="container">
      <h1 className="display" style={{textAlign:'center', marginBottom:'1.5rem', color:'var(--color-primary)'}}>Greene Heaven</h1>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:'1rem'}}>
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      {selected && (
        <ProductModal product={selected} onClose={()=>dispatch(selectProduct(null))} />
      )}
    </div>
  )
}
