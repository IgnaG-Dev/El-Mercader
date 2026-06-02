import { useParams, Link, useNavigate } from 'react-router-dom'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useProductBySlug, useProducts } from '../../hooks/useProducts'
import { useCartStore } from '../../store/cartStore'
import { useFinanceStore } from '../../store/financeStore'
import { useLocationStore } from '../../store/locationStore'
import { useUIStore } from '../../store/uiStore'
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed'
import { SHIPPING_ZONES } from '../../constants/shippingZones'
import { PROVINCES } from '../../constants/provinces'
import { getEffectivePrice } from '../../lib/pricing'
import { reverseGeocode } from '../../lib/geo'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import SEO from '../../components/ui/SEO'
import ProductCard from '../../components/ui/ProductCard'

function pad(n: number) { return String(n).padStart(2, '0') }

export default function ProductDetailPage() {
  const { slug } = useParams()

  // ── state ──────────────────────────────────────────────────────────
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { stickyBuyBar: stickyVisible, setStickyBuyBar: setStickyVisible } = useUIStore()
  const [linkCopied, setLinkCopied] = useState(false)
  const [soldCount, setSoldCount] = useState(0)
  const [countdown, setCountdown] = useState<{ h: number; m: number; s: number } | null>(null)
  const [visibleRelated, setVisibleRelated] = useState(8)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [pickerProvince, setPickerProvince] = useState('')
  const [pickerCity, setPickerCity] = useState('')
  const [pickerStreet, setPickerStreet] = useState('')
  const [pickerPostalCode, setPickerPostalCode] = useState('')
  const [pickerGeoLoading, setPickerGeoLoading] = useState(false)
  const [pickerGeoError, setPickerGeoError] = useState<string | null>(null)

  // ── refs ────────────────────────────────────────────────────────────
  const addTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const buyBtnsRef = useRef<HTMLDivElement>(null)
  const sentinelRelated = useRef<HTMLDivElement>(null)

  // ── store / query hooks ─────────────────────────────────────────────
  const addItem = useCartStore((s) => s.addItem)
  const navigate = useNavigate()
  const { paymentMethods, shippingCost, shippingDays, serviceFee } = useFinanceStore()
  const { city, province, street, postalCode, setLocation } = useLocationStore()
  const { data: product, isLoading } = useProductBySlug(slug)
  const { data: allProducts = [] } = useProducts()
  const { ids: recentIds, addId: addRecentlyViewed } = useRecentlyViewed()

  // ── derived (null-safe) ─────────────────────────────────────────────
  const shippingZone = province
    ? (SHIPPING_ZONES[province] ?? { cost: shippingCost, days: shippingDays })
    : null

  const allRecommended = product
    ? [
        ...allProducts.filter((p) => p.id !== product.id && p.category === product.category),
        ...allProducts.filter((p) => p.id !== product.id && p.category !== product.category),
      ]
    : []

  const recentlyViewedProducts = allProducts
    .filter((p) => recentIds.includes(p.id) && p.id !== product?.id)
    .sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id))
    .slice(0, 8)

  // ── callbacks ───────────────────────────────────────────────────────
  const loadMoreRelated = useCallback(() => {
    setVisibleRelated((n) => Math.min(n + 8, allRecommended.length))
  }, [allRecommended.length])

  // ── effects ─────────────────────────────────────────────────────────
  // Reset qty/img/visible when navigating to a different product
  useEffect(() => {
    setQty(1)
    setActiveImg(0)
    setVisibleRelated(8)
    setSoldCount(0)
  }, [slug])

  // Save to recently viewed
  useEffect(() => {
    if (product?.id) addRecentlyViewed(product.id)
  }, [product?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll on related products
  useEffect(() => {
    const el = sentinelRelated.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMoreRelated() },
      { rootMargin: '300px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMoreRelated])

  // Sticky buy bar visibility — also clears on unmount so WAButton returns to normal
  useEffect(() => {
    const el = buyBtnsRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => setStickyVisible(!e.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px' },
    )
    obs.observe(el)
    return () => { obs.disconnect(); setStickyVisible(false) }
  }, [product, setStickyVisible])

  // Social proof — orders in last 7 days for this product
  useEffect(() => {
    if (!product?.id) return
    let cancelled = false
    ;(async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data: orders } = await supabase
        .from('orders').select('id').neq('status', 'cancelled').gte('created_at', since)
      const ids = orders?.map((o: { id: string }) => o.id) ?? []
      if (!ids.length || cancelled) return
      const { count } = await supabase
        .from('order_items').select('*', { count: 'exact', head: true })
        .eq('product_id', product.id).in('order_id', ids)
      if (!cancelled) setSoldCount(count ?? 0)
    })()
    return () => { cancelled = true }
  }, [product?.id])

  // Flash sale countdown
  useEffect(() => {
    const endsAt = product?.saleEndsAt
    if (!endsAt) { setCountdown(null); return }
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now()
      if (diff <= 0) { setCountdown(null); return }
      setCountdown({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [product?.saleEndsAt])

  // ── early returns (after ALL hooks) ────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-6 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          <div className="bg-surface-container rounded-xl aspect-square animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-surface-container rounded animate-pulse w-3/4" />
            <div className="h-6 bg-surface-container rounded animate-pulse w-1/4" />
            <div className="h-24 bg-surface-container rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <>
        <SEO title="Producto no encontrado" noindex />
        <div className="max-w-container-max mx-auto px-4 py-24 text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">search_off</span>
          <h2 className="font-headline text-headline-md text-on-surface mb-4">Producto no encontrado</h2>
          <Link to="/tienda" className="text-secondary hover:underline">Volver a la tienda</Link>
        </div>
      </>
    )
  }

  // ── post-product computed values ────────────────────────────────────
  const mpFee = paymentMethods.mercadopago.fee
  const totalDiscount = mpFee + serviceFee
  const hasDiscount = totalDiscount > 0 && paymentMethods.transfer.enabled
  const inflatedPrice = hasDiscount ? Math.round(product.price * (1 + totalDiscount / 100)) : product.price

  const SITE_URL = 'https://elmercader.com.ar'
  const productUrl = `${SITE_URL}/producto/${product.slug}`
  const seoDescription = product.description
    ? product.description.slice(0, 155) + (product.description.length > 155 ? '…' : '')
    : `Comprá ${product.name} en El Mercader. Envíos a todo Argentina. Pago con Mercado Pago o transferencia.`

  // ── handlers ────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    addItem(product, qty)
    setJustAdded(true)
    if (addTimerRef.current) clearTimeout(addTimerRef.current)
    addTimerRef.current = setTimeout(() => setJustAdded(false), 2200)
  }
  const handleBuyNow = () => { addItem(product, qty); navigate('/finalizar-compra') }
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setZoomPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }
  const openLocationPicker = () => {
    setPickerProvince(province); setPickerCity(city)
    setPickerStreet(street); setPickerPostalCode(postalCode)
    setPickerGeoError(null); setShowLocationPicker(true)
  }
  const handleApplyProvince = () => {
    if (!pickerProvince) return
    setLocation({ province: pickerProvince, city: pickerCity, street: pickerStreet, postalCode: pickerPostalCode })
    setShowLocationPicker(false)
  }
  const handlePickerGeolocate = async () => {
    if (!navigator.geolocation) { setPickerGeoError('Tu navegador no soporta geolocalización.'); return }
    setPickerGeoLoading(true); setPickerGeoError(null)
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 }))
      const r = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
      setPickerProvince(r.province); setPickerCity(r.city)
      if (r.street) setPickerStreet(r.street)
      if (r.postalCode) setPickerPostalCode(r.postalCode)
      if (r.provinceWarning) setPickerGeoError('Provincia no reconocida. Seleccionála manualmente.')
    } catch (err) {
      const isGeo = err && typeof err === 'object' && 'code' in err
      setPickerGeoError(isGeo && (err as GeolocationPositionError).code === 1
        ? 'Permiso denegado. Habilitá la ubicación en tu navegador.'
        : 'No se pudo obtener la ubicación.')
    } finally { setPickerGeoLoading(false) }
  }
  const shareWA = () => window.open(
    `https://wa.me/?text=${encodeURIComponent(`¡Mirá este producto! ${product.name} — ${productUrl}`)}`
  )
  const copyLink = async () => {
    await navigator.clipboard.writeText(productUrl)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  // ── render ──────────────────────────────────────────────────────────
  return (
    <>
      <SEO
        title={product.name}
        description={seoDescription}
        image={product.image || undefined}
        url={`/producto/${product.slug}`}
        type="product"
        price={product.price}
        structuredData={[
          {
            '@context': 'https://schema.org', '@type': 'Product',
            name: product.name,
            image: product.images?.length ? product.images : [product.image],
            description: product.description ?? seoDescription,
            brand: { '@type': 'Brand', name: 'Catan' },
            offers: {
              '@type': 'Offer',
              price: product.price.toFixed(2), priceCurrency: 'ARS',
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              url: productUrl, seller: { '@type': 'Organization', name: 'El Mercader' },
            },
            ...(product.rating && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating.toFixed(1), reviewCount: product.reviews ?? 0,
              },
            }),
          },
          {
            '@context': 'https://schema.org', '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${SITE_URL}/tienda` },
              { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
            ],
          },
        ]}
      />

      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-6 md:py-12">

        {/* Breadcrumb */}
        <nav aria-label="Ruta de navegación" className="flex items-center gap-1 text-label-sm text-on-surface-variant mb-6 md:mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
          <Link to="/" className="hover:text-primary transition-colors shrink-0">Inicio</Link>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <Link to="/tienda" className="hover:text-primary transition-colors shrink-0">Tienda</Link>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span className="text-on-surface truncate">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">

          {/* Image gallery */}
          <div className="flex flex-col gap-3 md:sticky md:top-20 md:self-start">
            <div
              className="bg-surface-container-highest rounded-xl overflow-hidden aspect-square cursor-zoom-in select-none"
              onMouseEnter={() => setZoom(true)} onMouseLeave={() => setZoom(false)}
              onMouseMove={handleMouseMove} onClick={() => setLightboxOpen(true)}
            >
              <img
                src={product.images?.[activeImg] ?? product.image} alt={product.name}
                className="w-full h-full object-cover pointer-events-none"
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: zoom ? 'scale(2.5)' : 'scale(1)',
                  transition: zoom ? 'transform 0.08s ease-out' : 'transform 0.25s ease-out',
                }}
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((url, idx) => (
                  <button key={idx} onClick={() => setActiveImg(idx)}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                      activeImg === idx ? 'border-primary' : 'border-outline-variant/30 hover:border-primary/50'
                    }`}
                  >
                    <img src={url} alt={`${product.name} imagen ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">

            {/* Badge + social proof row */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {product.badge && <Badge variant="tertiary">{product.badge}</Badge>}
              {soldCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/30">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '14px' }}>local_fire_department</span>
                  <strong className="text-on-surface">{soldCount}</strong> {soldCount === 1 ? 'persona lo compró' : 'personas lo compraron'} esta semana
                </span>
              )}
            </div>

            <h1 className="font-headline text-2xl md:text-headline-lg text-on-surface mb-3">{product.name}</h1>

            {/* Flash sale countdown */}
            {countdown && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/20 mb-4">
                <span className="material-symbols-outlined text-primary animate-pulse" style={{ fontSize: '16px' }}>timer</span>
                <span className="text-xs font-bold text-primary">¡Oferta termina en:</span>
                <div className="flex items-center gap-0.5 font-mono font-bold text-primary ml-auto">
                  {countdown.h > 0 && (
                    <><span className="bg-primary text-on-primary px-1.5 py-0.5 rounded text-xs">{pad(countdown.h)}</span><span className="text-primary text-xs">:</span></>
                  )}
                  <span className="bg-primary text-on-primary px-1.5 py-0.5 rounded text-xs">{pad(countdown.m)}</span>
                  <span className="text-primary text-xs">:</span>
                  <span className="bg-primary text-on-primary px-1.5 py-0.5 rounded text-xs">{pad(countdown.s)}</span>
                </div>
              </div>
            )}

            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-tertiary-container">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="material-symbols-outlined"
                      style={{ fontSize: '18px', fontVariationSettings: `'FILL' ${s <= Math.round(product.rating!) ? 1 : 0}` }}
                    >star</span>
                  ))}
                </div>
                <span className="text-label-sm text-on-surface-variant">({product.reviews} reseñas)</span>
              </div>
            )}

            {/* Price block */}
            <div className="mb-5">
              {(() => {
                const effectiveUnit = getEffectivePrice(product, qty)
                const activeTier = product.volumeTiers?.find(t => t.price === effectiveUnit && effectiveUnit !== product.price)
                const effectiveInflated = hasDiscount ? Math.round(effectiveUnit * (1 + totalDiscount / 100)) : effectiveUnit
                const effectiveSavings = effectiveInflated - effectiveUnit
                return (
                  <>
                    {hasDiscount && (
                      <p className="text-sm line-through text-on-surface-variant/60 mb-0.5">
                        ${effectiveInflated.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-2xl md:text-headline-md font-bold text-secondary">
                        ${effectiveUnit.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        <span className="text-sm font-normal text-on-surface-variant ml-1">c/u</span>
                      </p>
                      {activeTier && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full border border-tertiary/20">
                          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>sell</span>
                          Precio x{activeTier.qty}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-secondary bg-secondary/10 px-2.5 py-1 rounded-full mt-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>local_offer</span>
                        Ahorrás ${effectiveSavings.toLocaleString('es-AR')} pagando con transferencia
                      </span>
                    )}
                  </>
                )
              })()}

              {/* Volume tier chips */}
              {product.volumeTiers && product.volumeTiers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {[...product.volumeTiers].sort((a, b) => a.qty - b.qty).map((tier) => {
                    const isActive = qty >= tier.qty && getEffectivePrice(product, qty) === tier.price
                    const pctOff = Math.round((1 - tier.price / product.price) * 100)
                    return (
                      <button key={tier.qty} onClick={() => setQty(tier.qty)}
                        className={`flex flex-col items-center px-3 py-2 rounded-xl border-2 transition-all text-left ${
                          isActive ? 'border-tertiary bg-tertiary/10 shadow-sm' : 'border-outline-variant bg-surface hover:border-tertiary/50'
                        }`}
                      >
                        <span className="text-xs font-bold text-on-surface">x{tier.qty} unidades</span>
                        <span className={`text-sm font-bold ${isActive ? 'text-tertiary' : 'text-secondary'}`}>
                          ${tier.price.toLocaleString('es-AR')} c/u
                        </span>
                        {pctOff > 0 && <span className="text-xs text-tertiary font-bold">-{pctOff}%</span>}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Auto bundle hint — when no volume tiers */}
              {!product.volumeTiers?.length && product.stock >= 2 && (
                <div className="mt-3 p-3 bg-surface-container rounded-xl border border-outline-variant/40">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>shopping_bag</span>
                    ¿Comprás más de uno?
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {[2, 3].filter((n) => n <= product.stock).map((n) => (
                      <button key={n} onClick={() => setQty(n)}
                        className={`flex-1 flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${
                          qty === n ? 'border-primary bg-primary/10 shadow-sm' : 'border-outline-variant bg-surface hover:border-primary/40'
                        }`}
                      >
                        <span className="text-xs text-on-surface-variant">x{n} unidades</span>
                        <span className="text-sm font-bold text-secondary">${(product.price * n).toLocaleString('es-AR')}</span>
                        <span className="text-xs text-on-surface-variant">total</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="text-body-md md:text-body-lg text-on-surface-variant mb-6 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${product.stock > 0 ? 'bg-secondary' : 'bg-error'}`} />
              <span className="text-label-sm text-on-surface-variant">
                {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Sin stock'}
              </span>
            </div>

            {/* Shipping estimate */}
            <div className="mb-5">
              {shippingZone ? (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary/5 rounded-lg border border-secondary/20">
                  <span className="material-symbols-outlined text-secondary flex-shrink-0" style={{ fontSize: '18px' }}>local_shipping</span>
                  <div className="flex-1 min-w-0 text-sm">
                    <span className="text-on-surface">Llega a <strong>{city || province}</strong>:{' '}
                      <strong className="text-secondary">${shippingZone.cost.toLocaleString('es-AR')}</strong>
                    </span>
                    <span className="text-on-surface-variant"> · {shippingZone.days}</span>
                  </div>
                  <button onClick={openLocationPicker} className="text-xs text-primary hover:underline flex-shrink-0">Cambiar</button>
                </div>
              ) : showLocationPicker ? (
                <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowLocationPicker(false)}
                      className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-outline-variant/20 transition-colors text-on-surface-variant">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                    </button>
                    <p className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>local_shipping</span>
                      ¿A dónde enviamos?
                    </p>
                  </div>
                  <button type="button" onClick={handlePickerGeolocate} disabled={pickerGeoLoading}
                    className="flex items-center justify-center gap-2 w-full text-sm font-bold text-primary border border-primary/40 rounded-lg px-4 py-2.5 hover:bg-primary/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    <span className={`material-symbols-outlined ${pickerGeoLoading ? 'animate-spin' : ''}`} style={{ fontSize: '18px' }}>
                      {pickerGeoLoading ? 'progress_activity' : 'my_location'}
                    </span>
                    {pickerGeoLoading ? 'Detectando...' : 'Usar mi ubicación actual'}
                  </button>
                  {pickerGeoError && (
                    <p className="text-xs text-error flex items-start gap-1">
                      <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '14px' }}>error</span>
                      {pickerGeoError}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-outline-variant" />
                    <span className="text-xs text-on-surface-variant whitespace-nowrap">o ingresá manualmente</span>
                    <div className="flex-1 h-px bg-outline-variant" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface">Provincia *</label>
                    <select value={pickerProvince} onChange={(e) => setPickerProvince(e.target.value)}
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40">
                      <option value="">Seleccioná una provincia</option>
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-on-surface">Ciudad</label>
                      <input value={pickerCity} onChange={(e) => setPickerCity(e.target.value)} placeholder="Ej: Corrientes"
                        className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-on-surface">Código postal</label>
                      <input value={pickerPostalCode} onChange={(e) => setPickerPostalCode(e.target.value)} placeholder="3400" inputMode="numeric"
                        className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>
                  </div>
                  <button onClick={handleApplyProvince} disabled={!pickerProvince}
                    className="w-full bg-primary text-on-primary rounded-lg py-2.5 text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Ver costo
                  </button>
                </div>
              ) : (
                <button onClick={openLocationPicker} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '18px' }}>local_shipping</span>
                  Calculá el costo de envío a tu provincia
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                </button>
              )}
            </div>

            {/* Qty + Buttons */}
            <div className="flex flex-col gap-3 mb-4" ref={buyBtnsRef}>
              <div className="flex items-center border border-outline-variant rounded overflow-hidden self-start">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
                </button>
                <span className="px-4 py-2 text-body-md font-bold text-on-surface bg-surface min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                </button>
              </div>

              <div className="relative w-full">
                {justAdded && (
                  <div className="float-chip absolute left-1/2 bottom-full mb-2 pointer-events-none z-10">
                    <span className="bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg whitespace-nowrap">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>¡Añadido al carrito!
                    </span>
                  </div>
                )}
                <Button onClick={handleAddToCart} disabled={product.stock === 0} size="lg"
                  className={`w-full transition-all duration-300 ${justAdded ? '!bg-secondary scale-95' : ''}`}>
                  <span className="material-symbols-outlined transition-all duration-300"
                    style={{ fontSize: '20px', fontVariationSettings: justAdded ? "'FILL' 1" : "'FILL' 0" }}>
                    {justAdded ? 'check_circle' : 'add_shopping_cart'}
                  </span>
                  {justAdded ? '¡Añadido!' : 'Añadir al carrito'}
                </Button>
              </div>

              <button onClick={handleBuyNow} disabled={product.stock === 0}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg border-2 border-primary text-primary font-bold text-body-md hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bolt</span>
                Comprar ahora
              </button>
            </div>

            {/* Share */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs text-on-surface-variant">Compartir:</span>
              <button onClick={shareWA}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors text-xs font-bold border border-[#25D366]/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp
              </button>
              <button onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors text-xs font-bold border border-outline-variant/40">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{linkCopied ? 'check' : 'link'}</span>
                {linkCopied ? '¡Copiado!' : 'Copiar link'}
              </button>
            </div>

            {/* Features & payment */}
            <div className="border-t border-outline-variant pt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: 'local_shipping', label: shippingZone ? `Envío a ${city || province}: $${shippingZone.cost.toLocaleString('es-AR')}` : 'Envíos a todo Argentina' },
                  { icon: 'verified_user', label: 'Pago 100% seguro' },
                  { icon: 'replay', label: 'Devolución sin problemas' },
                  { icon: 'support_agent', label: 'Soporte dedicado' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary flex-shrink-0" style={{ fontSize: '18px' }}>{icon}</span>
                    <span className="text-label-sm">{label}</span>
                  </div>
                ))}
              </div>
              {Object.entries(paymentMethods).some(([, cfg]) => cfg.enabled) && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/30">
                  <span className="text-label-sm text-on-surface-variant">Medios de pago:</span>
                  <div className="flex flex-wrap gap-2">
                    {paymentMethods.mercadopago.enabled && (
                      <span className="inline-flex items-center bg-white px-3 py-2 rounded-lg border border-[#009ee3]/30">
                        <img src="/logos/mercadopago.png" alt="Mercado Pago" className="h-8 w-auto" />
                      </span>
                    )}
                    {paymentMethods.transfer.enabled && (
                      <span className="inline-flex items-center gap-1 bg-secondary/10 text-secondary px-2.5 py-1 rounded text-xs font-bold border border-secondary/20">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>account_balance</span>
                        Transferencia
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}>
            <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white bg-white/20 hover:bg-white/30 rounded-full transition-colors flex-shrink-0"
              onClick={() => setLightboxOpen(false)}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
            <img src={product.images?.[activeImg] ?? product.image} alt={product.name}
              className="max-w-full max-h-[75vh] md:max-h-[82vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} />
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1" onClick={(e) => e.stopPropagation()}>
                {product.images.map((url, idx) => (
                  <button key={idx} onClick={() => setActiveImg(idx)}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                      activeImg === idx ? 'border-white' : 'border-white/30 hover:border-white/70'
                    }`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recently viewed carousel */}
        {recentlyViewedProducts.length > 0 && (
          <div className="mt-10 md:mt-14">
            <h2 className="font-headline text-lg md:text-xl text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>history</span>
              Vistos recientemente
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
              {recentlyViewedProducts.map((p) => (
                <div key={p.id} className="flex-shrink-0 w-40 sm:w-48">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended products — infinite scroll feed */}
        {allRecommended.length > 0 && (
          <div className="mt-10 md:mt-14">
            <h2 className="font-headline text-xl md:text-headline-md text-primary mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>recommend</span>
              También te puede interesar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-gutter">
              {allRecommended.slice(0, visibleRelated).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div ref={sentinelRelated} />
            <div className="mt-8 flex justify-center">
              {visibleRelated < allRecommended.length ? (
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '18px' }}>progress_activity</span>
                  Cargando más productos...
                </div>
              ) : allRecommended.length > 8 ? (
                <p className="text-xs text-on-surface-variant/60">— {allRecommended.length} productos —</p>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Sticky buy bar — mobile only */}
      {stickyVisible && product.stock > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 bg-surface border-t border-outline-variant shadow-2xl">
          <div className="flex items-center gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
            <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-outline-variant/30" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface line-clamp-1">{product.name}</p>
              <p className="text-sm font-bold text-secondary">${getEffectivePrice(product, qty).toLocaleString('es-AR')}</p>
            </div>
            <button onClick={handleAddToCart}
              className="flex-shrink-0 bg-primary text-on-primary font-bold px-4 py-2.5 rounded-lg text-sm flex items-center gap-1.5 hover:bg-primary/90 active:scale-95 transition-all">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_shopping_cart</span>
              Agregar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
