import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import { useProducts } from '../../hooks/useProducts'
import { useCartStore } from '../../store/cartStore'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const addItem = useCartStore((s) => s.addItem)
  const { data: allProducts = [] } = useProducts()

  const results = query.trim().length > 1
    ? allProducts.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <>
      <SEO
        title="Buscar juegos de Catan"
        description="Buscá juegos, expansiones y accesorios de Catan en El Mercader Argentina."
        url="/busqueda"
        noindex
      />
      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
        <h1 className="font-headline text-headline-lg text-primary mb-8">Buscar en el Gremio</h1>

        <div className="relative mb-10 max-w-2xl">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca juegos, expansiones, accesorios..."
            className="w-full pl-12 pr-4 py-4 border-2 border-outline-variant rounded-lg bg-surface text-body-lg text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        {query.trim().length > 1 && (
          <>
            <p className="text-label-sm text-on-surface-variant mb-4">
              {results.length} resultado{results.length !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
            </p>
            {results.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">search_off</span>
                <p className="text-body-lg text-on-surface-variant">No encontramos nada. Prueba con otro término.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                {results.map((p) => (
                  <div key={p.id} className="bg-surface-container rounded-lg p-4 border border-outline-variant/30 soft-lift flex flex-col">
                    <Link to={`/producto/${p.slug}`} className="block aspect-square bg-surface-container-highest rounded mb-4 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </Link>
                    <Link to={`/producto/${p.slug}`}>
                      <h3 className="font-bold text-label-bold text-on-surface mb-1 line-clamp-2 hover:text-primary">{p.name}</h3>
                    </Link>
                    <p className="text-body-md text-secondary font-bold mb-4">${p.price.toFixed(2)}</p>
                    <button
                      onClick={() => addItem(p)}
                      className="mt-auto w-full bg-surface text-primary border border-primary hover:bg-primary hover:text-on-primary font-bold text-label-bold py-2 rounded transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_shopping_cart</span>
                      Añadir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {query.trim().length <= 1 && (
          <div>
            <h2 className="font-headline text-headline-md text-on-surface mb-6">Más buscados</h2>
            <div className="flex flex-wrap gap-3">
              {['Catan base', 'Navegantes', 'Ciudades y Caballeros', 'Dados', '5 jugadores', 'Expansión'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors text-label-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
