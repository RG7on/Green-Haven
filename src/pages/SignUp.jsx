import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearError } from '../redux/slices/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import homeArt from '../assets/home_art_photo.png'
import { MdPerson, MdEmail, MdLock } from 'react-icons/md'

export default function SignUp() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
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
    const result = await dispatch(register({ firstName, lastName, email, password }))
    if (result.type === 'auth/register/fulfilled') {
      navigate('/home')
    }
  }

  return (
    <div className="center" style={{padding:'2rem 1rem'}}>
      <div className="stack" style={{maxWidth:600, textAlign:'center'}}>
        <img src={homeArt} alt="logo" style={{height:96, margin:'0 auto'}} />
        <h1 className="display" style={{fontSize:'2rem', marginBottom:'1rem'}}>Greene Heaven</h1>
        <form onSubmit={handleSubmit} className="stack card" style={{padding:'2rem'}}>
          <h2 style={{textAlign:'center'}}>Sign Up</h2>
          
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

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <Input 
              label="First Name" 
              icon={<MdPerson />} 
              value={firstName} 
              onChange={e=>setFirstName(e.target.value)} 
              required 
              disabled={status === 'loading'}
            />
            <Input 
              label="Last Name" 
              icon={<MdPerson />} 
              value={lastName} 
              onChange={e=>setLastName(e.target.value)} 
              required 
              disabled={status === 'loading'}
            />
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
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
          </div>
          <Button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Creating account...' : 'Join Now'}
          </Button>
          <p style={{textAlign:'center', color:'var(--color-text)'}}>
            <Link to="/login" style={{color:'var(--color-primary)', textDecoration:'underline'}}>Already have an account?</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
