import { useSelector, useDispatch } from 'react-redux'
import { changeQty, removeFromCart, clearCart } from '../redux/slices/cartSlice'
import QuantitySelector from '../components/common/QuantitySelector'
import Button from '../components/common/Button'

export default function Cart() {
  const items = useSelector(s => s.cart.items)
  const products = useSelector(s => s.products.items)
  const dispatch = useDispatch()
  const enriched = items.map(i => ({...i, product: products.find(p => p.id === i.productId)}))
  const total = enriched.reduce((a,c)=>a + c.product.price * c.qty,0)

  return (
    <div className="container stack" style={{paddingTop:'2rem'}}>
      <h2 className="display" style={{textAlign:'center'}}>Cart</h2>
      <div className="stack" style={{gap:'1.5rem'}}>
        {enriched.map(line => (
          <div key={line.productId} className="card" style={{display:'grid', gridTemplateColumns:'80px 1fr auto', gap:'1rem', padding:'0.75rem', alignItems:'center'}}>
            <img src={line.product.image || '/vite.svg'} alt="" style={{width:80, height:80, objectFit:'contain', background:'#fff', borderRadius:12}} />
            <div className="stack" style={{gap:4}}>
              <strong>{line.product.name}</strong>
              <div style={{color:'var(--color-primary)'}}>{line.product.price} {line.product.currency}</div>
              <QuantitySelector value={line.qty} onChange={(v)=>dispatch(changeQty({productId: line.productId, qty:v}))} />
            </div>
            <button aria-label="remove" onClick={()=>dispatch(removeFromCart(line.productId))} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem'}}>🗑️</button>
          </div>
        ))}
      </div>
      <div style={{textAlign:'center', marginTop:'1rem'}}>
        <p><strong>Total:</strong> {total.toFixed(2)} OMR</p>
        <Button variant="primary" style={{marginRight:'1rem'}}>Continue To Payment</Button>
        <Button onClick={()=>dispatch(clearCart())}>Clear Cart</Button>
      </div>
    </div>
  )
}
