import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import QuantitySelector from '../components/common/QuantitySelector'
import Button from '../components/common/Button'
import { addToCart } from '../redux/slices/cartSlice'

export default function ProductDetails() {
  const { id } = useParams()
  const product = useSelector(s => s.products.items.find(p => p.id === id) || s.products.selected)
  const [qty, setQty] = useState(1)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  if (!product) return <div className="container" style={{color:'var(--color-text)'}}>Product not found.</div>

  const onAdd = () => {
    dispatch(addToCart({ productId: product.id, qty }))
    navigate('/cart')
  }

  return (
    <div className="container" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem', alignItems:'center', paddingTop:'2rem'}}>
      <div className="card" style={{padding:'1rem'}}>
        <img src={product.image || '/images/general/vite.svg'} alt="" style={{width:'100%', objectFit:'contain'}} />
      </div>
      <div className="stack">
        <h2 className="display" style={{color:'var(--color-primary)'}}>{product.name}</h2>
        <p style={{color:'var(--color-text)'}}>{product.description}</p>
        <div style={{fontWeight:700, fontSize:'1.5rem', color:'var(--color-primary)'}}>{product.price} {product.currency}</div>
        <div style={{display:'flex', gap:16, alignItems:'center'}}>
          <QuantitySelector value={qty} onChange={setQty} />
          <Button variant="primary" onClick={onAdd}>Add to Cart</Button>
          <Button variant="dark">Buy Now</Button>
        </div>
      </div>
    </div>
  )
}
