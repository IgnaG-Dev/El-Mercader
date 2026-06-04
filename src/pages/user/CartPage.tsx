import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useFinanceStore } from '../../store/financeStore'
import { useLocationStore } from '../../store/locationStore'
import { useProducts } from '../../hooks/useProducts'

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, addItem } = useCartStore()
  const navigate = useNavigate()
  const { paymentMethods, serviceFee, shippingCost } = useFinanceStore()
  const { city, province } = useLocationStore()
  const { data: allProducts = [] } = useProducts()

  const hasLocation = Boolean(city || province)
  const shipping = hasLocation ? shippingCost : null

  // Descuentos separados (precio de transferencia = sin ninguna comisión)
  const serviceFeeSaving = serviceFee > 0 ? Math.round(total * serviceFee / 100) : 0
  const mpSaving = paymentMethods.mercadopago.fee > 0
    ? Math.round(total * paymentMethods.mercadopago.fee / 100)
    : 0
  const grandTotal = total + (shipping ?? 0)
  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0)

  // Precio tachado por item (precio con MP, sin descuento servicio)
  const itemDisplayDiscount = serviceFee + paymentMethods.mercadopago.fee
  const hasItemDiscount = itemDisplayDiscount > 0 && paymentMethods.transfer.enabled

  // Sugerencias: productos activos que no están en el carrito
  const cartIds = new Set(items.map(i => i.product.id))
  const suggestions = allProducts.filter(p => !cartIds.has(p.id) && p.active !== false).slice(0, 8)

  if (items.length === 0) {
    return (
      <div className="max-w-container-max mx-auto px-4 py-24 text-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">shopping_cart</span>
        <h2 className="font-headline text-headline-md text-on-surface mb-4">Tu carrito está vacío</h2>
        <p className="text-body-lg text-on-surface-variant mb-8">Explora la tienda y añade tus juegos favoritos.</p>
        <Link to="/tienda" className="bg-primary text-on-primary font-bold py-3 px-8 rounded hover:bg-primary-container transition-colors">
          Ver la Tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
      <h1 className="font-headline text-headline-lg text-primary mb-8">Tu Carrito</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="bg-surface-container rounded-xl border border-outline-variant/30 p-4 flex gap-3">
              <Link to={`/producto/${product.slug}`} className="flex-shrink-0">
                <img src={product.image} alt={product.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/producto/${product.slug}`} className="flex-1 min-w-0">
                    <h3 className="font-bold text-label-bold text-on-surface hover:text-primary line-clamp-2 text-sm sm:text-base">{product.name}</h3>
                  </Link>
                  <div className="text-right flex-shrink-0">
                    {hasItemDiscount && (
                      <p className="text-xs line-through text-on-surface-variant/50">
                        ${(Math.round(product.price * (1 + itemDisplayDiscount / 100)) * quantity).toLocaleString('es-AR')}
                      </p>
                    )}
                    <p className="font-bold text-base sm:text-lg text-on-surface whitespace-nowrap">
                      ${(product.price * quantity).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
                {hasItemDiscount && (
                  <p className="text-xs line-through text-on-surface-variant/50 mt-0.5">
                    ${Math.round(product.price * (1 + itemDisplayDiscount / 100)).toLocaleString('es-AR')}
                  </p>
                )}
                <p className="text-sm text-secondary font-bold">${product.price.toLocaleString('es-AR')}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center border border-outline-variant rounded overflow-hidden">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2 py-1 bg-surface-container hover:bg-surface-container-high transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>remove</span>
                    </button>
                    <span className="px-3 py-1 text-body-md font-bold min-w-[2rem] text-center">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2 py-1 bg-surface-container hover:bg-surface-container-high transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                    </button>
                  </div>
                  <button onClick={() => removeItem(product.id)} className="text-error hover:text-error/80 transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete_outline</span>
                    <span className="text-label-sm">Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-6 sticky top-24">
            <h2 className="font-headline text-headline-md text-on-surface mb-5">Resumen del pedido</h2>
            <div className="space-y-1.5 mb-6">

              {/* Productos */}
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>
                  Productos
                  <span className="text-xs ml-1">({totalQuantity} {totalQuantity === 1 ? 'unidad' : 'unidades'})</span>
                </span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>

              {/* Envío */}
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Envío</span>
                {shipping !== null ? (
                  <span>${shipping.toLocaleString('es-AR')}</span>
                ) : (
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-secondary hover:underline text-sm font-medium"
                  >
                    Ingresá tu ubicación
                  </button>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-outline-variant pt-2 mt-1 flex justify-between font-bold text-headline-md text-on-surface">
                <span>Total</span>
                <span>${grandTotal.toLocaleString('es-AR')}</span>
              </div>

              {/* Beneficios informativos */}
              {(serviceFeeSaving > 0 || mpSaving > 0) && (
                <div className="mt-2 rounded-xl border border-secondary/25 bg-secondary/8 p-3 space-y-1.5">
                  <p className="text-xs font-bold text-secondary flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>savings</span>
                    Lo que te descontamos al pagar con transferencia
                  </p>
                  {serviceFeeSaving > 0 && (
                    <div className="flex justify-between text-xs text-secondary">
                      <span>Comisión de servicio ({serviceFee}%)</span>
                      <span className="font-bold">−${serviceFeeSaving.toLocaleString('es-AR')}</span>
                    </div>
                  )}
                  {mpSaving > 0 && (
                    <div className="flex justify-between text-xs text-secondary">
                      <span>Comisión Mercado Pago ({paymentMethods.mercadopago.fee}%)</span>
                      <span className="font-bold">−${mpSaving.toLocaleString('es-AR')}</span>
                    </div>
                  )}
                  {(serviceFeeSaving > 0 || mpSaving > 0) && (
                    <div className="flex justify-between text-xs font-bold text-secondary border-t border-secondary/20 pt-1.5 mt-1">
                      <span>Total ahorrado</span>
                      <span>−${(serviceFeeSaving + mpSaving).toLocaleString('es-AR')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/finalizar-compra')}
              className="w-full bg-primary text-on-primary font-bold py-3 rounded hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>payment</span>
              Finalizar compra
            </button>
            <Link to="/tienda" className="block text-center mt-4 text-secondary hover:underline text-label-sm">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>

      {/* Productos sugeridos */}
      {suggestions.length > 0 && (
        <div className="mt-10">
          <h2 className="font-headline text-xl text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            También te puede gustar
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {suggestions.map(product => (
              <div
                key={product.id}
                className="bg-surface-container rounded-xl border border-outline-variant/30 p-3 soft-lift flex flex-col"
              >
                <Link to={`/producto/${product.id}`} className="block mb-2">
                  <img src={product.image} alt={product.name} className="w-full h-28 object-cover rounded-lg" />
                </Link>
                <Link to={`/producto/${product.id}`} className="flex-1 min-h-0">
                  <p className="text-xs font-bold text-on-surface line-clamp-2 hover:text-primary leading-tight mb-1">
                    {product.name}
                  </p>
                </Link>
                <p className="text-xs font-bold text-secondary mb-2 mt-1">${product.price.toLocaleString('es-AR')}</p>
                <button
                  onClick={() => addItem(product, 1)}
                  className="w-full text-xs font-bold bg-primary text-on-primary rounded-lg py-1.5 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add_shopping_cart</span>
                  Agregar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
