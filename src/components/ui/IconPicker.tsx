import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

// Curated Material Symbols for a board-game / e-commerce store
const ICONS: { name: string; label: string }[] = [
  // Juegos y entretenimiento
  { name: 'casino', label: 'Dado' },
  { name: 'extension', label: 'Pieza puzzle' },
  { name: 'sports_esports', label: 'Joystick' },
  { name: 'emoji_events', label: 'Trofeo' },
  { name: 'psychology', label: 'Mente' },
  { name: 'military_tech', label: 'Medalla' },
  { name: 'star', label: 'Estrella' },
  { name: 'grade', label: 'Estrella rellena' },
  { name: 'local_activity', label: 'Actividad' },
  { name: 'celebration', label: 'Celebración' },
  { name: 'toys', label: 'Juguetes' },
  { name: 'interests', label: 'Intereses' },
  { name: 'family_restroom', label: 'Familia' },
  { name: 'groups', label: 'Grupo' },
  { name: 'groups_2', label: 'Grupo 2' },
  { name: 'person', label: 'Persona' },
  { name: 'people', label: 'Gente' },
  { name: 'map', label: 'Mapa' },
  { name: 'explore', label: 'Brújula' },
  { name: 'terrain', label: 'Terreno' },
  { name: 'landscape', label: 'Paisaje' },
  { name: 'sailing', label: 'Velero' },
  { name: 'anchor', label: 'Ancla' },
  { name: 'forest', label: 'Bosque' },
  { name: 'park', label: 'Árbol' },
  { name: 'grain', label: 'Grano' },
  { name: 'spa', label: 'Hoja' },
  { name: 'water', label: 'Agua' },
  { name: 'waves', label: 'Olas' },
  { name: 'castle', label: 'Castillo' },
  { name: 'fort', label: 'Fortaleza' },
  { name: 'church', label: 'Edificio' },
  { name: 'home', label: 'Casa' },
  { name: 'villa', label: 'Villa' },
  { name: 'cottage', label: 'Cabaña' },
  // Comercio
  { name: 'local_offer', label: 'Oferta' },
  { name: 'sell', label: 'Venta' },
  { name: 'loyalty', label: 'Lealtad' },
  { name: 'redeem', label: 'Canjear' },
  { name: 'storefront', label: 'Tienda' },
  { name: 'shopping_cart', label: 'Carrito' },
  { name: 'shopping_bag', label: 'Bolsa' },
  { name: 'inventory_2', label: 'Inventario' },
  { name: 'warehouse', label: 'Almacén' },
  { name: 'category', label: 'Categoría' },
  { name: 'style', label: 'Estilos' },
  { name: 'label', label: 'Etiqueta' },
  { name: 'tag', label: 'Tag' },
  { name: 'new_releases', label: 'Nuevo' },
  { name: 'workspace_premium', label: 'Premium' },
  { name: 'diamond', label: 'Diamante' },
  { name: 'verified', label: 'Verificado' },
  { name: 'verified_user', label: 'Seguro' },
  { name: 'stars', label: 'Estrellas' },
  { name: 'auto_awesome', label: 'Especial' },
  { name: 'bolt', label: 'Rayo' },
  { name: 'flare', label: 'Destello' },
  { name: 'whatshot', label: 'Caliente' },
  // Naturaleza y recursos
  { name: 'eco', label: 'Eco' },
  { name: 'energy_savings_leaf', label: 'Hoja eco' },
  { name: 'grass', label: 'Pasto' },
  { name: 'agriculture', label: 'Agricultura' },
  { name: 'yard', label: 'Jardín' },
  { name: 'hiking', label: 'Senderismo' },
  { name: 'camping', label: 'Camping' },
  { name: 'cabin', label: 'Cabaña bosque' },
  { name: 'beach_access', label: 'Playa' },
  { name: 'sunny', label: 'Sol' },
  { name: 'cloudy', label: 'Nube' },
  { name: 'thunderstorm', label: 'Tormenta' },
  { name: 'snowing', label: 'Nieve' },
  // Materiales / construcción
  { name: 'construction', label: 'Construcción' },
  { name: 'hardware', label: 'Herramientas' },
  { name: 'architecture', label: 'Arquitectura' },
  { name: 'foundation', label: 'Fundación' },
  { name: 'roofing', label: 'Techo' },
  { name: 'brick', label: 'Ladrillo' },
  { name: 'build', label: 'Construir' },
  { name: 'handyman', label: 'Manualidades' },
  { name: 'carpenter', label: 'Carpintero' },
  // Navegación / logística
  { name: 'local_shipping', label: 'Envío' },
  { name: 'directions_boat', label: 'Barco' },
  { name: 'flight', label: 'Avión' },
  { name: 'train', label: 'Tren' },
  { name: 'route', label: 'Ruta' },
  { name: 'navigation', label: 'Navegación' },
  { name: 'location_on', label: 'Ubicación' },
  { name: 'place', label: 'Lugar' },
  { name: 'flag', label: 'Bandera' },
  { name: 'public', label: 'Mundo' },
  { name: 'language', label: 'Idioma' },
  // Acciones / UI
  { name: 'add_circle', label: 'Agregar' },
  { name: 'bookmark', label: 'Marcador' },
  { name: 'bookmarks', label: 'Marcadores' },
  { name: 'favorite', label: 'Favorito' },
  { name: 'thumb_up', label: 'Me gusta' },
  { name: 'share', label: 'Compartir' },
  { name: 'notifications', label: 'Notificaciones' },
  { name: 'info', label: 'Info' },
  { name: 'help', label: 'Ayuda' },
  { name: 'settings', label: 'Ajustes' },
  { name: 'tune', label: 'Tunear' },
  { name: 'filter_list', label: 'Filtros' },
  { name: 'sort', label: 'Ordenar' },
  { name: 'search', label: 'Buscar' },
  // Finanzas
  { name: 'payments', label: 'Pagos' },
  { name: 'account_balance', label: 'Banco' },
  { name: 'credit_card', label: 'Tarjeta' },
  { name: 'attach_money', label: 'Dinero' },
  { name: 'savings', label: 'Ahorros' },
  { name: 'currency_exchange', label: 'Cambio' },
  { name: 'price_check', label: 'Precio' },
  { name: 'receipt_long', label: 'Recibo' },
  // Medios / arte
  { name: 'palette', label: 'Paleta' },
  { name: 'brush', label: 'Pincel' },
  { name: 'draw', label: 'Dibujar' },
  { name: 'image', label: 'Imagen' },
  { name: 'photo_camera', label: 'Cámara' },
  { name: 'art_track', label: 'Arte' },
  { name: 'museum', label: 'Museo' },
  { name: 'theater_comedy', label: 'Teatro' },
  { name: 'movie', label: 'Película' },
  { name: 'music_note', label: 'Música' },
]

const PAGE_SIZE = 40   // 8 cols × 5 rows — sin scroll interno

interface Props {
  value: string
  onChange: (icon: string) => void
}

export default function IconPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)

  // Recalculate position when opening
  function openPicker() {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setDropPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    setOpen(true)
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      // Check if click is inside the portal dropdown
      const dropdown = document.getElementById('icon-picker-dropdown')
      if (dropdown?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return ICONS
    return ICONS.filter(i => i.name.includes(q) || i.label.toLowerCase().includes(q))
  }, [search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleSearch(val: string) {
    setSearch(val)
    setPage(0)
  }

  function select(name: string) {
    onChange(name)
    setOpen(false)
    setSearch('')
    setPage(0)
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div ref={triggerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => open ? setOpen(false) : openPicker()}
        className={`w-full flex items-center gap-2 border rounded-lg px-3 py-2 text-sm bg-surface transition-colors text-left
          ${open ? 'border-primary' : 'border-outline-variant hover:border-primary/60'}`}
      >
        {value ? (
          <>
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>{value}</span>
            <span className="flex-1 text-on-surface">{value}</span>
            <button type="button" onClick={clear} className="text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
            </button>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '22px' }}>add_photo_alternate</span>
            <span className="flex-1 text-on-surface-variant">Elegir ícono...</span>
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>arrow_drop_down</span>
          </>
        )}
      </button>

      {/* Dropdown — portal para evitar conflicto con scroll del modal */}
      {open && createPortal(
        <div
          id="icon-picker-dropdown"
          style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: Math.max(dropPos.width, 320), zIndex: 9999 }}
          className="bg-surface border border-outline-variant rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Search */}
          <div className="p-2 border-b border-outline-variant/30">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '16px' }}>search</span>
              <input
                autoFocus
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Buscar ícono..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-outline-variant rounded-lg bg-surface-container focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Grid — sin scroll, usa paginación */}
          <div className="p-2">
            {pageItems.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-6">Sin resultados para "{search}"</p>
            ) : (
              <div className="grid grid-cols-8 gap-1">
                {pageItems.map(icon => (
                  <button
                    key={icon.name}
                    type="button"
                    title={icon.label}
                    onClick={() => select(icon.name)}
                    className={`flex items-center justify-center p-2 rounded-lg transition-colors
                      ${value === icon.name
                        ? 'bg-primary text-on-primary'
                        : 'hover:bg-surface-container text-on-surface-variant hover:text-primary'
                      }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{icon.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-outline-variant/30 bg-surface-container/50">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1 rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-30 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
              </button>
              <span className="text-xs text-on-surface-variant">
                {page + 1} / {totalPages}
                <span className="ml-1 text-on-surface-variant/60">({filtered.length} íconos)</span>
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-1 rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-30 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
