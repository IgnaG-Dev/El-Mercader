import type { Order } from '../../types'

const config: Record<Order['status'], { label: string; cls: string }> = {
  pending:   { label: 'Pendiente',   cls: 'bg-tertiary-fixed/30 text-on-tertiary-container' },
  paid:      { label: 'Pagado',      cls: 'bg-secondary-container text-on-secondary-container' },
  shipped:   { label: 'Enviado',     cls: 'bg-primary-fixed text-on-primary-fixed' },
  delivered: { label: 'Entregado',   cls: 'bg-secondary-container text-on-secondary-container' },
  cancelled: { label: 'Cancelado',   cls: 'bg-error-container text-on-error-container' },
}

export default function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const { label, cls } = config[status]
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-label-sm font-bold ${cls}`}>
      {label}
    </span>
  )
}
