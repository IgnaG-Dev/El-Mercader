import { useState, useMemo } from 'react'
import {
  useAdminOrders,
  useUpdateOrderStatus,
  useDeleteOrder,
  useCreateOrderAdmin,
} from '../../hooks/useOrders'
import { useAdminProducts } from '../../hooks/useProducts'
import { useUsers } from '../../hooks/useUsers'
import type { Order, User } from '../../types'
import type { CreateOrderAdminInput } from '../../services/orders'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import OrderStatusBadge from '../../components/ui/OrderStatusBadge'
import OrderTracker from '../../components/ui/OrderTracker'
import Button from '../../components/ui/Button'

const STATUS_OPTIONS: Order['status'][] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Pendiente', paid: 'Pagado', shipped: 'Enviado',
  delivered: 'Entregado', cancelled: 'Cancelado',
}

const PAYMENT_OPTS = ['Todos', 'mercado_pago', 'transfer', 'transferencia', 'efectivo', 'tarjeta']

type SortCol = 'date' | 'total' | 'status' | 'payment' | 'items' | 'customer'
type SortDir = 'asc' | 'desc'
type GroupMode = 'none' | 'status'

const EMPTY_ORDER: CreateOrderAdminInput = {
  items: [], total: 0, paymentMethod: 'efectivo', status: 'pending',
  shippingAddress: { name: '', email: '', phone: '', street: '', city: '', province: '', postalCode: '' },
}

interface OrderItem {
  productId: string; productName: string; productImage: string
  quantity: number; unitPrice: number
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`material-symbols-outlined transition-opacity ${active ? 'text-primary opacity-100' : 'opacity-30'}`} style={{ fontSize: '14px' }}>
      {active ? (dir === 'asc' ? 'expand_less' : 'expand_more') : 'unfold_more'}
    </span>
  )
}

function InfoRow({ label, value, valueClass = 'font-bold text-on-surface' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-on-surface-variant shrink-0">{label}:</span>
      <span className={valueClass}>{value}</span>
    </div>
  )
}

export default function AdminOrders() {
  const { data: orders = [], isLoading } = useAdminOrders()
  const { data: products = [] } = useAdminProducts()
  const { data: users = [] } = useUsers()
  const updateStatus = useUpdateOrderStatus()
  const deleteOrder = useDeleteOrder()
  const createOrder = useCreateOrderAdmin()

  const profileMap = useMemo(() => {
    const map: Record<string, User> = {}
    users.forEach(u => { map[u.id] = u })
    return map
  }, [users])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState('Todos')
  const [sortCol, setSortCol] = useState<SortCol>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [groupMode, setGroupMode] = useState<GroupMode>('none')

  const [viewOrder, setViewOrder] = useState<Order | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const [newOrder, setNewOrder] = useState<CreateOrderAdminInput>(EMPTY_ORDER)
  const [newItems, setNewItems] = useState<OrderItem[]>([])
  const [createError, setCreateError] = useState('')

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    let list = [...orders]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        (profileMap[o.userId]?.name ?? '').toLowerCase().includes(q) ||
        (profileMap[o.userId]?.email ?? '').toLowerCase().includes(q) ||
        JSON.stringify(o.address ?? {}).toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter)
    if (paymentFilter !== 'Todos') list = list.filter(o => o.paymentMethod === paymentFilter)
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortCol) {
        case 'date': return dir * a.createdAt.localeCompare(b.createdAt)
        case 'total': return dir * (a.total - b.total)
        case 'status': return dir * a.status.localeCompare(b.status)
        case 'payment': return dir * (a.paymentMethod ?? '').localeCompare(b.paymentMethod ?? '')
        case 'items': return dir * (a.items.length - b.items.length)
        case 'customer': {
          const na = profileMap[a.userId]?.name ?? (a.address as unknown as Record<string, string>)?.name ?? ''
          const nb = profileMap[b.userId]?.name ?? (b.address as unknown as Record<string, string>)?.name ?? ''
          return dir * na.localeCompare(nb)
        }
        default: return 0
      }
    })
    return list
  }, [orders, search, statusFilter, paymentFilter, sortCol, sortDir, profileMap])

  const grouped = useMemo(() => {
    if (groupMode === 'none') return { '': filtered }
    return filtered.reduce<Record<string, Order[]>>((acc, o) => {
      if (!acc[o.status]) acc[o.status] = []
      acc[o.status].push(o)
      return acc
    }, {})
  }, [filtered, groupMode])

  function addItem() {
    const first = products[0]
    if (!first) return
    setNewItems(prev => [...prev, { productId: first.id, productName: first.name, productImage: first.image, quantity: 1, unitPrice: first.price }])
  }

  function updateItem(idx: number, key: keyof OrderItem, value: string | number) {
    setNewItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      if (key === 'productId') {
        const p = products.find(p => p.id === value)
        return p ? { ...item, productId: p.id, productName: p.name, productImage: p.image, unitPrice: p.price } : item
      }
      return { ...item, [key]: value }
    }))
  }

  function removeItem(idx: number) {
    setNewItems(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleCreate() {
    setCreateError('')
    if (newItems.length === 0) { setCreateError('Agregá al menos un producto'); return }
    const total = newItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    try {
      await createOrder.mutateAsync({ ...newOrder, items: newItems, total })
      setShowCreate(false)
      setNewOrder(EMPTY_ORDER)
      setNewItems([])
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : 'Error al crear el pedido')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteOrder.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  const COLS: { key: SortCol | null; label: string }[] = [
    { key: null, label: 'Pedido' },
    { key: 'customer', label: 'Cliente' },
    { key: 'date', label: 'Fecha' },
    { key: 'items', label: 'Items' },
    { key: 'total', label: 'Total' },
    { key: 'status', label: 'Estado' },
    { key: 'payment', label: 'Pago' },
    { key: null, label: 'Acciones' },
  ]

  // Pre-compute modal data
  const viewProfile = viewOrder ? profileMap[viewOrder.userId] : null
  const viewAddr = viewOrder ? (viewOrder.address as unknown as Record<string, string> | undefined) : null
  const viewCustomerName = viewProfile?.name ?? viewAddr?.name ?? '—'
  const viewCustomerEmail = viewProfile?.email ?? viewAddr?.email

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-headline text-2xl sm:text-3xl text-primary font-bold">Gestión de Pedidos</h1>
        <Button size="sm" onClick={() => { setNewOrder(EMPTY_ORDER); setNewItems([]); setCreateError(''); setShowCreate(true) }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          Nuevo pedido
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por ID, nombre o email..."
            className="pl-9 pr-4 py-2 border border-outline-variant rounded-lg bg-surface text-sm text-on-surface focus:outline-none focus:border-primary w-64"
          />
        </div>

        <div className="flex gap-1 bg-surface-container rounded-lg p-1">
          <button onClick={() => setStatusFilter('all')} className={`px-3 py-1 rounded text-sm font-bold transition-colors ${statusFilter === 'all' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}>Todos</button>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded text-sm font-bold transition-colors ${statusFilter === s ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface text-on-surface focus:outline-none focus:border-primary">
          {PAYMENT_OPTS.map(p => <option key={p} value={p}>{p === 'Todos' ? 'Todos los pagos' : p}</option>)}
        </select>

        <button
          onClick={() => setGroupMode(g => g === 'none' ? 'status' : 'none')}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-bold transition-colors ${groupMode !== 'none' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>layers</span>
          Agrupar
        </button>

        <span className="text-sm text-on-surface-variant ml-auto">{filtered.length} pedido{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-surface-container-highest">
            <tr>
              {COLS.map(col => (
                <th
                  key={col.label}
                  onClick={col.key ? () => handleSort(col.key!) : undefined}
                  className={`text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide select-none ${col.key ? 'cursor-pointer hover:text-primary hover:bg-surface-container/60 transition-colors' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.key && <SortIcon active={sortCol === col.key} dir={sortDir} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-8 bg-surface-container-highest rounded animate-pulse" /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-on-surface-variant">No se encontraron pedidos.</td></tr>
            ) : Object.entries(grouped).map(([group, items]) => (
              <>
                {groupMode !== 'none' && (
                  <tr key={`group-${group}`} className="bg-surface-container-highest/50">
                    <td colSpan={8} className="px-4 py-2">
                      <span className="font-bold text-sm text-primary uppercase tracking-widest">{STATUS_LABELS[group as Order['status']] ?? group}</span>
                      <span className="ml-2 text-xs text-on-surface-variant">({items.length})</span>
                    </td>
                  </tr>
                )}
                {items.map(order => {
                  const profile = profileMap[order.userId]
                  const addr = order.address as unknown as Record<string, string> | undefined
                  const customerName = profile?.name ?? addr?.name ?? '—'
                  const customerEmail = profile?.email ?? addr?.email
                  return (
                    <tr key={order.id} className="hover:bg-surface-container/60 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm font-bold text-on-surface">
                        <div className="flex flex-col gap-0.5">
                          <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                          {order.receiptUrl ? (
                            <span className="flex items-center gap-1 text-secondary text-xs font-normal font-sans">
                              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>attach_file</span>
                              Comprobante
                            </span>
                          ) : order.paymentMethod === 'transfer' || order.paymentMethod === 'transferencia' ? (
                            <span className="flex items-center gap-1 text-error text-xs font-normal font-sans">
                              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>warning</span>
                              Sin comprobante
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-outline-variant/20">
                            {profile?.avatar ? (
                              <img src={profile.avatar} alt={customerName} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>person</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-on-surface truncate max-w-[160px]">{customerName}</div>
                            {customerEmail && <div className="text-xs text-on-surface-variant truncate max-w-[160px]">{customerEmail}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-on-surface-variant whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 text-sm text-on-surface-variant">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                      <td className="px-4 py-3 font-bold text-sm text-secondary">${order.total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</td>
                      <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant capitalize">{order.paymentMethod?.replace('_', ' ') ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 items-center">
                          <button onClick={() => setViewOrder(order)} className="p-1.5 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" title="Ver detalle">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                          </button>
                          <select
                            value={order.status}
                            onChange={e => updateStatus.mutate({ id: order.id, status: e.target.value as Order['status'] })}
                            disabled={updateStatus.isPending}
                            className="text-xs border border-outline-variant rounded px-2 py-1 bg-surface text-on-surface focus:outline-none focus:border-primary"
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                          </select>
                          <button onClick={() => setDeleteTarget(order)} className="p-1.5 rounded text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors" title="Eliminar">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Detail Modal */}
      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title={`Pedido #${viewOrder?.id.slice(0, 8).toUpperCase() ?? ''}`} maxWidth="xl">
        {viewOrder && (
          <div className="p-6 space-y-5">

            {/* ── Comprador ── */}
            <section className="flex items-center gap-4 p-4 bg-surface-container rounded-xl border border-outline-variant/20">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-outline-variant/20">
                {viewProfile?.avatar ? (
                  <img src={viewProfile.avatar} alt={viewCustomerName} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '26px' }}>person</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-on-surface text-base">{viewCustomerName}</div>
                {viewCustomerEmail && <div className="text-sm text-on-surface-variant">{viewCustomerEmail}</div>}
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                  {(viewProfile?.phone ?? viewAddr?.phone) && (
                    <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>phone</span>
                      {viewProfile?.phone ?? viewAddr?.phone}
                    </span>
                  )}
                  {viewProfile?.dni && (
                    <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>badge</span>
                      DNI {viewProfile.dni}
                    </span>
                  )}
                </div>
              </div>
              <OrderStatusBadge status={viewOrder.status} />
            </section>

            {/* ── Tracking ── */}
            <section>
              <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-3">
                Seguimiento de caravana
              </div>
              <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/20">
                <OrderTracker status={viewOrder.status} createdAt={viewOrder.createdAt} />
              </div>
            </section>

            {/* ── Cambiar estado ── */}
            <section className="flex items-center gap-3 p-3 bg-surface-container-highest rounded-lg border border-outline-variant/30">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>edit</span>
              <span className="text-sm font-bold text-on-surface-variant">Actualizar estado:</span>
              <select
                value={viewOrder.status}
                onChange={e => {
                  const next = e.target.value as Order['status']
                  updateStatus.mutate({ id: viewOrder.id, status: next })
                  setViewOrder(o => o ? { ...o, status: next } : o)
                }}
                disabled={updateStatus.isPending}
                className="text-sm border border-outline-variant rounded-lg px-3 py-1.5 bg-surface text-on-surface focus:outline-none focus:border-primary"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </section>

            {/* ── Info + Dirección ── */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20 space-y-2">
                <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">Info del pedido</div>
                <InfoRow label="Fecha" value={formatDate(viewOrder.createdAt)} />
                <InfoRow label="Pago" value={viewOrder.paymentMethod?.replace('_', ' ') ?? '—'} />
                <InfoRow label="Total" value={`$${viewOrder.total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`} valueClass="font-bold text-secondary text-base" />
                <div className="flex items-center gap-2">
                  <span className="text-on-surface-variant">Comprobante:</span>
                  {viewOrder.receiptUrl ? (
                    <a href={viewOrder.receiptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-secondary font-bold hover:underline">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                      Ver adjunto
                    </a>
                  ) : (
                    <span className="flex items-center gap-1 text-error font-bold">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                      Sin adjuntar
                    </span>
                  )}
                </div>
              </div>
              {viewAddr && (
                <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20 space-y-1">
                  <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">Dirección de envío</div>
                  {viewAddr.street && <div className="text-on-surface font-medium">{viewAddr.street}</div>}
                  {(viewAddr.city || viewAddr.province) && (
                    <div className="text-on-surface-variant">{[viewAddr.city, viewAddr.province].filter(Boolean).join(', ')}</div>
                  )}
                  {viewAddr.postalCode && <div className="text-on-surface-variant">CP {viewAddr.postalCode}</div>}
                </div>
              )}
            </div>

            {/* ── Productos ── */}
            <div>
              <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">Productos ({viewOrder.items.length})</div>
              <div className="space-y-2">
                {viewOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-surface-container rounded-lg border border-outline-variant/10">
                    <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-cover rounded border border-outline-variant/30 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-on-surface truncate">{item.product.name}</div>
                      <div className="text-xs text-on-surface-variant">x{item.quantity} · ${item.product.price.toLocaleString('es-AR')} c/u</div>
                    </div>
                    <div className="font-bold text-sm text-secondary shrink-0">${(item.product.price * item.quantity).toLocaleString('es-AR')}</div>
                  </div>
                ))}
                <div className="flex justify-end pt-1 text-sm gap-2">
                  <span className="text-on-surface-variant">Total:</span>
                  <span className="font-bold text-secondary">${viewOrder.total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            {/* ── Comprobante ── */}
            {viewOrder.receiptUrl && (
              <div>
                <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">Comprobante de pago</div>
                {viewOrder.receiptUrl.match(/\.(jpg|jpeg|png|webp|gif)($|\?)/i) ? (
                  <img
                    src={viewOrder.receiptUrl}
                    alt="Comprobante"
                    className="w-full rounded-lg border border-outline-variant/30 object-contain bg-surface-container-highest"
                  />
                ) : (
                  <iframe
                    src={viewOrder.receiptUrl}
                    title="Comprobante PDF"
                    className="w-full h-64 rounded-lg border border-outline-variant/30"
                  />
                )}
              </div>
            )}

            <div className="text-xs text-on-surface-variant font-mono border-t border-outline-variant/30 pt-3">
              ID: {viewOrder.id}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Order Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Pedido Manual" maxWidth="2xl">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Estado inicial</label>
              <select value={newOrder.status} onChange={e => setNewOrder(o => ({ ...o, status: e.target.value as Order['status'] }))} className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Método de pago</label>
              <select value={newOrder.paymentMethod} onChange={e => setNewOrder(o => ({ ...o, paymentMethod: e.target.value }))} className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary">
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="mercado_pago">Mercado Pago</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">Datos del cliente</div>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['name', 'Nombre'], ['email', 'Email'], ['phone', 'Teléfono'],
                ['street', 'Dirección'], ['city', 'Ciudad'], ['province', 'Provincia'],
                ['postalCode', 'Código postal'],
              ] as [string, string][]).map(([key, label]) => (
                <div key={key} className={key === 'street' || key === 'name' || key === 'email' ? 'col-span-2' : ''}>
                  <label className="block text-xs text-on-surface-variant mb-1">{label}</label>
                  <input
                    value={(newOrder.shippingAddress as Record<string, string>)?.[key] ?? ''}
                    onChange={e => setNewOrder(o => ({ ...o, shippingAddress: { ...o.shippingAddress!, [key]: e.target.value } }))}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Productos</div>
              <button onClick={addItem} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span> Agregar
              </button>
            </div>
            {newItems.length === 0 && <p className="text-sm text-on-surface-variant">Sin productos agregados.</p>}
            <div className="space-y-2">
              {newItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-surface-container rounded-lg">
                  <select
                    value={item.productId}
                    onChange={e => updateItem(idx, 'productId', e.target.value)}
                    className="flex-1 border border-outline-variant rounded px-2 py-1 text-sm bg-surface focus:outline-none"
                  >
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>)}
                  </select>
                  <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                    className="w-16 border border-outline-variant rounded px-2 py-1 text-sm bg-surface focus:outline-none text-center" />
                  <span className="text-sm font-bold text-secondary w-16 text-right">${(item.unitPrice * item.quantity).toFixed(0)}</span>
                  <button onClick={() => removeItem(idx)} className="text-error hover:text-error/70">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                  </button>
                </div>
              ))}
            </div>
            {newItems.length > 0 && (
              <div className="text-right font-bold text-sm text-on-surface mt-2">
                Total: <span className="text-secondary">${newItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0).toFixed(2)}</span>
              </div>
            )}
          </div>

          {createError && <p className="text-error text-sm">{createError}</p>}

          <div className="flex gap-3 justify-end pt-2 border-t border-outline-variant/30">
            <Button variant="outline" size="sm" onClick={() => setShowCreate(false)} disabled={createOrder.isPending}>Cancelar</Button>
            <Button size="sm" onClick={handleCreate} loading={createOrder.isPending}>Crear pedido</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteOrder.isPending}
        message={`¿Eliminar el pedido #${deleteTarget?.id.slice(0, 8).toUpperCase()}? Esta acción eliminará también sus items.`}
      />
    </div>
  )
}
