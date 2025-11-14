export default function Input({ label, hint, icon, ...rest }) {
  return (
    <label className="stack" style={{width:'100%', position:'relative'}}>
      <div style={{position:'relative'}}>
        {icon && <span style={{position:'absolute', left:'1rem', top:'0.9rem', color:'var(--color-primary)', fontSize:'1.2rem', pointerEvents:'none', zIndex:1}}>{icon}</span>}
        <input 
          className="input" 
          placeholder={label} 
          style={icon ? {paddingLeft:'2.75rem'} : {}} 
          {...rest} 
        />
      </div>
      {hint && <small style={{color:'var(--color-muted)'}}>{hint}</small>}
    </label>
  )
}
