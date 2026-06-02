import { Link } from 'react-router-dom'
import ProductCard from '../../components/ui/ProductCard'
import SEO from '../../components/ui/SEO'
import { useProducts, useBestSellers } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed'

const BENTO_COLORS = [
  { text: 'text-primary' },
  { text: 'text-secondary' },
  { text: 'text-tertiary' },
  { text: 'text-primary' },
]

export default function HomePage() {
  const { data: products = [], isLoading } = useProducts()
  const { data: categories = [] } = useCategories()
  const { products: bestSellers, isLoading: bsLoading } = useBestSellers(4)
  const { ids: recentIds } = useRecentlyViewed()
  const recentlyViewed = products
    .filter((p) => recentIds.includes(p.id))
    .sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id))
    .slice(0, 8)
  const featured = products.slice(0, 4)

  return (
    <>
      <SEO
        title="Juegos de Catan en Argentina — Juego Base, Expansiones y Accesorios"
        description="Comprá Catan y todas sus expansiones en Argentina. Envíos a todo el país con Andreani. Juego base, Ciudades y Caballeros, Navegantes, Piratas y Exploradores. Pagá con Mercado Pago o transferencia."
        url="/"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'El Mercader — Catan Argentina',
            url: 'https://elmercader.com.ar',
            potentialAction: {
              '@type': 'SearchAction',
              target: { '@type': 'EntryPoint', urlTemplate: 'https://elmercader.com.ar/busqueda?q={search_term_string}' },
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Store',
            name: 'El Mercader',
            description: 'La tienda especializada en juegos de mesa Catan de Argentina. Juego base, todas las expansiones y accesorios exclusivos.',
            url: 'https://elmercader.com.ar',
            logo: 'https://elmercader.com.ar/favicon.svg',
            address: { '@type': 'PostalAddress', addressCountry: 'AR' },
            priceRange: '$$',
            paymentAccepted: 'Mercado Pago, Transferencia bancaria',
            currenciesAccepted: 'ARS',
          },
        ]}
      />
      {/* ── Hero ── */}
      <section className="relative w-full h-[480px] sm:h-[540px] md:h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-surface-container-highest">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7hC-BQbCm7vocr9dJPTWteUmN0f4llVHxEv1VJwFTZR1-mhj4e2BoxmRLt2RLUEWpomyIkOBvYzMlOuqokgn3q-p_LiXrPPFMGJNSocaen235TJcKjz5_aBJdNrULlIfA2znCHU5sgVCZBB-ahsMjlpu7zXEPbQbfe_bHEx4PYip9Znj_6JOQ3vw65soxMlmFqZ_srogrHTkFRkRxJlwBjVYnNWUlk6enN8zZ6q-6IwY1AieOLTbNXZqUX5RIegdlCykoGORR660A"
            alt="Catan"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 to-transparent" />
        </div>
        <div className="relative z-10 text-center px-6 md:px-margin-desktop max-w-container-max mx-auto flex flex-col items-center">
          <h1 className="font-headline text-3xl sm:text-4xl md:text-headline-xl text-on-primary mb-3 md:mb-4 drop-shadow-md">
            Conquista la Isla de Catan
          </h1>
          <p className="text-sm sm:text-base md:text-body-lg text-surface-variant mb-6 md:mb-8 max-w-xs sm:max-w-xl md:max-w-2xl drop-shadow">
            Encuentra el juego base, todas las expansiones y accesorios exclusivos en un solo lugar.
          </p>
          <Link
            to="/tienda"
            className="bg-primary text-on-primary font-bold py-2.5 px-7 sm:py-3 sm:px-8 rounded shadow-md hover:bg-primary-container transition-colors duration-300 text-sm sm:text-base"
          >
            Ver Colección
          </Link>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-10 md:py-16 px-4 md:px-margin-desktop max-w-container-max mx-auto">
        <div className="flex justify-between items-center mb-5 md:mb-8 border-b border-outline-variant pb-4">
          <h2 className="font-headline text-xl md:text-headline-md text-primary">Tesoros Destacados</h2>
          <Link
            to="/tienda"
            className="font-bold text-label-bold text-secondary hover:underline flex items-center gap-1 text-sm"
          >
            Ver todos
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-gutter">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-container rounded-lg border border-outline-variant/30 h-52 md:h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-gutter">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── Más vendidos ── */}
      <section className="py-10 md:py-14 px-4 md:px-margin-desktop max-w-container-max mx-auto">
        <div className="flex justify-between items-center mb-5 md:mb-8 border-b border-outline-variant pb-4">
          <h2 className="font-headline text-xl md:text-headline-md text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>local_fire_department</span>
            Más Vendidos
          </h2>
          <Link to="/tienda" className="font-bold text-label-bold text-secondary hover:underline flex items-center gap-1 text-sm">
            Ver todos <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        {bsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-gutter">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-container rounded-lg border border-outline-variant/30 h-52 md:h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-gutter">
            {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── Vistos recientemente ── */}
      {recentlyViewed.length > 0 && (
        <section className="py-8 md:py-10 px-4 md:px-margin-desktop max-w-container-max mx-auto">
          <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-3">
            <h2 className="font-headline text-xl md:text-headline-md text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>history</span>
              Vistos recientemente
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
            {recentlyViewed.map((p) => (
              <div key={p.id} className="flex-shrink-0 w-40 sm:w-48">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Categories Bento ── */}
      {categories.length > 0 && (
        <section className="py-10 md:py-16 bg-surface-container-low px-4 md:px-margin-desktop">
          <div className="max-w-container-max mx-auto">
            <h2 className="font-headline text-xl md:text-headline-md text-primary mb-6 md:mb-8 text-center">
              Explora el Gremio
            </h2>

            {/* Mobile: flex column — Tablet/Desktop: bento 2+1 grid */}
            <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-6 md:h-[400px]">

              {/* Large card — first category */}
              {categories[0] && (() => {
                const c = categories[0]
                const color = BENTO_COLORS[0]
                const img = products.find(p => p.category === c.slug && p.image)?.image
                return (
                  <Link
                    to={`/tienda?categoria=${c.slug}`}
                    className="rounded-xl border border-outline-variant/40 soft-lift relative overflow-hidden group
                               h-[200px] md:h-full md:col-span-2
                               flex items-center justify-center bg-surface-container"
                  >
                    {img
                      ? <img src={img} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="absolute inset-0 wood-texture" />
                    }
                    <div className="absolute inset-0 bg-inverse-surface/50 group-hover:bg-inverse-surface/40 transition-colors duration-300" />
                    <div className="z-10 text-center p-4 md:p-6 bg-surface-container/80 backdrop-blur-sm rounded-lg border border-outline-variant/50">
                      {c.icon && (
                        <span className={`material-symbols-outlined text-3xl md:text-4xl mb-1 md:mb-2 block ${color.text}`}>
                          {c.icon}
                        </span>
                      )}
                      <h3 className={`font-headline text-headline-md md:text-headline-lg ${color.text} mb-1 md:mb-2`}>
                        {c.name}
                      </h3>
                      {c.description && (
                        <p className="text-xs sm:text-body-md text-on-surface-variant hidden sm:block">
                          {c.description}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })()}

              {/* Small cards — categories 2 & 3 */}
              {categories.length > 1 && (
                <div className="flex flex-col gap-4 md:gap-6 md:col-span-1">
                  {categories.slice(1, 3).map((c, idx) => {
                    const color = BENTO_COLORS[(idx + 1) % BENTO_COLORS.length]
                    const img = products.find(p => p.category === c.slug && p.image)?.image
                    return (
                      <Link
                        key={c.slug}
                        to={`/tienda?categoria=${c.slug}`}
                        className="rounded-xl border border-outline-variant/40 soft-lift relative overflow-hidden group
                                   h-[130px] md:flex-1
                                   flex items-center justify-center bg-surface-container"
                      >
                        {img
                          ? <img src={img} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : <div className="absolute inset-0 wood-texture" />
                        }
                        <div className="absolute inset-0 bg-inverse-surface/50 group-hover:bg-inverse-surface/40 transition-colors duration-300" />
                        <div className="z-10 text-center p-3 md:p-4 bg-surface-container/80 backdrop-blur-sm rounded-lg border border-outline-variant/50">
                          {c.icon && (
                            <span className={`material-symbols-outlined text-2xl mb-1 block ${color.text}`}>
                              {c.icon}
                            </span>
                          )}
                          <h3 className={`font-headline text-headline-md ${color.text}`}>{c.name}</h3>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Extra categories row (>3) */}
            {categories.length > 3 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6">
                {categories.slice(3).map((c, idx) => {
                  const color = BENTO_COLORS[(idx + 3) % BENTO_COLORS.length]
                  const img = products.find(p => p.category === c.slug && p.image)?.image
                  return (
                    <Link
                      key={c.slug}
                      to={`/tienda?categoria=${c.slug}`}
                      className="rounded-xl border border-outline-variant/40 soft-lift relative overflow-hidden group
                                 h-[90px] md:min-h-[80px]
                                 flex items-center justify-center bg-surface-container"
                    >
                      {img
                        ? <img src={img} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="absolute inset-0 wood-texture" />
                      }
                      <div className="absolute inset-0 bg-inverse-surface/50 group-hover:bg-inverse-surface/40 transition-colors duration-300" />
                      <div className="z-10 text-center p-2 md:p-3 bg-surface-container/80 backdrop-blur-sm rounded-lg border border-outline-variant/50">
                        {c.icon && (
                          <span className={`material-symbols-outlined text-lg md:text-xl mb-0.5 block ${color.text}`}>
                            {c.icon}
                          </span>
                        )}
                        <h3 className={`font-headline text-sm md:text-base ${color.text}`}>{c.name}</h3>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Trust badges ── */}
      <section className="py-8 md:py-12 border-t border-outline-variant/30 bg-surface">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
            {[
              { icon: 'local_shipping', title: 'Envío Rápido', desc: 'A toda Argentina en 24/48h', bg: 'bg-secondary-container text-on-secondary-container' },
              { icon: 'verified_user', title: 'Pago Seguro', desc: 'Transacciones encriptadas 100% seguras', bg: 'bg-tertiary-container text-on-tertiary-container' },
              { icon: 'support_agent', title: 'Atención al Jugador', desc: 'Resolvemos tus dudas rápidamente', bg: 'bg-primary-container text-on-primary-container' },
            ].map(({ icon, title, desc, bg }) => (
              <div key={title} className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-0 sm:text-center">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-full ${bg} flex items-center justify-center sm:mb-4`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>{icon}</span>
                </div>
                <div className="text-left sm:text-center">
                  <h4 className="font-bold text-label-bold text-on-surface mb-0.5 sm:mb-2">{title}</h4>
                  <p className="text-sm text-on-surface-variant">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Acerca de El Mercader (SEO text) ── */}
      <section className="py-12 md:py-16 bg-surface-container-low border-t border-outline-variant/30">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
            <h2 className="font-headline text-xl md:text-headline-md text-primary mb-4">
              La tienda de Catan más completa de Argentina
            </h2>
            <p className="text-body-md md:text-body-lg text-on-surface-variant leading-relaxed">
              En <strong className="text-on-surface">El Mercader</strong> encontrás todo el universo Catan en un solo lugar.
              Desde el <strong className="text-on-surface">Catan Juego Base</strong> hasta las expansiones más buscadas como{' '}
              <strong className="text-on-surface">Ciudades y Caballeros</strong>,{' '}
              <strong className="text-on-surface">Navegantes</strong> y{' '}
              <strong className="text-on-surface">Piratas y Exploradores</strong>.
              También contamos con <strong className="text-on-surface">ampliaciones para 5 y 6 jugadores</strong> y accesorios exclusivos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: 'storefront',
                title: 'Catálogo completo de Catan',
                text: 'Juego base, todas las expansiones oficiales, ampliaciones 5-6 jugadores y accesorios. Siempre con stock actualizado y precios en pesos argentinos.',
              },
              {
                icon: 'local_shipping',
                title: 'Envíos a todo el país',
                text: 'Despachamos con Andreani a cualquier provincia de Argentina. Recibís tu pedido en 24 a 48 horas hábiles con seguimiento en tiempo real.',
              },
              {
                icon: 'payments',
                title: 'Pagá como quieras',
                text: 'Aceptamos Mercado Pago con todas las tarjetas de crédito y débito, o transferencia bancaria directa. Compra 100% segura y protegida.',
              },
            ].map(({ icon, title, text }) => (
              <article key={title} className="bg-surface rounded-xl p-6 border border-outline-variant/30 soft-lift text-center">
                <span className="material-symbols-outlined text-primary mb-3 block" style={{ fontSize: '36px' }}>{icon}</span>
                <h3 className="font-headline text-base md:text-lg text-on-surface mb-2">{title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 md:mt-14 max-w-3xl mx-auto">
            <h3 className="font-headline text-lg md:text-xl text-primary mb-4 text-center">
              ¿Por qué comprar Catan en El Mercader?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-on-surface-variant">
              {[
                '✓ Productos 100% originales y en español',
                '✓ Atención personalizada por WhatsApp',
                '✓ Precios en pesos argentinos actualizados',
                '✓ Envíos a Buenos Aires, Córdoba, Rosario y todo el país',
                '✓ Comunidad activa de jugadores de Catan',
                '✓ Asesoramiento para elegir tu próxima expansión',
              ].map((item) => (
                <p key={item} className="flex items-start gap-2 bg-surface px-4 py-3 rounded-lg border border-outline-variant/20">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
