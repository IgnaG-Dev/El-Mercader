import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const widths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
}

export default function Modal({ open, onClose, title, children, maxWidth = 'md' }: Props) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-surface rounded-xl shadow-xl w-full ${widths[maxWidth]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 flex-shrink-0">
          <h2 className="font-headline text-xl text-primary font-bold">{title}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
