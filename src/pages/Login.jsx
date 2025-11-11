import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../redux/slices/authSlice'
import { fetchCart } from '../redux/slices/cartSlice'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import homeArt from '../assets/home_art_photo.png'
import { MdEmail, MdLock } from 'react-icons/md'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, status, error } = useSelector((state) => state.auth)

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/home')
    }
  }, [user, navigate])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  async function handleSubmit(e) {
    e.preventDefault()
    const result = await dispatch(login({ email, password }))
    if (result.type === 'auth/login/fulfilled') {
      // Fetch user's cart after successful login
      await dispatch(fetchCart())
      navigate('/home')
    }
  }

  return (
    <div className="center" style={{padding:'2rem 1rem'}}>
      <div className="stack" style={{maxWidth:500, textAlign:'center'}}>
        <img src={homeArt} alt="logo" style={{height:96, margin:'0 auto'}} />
        <h1 className="display" style={{fontSize:'2rem', marginBottom:'1rem'}}>Greene Heaven</h1>
        <form onSubmit={handleSubmit} className="stack card" style={{padding:'2rem'}}>
          <h2 style={{textAlign:'center'}}>Login</h2>
          
          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--color-danger)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <Input 
            label="Email" 
            icon={<MdEmail />} 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            type="email" 
            required 
            disabled={status === 'loading'}
          />
          <Input 
            label="Password" 
            icon={<MdLock />} 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            type="password" 
            required 
            disabled={status === 'loading'}
          />
          <Button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Logging in...' : 'Login'}
          </Button>
          <p style={{textAlign:'center', color:'var(--color-text)'}}>
            <Link to="/signup" style={{color:'var(--color-primary)', textDecoration:'underline'}}>Don't have an account?</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
