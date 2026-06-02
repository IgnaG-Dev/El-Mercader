import type { Product } from '../types'

/** Returns the unit price that applies for the given quantity, considering volume tiers. */
export function getEffectivePrice(product: Product, quantity: number): number {
  const tiers = product.volumeTiers
  if (!tiers?.length) return product.price
  // Find the best matching tier (highest qty that is <= quantity)
  const sorted = [...tiers].sort((a, b) => b.qty - a.qty)
  const match = sorted.find((t) => quantity >= t.qty)
  return match ? match.price : product.price
}
