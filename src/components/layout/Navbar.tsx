import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-tertiary-fixed font-bold border-b-2 border-tertiary-fixed pb-1 transition-colors'
    : 'text-surface-variant hover:text-tertiary-fixed transition-colors duration-200'

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
    isActive
      ? 'bg-tertiary-fixed/15 text-tertiary-fixed'
      : 'text-surface-variant hover:bg-white/10 hover:text-tertiary-fixed'
  }`

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartBump, setCartBump] = useState(false)
  const itemCount = useCartStore((s) => s.itemCount)
  const prevCount = useRef(itemCount)
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setCartBump(true)
      const t = setTimeout(() => setCartBump(false), 600)
      return () => clearTimeout(t)
    }
    prevCount.current = itemCount
  }, [itemCount])

  const close = () => setMobileOpen(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    close()
  }

  return (
    <nav className="bg-inverse-surface text-tertiary-fixed sticky top-0 z-50 shadow-md">
      {/* ── Top bar ── */}
      <div className="flex justify-between items-center w-full px-4 md:px-margin-desktop py-4 max-w-container-max mx-auto">
        {/* Logo */}
        <Link to="/" className="font-headline text-2xl font-bold text-tertiary-fixed flex-shrink-0">
          El Mercader
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex flex-grow justify-center space-x-8 items-center">
          <NavLink to="/" end className={desktopLinkClass}>Inicio</NavLink>
          <NavLink to="/tienda" className={desktopLinkClass}>Tienda</NavLink>
          <NavLink to="/comunidad" className={desktopLinkClass}>Comunidad</NavLink>
        </div>

        {/* Right icons */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <Link to="/busqueda" className="text-surface-variant hover:text-tertiary-fixed transition-colors">
            <span className="material-symbols-outlined">search</span>
          </Link>

          <Link to="/carrito" className="relative text-surface-variant hover:text-tertiary-fixed transition-colors">
            <span className={`material-symbols-outlined ${cartBump ? 'cart-bump' : ''}`}>shopping_cart</span>
            {itemCount > 0 && (
              <span className={`absolute -top-2 -right-2 bg-primary text-on-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${cartBump ? 'badge-pop' : ''}`}>
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          {/* Desktop user menu */}
          {isAuthenticated ? (
            <div className="relative group hidden md:block">
              <button className="text-surface-variant hover:text-tertiary-fixed transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined">person</span>
              </button>
              <div className="absolute right-0 top-8 w-48 bg-surface-container-high rounded-lg shadow-lg border border-outline-variant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-4 py-2 border-b border-outline-variant">
                  <p className="text-label-sm font-bold text-on-surface truncate">{user?.name}</p>
                </div>
                <Link to="/perfil" className="flex items-center gap-2 px-4 py-2 text-body-md text-on-surface hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>manage_accounts</span>
                  Mi Perfil
                </Link>
                <Link to="/historial-pedidos" className="flex items-center gap-2 px-4 py-2 text-body-md text-on-surface hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>receipt_long</span>
                  Mis Pedidos
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-body-md text-primary font-bold hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>admin_panel_settings</span>
                    Panel Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-body-md text-error hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="text-surface-variant hover:text-tertiary-fixed transition-colors hidden md:block">
              <span className="material-symbols-outlined">person</span>
            </Link>
          )}

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden text-surface-variant hover:text-tertiary-fixed transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10">
          {/* Nav links */}
          <div className="px-3 pt-3 pb-2 space-y-1">
            <NavLink to="/" end className={mobileLinkClass} onClick={close}>
              <span className="material-symbols-outlined text-xl">home</span>
              Inicio
            </NavLink>
            <NavLink to="/tienda" className={mobileLinkClass} onClick={close}>
              <span className="material-symbols-outlined text-xl">storefront</span>
              Tienda
            </NavLink>
            <NavLink to="/comunidad" className={mobileLinkClass} onClick={close}>
              <span className="material-symbols-outlined text-xl">groups</span>
              Comunidad
            </NavLink>
          </div>

          {/* Account section */}
          <div className="border-t border-white/10 px-3 pt-2 pb-4 space-y-1">
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2">
                  <p className="text-tertiary-fixed/50 text-xs font-semibold uppercase tracking-wider">Mi cuenta</p>
                  <p className="text-tertiary-fixed font-bold text-sm mt-0.5 truncate">{user?.name}</p>
                </div>
                <NavLink to="/perfil" className={mobileLinkClass} onClick={close}>
                  <span className="material-symbols-outlined text-xl">manage_accounts</span>
                  Mi Perfil
                </NavLink>
                <NavLink to="/historial-pedidos" className={mobileLinkClass} onClick={close}>
                  <span className="material-symbols-outlined text-xl">receipt_long</span>
                  Mis Pedidos
                </NavLink>
                {user?.role === 'admin' && (
                  <NavLink to="/admin" className={mobileLinkClass} onClick={close}>
                    <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                    Panel Admin
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-white/10 transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <NavLink to="/login" className={mobileLinkClass} onClick={close}>
                <span className="material-symbols-outlined text-xl">person</span>
                Ingresar
              </NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
