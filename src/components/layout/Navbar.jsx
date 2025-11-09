import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { MdShoppingCart, MdPerson, MdLogin } from 'react-icons/md'

export default function Navbar() {
  const cartCount = useSelector(s => s.cart.items.reduce((a,c)=>a+c.qty,0))
  const user = useSelector(s => s.auth.user)
  return (
    <header className="container" style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem'}}>
      <Link to="/" style={{fontFamily:'var(--font-display)', fontSize:'1.8rem', color:'var(--color-primary)', textDecoration:'none'}}>Greene Heaven</Link>
      <nav style={{display:'flex', gap:'1.5rem', alignItems:'center'}}>
        {user ? (
          <Link to="/profile" style={{color:'var(--color-text)', textDecoration:'none', fontWeight:500, display:'flex', alignItems:'center', gap:'0.35rem'}}>
            <MdPerson style={{fontSize:'1.3rem'}} /> Profile
          </Link>
        ) : (
          <Link to="/login" style={{color:'var(--color-text)', textDecoration:'none', fontWeight:500, display:'flex', alignItems:'center', gap:'0.35rem'}}>
            <MdLogin style={{fontSize:'1.3rem'}} /> Login
          </Link>
        )}
        <Link to="/cart" style={{color:'var(--color-text)', textDecoration:'none', fontWeight:500, display:'flex', alignItems:'center', gap:'0.35rem', position:'relative'}}>
          <MdShoppingCart style={{fontSize:'1.5rem'}} />
          {cartCount > 0 && (
            <span style={{
              position:'absolute',
              top:'-8px',
              right:'-8px',
              background:'var(--color-danger)',
              color:'white',
              borderRadius:'50%',
              width:'20px',
              height:'20px',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              fontSize:'0.75rem',
              fontWeight:'bold'
            }}>
              {cartCount}
            </span>
          )}
        </Link>
      </nav>
    </header>
  )
}
