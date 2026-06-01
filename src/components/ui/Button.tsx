import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-container',
  secondary: 'bg-secondary text-on-secondary hover:bg-secondary/80',
  outline: 'border border-primary text-primary hover:bg-primary hover:text-on-primary bg-surface',
  ghost: 'text-primary hover:bg-surface-container',
  danger: 'bg-error text-on-error hover:bg-error/80',
}

const sizes = {
  sm: 'py-1.5 px-4 text-label-sm',
  md: 'py-2.5 px-6 text-label-bold',
  lg: 'py-3 px-8 text-body-md font-bold',
}

export default function Button({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded font-bold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <span className="material-symbols-outlined animate-spin text-sm" style={{ fontSize: '16px' }}>progress_activity</span>
      )}
      {children}
    </button>
  )
}
