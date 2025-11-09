import { useSelector, useDispatch } from 'react-redux'
import { changeQty, removeFromCart, clearCart } from '../redux/slices/cartSlice'
import QuantitySelector from '../components/common/QuantitySelector'
import Button from '../components/common/Button'
import { MdShoppingCart, MdDelete, MdPayment, MdDeleteSweep } from 'react-icons/md'

export default function Cart() {
  const items = useSelector(s => s.cart.items)
  const products = useSelector(s => s.products.items)
  const dispatch = useDispatch()
  const enriched = items.map(i => ({...i, product: products.find(p => p.id === i.productId)}))
  const total = enriched.reduce((a,c)=>a + c.product.price * c.qty,0)

  if (enriched.length === 0) {
    return (
      <div className="container stack" style={{paddingTop:'3rem', textAlign:'center', alignItems:'center'}}>
        <MdShoppingCart style={{fontSize:'5rem', color:'var(--color-border)'}} />
        <h2 className="display" style={{color:'var(--color-primary)'}}>Your Cart is Empty</h2>
        <p style={{color:'var(--color-muted)'}}>Add some plants to get started!</p>
      </div>
    )
  }

  return (
    <div className="container stack" style={{paddingTop:'2rem', maxWidth:800}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', marginBottom:'1rem'}}>
        <MdShoppingCart style={{fontSize:'2rem', color:'var(--color-primary)'}} />
        <h2 className="display" style={{textAlign:'center', color:'var(--color-primary)', margin:0}}>Shopping Cart</h2>
      </div>
      <div className="stack" style={{gap:'1rem'}}>
        {enriched.map(line => (
          <div key={line.productId} className="card" style={{display:'grid', gridTemplateColumns:'100px 1fr auto', gap:'1.25rem', padding:'1rem', alignItems:'center'}}>
            <img src={line.product.image || '/vite.svg'} alt={line.product.name} style={{width:100, height:100, objectFit:'contain', background:'#fff', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border)'}} />
            <div className="stack" style={{gap:'0.5rem'}}>
              <strong style={{color:'var(--color-text)', fontSize:'1.1rem'}}>{line.product.name}</strong>
              <div style={{color:'var(--color-primary)', fontWeight:700, fontSize:'1.25rem'}}>{line.product.price} {line.product.currency}</div>
              <QuantitySelector value={line.qty} onChange={(v)=>dispatch(changeQty({productId: line.productId, qty:v}))} />
            </div>
            <button 
              aria-label="remove" 
              onClick={()=>dispatch(removeFromCart(line.productId))} 
              style={{
                background:'var(--color-danger)', 
                border:'none', 
                cursor:'pointer', 
                fontSize:'1.5rem', 
                color:'white',
                borderRadius:'50%',
                width:40,
                height:40,
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                transition:'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <MdDelete />
            </button>
          </div>
        ))}
      </div>
      <div className="card" style={{padding:'1.5rem', marginTop:'1rem', textAlign:'center'}}>
        <p style={{fontSize:'1.5rem', color:'var(--color-text)', marginBottom:'1.5rem', fontWeight:700}}>
          Total: <span style={{color:'var(--color-primary)'}}>{total.toFixed(2)} OMR</span>
        </p>
        <div style={{display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap'}}>
          <Button variant="primary" style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <MdPayment /> Continue To Payment
          </Button>
          <Button variant="dark" onClick={()=>dispatch(clearCart())} style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <MdDeleteSweep /> Clear Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
