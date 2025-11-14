import { useSelector, useDispatch } from 'react-redux'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { logout, updateProfile, clearError } from '../redux/slices/authSlice'
import { useState, useEffect } from 'react'
import { MdPerson, MdEmail, MdHome, MdLocationCity, MdLocationOn, MdPublic, MdPhone } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, status, error } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [fullName, setFullName] = useState(user?.address?.fullName || '')
  const [phoneNumber, setPhoneNumber] = useState(user?.address?.phoneNumber || '')
  const [address, setAddress] = useState(user?.address?.address || '')
  const [city, setCity] = useState(user?.address?.city || '')
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '')
  const [country, setCountry] = useState(user?.address?.country || '')
  const [successMessage, setSuccessMessage] = useState('')
  const [activeTab, setActiveTab] = useState('personal') // 'personal' or 'address'

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
      setFullName(user.address?.fullName || '')
      setPhoneNumber(user.address?.phoneNumber || '')
      setAddress(user.address?.address || '')
      setCity(user.address?.city || '')
      setPostalCode(user.address?.postalCode || '')
      setCountry(user.address?.country || '')
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
    const result = await dispatch(updateProfile({ 
      firstName, 
      lastName,
      address: {
        fullName,
        phoneNumber,
        address,
        city,
        postalCode,
        country
      }
    }))
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
    <div className="container" style={{padding:'2rem 1rem', paddingBottom:'2rem'}}>
      <h2 style={{
        fontFamily:'var(--font-display)',
        fontSize:'1.75rem',
        color:'var(--color-primary)',
        marginBottom:'1.5rem',
        textAlign:'center',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        gap:'0.5rem'
      }}>
        <MdPerson /> My Profile
      </h2>
      <div style={{maxWidth:'700px', margin:'0 auto'}}>
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--color-danger)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem'
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
            marginBottom: '1.5rem'
          }}>
            {successMessage}
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display:'flex',
          gap:'0.5rem',
          marginBottom:'1.5rem',
          borderBottom:'2px solid var(--color-border)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            style={{
              flex:1,
              padding:'1rem',
              background: activeTab === 'personal' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'personal' ? 'white' : 'var(--color-text)',
              border:'none',
              borderRadius:'var(--radius-md) var(--radius-md) 0 0',
              cursor:'pointer',
              fontSize:'1rem',
              fontWeight:600,
              transition:'all 0.2s',
              borderBottom: activeTab === 'personal' ? '3px solid var(--color-primary)' : '3px solid transparent',
              marginBottom:'-2px'
            }}
          >
            Personal Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('address')}
            style={{
              flex:1,
              padding:'1rem',
              background: activeTab === 'address' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'address' ? 'white' : 'var(--color-text)',
              border:'none',
              borderRadius:'var(--radius-md) var(--radius-md) 0 0',
              cursor:'pointer',
              fontSize:'1rem',
              fontWeight:600,
              transition:'all 0.2s',
              borderBottom: activeTab === 'address' ? '3px solid var(--color-primary)' : '3px solid transparent',
              marginBottom:'-2px'
            }}
          >
            Shipping Address
          </button>
        </div>

        <form onSubmit={onUpdate}>
          <div className="card" style={{padding:'2rem'}}>
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="stack" style={{gap:'1rem'}}>
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
                <div style={{opacity: 0.6, pointerEvents: 'none'}}>
                  <Input 
                    icon={<MdEmail />} 
                    value={user.email} 
                    type="email" 
                    disabled
                  />
                </div>
                <p style={{fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '-0.5rem'}}>
                  Email cannot be changed for security reasons
                </p>
              </div>
            )}

            {/* Shipping Address Tab */}
            {activeTab === 'address' && (
              <div>
                <p style={{fontSize: '0.9rem', color: 'var(--color-muted)', marginBottom:'1.5rem', textAlign:'center'}}>
                  This address will be used to autofill checkout forms
                </p>
                <div className="stack" style={{gap:'1rem'}}>
                  <Input 
                    label="Full Name" 
                    icon={<MdPerson />} 
                    value={fullName} 
                    onChange={e=>setFullName(e.target.value)}
                    placeholder="Recipient's full name"
                    disabled={status === 'loading'}
                  />
                  <Input 
                    label="Phone Number" 
                    icon={<MdPhone />} 
                    value={phoneNumber} 
                    onChange={e=>setPhoneNumber(e.target.value)}
                    placeholder="Phone number"
                    type="tel"
                    disabled={status === 'loading'}
                  />
                  <Input 
                    label="Address" 
                    icon={<MdHome />} 
                    value={address} 
                    onChange={e=>setAddress(e.target.value)}
                    placeholder="Street address, apartment, etc."
                    disabled={status === 'loading'}
                  />
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                    <Input 
                      label="City" 
                      icon={<MdLocationCity />} 
                      value={city} 
                      onChange={e=>setCity(e.target.value)}
                      placeholder="City"
                      disabled={status === 'loading'}
                    />
                    <Input 
                      label="Postal Code" 
                      icon={<MdLocationOn />} 
                      value={postalCode} 
                      onChange={e=>setPostalCode(e.target.value)}
                      placeholder="Postal code"
                      disabled={status === 'loading'}
                    />
                  </div>
                  <Input 
                    label="Country" 
                    icon={<MdPublic />} 
                    value={country} 
                    onChange={e=>setCountry(e.target.value)}
                    placeholder="Country"
                    disabled={status === 'loading'}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{
            display:'flex',
            gap:'1rem',
            justifyContent:'center',
            flexWrap:'wrap',
            marginTop:'1.5rem'
          }}>
            <Button type="submit" variant="primary" disabled={status === 'loading'} style={{minWidth:'200px'}}>
              {status === 'loading' ? 'Updating...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="dark" onClick={handleLogout} style={{minWidth:'200px'}}>Logout</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
