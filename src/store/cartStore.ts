import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '../types'
import { getEffectivePrice } from '../lib/pricing'

interface CartState {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const computeTotals = (items: CartItem[]) => ({
  itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  total: items.reduce((sum, i) => sum + getEffectivePrice(i.product, i.quantity) * i.quantity, 0),
})

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,

      addItem: (product, quantity = 1) => {
        const items = get().items
        const existing = items.find((i) => i.product.id === product.id)
        const updated = existing
          ? items.map((i) =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
            )
          : [...items, { product, quantity }]
        set({ items: updated, ...computeTotals(updated) })
      },

      removeItem: (productId) => {
        const updated = get().items.filter((i) => i.product.id !== productId)
        set({ items: updated, ...computeTotals(updated) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        const updated = get().items.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        )
        set({ items: updated, ...computeTotals(updated) })
      },

      clearCart: () => set({ items: [], itemCount: 0, total: 0 }),
    }),
    { name: 'el-mercader-cart' }
  )
)
