export default function QuantitySelector({ value=1, onChange }) {
  const change = (delta) => {
    const next = Math.max(1, value + delta)
    onChange?.(next)
  }
  return (
    <div style={{display:'inline-flex', gap:8, alignItems:'center'}}>
      <button className="btn" aria-label="decrease" onClick={()=>change(-1)}>-</button>
      <div aria-live="polite" style={{minWidth:24, textAlign:'center'}}>{value}</div>
      <button className="btn" aria-label="increase" onClick={()=>change(1)}>+</button>
    </div>
  )
}
