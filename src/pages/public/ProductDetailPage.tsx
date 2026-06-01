import { useParams, Link } from 'react-router-dom'
import React, { useState, useRef } from 'react'
import { useProductBySlug, useProducts } from '../../hooks/useProducts'
import { useCartStore } from '../../store/cartStore'
import { useFinanceStore } from '../../store/financeStore'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import SEO from '../../components/ui/SEO'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const addTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = () => {
    addItem(product!, qty)
    setJustAdded(true)
    if (addTimerRef.current) clearTimeout(addTimerRef.current)
    addTimerRef.current = setTimeout(() => setJustAdded(false), 2200)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  const { data: product, isLoading } = useProductBySlug(slug)
  const { data: allProducts = [] } = useProducts()
  const { paymentMethods, shippingCost, shippingDays } = useFinanceStore()

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

  const related = allProducts.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4)

  const seoDescription = product.description
    ? product.description.slice(0, 155) + (product.description.length > 155 ? '…' : '')
    : `Comprá ${product.name} en El Mercader. Envíos a todo Argentina. Pago con Mercado Pago o transferencia.`

  const SITE_URL = 'https://elmercader.com.ar'
  const productUrl = `${SITE_URL}/producto/${product.slug}`

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
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.images?.length ? product.images : [product.image],
            description: product.description ?? seoDescription,
            brand: { '@type': 'Brand', name: 'Catan' },
            offers: {
              '@type': 'Offer',
              price: product.price.toFixed(2),
              priceCurrency: 'ARS',
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              url: productUrl,
              seller: { '@type': 'Organization', name: 'El Mercader' },
            },
            ...(product.rating && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating.toFixed(1),
                reviewCount: product.reviews ?? 0,
              },
            }),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
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
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={product.images?.[activeImg] ?? product.image}
                alt={product.name}
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
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                      activeImg === idx
                        ? 'border-primary'
                        : 'border-outline-variant/30 hover:border-primary/50'
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
            {product.badge && (
              <div className="mb-3">
                <Badge variant="tertiary">{product.badge}</Badge>
              </div>
            )}

            <h1 className="font-headline text-2xl md:text-headline-lg text-on-surface mb-3">{product.name}</h1>

            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-tertiary-container">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', fontVariationSettings: `'FILL' ${s <= Math.round(product.rating!) ? 1 : 0}` }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <span className="text-label-sm text-on-surface-variant">({product.reviews} reseñas)</span>
              </div>
            )}

            <p className="text-2xl md:text-headline-md font-bold text-secondary mb-5">
              ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>

            <p className="text-body-md md:text-body-lg text-on-surface-variant mb-6 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            <div className="flex items-center gap-2 mb-5">
              <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${product.stock > 0 ? 'bg-secondary' : 'bg-error'}`} />
              <span className="text-label-sm text-on-surface-variant">
                {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Sin stock'}
              </span>
            </div>

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="flex items-center border border-outline-variant rounded overflow-hidden flex-shrink-0">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
                </button>
                <span className="px-4 py-2 text-body-md font-bold text-on-surface bg-surface min-w-[3rem] text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                </button>
              </div>

              <div className="relative flex-1 min-w-[160px]">
                {justAdded && (
                  <div className="float-chip absolute left-1/2 bottom-full mb-2 pointer-events-none z-10">
                    <span className="bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg whitespace-nowrap">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                      ¡Añadido al carrito!
                    </span>
                  </div>
                )}
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  size="lg"
                  className={`w-full transition-all duration-300 ${justAdded ? '!bg-secondary scale-95' : ''}`}
                >
                  <span
                    className="material-symbols-outlined transition-all duration-300"
                    style={{ fontSize: '20px', fontVariationSettings: justAdded ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {justAdded ? 'check_circle' : 'add_shopping_cart'}
                  </span>
                  {justAdded ? '¡Añadido!' : 'Añadir al carrito'}
                </Button>
              </div>
            </div>

            {/* Features & payment */}
            <div className="border-t border-outline-variant pt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: 'local_shipping', label: `Envío $${shippingCost.toLocaleString('es-AR')} · ${shippingDays}` },
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
          <div
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white bg-white/20 hover:bg-white/30 rounded-full transition-colors flex-shrink-0"
              onClick={() => setLightboxOpen(false)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>

            <img
              src={product.images?.[activeImg] ?? product.image}
              alt={product.name}
              className="max-w-full max-h-[75vh] md:max-h-[82vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {product.images && product.images.length > 1 && (
              <div
                className="flex gap-3 mt-4 overflow-x-auto pb-1"
                onClick={(e) => e.stopPropagation()}
              >
                {product.images.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                      activeImg === idx ? 'border-white' : 'border-white/30 hover:border-white/70'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h2 className="font-headline text-xl md:text-headline-md text-primary mb-5">También te puede interesar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-gutter">
              {related.map((p) => (
                <div key={p.id} className="bg-surface-container rounded-lg p-3 border border-outline-variant/30 soft-lift">
                  <Link to={`/producto/${p.slug}`}>
                    <img src={p.image} alt={p.name} className="w-full aspect-square object-cover rounded mb-3" />
                    <h4 className="text-label-bold font-bold text-on-surface line-clamp-2 mb-1 hover:text-primary text-sm">{p.name}</h4>
                    <p className="text-body-md text-secondary font-bold">${p.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
