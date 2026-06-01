import { useState } from 'react'

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState({
    newsletter: true,
    orderNotifications: true,
    promotions: false,
    language: 'es',
    currency: 'ARS',
  })

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  const [saved, setSaved] = useState(false)
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 3000) }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
      <h1 className="font-headline text-headline-lg text-primary mb-8">Preferencias de Cuenta</h1>

      <div className="max-w-xl space-y-6">
        {/* Notifications */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
          <h2 className="font-headline text-headline-md text-on-surface mb-4">Notificaciones</h2>
          <div className="space-y-4">
            {[
              { key: 'newsletter' as const, label: 'Boletín del Gremio', desc: 'Novedades, lanzamientos y torneos' },
              { key: 'orderNotifications' as const, label: 'Actualizaciones de pedidos', desc: 'Estado de envíos y entregas' },
              { key: 'promotions' as const, label: 'Ofertas y promociones', desc: 'Descuentos exclusivos para miembros' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-label-bold text-on-surface">{label}</div>
                  <div className="text-label-sm text-on-surface-variant">{desc}</div>
                </div>
                <button
                  onClick={() => toggle(key)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${prefs[key] ? 'bg-secondary' : 'bg-outline-variant'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs[key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Regional */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
          <h2 className="font-headline text-headline-md text-on-surface mb-4">Regional</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-label-bold font-bold text-on-surface mb-1.5">Idioma</label>
              <select
                value={prefs.language}
                onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
                className="w-full border border-outline-variant rounded px-3 py-2 text-body-md bg-surface text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-label-bold font-bold text-on-surface mb-1.5">Moneda</label>
              <select
                value={prefs.currency}
                onChange={(e) => setPrefs((p) => ({ ...p, currency: e.target.value }))}
                className="w-full border border-outline-variant rounded px-3 py-2 text-body-md bg-surface text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="ARS">ARS - Peso Argentino</option>
                <option value="USD">USD - Dólar</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={save} className="bg-primary text-on-primary font-bold py-2.5 px-6 rounded hover:bg-primary-container transition-colors">
            Guardar cambios
          </button>
          {saved && (
            <span className="text-secondary flex items-center gap-1 text-label-sm">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
              Guardado
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
