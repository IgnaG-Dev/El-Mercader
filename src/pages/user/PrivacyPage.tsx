import { useState } from 'react'
import Button from '../../components/ui/Button'

export default function PrivacyPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saved, setSaved] = useState(false)
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: false,
    activityVisible: true,
    dataAnalytics: true,
  })

  const toggle = (key: keyof typeof privacySettings) => setPrivacySettings((p) => ({ ...p, [key]: !p[key] }))

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
      <h1 className="font-headline text-headline-lg text-primary mb-8">Privacidad y Seguridad</h1>

      <div className="max-w-xl space-y-6">
        {/* Change password */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
          <h2 className="font-headline text-headline-md text-on-surface mb-4">Cambiar contraseña</h2>
          <div className="space-y-4">
            {['Contraseña actual', 'Nueva contraseña', 'Confirmar nueva contraseña'].map((label) => (
              <div key={label}>
                <label className="block text-label-bold font-bold text-on-surface mb-1.5">{label}</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-outline-variant rounded px-3 py-2 text-body-md bg-surface text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            ))}
            <Button size="sm" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000) }}>
              Actualizar contraseña
            </Button>
            {saved && <span className="text-secondary text-label-sm flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span> Contraseña actualizada</span>}
          </div>
        </div>

        {/* Privacy settings */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
          <h2 className="font-headline text-headline-md text-on-surface mb-4">Privacidad</h2>
          <div className="space-y-4">
            {[
              { key: 'profilePublic' as const, label: 'Perfil público', desc: 'Otros jugadores pueden ver tu perfil' },
              { key: 'activityVisible' as const, label: 'Actividad visible', desc: 'Mostrar tu actividad en la comunidad' },
              { key: 'dataAnalytics' as const, label: 'Datos de analítica', desc: 'Ayúdanos a mejorar la experiencia' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-label-bold text-on-surface">{label}</div>
                  <div className="text-label-sm text-on-surface-variant">{desc}</div>
                </div>
                <button
                  onClick={() => toggle(key)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${privacySettings[key] ? 'bg-secondary' : 'bg-outline-variant'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${privacySettings[key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-error-container/30 rounded-xl border border-error/20 p-6">
          <h2 className="font-headline text-headline-md text-error mb-2">Zona de peligro</h2>
          <p className="text-body-md text-on-surface-variant mb-4">Estas acciones son irreversibles.</p>
          {!showDeleteConfirm ? (
            <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              Eliminar cuenta
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-body-md text-error font-bold">¿Estás seguro? Esta acción eliminará todos tus datos.</p>
              <div className="flex gap-3">
                <Button variant="danger" size="sm">Sí, eliminar mi cuenta</Button>
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
