import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'

export default function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCartStore()
  const navigate = useNavigate()

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
            <div key={product.id} className="bg-surface-container rounded-xl border border-outline-variant/30 p-4 flex gap-4">
              <Link to={`/producto/${product.id}`} className="flex-shrink-0">
                <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/producto/${product.id}`}>
                  <h3 className="font-bold text-label-bold text-on-surface hover:text-primary line-clamp-2">{product.name}</h3>
                </Link>
                <p className="text-body-md text-secondary font-bold mt-1">${product.price.toFixed(2)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-outline-variant rounded overflow-hidden">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2 py-1 bg-surface-container hover:bg-surface-container-high transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>remove</span>
                    </button>
                    <span className="px-3 py-1 text-body-md font-bold min-w-[2.5rem] text-center">{quantity}</span>
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
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-headline-md text-on-surface">${(product.price * quantity).toFixed(2)}</p>
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
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-body-md text-on-surface-variant">
                <span>Envío</span>
                <span className="text-secondary font-bold">Gratis</span>
              </div>
              <div className="border-t border-outline-variant pt-3 flex justify-between font-bold text-headline-md text-on-surface">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
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
