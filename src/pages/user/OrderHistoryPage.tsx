import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrders } from '../../hooks/useOrders'
import OrderStatusBadge from '../../components/ui/OrderStatusBadge'
import OrderTracker from '../../components/ui/OrderTracker'
import type { Order } from '../../types'

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden">
      {/* ── Header row ── */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="font-bold text-label-bold text-on-surface font-mono text-sm">
              {order.id.slice(0, 8).toUpperCase()}
            </div>
            <div className="text-label-sm text-on-surface-variant">{order.createdAt}</div>
          </div>
          <div className="flex items-center gap-4">
            <OrderStatusBadge status={order.status} />
            <span className="font-bold text-headline-md text-on-surface">${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* products */}
        <div className="flex flex-wrap gap-3">
          {order.items.map(({ product, quantity }, i) => (
            <div key={i} className="flex items-center gap-2 bg-surface rounded-lg p-2 border border-outline-variant/20">
              {product.image && (
                <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
              )}
              <div>
                <div className="text-label-sm font-bold text-on-surface line-clamp-1">{product.name}</div>
                <div className="text-label-sm text-on-surface-variant">x{quantity} · ${product.price.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* toggle button */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-4 flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            {expanded ? 'expand_less' : 'local_shipping'}
          </span>
          {expanded ? 'Ocultar seguimiento' : 'Ver seguimiento del paquete'}
        </button>
      </div>

      {/* ── Tracker panel ── */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-outline-variant/20 pt-5 bg-surface-container-low/40">
          <OrderTracker status={order.status} createdAt={order.createdAt} />
        </div>
      )}
    </div>
  )
}

export default function OrderHistoryPage() {
  const { data: orders = [], isLoading } = useOrders()

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
      <h1 className="font-headline text-headline-lg text-primary mb-8">Historial de Pedidos</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container rounded-xl border border-outline-variant/30 h-32 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">receipt_long</span>
          <p className="text-body-lg text-on-surface-variant">No tienes pedidos aún.</p>
          <Link to="/tienda" className="mt-4 inline-block text-secondary hover:underline">Explorar tienda</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  )
}
