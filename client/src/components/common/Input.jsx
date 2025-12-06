export default function Input({ label, hint, icon, required, ...rest }) {
  return (
    <label className="stack" style={{width:'100%', position:'relative', gap: '0.5rem'}}>
      {label && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--color-text)',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          {icon && <span style={{color:'var(--color-primary)', fontSize:'1.2rem'}}>{icon}</span>}
          {label}
          {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </div>
      )}
      <div style={{position:'relative'}}>
        <input 
          className="input" 
          required={required}
          {...rest} 
        />
      </div>
      {hint && <small style={{color:'var(--color-muted)'}}>{hint}</small>}
    </label>
  )
}
