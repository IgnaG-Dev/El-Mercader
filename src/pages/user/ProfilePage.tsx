import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { updateProfile } from '../../services/profiles'
import Button from '../../components/ui/Button'

const profileLinks = [
  { to: '/historial-pedidos', icon: 'receipt_long', label: 'Historial de pedidos', desc: 'Ve todos tus pedidos anteriores' },
  { to: '/direcciones', icon: 'location_on', label: 'Direcciones de envío', desc: 'Gestiona tus domicilios' },
  { to: '/preferencias', icon: 'tune', label: 'Preferencias de cuenta', desc: 'Personaliza tu experiencia' },
  { to: '/privacidad', icon: 'shield', label: 'Privacidad y seguridad', desc: 'Controla tus datos' },
]

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await updateProfile(user.id, { name })
      setUser({ ...user, name })
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
      <h1 className="font-headline text-headline-lg text-primary mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6 text-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-on-primary text-3xl font-bold mx-auto mb-4">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            {editing ? (
              <div className="space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-outline-variant rounded px-3 py-2 text-body-md text-on-surface bg-surface text-center focus:outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} loading={saving} className="flex-1">Guardar</Button>
                  <Button size="sm" variant="outline" onClick={() => { setEditing(false); setName(user?.name ?? '') }} className="flex-1">Cancelar</Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-headline text-headline-md text-on-surface">{user?.name}</h2>
                <p className="text-body-md text-on-surface-variant mt-1">{user?.email}</p>
                <button onClick={() => setEditing(true)} className="mt-4 text-label-sm text-secondary hover:underline block mx-auto">
                  Editar nombre
                </button>
              </>
            )}
            {saved && (
              <div className="mt-3 text-label-sm text-secondary flex items-center gap-1 justify-center">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                Guardado
              </div>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profileLinks.map(({ to, icon, label, desc }) => (
              <Link key={to} to={to} className="bg-surface-container rounded-xl border border-outline-variant/30 p-5 soft-lift flex items-center gap-4 group hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{icon}</span>
                </div>
                <div>
                  <div className="font-bold text-label-bold text-on-surface">{label}</div>
                  <div className="text-label-sm text-on-surface-variant">{desc}</div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant ml-auto" style={{ fontSize: '20px' }}>chevron_right</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
