import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { MdShoppingCart, MdPerson, MdLogin, MdLogout, MdShoppingBag, MdSearch } from 'react-icons/md'
import { logout } from '../../redux/slices/authSlice'
import { clearCart } from '../../redux/slices/cartSlice'
import { useState } from 'react'

export default function Navbar() {
  const cartCount = useSelector(s => s.cart.items.reduce((a,c)=>a+(c.quantity || 0), 0))
  const user = useSelector(s => s.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearCart())
    navigate('/')
  }

  // Real-time search: update Home page as user types
  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    navigate(`/home?search=${encodeURIComponent(value)}`)
  }

  return (
    <header className="container" style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', gap:'1rem', flexWrap:'wrap'}}>
      <Link to="/home" style={{fontFamily:'var(--font-display)', fontSize:'1.8rem', color:'var(--color-primary)', textDecoration:'none'}}>Greene Heaven</Link>
      
      {/* Search Box */}
      {user && (
        <div style={{flex:'1', maxWidth:'400px', position:'relative'}}>
          <input
            type="text"
            placeholder="Search plants..."
            value={searchQuery}
            onChange={handleInputChange}
            style={{
              width:'100%',
              padding:'0.6rem 2.5rem 0.6rem 1rem',
              borderRadius:'var(--radius-md)',
              border:'1px solid var(--color-border)',
              fontSize:'0.95rem',
              outline:'none'
            }}
          />
          <span
            style={{
              position:'absolute',
              right:'0.5rem',
              top:'50%',
              transform:'translateY(-50%)',
              color:'var(--color-primary)',
              padding:'0.25rem'
            }}
          >
            <MdSearch style={{fontSize:'1.5rem'}} />
          </span>
        </div>
      )}
      
      <nav style={{display:'flex', gap:'1.5rem', alignItems:'center'}}>
        {user ? (
          <>
            <Link to="/orders" style={{color:'var(--color-text)', textDecoration:'none', fontWeight:500, display:'flex', alignItems:'center', gap:'0.35rem'}}>
              <MdShoppingBag style={{fontSize:'1.3rem'}} /> Orders
            </Link>
            <Link to="/profile" style={{color:'var(--color-text)', textDecoration:'none', fontWeight:500, display:'flex', alignItems:'center', gap:'0.35rem'}}>
              <MdPerson style={{fontSize:'1.3rem'}} /> Profile
            </Link>
            <button 
              onClick={handleLogout}
              style={{
                background:'transparent',
                border:'none',
                color:'var(--color-text)',
                cursor:'pointer',
                fontWeight:500,
                display:'flex',
                alignItems:'center',
                gap:'0.35rem',
                fontSize:'1rem',
                fontFamily:'inherit'
              }}
            >
              <MdLogout style={{fontSize:'1.3rem'}} /> Logout
            </button>
          </>
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
