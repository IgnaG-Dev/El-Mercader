interface Props {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'outline'
}

const variants = {
  primary: 'bg-primary-fixed text-on-primary-fixed',
  secondary: 'bg-secondary-container text-on-secondary-container',
  tertiary: 'bg-tertiary-fixed/30 text-on-tertiary-container',
  error: 'bg-error-container text-on-error-container',
  outline: 'border border-outline-variant text-on-surface-variant',
}

export default function Badge({ children, variant = 'primary' }: Props) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-label-sm font-bold ${variants[variant]}`}>
      {children}
    </span>
  )
}
