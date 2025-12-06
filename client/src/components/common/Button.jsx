export default function Button({ children, variant='default', ...rest }) {
  const className = ['btn',
    variant === 'primary' && 'btn-primary',
    variant === 'dark' && 'btn-dark'
  ].filter(Boolean).join(' ')
  return <button className={className} {...rest}>{children}</button>
}
