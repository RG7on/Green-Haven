import { useSelector, useDispatch } from 'react-redux'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { logout } from '../redux/slices/authSlice'
import { useState } from 'react'
import { MdPerson, MdEmail } from 'react-icons/md'

export default function Profile() {
  const user = useSelector(s => s.auth.user)
  const dispatch = useDispatch()
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [email, setEmail] = useState(user?.email || '')

  if (!user) return <div className="container" style={{color:'var(--color-text)', padding:'2rem', textAlign:'center'}}>Please login first.</div>

  function onUpdate(e) {
    e.preventDefault()
    // Placeholder: would call API to update
    alert('Profile updated (placeholder).')
  }

  return (
    <div className="center" style={{padding:'2rem 1rem'}}>
      <form onSubmit={onUpdate} className="stack card" style={{padding:'2rem', width:'100%', maxWidth:420}}>
        <h2 className="display" style={{textAlign:'center', color:'var(--color-primary)'}}>Profile</h2>
        <Input label="First Name" icon={<MdPerson />} value={firstName} onChange={e=>setFirstName(e.target.value)} />
        <Input label="Last Name" icon={<MdPerson />} value={lastName} onChange={e=>setLastName(e.target.value)} />
        <Input label="Email" icon={<MdEmail />} value={email} onChange={e=>setEmail(e.target.value)} type="email" />
        <Button type="submit" variant="primary">Update</Button>
        <Button type="button" variant="dark" onClick={()=>dispatch(logout())}>Logout</Button>
      </form>
    </div>
  )
}
