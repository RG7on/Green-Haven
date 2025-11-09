import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../redux/slices/authSlice'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import homeArt from '../assets/home_art_photo.png'
import { MdEmail, MdLock } from 'react-icons/md'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    // Placeholder auth
    dispatch(loginSuccess({ id: 'u1', email }))
    navigate('/home')
  }

  return (
    <div className="center" style={{padding:'2rem 1rem'}}>
      <div className="stack" style={{maxWidth:500, textAlign:'center'}}>
        <img src={homeArt} alt="logo" style={{height:96, margin:'0 auto'}} />
        <h1 className="display" style={{fontSize:'2rem', marginBottom:'1rem'}}>Greene Heaven</h1>
        <form onSubmit={handleSubmit} className="stack card" style={{padding:'2rem'}}>
          <h2 style={{textAlign:'center'}}>Login</h2>
          <Input label="Email" icon={<MdEmail />} value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
          <Input label="Password" icon={<MdLock />} value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
          <Button type="submit">Login</Button>
          <p style={{textAlign:'center', color:'var(--color-text)'}}>
            <Link to="/signup" style={{color:'var(--color-primary)', textDecoration:'underline'}}>Don't have an account?</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
