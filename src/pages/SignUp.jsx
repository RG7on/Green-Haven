import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../redux/slices/authSlice'
import { useNavigate, Link } from 'react-router-dom'

export default function SignUp() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    dispatch(loginSuccess({ id: 'u1', email, firstName, lastName }))
    navigate('/home')
  }

  return (
    <div className="center" style={{padding:'2rem 1rem'}}>
      <form onSubmit={handleSubmit} className="stack card" style={{maxWidth:520, padding:'2rem'}}>
        <h2 style={{textAlign:'center'}}>Sign Up</h2>
        <Input label="First Name" value={firstName} onChange={e=>setFirstName(e.target.value)} required />
        <Input label="Last Name" value={lastName} onChange={e=>setLastName(e.target.value)} required />
        <Input label="Email" value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        <Input label="Password" value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        <Button type="submit">Join Now</Button>
        <p style={{textAlign:'center'}}><Link to="/login" style={{textDecoration:'underline'}}>Already have an account?</Link></p>
      </form>
    </div>
  )
}
