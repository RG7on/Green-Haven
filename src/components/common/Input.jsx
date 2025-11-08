export default function Input({ label, hint, ...rest }) {
  return (
    <label className="stack" style={{width:'100%'}}>
      {label && <span style={{fontFamily:'var(--font-display)'}}>{label}</span>}
      <input className="input" {...rest} />
      {hint && <small style={{color:'var(--color-muted)'}}>{hint}</small>}
    </label>
  )
}
