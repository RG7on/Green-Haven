export default function Input({ label, hint, icon, ...rest }) {
  return (
    <label className="stack" style={{width:'100%', position:'relative'}}>
      {icon && <span style={{position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'var(--color-primary)', fontSize:'1.2rem', pointerEvents:'none'}}>{icon}</span>}
      <input 
        className="input" 
        placeholder={label} 
        style={icon ? {paddingLeft:'2.75rem'} : {}} 
        {...rest} 
      />
      {hint && <small style={{color:'var(--color-muted)'}}>{hint}</small>}
    </label>
  )
}
