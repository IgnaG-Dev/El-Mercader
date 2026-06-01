import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Product } from '../../types'
import { useCartStore } from '../../store/cartStore'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [justAdded, setJustAdded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    setJustAdded(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setJustAdded(false), 2200)
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    navigate('/finalizar-compra')
  }

  return (
    <div className="bg-surface-container rounded-lg p-3 md:p-4 border border-outline-variant/30 soft-lift flex flex-col h-full relative group overflow-visible">
      {product.badge && (
        <div className="absolute top-2 right-2 bg-tertiary-fixed/20 text-on-tertiary-fixed text-label-sm font-bold px-2 py-1 rounded-full z-10 text-xs">
          {product.badge}
        </div>
      )}

      <Link to={`/producto/${product.slug}`} className="block w-full aspect-square bg-surface-container-highest rounded mb-3 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      <div className="flex-grow flex flex-col justify-between">
        <div>
          <Link to={`/producto/${product.slug}`}>
            <h3 className="text-label-bold font-bold text-on-surface mb-1 line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-body-md text-secondary font-bold mb-3">
            ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-2">
          {/* Comprar ahora */}
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="w-full bg-primary text-on-primary font-bold text-label-bold py-2 rounded transition-colors duration-300 flex justify-center items-center gap-1.5 hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bolt</span>
            <span className="hidden sm:inline">Comprar ahora</span>
            <span className="sm:hidden">Comprar</span>
          </button>

          {/* Añadir al carrito con animación */}
          <div className="relative">
            {justAdded && (
              <div className="float-chip absolute left-1/2 bottom-full mb-2 pointer-events-none z-10">
                <span className="bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg whitespace-nowrap">
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>check_circle</span>
                  ¡Añadido!
                </span>
              </div>
            )}
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className={`w-full font-bold text-label-bold py-2 rounded transition-all duration-300 flex justify-center items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                justAdded
                  ? 'bg-secondary text-white scale-95 border border-secondary'
                  : 'bg-surface text-primary border border-primary hover:bg-primary hover:text-on-primary'
              }`}
            >
              <span
                className="material-symbols-outlined transition-all duration-300"
                style={{ fontSize: '16px', fontVariationSettings: justAdded ? "'FILL' 1" : "'FILL' 0" }}
              >
                {justAdded ? 'check_circle' : 'add_shopping_cart'}
              </span>
              <span className="hidden sm:inline">{justAdded ? '¡Añadido!' : 'Añadir al carrito'}</span>
              <span className="sm:hidden">{justAdded ? '¡Añadido!' : 'Agregar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
