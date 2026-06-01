import type { Order } from '../../types'

type StageConfig = {
  status: Order['status']
  label: string
  icon: string
  description: string
}

const STAGES: StageConfig[] = [
  { status: 'pending',   label: 'Confirmado',    icon: 'shopping_bag',   description: 'Pedido recibido y confirmado' },
  { status: 'paid',      label: 'Pago recibido', icon: 'price_check',    description: 'El pago fue verificado' },
  { status: 'shipped',   label: 'En camino',     icon: 'local_shipping', description: 'La caravana está en ruta' },
  { status: 'delivered', label: 'Entregado',     icon: 'home',           description: 'Llegó a destino' },
]

const STATUS_LEVEL: Record<Order['status'], number> = {
  pending: 0, paid: 1, shipped: 2, delivered: 3, cancelled: -1,
}

interface Props {
  status: Order['status']
  createdAt: string
}

export default function OrderTracker({ status, createdAt }: Props) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 bg-error-container/30 rounded-xl border border-error/20">
        <span className="material-symbols-outlined text-error text-2xl">cancel</span>
        <div>
          <div className="font-bold text-on-surface text-sm">Pedido cancelado</div>
          <div className="text-xs text-on-surface-variant">{createdAt}</div>
        </div>
      </div>
    )
  }

  const level = STATUS_LEVEL[status]

  return (
    <div className="space-y-6">
      {/* ── Progress stepper ── */}
      <div className="flex items-start">
        {STAGES.map((stage, idx) => {
          const isDone   = level > idx
          const isActive = level === idx
          const isFuture = level < idx

          return (
            <div key={stage.status} className="flex-1 flex flex-col items-center min-w-0">
              {/* connector + node */}
              <div className="flex items-center w-full">
                {idx > 0 && (
                  <div className={`flex-1 h-0.5 transition-colors ${isDone || isActive ? 'bg-secondary' : 'bg-outline-variant/40'}`} />
                )}
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all
                  ${isDone   ? 'bg-secondary border-secondary' : ''}
                  ${isActive ? 'bg-primary border-primary ring-4 ring-primary/20' : ''}
                  ${isFuture ? 'bg-surface border-outline-variant/40' : ''}
                `}>
                  {isDone ? (
                    <span
                      className="material-symbols-outlined text-white"
                      style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}
                    >check</span>
                  ) : (
                    <span
                      className={`material-symbols-outlined ${isActive ? 'text-on-primary' : 'text-on-surface-variant/40'}`}
                      style={{ fontSize: '16px' }}
                    >{stage.icon}</span>
                  )}
                </div>
                {idx < STAGES.length - 1 && (
                  <div className={`flex-1 h-0.5 transition-colors ${isDone ? 'bg-secondary' : 'bg-outline-variant/40'}`} />
                )}
              </div>
              {/* label */}
              <p className={`
                mt-2 text-center text-xs font-bold leading-tight px-0.5
                ${isActive ? 'text-primary' : isDone ? 'text-secondary' : 'text-on-surface-variant/50'}
              `}>
                {stage.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* ── Timeline log of completed steps ── */}
      <div className="relative pl-6 space-y-4 before:absolute before:inset-y-1 before:left-[9px] before:w-0.5 before:bg-outline-variant/30">
        {STAGES.slice(0, level + 1).reverse().map((stage, idx) => {
          const isMostRecent = idx === 0
          return (
            <div key={stage.status} className="relative">
              <div className={`
                absolute -left-6 w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${isMostRecent ? 'bg-primary border-primary' : 'bg-secondary border-secondary'}
              `}>
                {!isMostRecent && (
                  <span
                    className="material-symbols-outlined text-white"
                    style={{ fontSize: '8px', fontVariationSettings: "'FILL' 1" }}
                  >check</span>
                )}
              </div>
              <p className={`text-sm font-bold ${isMostRecent ? 'text-on-surface' : 'text-on-surface/70'}`}>
                {stage.label}
              </p>
              <p className="text-xs text-on-surface-variant">{stage.description}</p>
              {stage.status === 'pending' && (
                <p className="text-xs text-on-surface-variant/60 mt-0.5">{createdAt}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
