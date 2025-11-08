import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const cartCount = useSelector(s => s.cart.items.reduce((a,c)=>a+c.qty,0))
  const user = useSelector(s => s.auth.user)
  return (
    <header className="container" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
      <Link to="/" style={{fontFamily:'var(--font-display)', fontSize:'1.8rem', color:'var(--color-primary)'}}>Green Haven</Link>
      <nav style={{display:'flex', gap:'1rem', alignItems:'center'}}>
        {user ? <Link to="/profile">Profile</Link> : <Link to="/login">Login</Link>}
        <Link to="/cart">Cart ({cartCount})</Link>
      </nav>
    </header>
  )
}
