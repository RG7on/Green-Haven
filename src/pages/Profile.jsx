import { useSelector, useDispatch } from 'react-redux'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { logout, updateProfile, clearError } from '../redux/slices/authSlice'
import { useState, useEffect } from 'react'
import { MdPerson, MdEmail } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, status, error } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [successMessage, setSuccessMessage] = useState('')

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
    }
  }, [user])

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  if (!user) return <div className="container" style={{color:'var(--color-text)', padding:'2rem', textAlign:'center'}}>Please login first.</div>

  async function onUpdate(e) {
    e.preventDefault()
    setSuccessMessage('')
    const result = await dispatch(updateProfile({ firstName, lastName }))
    if (result.type === 'auth/updateProfile/fulfilled') {
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <div className="center" style={{padding:'2rem 1rem'}}>
      <form onSubmit={onUpdate} className="stack card" style={{padding:'2rem', width:'100%', maxWidth:420}}>
        <h2 className="display" style={{textAlign:'center', color:'var(--color-primary)'}}>Profile</h2>
        
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

        {successMessage && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#4caf50',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem'
          }}>
            {successMessage}
          </div>
        )}

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
        <Input 
          label="Email" 
          icon={<MdEmail />} 
          value={user.email} 
          type="email" 
          disabled
          style={{opacity: 0.6, cursor: 'not-allowed'}}
        />
        <p style={{fontSize: '0.85rem', color: 'var(--color-muted)', margin: '-0.5rem 0 0.5rem'}}>
          Email cannot be changed for security reasons
        </p>
        <Button type="submit" variant="primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'Updating...' : 'Update Profile'}
        </Button>
        <Button type="button" variant="dark" onClick={handleLogout}>Logout</Button>
      </form>
    </div>
  )
}
