import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos.')
      } else if (msg.includes('Email not confirmed')) {
        setError('Confirmá tu email antes de ingresar.')
      } else {
        setError('Error al ingresar. Intenta nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-surface-container rounded-xl border border-outline-variant shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="font-headline text-2xl font-bold text-primary mb-1">El Mercader</div>
            <h1 className="font-headline text-headline-md text-on-surface">Acceso al Gremio</h1>
            <p className="text-body-md text-on-surface-variant mt-2">Ingresa para continuar tu aventura</p>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
              <span className="text-body-md">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-label-bold font-bold text-on-surface mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface bg-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-label-bold font-bold text-on-surface mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full border border-outline-variant rounded-lg px-4 py-3 pr-12 text-body-md text-on-surface bg-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Ingresar al Gremio
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <a href="#" className="text-label-sm text-secondary hover:underline">¿Olvidaste tu contraseña?</a>
            <p className="text-body-md text-on-surface-variant">
              ¿Sin cuenta?{' '}
              <Link to="/registro" className="text-secondary font-bold hover:underline">Únete al Gremio</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
