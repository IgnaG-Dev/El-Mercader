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

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-primary text-on-primary font-bold'
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
    }`

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-surface-container-highest border-r border-outline-variant
        flex flex-col flex-shrink-0 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:translate-x-0 lg:z-auto
      `}
    >
      <div className="p-6 border-b border-outline-variant flex items-center justify-between">
        <div>
          <div className="font-headline text-xl font-bold text-primary">El Mercader</div>
          <div className="text-label-sm text-on-surface-variant mt-1">Panel de Administración</div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
          aria-label="Cerrar menú"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
        </button>
      </div>

      <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass} onClick={onClose}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
            <span className="text-body-md">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-outline-variant">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm flex-shrink-0">
            {user?.name?.[0] ?? 'A'}
          </div>
          <div className="min-w-0">
            <div className="text-label-bold font-bold text-on-surface text-sm truncate">{user?.name}</div>
            <div className="text-label-sm text-on-surface-variant">Administrador</div>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors text-label-bold mb-1"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Volver a la web
        </button>
        <button
          onClick={() => { logout(); navigate('/') }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-error hover:bg-error-container transition-colors text-label-bold"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
