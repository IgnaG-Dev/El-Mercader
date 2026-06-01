import { useAdminOrders } from '../../hooks/useOrders'
import { useAdminProducts } from '../../hooks/useProducts'
import { useQuery } from '@tanstack/react-query'
import { fetchAllProfiles } from '../../services/profiles'
import OrderStatusBadge from '../../components/ui/OrderStatusBadge'

export default function AdminDashboard() {
  const { data: orders = [], isLoading: loadingOrders } = useAdminOrders()
  const { data: products = [], isLoading: loadingProducts } = useAdminProducts()
  const { data: users = [] } = useQuery({ queryKey: ['admin', 'users'], queryFn: fetchAllProfiles })

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)

  const stats = [
    {
      icon: 'attach_money',
      label: 'Ingresos totales',
      value: `$${totalRevenue.toFixed(0)}`,
      color: 'bg-secondary-container text-on-secondary-container',
    },
    {
      icon: 'receipt_long',
      label: 'Pedidos',
      value: orders.length.toString(),
      color: 'bg-primary-fixed text-on-primary-fixed',
    },
    {
      icon: 'groups',
      label: 'Usuarios',
      value: users.length.toString(),
      color: 'bg-tertiary-fixed/30 text-on-tertiary-container',
    },
    {
      icon: 'inventory_2',
      label: 'Productos activos',
      value: products.filter((p) => p.active).length.toString(),
      color: 'bg-surface-container-high text-on-surface',
    },
  ]

  const recentOrders = orders.slice(0, 5)
  const topProducts = products.slice(0, 5)

  return (
    <div className="p-8">
      <h1 className="font-headline text-headline-lg text-primary mb-8">Vista General</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map(({ icon, label, value, color }) => (
          <div key={label} className="bg-surface-container rounded-xl border border-outline-variant/30 p-5">
            <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{icon}</span>
            </div>
            {loadingOrders || loadingProducts ? (
              <div className="h-7 bg-surface-container-high rounded animate-pulse w-16 mb-1" />
            ) : (
              <div className="text-headline-md font-bold text-on-surface">{value}</div>
            )}
            <div className="text-label-sm text-on-surface-variant mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent orders */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
          <h2 className="font-headline text-headline-md text-on-surface mb-4">Últimos pedidos</h2>
          {recentOrders.length === 0 ? (
            <p className="text-body-md text-on-surface-variant text-center py-4">No hay pedidos aún.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-container-low transition-colors">
                  <div>
                    <div className="font-bold text-label-bold text-on-surface font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-label-sm text-on-surface-variant">{order.createdAt}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-bold text-body-md text-on-surface">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6">
          <h2 className="font-headline text-headline-md text-on-surface mb-4">Productos en catálogo</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-label-sm font-bold text-on-surface-variant w-5">{i + 1}</span>
                <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <div className="text-label-bold font-bold text-on-surface truncate">{p.name}</div>
                  <div className="text-label-sm text-on-surface-variant">${p.price}</div>
                </div>
                <div className={`text-label-sm font-bold ${p.stock < 5 ? 'text-error' : 'text-secondary'}`}>
                  {p.stock} unid.
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
