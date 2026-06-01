import { useAdminProducts } from '../../hooks/useProducts'

export default function AdminMerchandise() {
  const { data: products = [], isLoading } = useAdminProducts()
  const lowStock = products.filter((p) => p.stock < 8)

  return (
    <div className="p-8">
      <h1 className="font-headline text-headline-lg text-primary mb-8">Gestión de Mercancías</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-5">
          <span className="material-symbols-outlined text-secondary mb-2 block" style={{ fontSize: '28px' }}>inventory_2</span>
          <div className="font-bold text-headline-md text-on-surface">
            {isLoading ? <span className="inline-block w-8 h-7 bg-surface-container-highest rounded animate-pulse" /> : products.length}
          </div>
          <div className="text-label-sm text-on-surface-variant">Total productos</div>
        </div>
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-5">
          <span className="material-symbols-outlined text-error mb-2 block" style={{ fontSize: '28px' }}>warning</span>
          <div className="font-bold text-headline-md text-on-surface">
            {isLoading ? <span className="inline-block w-8 h-7 bg-surface-container-highest rounded animate-pulse" /> : lowStock.length}
          </div>
          <div className="text-label-sm text-on-surface-variant">Stock bajo (&lt;8 unid.)</div>
        </div>
        <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-5">
          <span className="material-symbols-outlined text-tertiary mb-2 block" style={{ fontSize: '28px' }}>warehouse</span>
          <div className="font-bold text-headline-md text-on-surface">
            {isLoading ? <span className="inline-block w-16 h-7 bg-surface-container-highest rounded animate-pulse" /> : products.reduce((s, p) => s + p.stock, 0)}
          </div>
          <div className="text-label-sm text-on-surface-variant">Unidades totales</div>
        </div>
      </div>

      {/* Low stock alert */}
      {!isLoading && lowStock.length > 0 && (
        <div className="bg-error-container/30 border border-error/20 rounded-xl p-6 mb-6">
          <h2 className="font-headline text-headline-md text-error mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>warning</span>
            Alertas de stock bajo
          </h2>
          <div className="space-y-3">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-surface rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />
                  <span className="font-bold text-label-bold text-on-surface">{p.name}</span>
                </div>
                <span className="font-bold text-error">{p.stock} unid. restantes</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full inventory */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-container-highest">
            <tr>
              {['Producto', 'Categoría', 'Stock', 'Precio', 'Valor total'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-8 bg-surface-container-highest rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-on-surface-variant">
                  No hay productos en el inventario.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-8 h-8 object-cover rounded border border-outline-variant/30" />
                      <span className="font-bold text-sm text-on-surface">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant capitalize">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-sm ${p.stock === 0 ? 'text-error' : p.stock < 5 ? 'text-error' : p.stock < 8 ? 'text-tertiary' : 'text-secondary'}`}>
                      {p.stock} unid.
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-secondary">${p.price.toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 font-bold text-sm text-on-surface">${(p.price * p.stock).toLocaleString('es-AR')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
