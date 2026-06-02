import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useFinanceStore } from '../../store/financeStore'

export default function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCartStore()
  const navigate = useNavigate()
  const { paymentMethods, serviceFee } = useFinanceStore()
  const totalDiscount = paymentMethods.mercadopago.fee + serviceFee
  const hasDiscount = totalDiscount > 0 && paymentMethods.transfer.enabled
  const totalSavings = hasDiscount ? Math.round(total * totalDiscount / 100) : 0

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
              <Link to={`/producto/${product.id}`} className="flex-shrink-0">
                <img src={product.image} alt={product.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/producto/${product.id}`} className="flex-1 min-w-0">
                    <h3 className="font-bold text-label-bold text-on-surface hover:text-primary line-clamp-2 text-sm sm:text-base">{product.name}</h3>
                  </Link>
                  {/* Price total — top right */}
                  <div className="text-right flex-shrink-0">
                    {hasDiscount && (
                      <p className="text-xs line-through text-on-surface-variant/50">
                        ${(Math.round(product.price * (1 + totalDiscount / 100)) * quantity).toLocaleString('es-AR')}
                      </p>
                    )}
                    <p className="font-bold text-base sm:text-lg text-on-surface whitespace-nowrap">
                      ${(product.price * quantity).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
                {hasDiscount && (
                  <p className="text-xs line-through text-on-surface-variant/50 mt-0.5">
                    ${Math.round(product.price * (1 + totalDiscount / 100)).toLocaleString('es-AR')}
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
            <h2 className="font-headline text-headline-md text-on-surface mb-6">Resumen del pedido</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-body-md text-on-surface-variant">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} artículos)</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-body-md text-on-surface-variant">
                <span>Envío</span>
                <span className="text-secondary font-bold">Gratis</span>
              </div>
              <div className="border-t border-outline-variant pt-3 flex justify-between font-bold text-headline-md text-on-surface">
                <span>Total</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
              {hasDiscount && totalSavings > 0 && (
                <div className="text-xs text-secondary bg-secondary/10 rounded-lg p-2.5 flex items-start gap-1.5">
                  <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '14px' }}>local_offer</span>
                  <span>Ahorrás <strong>${totalSavings.toLocaleString('es-AR')}</strong> pagando con transferencia bancaria</span>
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
    </div>
  )
}
