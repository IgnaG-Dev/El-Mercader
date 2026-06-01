import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/admin', icon: 'dashboard', label: 'Vista General', end: true },
  { to: '/admin/productos', icon: 'inventory_2', label: 'Productos' },
  { to: '/admin/categorias', icon: 'category', label: 'Categorías' },
  { to: '/admin/pedidos', icon: 'receipt_long', label: 'Pedidos' },
  { to: '/admin/usuarios', icon: 'groups', label: 'Usuarios y Gremios' },
  { to: '/admin/mercancias', icon: 'warehouse', label: 'Mercancías' },
  { to: '/admin/finanzas', icon: 'account_balance', label: 'Finanzas y Logística' },
  { to: '/admin/informes', icon: 'bar_chart', label: 'Informes' },
]

export default function AdminSidebar() {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-primary text-on-primary font-bold'
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
    }`

  return (
    <aside className="w-64 h-full bg-surface-container-highest border-r border-outline-variant flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-outline-variant">
        <div className="font-headline text-xl font-bold text-primary">El Mercader</div>
        <div className="text-label-sm text-on-surface-variant mt-1">Panel de Administración</div>
      </div>

      <nav className="flex-grow p-4 space-y-1">
        {navItems.map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
            <span className="text-body-md">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-outline-variant">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm">
            {user?.name?.[0] ?? 'A'}
          </div>
          <div>
            <div className="text-label-bold font-bold text-on-surface text-sm">{user?.name}</div>
            <div className="text-label-sm text-on-surface-variant">Administrador</div>
          </div>
        </div>
        <button
          onClick={() => { navigate('/'); logout() }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-error hover:bg-error-container transition-colors text-label-bold"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          Salir al sitio
        </button>
      </div>
    </aside>
  )
}
