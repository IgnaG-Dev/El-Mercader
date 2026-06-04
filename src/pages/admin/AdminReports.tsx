import { useMemo } from 'react'
import { useAdminOrders } from '../../hooks/useOrders'
import { useAdminProducts } from '../../hooks/useProducts'
import { useUsers } from '../../hooks/useUsers'

// ─── constants ───────────────────────────────────────────────────────────────

const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pendiente',  color: '#735c00' },
  confirmed: { label: 'Confirmado', color: '#3b6934' },
  shipped:   { label: 'Enviado',    color: '#1565c0' },
  delivered: { label: 'Entregado',  color: '#2e7d32' },
  cancelled: { label: 'Cancelado',  color: '#ba1a1a' },
}

const PM_META: Record<string, { label: string; color: string }> = {
  mercadopago: { label: 'Mercado Pago',         color: '#009ee3' },
  transfer:    { label: 'Transferencia bancaria', color: '#3b6934' },
}

// ─── micro-components ────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-container-highest rounded ${className}`} />
}

function KpiCard({
  label, value, icon, color, sub, loading,
}: { label: string; value: string; icon: string; color: string; sub?: string; loading?: boolean }) {
  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-5">
      <span className={`material-symbols-outlined ${color} mb-3 block`} style={{ fontSize: '26px' }}>{icon}</span>
      {loading
        ? <Skeleton className="h-8 w-24 mb-1" />
        : <div className="font-headline text-2xl font-bold text-on-surface leading-tight">{value}</div>}
      <div className="text-xs text-on-surface-variant mt-1">{label}</div>
      {sub && !loading && <div className="text-xs text-secondary font-bold mt-1">{sub}</div>}
    </div>
  )
}

function BarChart({
  data, height = 140,
}: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-2 w-full" style={{ height: `${height + 44}px` }}>
      {data.map(({ label, value }) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-on-surface-variant font-bold leading-none">
            {value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : value > 0 ? `$${value}` : '—'}
          </span>
          <div className="w-full flex flex-col justify-end" style={{ height: `${height}px` }}>
            <div
              className="w-full bg-primary rounded-t-md transition-all duration-500"
              style={{ height: `${Math.max((value / max) * height, value > 0 ? 4 : 0)}px` }}
            />
          </div>
          <span className="text-xs text-on-surface-variant leading-none">{label}</span>
        </div>
      ))}
    </div>
  )
}

function HBar({
  label, value, total, color, suffix = '',
}: { label: string; value: number; total: number; color: string; suffix?: string }) {
  const pct = total > 0 ? Math.max((value / total) * 100, value > 0 ? 2 : 0) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-on-surface font-bold truncate max-w-[60%]">{label}</span>
        <span className="text-on-surface-variant font-bold">{suffix || value}</span>
      </div>
      <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function DonutChart({ segments }: { segments: { value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total === 0) return (
    <div className="w-28 h-28 rounded-full bg-surface-container-highest flex items-center justify-center text-xs text-on-surface-variant">Sin datos</div>
  )
  let pct = 0
  const gradient = segments
    .filter(s => s.value > 0)
    .map(s => {
      const part = `${s.color} ${pct}% ${pct + (s.value / total) * 100}%`
      pct += (s.value / total) * 100
      return part
    })
    .join(', ')
  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(${gradient})` }} />
      <div className="absolute inset-[22%] bg-surface-container rounded-full flex items-center justify-center">
        <span className="text-sm font-bold text-on-surface">{total}</span>
      </div>
    </div>
  )
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function AdminReports() {
  const { data: orders = [], isLoading: ordersLoading } = useAdminOrders()
  const { data: products = [], isLoading: productsLoading } = useAdminProducts()
  const { data: users = [], isLoading: usersLoading } = useUsers()

  const isLoading = ordersLoading || productsLoading || usersLoading

  // current & previous month helpers
  const now = new Date()
  const curY = now.getFullYear(), curM = now.getMonth()
  const prevM = curM === 0 ? 11 : curM - 1
  const prevY = curM === 0 ? curY - 1 : curY

  function parseDate(s: string) {
    const [y, m] = s.split('-').map(Number)
    return { year: y, month: m - 1 } // month 0-indexed
  }

  // active = non-cancelled
  const activeOrders = useMemo(() => orders.filter(o => o.status !== 'cancelled'), [orders])

  const currentMonthOrders = useMemo(
    () => activeOrders.filter(o => { const d = parseDate(o.createdAt); return d.year === curY && d.month === curM }),
    [activeOrders, curY, curM]
  )
  const prevMonthOrders = useMemo(
    () => activeOrders.filter(o => { const d = parseDate(o.createdAt); return d.year === prevY && d.month === prevM }),
    [activeOrders, prevY, prevM]
  )

  const monthRevenue = currentMonthOrders.reduce((s, o) => s + o.total, 0)
  const prevRevenue  = prevMonthOrders.reduce((s, o) => s + o.total, 0)
  const revTrend = prevRevenue > 0 ? Math.round(((monthRevenue - prevRevenue) / prevRevenue) * 100) : null

  const avgTicket = currentMonthOrders.length > 0 ? Math.round(monthRevenue / currentMonthOrders.length) : 0

  // monthly bar chart — last 6 months
  const monthlySales = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(curY, curM - 5 + i, 1)
      return { year: d.getFullYear(), month: d.getMonth(), label: MONTHS_ES[d.getMonth()] }
    })
    return months.map(({ year, month, label }) => ({
      label,
      value: activeOrders
        .filter(o => { const d = parseDate(o.createdAt); return d.year === year && d.month === month })
        .reduce((s, o) => s + o.total, 0),
    }))
  }, [activeOrders, curY, curM])

  // orders per day — last 14 days
  const dailySales = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(curY, curM, now.getDate() - 13 + i)
      const iso = d.toISOString().split('T')[0]
      return { label: `${d.getDate()}/${d.getMonth() + 1}`, iso }
    })
    return days.map(({ label, iso }) => ({
      label,
      value: activeOrders.filter(o => o.createdAt === iso).reduce((s, o) => s + o.total, 0),
    }))
  }, [activeOrders, curY, curM])

  // status breakdown
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    orders.forEach(o => { counts[o.status] = (counts[o.status] ?? 0) + 1 })
    return counts
  }, [orders])

  const donutSegments = useMemo(
    () => Object.entries(STATUS_META).map(([key, meta]) => ({ value: statusCounts[key] ?? 0, color: meta.color })),
    [statusCounts]
  )

  // payment methods
  const paymentCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    orders.forEach(o => { const pm = o.paymentMethod ?? 'unknown'; counts[pm] = (counts[pm] ?? 0) + 1 })
    return counts
  }, [orders])

  // top products by revenue
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number; image: string; category: string }> = {}
    activeOrders.forEach(o =>
      o.items.forEach(item => {
        const id = item.product.id
        if (!map[id]) map[id] = { name: item.product.name, qty: 0, revenue: 0, image: item.product.image, category: item.product.category }
        map[id].qty += item.quantity
        map[id].revenue += item.product.price * item.quantity
      })
    )
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  }, [activeOrders])

  // category revenue
  const categoryRevenue = useMemo(() => {
    const map: Record<string, number> = {}
    activeOrders.forEach(o =>
      o.items.forEach(item => {
        map[item.product.category] = (map[item.product.category] ?? 0) + item.product.price * item.quantity
      })
    )
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [activeOrders])

  const maxCatRev = categoryRevenue[0]?.[1] ?? 1

  // low stock
  const lowStock = useMemo(() => products.filter(p => p.active && p.stock < 10).sort((a, b) => a.stock - b.stock).slice(0, 6), [products])

  // recent orders
  const recentOrders = useMemo(() => [...orders].slice(0, 8), [orders])

  // total stock value
  const totalInventoryValue = useMemo(() => products.reduce((s, p) => s + p.price * p.stock, 0), [products])

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="font-headline text-3xl text-primary font-bold">Informes Avanzados</h1>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Ingresos del mes"
          value={`$${monthRevenue.toLocaleString('es-AR')}`}
          icon="trending_up"
          color="text-secondary"
          sub={revTrend !== null ? `${revTrend >= 0 ? '+' : ''}${revTrend}% vs mes anterior` : undefined}
          loading={isLoading}
        />
        <KpiCard
          label="Pedidos del mes"
          value={String(currentMonthOrders.length)}
          icon="receipt_long"
          color="text-tertiary"
          sub={`${orders.length} total`}
          loading={isLoading}
        />
        <KpiCard
          label="Ticket promedio"
          value={`$${avgTicket.toLocaleString('es-AR')}`}
          icon="receipt"
          color="text-primary"
          loading={isLoading}
        />
        <KpiCard
          label="Usuarios registrados"
          value={String(users.length)}
          icon="group"
          color="text-secondary"
          sub={`Inventario $${totalInventoryValue.toLocaleString('es-AR')}`}
          loading={isLoading}
        />
      </div>

      {/* ── Monthly sales + Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-surface-container rounded-xl border border-outline-variant/30 p-6">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-5">Ventas últimos 6 meses</h2>
          {isLoading ? <Skeleton className="h-48 w-full" /> : <BarChart data={monthlySales} height={160} />}
        </div>

        {/* Status donut */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4">Estado de pedidos</h2>
          {isLoading ? <Skeleton className="w-28 h-28 rounded-full mx-auto mb-4" /> : (
            <div className="flex flex-col items-center gap-4">
              <DonutChart segments={donutSegments} />
              <div className="w-full space-y-2">
                {Object.entries(STATUS_META).map(([key, meta]) => {
                  const count = statusCounts[key] ?? 0
                  if (count === 0) return null
                  return (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                        <span className="text-on-surface">{meta.label}</span>
                      </div>
                      <span className="font-bold text-on-surface">{count}</span>
                    </div>
                  )
                })}
                {orders.length === 0 && !isLoading && <p className="text-xs text-center text-on-surface-variant">Sin pedidos aún</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Daily sparkline ── */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
        <h2 className="font-headline text-lg font-bold text-on-surface mb-5">Ventas últimos 14 días</h2>
        {isLoading ? <Skeleton className="h-32 w-full" /> : <BarChart data={dailySales} height={100} />}
      </div>

      {/* ── Category + Payment + Low stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category revenue */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4">Ventas por categoría</h2>
          {isLoading ? (
            <div className="space-y-3">{Array.from({length: 4}).map((_,i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : categoryRevenue.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {categoryRevenue.map(([cat, rev]) => (
                <HBar
                  key={cat}
                  label={cat}
                  value={rev}
                  total={maxCatRev}
                  color="#812e19"
                  suffix={`$${rev.toLocaleString('es-AR')}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Payment methods */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4">Métodos de pago</h2>
          {isLoading ? (
            <div className="space-y-3">{Array.from({length: 2}).map((_,i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : orders.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Sin datos</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(paymentCounts).map(([pm, count]) => {
                const meta = PM_META[pm] ?? { label: pm, color: '#888' }
                return (
                  <HBar
                    key={pm}
                    label={meta.label}
                    value={count}
                    total={orders.length}
                    color={meta.color}
                    suffix={`${count} (${Math.round((count / orders.length) * 100)}%)`}
                  />
                )
              })}
              <div className="pt-2 border-t border-outline-variant/20 text-xs text-on-surface-variant">
                Total: {orders.length} pedidos
              </div>
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-error" style={{ fontSize: '20px' }}>warning</span>
            Stock crítico
          </h2>
          {productsLoading ? (
            <div className="space-y-2">{Array.from({length: 4}).map((_,i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : lowStock.length === 0 ? (
            <div className="flex flex-col items-center py-4 gap-2">
              <span className="material-symbols-outlined text-secondary text-4xl">check_circle</span>
              <p className="text-sm text-on-surface-variant">Todos los productos tienen buen stock</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={p.image} alt="" className="w-7 h-7 object-cover rounded flex-shrink-0" />
                    <span className="text-xs text-on-surface truncate">{p.name}</span>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ml-2 ${p.stock === 0 ? 'text-error' : p.stock < 5 ? 'text-error' : 'text-tertiary'}`}>
                    {p.stock} unid.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Top products + Recent orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/20">
            <h2 className="font-headline text-lg font-bold text-on-surface">Top 5 productos</h2>
            <p className="text-xs text-on-surface-variant">por ingresos generados</p>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-3">{Array.from({length: 5}).map((_,i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : topProducts.length === 0 ? (
            <p className="p-6 text-sm text-on-surface-variant">Sin ventas aún</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[360px]">
              <thead className="bg-surface-container-highest/50">
                <tr>
                  {['#','Producto','Vendido','Ingresos'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-bold text-on-surface-variant uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {topProducts.map((p, i) => (
                  <tr key={p.name} className="hover:bg-surface-container/60">
                    <td className="px-4 py-3 text-sm font-bold text-on-surface-variant">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={p.image} alt="" className="w-8 h-8 object-cover rounded" />
                        <span className="text-xs font-bold text-on-surface line-clamp-2">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{p.qty} unid.</td>
                    <td className="px-4 py-3 text-sm font-bold text-secondary">${p.revenue.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/20">
            <h2 className="font-headline text-lg font-bold text-on-surface">Últimos pedidos</h2>
            <p className="text-xs text-on-surface-variant">los 8 más recientes</p>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-3">{Array.from({length: 6}).map((_,i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-on-surface-variant">Sin pedidos aún</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[360px]">
              <thead className="bg-surface-container-highest/50">
                <tr>
                  {['ID','Fecha','Total','Estado'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-bold text-on-surface-variant uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {recentOrders.map(o => {
                  const meta = STATUS_META[o.status] ?? { label: o.status, color: '#888' }
                  return (
                    <tr key={o.id} className="hover:bg-surface-container/60">
                      <td className="px-4 py-3 text-xs font-mono text-on-surface-variant">{o.id.slice(0, 8)}…</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{o.createdAt}</td>
                      <td className="px-4 py-3 text-sm font-bold text-secondary">${o.total.toLocaleString('es-AR')}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: meta.color + '20', color: meta.color }}
                        >
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
