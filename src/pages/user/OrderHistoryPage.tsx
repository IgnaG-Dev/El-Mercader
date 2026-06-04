import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useOrders } from '../../hooks/useOrders'
import OrderStatusBadge from '../../components/ui/OrderStatusBadge'
import OrderTracker from '../../components/ui/OrderTracker'
import type { Order } from '../../types'

const PAGE_SIZE = 5

type StatusFilter = Order['status'] | 'all'
type GroupBy = 'none' | 'status' | 'month'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagado' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const isPending = order.status === 'pending'

  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden">
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

        <div className="flex flex-wrap gap-3">
          {order.items.map(({ product, quantity }, i) => (
            <Link
              key={i}
              to={`/producto/${product.slug}`}
              className="flex items-center gap-2 bg-surface rounded-lg p-2 border border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container transition-colors"
            >
              {product.image && (
                <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
              )}
              <div>
                <div className="text-label-sm font-bold text-on-surface line-clamp-1 group-hover:text-primary">{product.name}</div>
                <div className="text-label-sm text-on-surface-variant">x{quantity} · ${product.price.toFixed(2)}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {expanded ? 'expand_less' : 'local_shipping'}
            </span>
            {expanded ? 'Ocultar seguimiento' : 'Ver seguimiento del paquete'}
          </button>

          {isPending && (
            order.paymentMethod === 'mercadopago' ? (
              <button
                onClick={() => navigate('/pago-mercadopago', { state: { orderId: order.id, total: order.total } })}
                className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#009ee3] hover:bg-[#008ecc] transition-colors px-4 py-1.5 rounded-lg"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>account_balance_wallet</span>
                Pagar con Mercado Pago
              </button>
            ) : (
              <button
                onClick={() => navigate('/instrucciones-pago', { state: { orderId: order.id, total: order.total } })}
                className="flex items-center gap-1.5 text-sm font-bold text-white bg-secondary hover:bg-secondary/90 transition-colors px-4 py-1.5 rounded-lg"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>account_balance</span>
                Pagar por transferencia
              </button>
            )
          )}
        </div>
      </div>

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
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [groupBy, setGroupBy] = useState<GroupBy>('none')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = [...orders]
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.items.some(({ product }) => product.name.toLowerCase().includes(q))
      )
    }
    return result
  }, [orders, statusFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const visibleOrders = useMemo(() => (
    groupBy === 'none'
      ? filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
      : filtered
  ), [filtered, groupBy, currentPage])

  const groups = useMemo(() => {
    if (groupBy === 'none') return null
    const map: Record<string, Order[]> = {}
    for (const o of visibleOrders) {
      let key: string
      if (groupBy === 'status') {
        key = STATUS_LABELS[o.status]
      } else {
        const d = new Date(o.createdAt)
        key = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
      }
      if (!map[key]) map[key] = []
      map[key].push(o)
    }
    return map
  }, [visibleOrders, groupBy])

  function handleSearch(v: string) { setSearch(v); setPage(1) }
  function handleStatus(v: StatusFilter) { setStatusFilter(v); setPage(1) }
  function handleGroup(v: GroupBy) { setGroupBy(v); setPage(1) }
  function clearAll() { setSearch(''); setStatusFilter('all'); setPage(1) }

  const hasActiveFilters = search.trim() || statusFilter !== 'all'

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
      <h1 className="font-headline text-headline-lg text-primary mb-8">Historial de Pedidos</h1>

      {/* ── Controls ── */}
      <div className="mb-6 space-y-4">
        {/* Search + Group row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ fontSize: '20px' }}>
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por ID o producto..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            {search && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            )}
          </div>

          {/* Group selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-label-sm text-on-surface-variant whitespace-nowrap hidden sm:inline">Agrupar:</span>
            <div className="flex rounded-lg border border-outline-variant overflow-hidden bg-surface">
              {([['none', 'Ninguno'], ['status', 'Estado'], ['month', 'Mes']] as [GroupBy, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => handleGroup(val)}
                  className={`px-3 py-2 text-label-sm font-bold transition-colors ${
                    groupBy === val
                      ? 'bg-primary text-white'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status filter pills + result count */}
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map(({ value, label }) => {
            const count = value === 'all' ? orders.length : orders.filter(o => o.status === value).length
            return (
              <button
                key={value}
                onClick={() => handleStatus(value)}
                className={`px-4 py-1.5 rounded-full text-label-sm font-bold border transition-colors ${
                  statusFilter === value
                    ? 'bg-primary text-white border-primary'
                    : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary bg-surface'
                }`}
              >
                {label}
                <span className="ml-1.5 opacity-70">({count})</span>
              </button>
            )
          })}
          <span className="ml-auto text-label-sm text-on-surface-variant whitespace-nowrap">
            {filtered.length} pedido{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container rounded-xl border border-outline-variant/30 h-32 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">
            {hasActiveFilters ? 'search_off' : 'receipt_long'}
          </span>
          <p className="text-body-lg text-on-surface-variant">
            {hasActiveFilters ? 'No se encontraron pedidos con ese filtro.' : 'No tienes pedidos aún.'}
          </p>
          {hasActiveFilters ? (
            <button onClick={clearAll} className="mt-4 text-secondary hover:underline">
              Limpiar filtros
            </button>
          ) : (
            <Link to="/tienda" className="mt-4 inline-block text-secondary hover:underline">
              Explorar tienda
            </Link>
          )}
        </div>
      ) : groups ? (
        // Grouped view
        <div className="space-y-8">
          {Object.entries(groups).map(([title, groupOrders]) => (
            <div key={title}>
              <h2 className="flex items-center gap-2 font-headline text-headline-sm text-on-surface-variant mb-3 capitalize">
                <span className="w-1 h-5 bg-primary rounded-full inline-block shrink-0" />
                {title}
                <span className="text-label-sm font-normal text-on-surface-variant/70">
                  ({groupOrders.length})
                </span>
              </h2>
              <div className="space-y-4">
                {groupOrders.map(o => <OrderCard key={o.id} order={o} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat paginated list
        <div className="space-y-4">
          {visibleOrders.map(o => <OrderCard key={o.id} order={o} />)}
        </div>
      )}

      {/* ── Pagination ── */}
      {!isLoading && groupBy === 'none' && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1.5">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-label-sm font-bold border transition-colors ${
                p === currentPage
                  ? 'bg-primary text-white border-primary'
                  : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
          </button>
        </div>
      )}
    </div>
  )
}
