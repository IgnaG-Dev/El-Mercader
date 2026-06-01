import { useState } from 'react'
import { useFinanceStore } from '../../store/financeStore'
import Button from '../../components/ui/Button'

const PAYMENT_LABELS: Record<string, { label: string; icon: string; feeLabel: string }> = {
  mercadopago: { label: 'Mercado Pago', icon: 'account_balance_wallet', feeLabel: 'Comisión: 6%' },
  transfer:    { label: 'Transferencia bancaria', icon: 'account_balance', feeLabel: 'Sin comisión extra' },
}

export default function AdminFinance() {
  const { shippingCost, shippingDays, cpOrigen, paymentMethods, updateShipping, updateCpOrigen, togglePaymentMethod } = useFinanceStore()

  const [cost, setCost] = useState(String(shippingCost))
  const [days, setDays] = useState(shippingDays)
  const [cp, setCp] = useState(cpOrigen)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    const parsed = Number(cost)
    if (isNaN(parsed) || parsed < 0) return
    updateShipping(parsed, days)
    if (cp.trim()) updateCpOrigen(cp.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8">
      <h1 className="font-headline text-headline-lg text-primary mb-8">Configuración de Finanzas y Logística</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment methods */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
          <h2 className="font-headline text-headline-md text-on-surface mb-4">Métodos de pago</h2>
          <div className="space-y-3">
            {(Object.entries(paymentMethods) as [keyof typeof paymentMethods, typeof paymentMethods[keyof typeof paymentMethods]][]).map(([key, cfg]) => {
              const meta = PAYMENT_LABELS[key]
              return (
                <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-surface border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>{meta.icon}</span>
                    <div>
                      <div className="font-bold text-sm text-on-surface">{meta.label}</div>
                      <div className="text-xs text-on-surface-variant">{meta.feeLabel}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePaymentMethod(key)}
                    className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none overflow-hidden ${cfg.enabled ? 'bg-secondary' : 'bg-on-surface/20'}`}
                    title={cfg.enabled ? 'Desactivar' : 'Activar'}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${cfg.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
          <h2 className="font-headline text-headline-md text-on-surface mb-5">Logística de envíos</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
              <span className="text-sm text-on-surface-variant">Proveedor de envíos</span>
              <img src="/logos/andreani.png" alt="Andreani" className="h-5 w-auto" />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Código postal de origen</label>
              <input
                value={cp}
                onChange={e => setCp(e.target.value)}
                placeholder="ej: 1043"
                inputMode="numeric"
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-on-surface-variant mt-1">CP del depósito / punto de despacho.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Costo de envío de respaldo (ARS $)</label>
              <input
                type="number"
                min="0"
                value={cost}
                onChange={e => setCost(e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-on-surface-variant mt-1">Se usa si la API de Andreani no está disponible.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Tiempo estimado de entrega (respaldo)</label>
              <input
                value={days}
                onChange={e => setDays(e.target.value)}
                placeholder="ej: 7 días hábiles"
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="pt-1 flex items-center gap-3">
              <Button size="sm" onClick={handleSave}>Guardar cambios</Button>
              {saved && (
                <span className="text-sm text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                  Guardado
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Andreani credentials info */}
      <div className="mt-6 bg-surface-container rounded-xl border border-outline-variant/30 p-6">
        <h2 className="font-headline text-headline-md text-on-surface mb-4 flex items-center gap-2">
          <img src="/logos/andreani.png" alt="Andreani" className="h-5 w-auto" />
          Credenciales Andreani
        </h2>
        <p className="text-sm text-on-surface-variant mb-3">
          Las credenciales de la API se configuran como variables de entorno en Supabase (no se almacenan en el cliente):
        </p>
        <div className="bg-inverse-surface rounded-lg p-4 text-xs font-mono text-tertiary-fixed space-y-1">
          <div>ANDREANI_USUARIO=tu_usuario</div>
          <div>ANDREANI_CLAVE=tu_contraseña</div>
          <div>ANDREANI_CONTRATO=400XXXXXXX</div>
          <div>ANDREANI_CLIENTE=tu_codigo_cliente</div>
        </div>
        <p className="text-xs text-on-surface-variant mt-3">
          Configurar con: <span className="font-mono">supabase secrets set ANDREANI_USUARIO=...</span>
        </p>
      </div>

      {/* Info panel */}
      <div className="mt-4 bg-tertiary-fixed/20 border border-tertiary/20 rounded-xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-tertiary mt-0.5" style={{ fontSize: '20px' }}>info</span>
        <p className="text-sm text-on-surface">
          Los cambios se aplican en tiempo real a la vista de productos y al proceso de compra. Los métodos de pago desactivados no aparecerán en el checkout.
        </p>
      </div>
    </div>
  )
}
