import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../redux/slices/authSlice'
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

  function handleSubmit(e) {
    e.preventDefault()
    dispatch(loginSuccess({ id: 'u1', email, firstName, lastName }))
    navigate('/home')
  }

  return (
    <div className="center" style={{padding:'2rem 1rem'}}>
      <div className="stack" style={{maxWidth:600, textAlign:'center'}}>
        <img src={homeArt} alt="logo" style={{height:96, margin:'0 auto'}} />
        <h1 className="display" style={{fontSize:'2rem', marginBottom:'1rem'}}>Greene Heaven</h1>
        <form onSubmit={handleSubmit} className="stack card" style={{padding:'2rem'}}>
          <h2 style={{textAlign:'center'}}>Sign Up</h2>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <Input label="First Name" icon={<MdPerson />} value={firstName} onChange={e=>setFirstName(e.target.value)} required />
            <Input label="Last Name" icon={<MdPerson />} value={lastName} onChange={e=>setLastName(e.target.value)} required />
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <Input label="Email" icon={<MdEmail />} value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
            <Input label="Password" icon={<MdLock />} value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
          </div>
          <Button type="submit">Join Now</Button>
          <p style={{textAlign:'center', color:'var(--color-text)'}}>
            <Link to="/login" style={{color:'var(--color-primary)', textDecoration:'underline'}}>Already have an account?</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
