import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../../components/ui/ProductCard'
import SEO from '../../components/ui/SEO'
import { useProducts } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'

const PAGE_SIZE = 12

const SORTS = [
  { value: 'default', label: 'Relevancia' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'name', label: 'A → Z' },
]

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors duration-200 ${active ? 'bg-secondary' : 'bg-outline-variant'}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${active ? 'left-5' : 'left-1'}`} />
    </button>
  )
}

export default function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('categoria') ?? 'all')
  const [sort, setSort] = useState('default')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [groupByCategory, setGroupByCategory] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data: allProducts = [], isLoading } = useProducts()
  const { data: categories = [] } = useCategories()

  const handleCategory = (cat: string) => {
    setActiveCategory(cat)
    const next = new URLSearchParams(searchParams)
    if (cat === 'all') next.delete('categoria')
    else next.set('categoria', cat)
    setSearchParams(next)
  }

  const clearFilters = () => {
    setSearch('')
    setActiveCategory('all')
    setSort('default')
    setPriceMin('')
    setPriceMax('')
    setInStockOnly(false)
    setGroupByCategory(false)
    setSearchParams(new URLSearchParams())
  }

  const filtered = useMemo(() => {
    let list = allProducts
    if (activeCategory !== 'all') list = list.filter(p => p.category === activeCategory)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }
    if (priceMin !== '') list = list.filter(p => p.price >= Number(priceMin))
    if (priceMax !== '') list = list.filter(p => p.price <= Number(priceMax))
    if (inStockOnly) list = list.filter(p => p.stock > 0)

    if (sort === 'price-asc') return [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') return [...list].sort((a, b) => b.price - a.price)
    if (sort === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [allProducts, activeCategory, search, priceMin, priceMax, inStockOnly, sort])

  const grouped = useMemo(() => {
    if (!groupByCategory || activeCategory !== 'all') return null
    return categories
      .map(c => ({ cat: c, products: filtered.filter(p => p.category === c.slug) }))
      .filter(g => g.products.length > 0)
  }, [filtered, groupByCategory, categories, activeCategory])

  // Reset visible count whenever filters/sort produce a new list
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filtered])

  // Load more when sentinel enters viewport
  const loadMore = useCallback(() => {
    setVisibleCount((n) => Math.min(n + PAGE_SIZE, filtered.length))
  }, [filtered.length])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  const activeFiltersCount = [
    activeCategory !== 'all',
    priceMin !== '',
    priceMax !== '',
    inStockOnly,
  ].filter(Boolean).length

  /* ── Filter panel (used in sidebar + drawer) ─────────────────────── */
  const filterPanel = (
    <div className="space-y-7">
      {/* Categories */}
      <div>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Categoría</p>
        <div className="space-y-0.5">
          <button
            onClick={() => handleCategory('all')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
              activeCategory === 'all'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>apps</span>
            Todas
          </button>
          {categories.map(c => (
            <button
              key={c.slug}
              onClick={() => handleCategory(c.slug)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                activeCategory === c.slug
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {c.icon && (
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{c.icon}</span>
              )}
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Precio (ARS)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface bg-surface focus:outline-none focus:border-primary"
          />
          <span className="text-on-surface-variant text-sm flex-shrink-0">—</span>
          <input
            type="number"
            placeholder="Máx"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface bg-surface focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Stock toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <Toggle active={inStockOnly} onToggle={() => setInStockOnly(v => !v)} />
        <span className="text-sm text-on-surface font-medium">Solo con stock</span>
      </label>

      {/* Group by category toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <Toggle active={groupByCategory} onToggle={() => setGroupByCategory(v => !v)} />
        <span className="text-sm text-on-surface font-medium">Agrupar por categoría</span>
      </label>

      {/* Clear */}
      {(activeFiltersCount > 0 || search) && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-error hover:bg-error/5 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>filter_alt_off</span>
          Limpiar filtros
        </button>
      )}
    </div>
  )

  /* ── Product grid / grouped view ─────────────────────────────────── */
  const productGrid = (products: typeof filtered, withSentinel = false) => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-gutter">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      {withSentinel && <div ref={sentinelRef} />}
    </>
  )

  return (
    <>
    <SEO
      title="Tienda de Catan Argentina — Juego Base, Expansiones y Accesorios"
      description="Comprá juegos de Catan en Argentina. Juego base, expansión Ciudades y Caballeros, Navegantes, Piratas y Exploradores, ampliaciones 5-6 jugadores. Envíos con Andreani. Pagá con Mercado Pago."
      url="/tienda"
      structuredData={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Tienda de Catan — El Mercader Argentina',
        description: 'Catálogo completo de juegos de mesa Catan en Argentina. Juego base, expansiones y accesorios.',
        url: 'https://elmercader.com.ar/tienda',
        isPartOf: { '@type': 'WebSite', url: 'https://elmercader.com.ar' },
      }}
    />
    <div className="min-h-screen bg-background">

      {/* ── Page header + search ── */}
      <div className="bg-surface-container-low border-b border-outline-variant/30">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-7 md:py-10">
          <h1 className="font-headline text-2xl md:text-headline-lg text-primary mb-1">
            La Tienda del Gremio
          </h1>
          <p className="text-sm md:text-body-md text-on-surface-variant mb-5 max-w-2xl">
            Juego base de Catan, expansiones (Ciudades y Caballeros, Navegantes, Piratas y Exploradores, Mercaderes y Bárbaros), ampliaciones para 5-6 jugadores y accesorios. Todo con envío a toda Argentina.
          </p>

          <div className="relative max-w-2xl">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary text-sm md:text-base shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-6 md:py-8">
        <div className="flex gap-7">

          {/* ── Sidebar — desktop only ── */}
          <aside className="hidden lg:block w-56 xl:w-60 flex-shrink-0">
            <div className="sticky top-24 bg-surface rounded-xl border border-outline-variant/40 p-5 shadow-sm">
              {filterPanel}
            </div>
          </aside>

          {/* ── Products area ── */}
          <div className="flex-1 min-w-0">

            {/* Mobile / tablet toolbar */}
            <div className="lg:hidden space-y-3 mb-5">
              {/* Category chips — horizontal scroll */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[{ slug: 'all', name: 'Todo' }, ...categories].map(c => (
                  <button
                    key={c.slug}
                    onClick={() => handleCategory(c.slug)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      activeCategory === c.slug
                        ? 'bg-primary text-on-primary border-primary'
                        : 'border-outline-variant text-on-surface-variant bg-surface hover:border-primary hover:text-primary'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Filter button + sort + count */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm font-medium text-on-surface hover:border-primary hover:text-primary transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>tune</span>
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-on-primary text-xs rounded-full flex items-center justify-center font-bold leading-none">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="flex-1 border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface bg-surface focus:outline-none focus:border-primary"
                >
                  {SORTS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Result count — mobile */}
              {!isLoading && (
                <p className="text-xs text-on-surface-variant">
                  <span className="font-bold text-on-surface">{filtered.length}</span>{' '}
                  producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Desktop toolbar: count + group toggle + sort */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              {isLoading ? (
                <div className="h-4 w-28 bg-surface-container rounded animate-pulse" />
              ) : (
                <p className="text-sm text-on-surface-variant">
                  <span className="font-bold text-on-surface">{filtered.length}</span>{' '}
                  producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                </p>
              )}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Toggle active={groupByCategory} onToggle={() => setGroupByCategory(v => !v)} />
                  <span className="text-sm text-on-surface-variant font-medium">Agrupar</span>
                </label>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface bg-surface focus:outline-none focus:border-primary"
                >
                  {SORTS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {(activeFiltersCount > 0 || search) && !isLoading && (
              <div className="flex flex-wrap gap-2 mb-5">
                {search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    "{search}"
                    <button onClick={() => setSearch('')} className="ml-0.5 hover:text-primary/70">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                    </button>
                  </span>
                )}
                {activeCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {categories.find(c => c.slug === activeCategory)?.name ?? activeCategory}
                    <button onClick={() => handleCategory('all')} className="ml-0.5 hover:text-primary/70">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                    </button>
                  </span>
                )}
                {(priceMin !== '' || priceMax !== '') && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {priceMin !== '' && priceMax !== '' ? `$${priceMin} – $${priceMax}`
                      : priceMin !== '' ? `Desde $${priceMin}`
                      : `Hasta $${priceMax}`}
                    <button onClick={() => { setPriceMin(''); setPriceMax('') }} className="ml-0.5 hover:text-primary/70">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    Con stock
                    <button onClick={() => setInStockOnly(false)} className="ml-0.5 hover:text-primary/70">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products output */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-gutter">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="bg-surface-container rounded-lg border border-outline-variant/30 h-52 md:h-72 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-4 block">search_off</span>
                <p className="font-medium text-base mb-1 text-on-surface">Sin resultados</p>
                <p className="text-sm">Probá con otros términos o limpiá los filtros.</p>
                <button onClick={clearFilters} className="mt-4 text-primary font-bold text-sm hover:underline">
                  Limpiar filtros
                </button>
              </div>
            ) : grouped ? (
              <div className="space-y-10">
                {grouped.map(({ cat, products }) => (
                  <section key={cat.slug}>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/50">
                      {cat.icon && (
                        <span className="material-symbols-outlined text-primary">{cat.icon}</span>
                      )}
                      <h2 className="font-headline text-headline-md text-primary">{cat.name}</h2>
                      <span className="text-xs text-on-surface-variant font-medium ml-1">
                        ({products.length})
                      </span>
                    </div>
                    {productGrid(products)}
                  </section>
                ))}
                <div ref={sentinelRef} />
              </div>
            ) : (
              <>
                {productGrid(filtered.slice(0, visibleCount), true)}
                {/* Infinite scroll status */}
                <div className="mt-8 flex justify-center">
                  {visibleCount < filtered.length ? (
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '18px' }}>progress_activity</span>
                      Cargando más productos...
                    </div>
                  ) : filtered.length > PAGE_SIZE ? (
                    <p className="text-xs text-on-surface-variant/60">
                      — {filtered.length} productos en total —
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-inverse-surface/50 z-40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl shadow-2xl lg:hidden max-h-[88vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/30 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">tune</span>
                <h3 className="font-headline text-lg text-on-surface">Filtros</h3>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-on-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto p-5 flex-1">
              {filterPanel}
            </div>

            {/* Apply button */}
            <div className="p-4 border-t border-outline-variant/30 flex-shrink-0">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:bg-primary-container transition-colors"
              >
                Ver {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
    </>
  )
}
