import { useState, useEffect } from 'react'
import Input from './Input'
import { OMAN_GOVERNORATES, getWilayatsByGovernorate, validateAddress } from '../../utils/omanLocations'
import { MdPerson, MdPhone, MdLocationOn, MdHome } from 'react-icons/md'

export default function AddressForm({ value = {}, onChange, disabled = false }) {
  const [formData, setFormData] = useState({
    fullName: value.fullName || '',
    phone: value.phone || '',
    governorateId: value.governorateId || '',
    wilayatId: value.wilayatId || '',
    houseNumber: value.houseNumber || '',
    additionalInfo: value.additionalInfo || ''
  })

  const [errors, setErrors] = useState({})
  const [availableWilayats, setAvailableWilayats] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Sync with external value changes (for autofill) - only once
  useEffect(() => {
    if (value && !isInitialized) {
      const hasData = value.fullName || value.phone || value.governorateId
      if (hasData) {
        setFormData({
          fullName: value.fullName || '',
          phone: value.phone || '',
          governorateId: value.governorateId || '',
          wilayatId: value.wilayatId || '',
          houseNumber: value.houseNumber || '',
          additionalInfo: value.additionalInfo || ''
        })
        setIsInitialized(true)
      }
    }
  }, [value, isInitialized])

  // Update available wilayats when governorate changes
  useEffect(() => {
    if (formData.governorateId) {
      const wilayats = getWilayatsByGovernorate(Number(formData.governorateId))
      setAvailableWilayats(wilayats)
      
      // Reset wilayat if it doesn't belong to the new governorate
      const wilayatExists = wilayats.some(w => w.id === Number(formData.wilayatId))
      if (!wilayatExists && formData.wilayatId) {
        handleChange('wilayatId', '')
      }
    } else {
      setAvailableWilayats([])
      if (formData.wilayatId) {
        handleChange('wilayatId', '')
      }
    }
  }, [formData.governorateId])

  // Update parent when form data changes
  useEffect(() => {
    if (onChange) {
      onChange(formData)
    }
  }, [formData])

  const handleChange = (field, newValue) => {
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validate = () => {
    const validationErrors = validateAddress(formData)
    setErrors(validationErrors || {})
    return !validationErrors
  }

  return (
    <div className="stack" style={{ gap: '1rem' }}>
      {/* Full Name */}
      <Input
        label="Full Name"
        icon={<MdPerson />}
        value={formData.fullName}
        onChange={(e) => handleChange('fullName', e.target.value)}
        disabled={disabled}
        required
        placeholder="Enter full name"
      />
      {errors.fullName && (
        <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '-0.5rem' }}>
          {errors.fullName}
        </p>
      )}

      {/* Phone Number */}
      <Input
        label="Phone Number"
        icon={<MdPhone />}
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        disabled={disabled}
        required
        placeholder="7XXXXXXX or 9XXXXXXX"
        type="tel"
      />
      {errors.phone && (
        <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '-0.5rem' }}>
          {errors.phone}
        </p>
      )}

      {/* Governorate */}
      <div>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--color-text)',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '0.5rem'
        }}>
          <MdLocationOn /> Governorate <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <select
          value={formData.governorateId}
          onChange={(e) => handleChange('governorateId', e.target.value)}
          disabled={disabled}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${errors.governorateId ? 'var(--color-danger)' : 'var(--color-border)'}`,
            fontSize: '1rem',
            fontFamily: 'inherit',
            cursor: disabled ? 'not-allowed' : 'pointer',
            background: disabled ? 'var(--color-surface)' : 'white'
          }}
        >
          <option value="">Select Governorate</option>
          {OMAN_GOVERNORATES.map(gov => (
            <option key={gov.id} value={gov.id}>{gov.name}</option>
          ))}
        </select>
        {errors.governorateId && (
          <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {errors.governorateId}
          </p>
        )}
      </div>

      {/* Wilayat */}
      <div>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--color-text)',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '0.5rem'
        }}>
          <MdLocationOn /> Wilayat <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <select
          value={formData.wilayatId}
          onChange={(e) => handleChange('wilayatId', e.target.value)}
          disabled={disabled || !formData.governorateId}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${errors.wilayatId ? 'var(--color-danger)' : 'var(--color-border)'}`,
            fontSize: '1rem',
            fontFamily: 'inherit',
            cursor: disabled || !formData.governorateId ? 'not-allowed' : 'pointer',
            background: disabled || !formData.governorateId ? 'var(--color-surface)' : 'white'
          }}
        >
          <option value="">
            {formData.governorateId ? 'Select Wilayat' : 'Select Governorate first'}
          </option>
          {availableWilayats.map(wilayat => (
            <option key={wilayat.id} value={wilayat.id}>{wilayat.name}</option>
          ))}
        </select>
        {errors.wilayatId && (
          <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {errors.wilayatId}
          </p>
        )}
      </div>

      {/* House/Building Number */}
      <div>
        <Input
          label="House/Building Number"
          icon={<MdHome />}
          value={formData.houseNumber}
          onChange={(e) => handleChange('houseNumber', e.target.value)}
          disabled={disabled}
          required
          placeholder="e.g., Building 123, Villa 45"
        />
      </div>
      {errors.houseNumber && (
        <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '-0.5rem' }}>
          {errors.houseNumber}
        </p>
      )}
    </div>
  )
}
