import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true)
    try {
      const { needsConfirmation } = await register({ name, email, password })
      if (needsConfirmation) {
        setSuccess(true)
      } else {
        navigate('/')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('already registered')) {
        setError('Este email ya está registrado.')
      } else {
        setError('Error al crear la cuenta. Intenta nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-surface-container rounded-xl border border-outline-variant shadow-lg p-8">
            <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
            </div>
            <h2 className="font-headline text-headline-md text-on-surface mb-2">¡Revisa tu email!</h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              Te enviamos un enlace de confirmación a <strong>{email}</strong>. Confirmá tu cuenta para ingresar.
            </p>
            <Link to="/login" className="text-secondary font-bold hover:underline text-label-bold">
              Ir al login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-surface-container rounded-xl border border-outline-variant shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="font-headline text-2xl font-bold text-primary mb-1">El Mercader</div>
            <h1 className="font-headline text-headline-md text-on-surface">Únete al Gremio</h1>
            <p className="text-body-md text-on-surface-variant mt-2">Crea tu cuenta de comerciante</p>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
              <span className="text-body-md">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-label-bold font-bold text-on-surface mb-1.5">Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Tu nombre"
                className="w-full border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface bg-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
              />
            </div>

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

            <div>
              <label className="block text-label-bold font-bold text-on-surface mb-1.5">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full border border-outline-variant rounded-lg px-4 py-3 pr-12 text-body-md text-on-surface bg-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showConfirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Crear cuenta
            </Button>
          </form>

          <p className="mt-6 text-center text-body-md text-on-surface-variant">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-secondary font-bold hover:underline">Ingresa aquí</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
