import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../redux/slices/authSlice'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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
      <form onSubmit={handleSubmit} className="stack card" style={{maxWidth:500, padding:'2rem'}}>
        <h2 style={{textAlign:'center'}}>Login</h2>
        <Input label="Email" value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        <Input label="Password" value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        <Button type="submit">Login</Button>
        <p style={{textAlign:'center'}}><Link to="/signup" style={{textDecoration:'underline'}}>Don’t have an account?</Link></p>
      </form>
    </div>
  )
}
