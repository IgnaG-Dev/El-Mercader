import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { useLocationStore } from '../../store/locationStore'
import { useAddresses } from '../../hooks/useAddresses'
import { PROVINCES } from '../../constants/provinces'
import { reverseGeocode } from '../../lib/geo'

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
  const [locationOpen, setLocationOpen] = useState(false)
  const [pendingProvince, setPendingProvince] = useState('')
  const [pendingCity, setPendingCity] = useState('')
  const [pendingStreet, setPendingStreet] = useState('')
  const [pendingPostalCode, setPendingPostalCode] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const itemCount = useCartStore((s) => s.itemCount)
  const prevCount = useRef(itemCount)
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const { city, province, street, postalCode, setLocation, clearLocation } = useLocationStore()
  const { data: addresses } = useAddresses({ enabled: isAuthenticated })

  const locationDropdownRef = useRef<HTMLDivElement>(null)

  // Sync default address → locationStore when user logs in and has no location set
  useEffect(() => {
    if (!isAuthenticated || city) return
    const defaultAddr = addresses?.find((a) => a.isDefault) ?? addresses?.[0]
    if (defaultAddr) {
      setLocation({
        city: defaultAddr.city,
        province: defaultAddr.province,
        street: defaultAddr.street,
        postalCode: defaultAddr.postalCode,
      })
    }
  }, [addresses, isAuthenticated, city, setLocation])

  // Initialise pending values when dropdown opens
  useEffect(() => {
    if (locationOpen) {
      setPendingProvince(province)
      setPendingCity(city)
      setPendingStreet(street)
      setPendingPostalCode(postalCode)
      setGeoError(null)
    }
  }, [locationOpen, province, city, street, postalCode])

  // Close dropdown on outside click
  useEffect(() => {
    if (!locationOpen) return
    const handler = (e: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setLocationOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [locationOpen])

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
    clearLocation()
    navigate('/')
    close()
  }

  const handleSaveLocation = () => {
    if (!pendingProvince) return
    setLocation({ province: pendingProvince, city: pendingCity, street: pendingStreet, postalCode: pendingPostalCode })
    setLocationOpen(false)
  }

  const handleGeolocate = async () => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.')
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      )
      const { latitude, longitude } = position.coords
      const result = await reverseGeocode(latitude, longitude)
      setPendingProvince(result.province)
      setPendingCity(result.city)
      if (result.street) setPendingStreet(result.street)
      if (result.postalCode) setPendingPostalCode(result.postalCode)
      if (result.provinceWarning) {
        setGeoError('Provincia no reconocida. Seleccionála manualmente.')
      }
    } catch (err) {
      const isGeoErr = err && typeof err === 'object' && 'code' in err
      if (isGeoErr && (err as GeolocationPositionError).code === 1) {
        setGeoError('Permiso denegado. Habilitá la ubicación en tu navegador.')
      } else {
        setGeoError('No se pudo obtener la ubicación.')
      }
    } finally {
      setGeoLoading(false)
    }
  }

  const locationLabel = city && province
    ? `${city}, ${province}`
    : province || null

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

      {/* ── Location bar ── */}
      <div className="border-t border-white/5">
        <div className="relative max-w-container-max mx-auto px-4 md:px-margin-desktop py-1.5">
          {/* Trigger */}
          <button
            onClick={() => setLocationOpen((v) => !v)}
            className="flex items-center gap-1 text-xs text-tertiary-fixed/70 hover:text-tertiary-fixed transition-colors max-w-full"
          >
            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '14px' }}>location_on</span>
            <span className="truncate">
              Enviar a:{' '}
              <strong className="text-tertiary-fixed">
                {locationLabel ?? 'Configurar ubicación'}
              </strong>
            </span>
            <span
              className={`material-symbols-outlined flex-shrink-0 transition-transform duration-200 ${locationOpen ? 'rotate-180' : ''}`}
              style={{ fontSize: '14px' }}
            >
              expand_more
            </span>
          </button>

          {/* Dropdown panel — full width on mobile, fixed 300px on md+ */}
          {locationOpen && (
            <div
              ref={locationDropdownRef}
              className="absolute left-0 right-0 md:right-auto md:w-[300px] top-full mt-1 z-50 bg-surface-container-high rounded-xl shadow-2xl border border-outline-variant p-4 mx-0"
            >
              <p className="font-bold text-sm text-on-surface mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>local_shipping</span>
                ¿A dónde enviamos?
              </p>

              <div className="space-y-3">
                {/* Geolocation button */}
                <button
                  type="button"
                  onClick={handleGeolocate}
                  disabled={geoLoading}
                  className="flex items-center justify-center gap-2 w-full text-sm font-bold text-primary border border-primary/40 rounded-lg px-4 py-2.5 hover:bg-primary/5 active:bg-primary/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span
                    className={`material-symbols-outlined ${geoLoading ? 'animate-spin' : ''}`}
                    style={{ fontSize: '18px' }}
                  >
                    {geoLoading ? 'progress_activity' : 'my_location'}
                  </span>
                  {geoLoading ? 'Detectando...' : 'Usar mi ubicación actual'}
                </button>

                {geoError && (
                  <p className="text-xs text-error flex items-start gap-1">
                    <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '14px' }}>error</span>
                    {geoError}
                  </p>
                )}

                {/* Divider */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-outline-variant" />
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">o ingresá manualmente</span>
                  <div className="flex-1 h-px bg-outline-variant" />
                </div>

                {/* Province */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface">Provincia *</label>
                  <select
                    value={pendingProvince}
                    onChange={(e) => setPendingProvince(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  >
                    <option value="">Seleccioná una provincia</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* City */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface">Ciudad</label>
                  <input
                    value={pendingCity}
                    onChange={(e) => setPendingCity(e.target.value)}
                    placeholder="Ej: Corrientes"
                    className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm bg-surface text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>

                {/* Street */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface">Calle y número</label>
                  <input
                    value={pendingStreet}
                    onChange={(e) => setPendingStreet(e.target.value)}
                    placeholder="Ej: Av. San Martín 1234"
                    className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm bg-surface text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>

                {/* Postal Code */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface">Código postal</label>
                  <input
                    value={pendingPostalCode}
                    onChange={(e) => setPendingPostalCode(e.target.value)}
                    placeholder="Ej: 3400"
                    inputMode="numeric"
                    className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm bg-surface text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>

                {/* Save */}
                <button
                  onClick={handleSaveLocation}
                  disabled={!pendingProvince}
                  className="w-full bg-primary text-on-primary rounded-lg py-2.5 text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar ubicación
                </button>

                {isAuthenticated && (
                  <Link
                    to="/direcciones"
                    onClick={() => setLocationOpen(false)}
                    className="block text-center text-xs text-primary hover:underline py-0.5"
                  >
                    Administrar mis direcciones
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10">
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
