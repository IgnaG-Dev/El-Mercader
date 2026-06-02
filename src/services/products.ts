import { supabase } from '../lib/supabase'
import { slugify } from '../lib/slugify'
import type { Product, VolumeTier } from '../types'

function mapProduct(db: Record<string, unknown>): Product {
  const rawUrls = (db.image_urls as string[] | null) ?? []
  const legacyUrl = (db.image_url as string) ?? ''
  const images = rawUrls.length > 0 ? rawUrls : (legacyUrl ? [legacyUrl] : [])

  return {
    id: db.id as string,
    slug: (db.slug as string) || slugify(db.name as string),
    name: db.name as string,
    price: Number(db.price),
    image: images[0] ?? '',
    images,
    category: (db.category as string) ?? '',
    badge: (db.badge as string) ?? undefined,
    description: (db.description as string) ?? undefined,
    stock: db.stock as number,
    rating: db.rating ? Number(db.rating) : undefined,
    reviews: (db.reviews_count as number) ?? 0,
    active: db.active as boolean,
    volumeTiers: (db.volume_tiers as VolumeTier[] | null) ?? [],
  }
}

export async function fetchProducts(category?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(mapProduct)
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return mapProduct(data)
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return mapProduct(data)
}

export async function fetchAllProductsAdmin(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapProduct)
}

export async function updateProduct(
  id: string,
  updates: {
    name?: string
    price?: number
    stock?: number
    active?: boolean
    badge?: string
    description?: string
    image_urls?: string[]
    volume_tiers?: VolumeTier[]
  }
): Promise<void> {
  const payload: Record<string, unknown> = { ...updates }
  if (updates.image_urls !== undefined) {
    payload.image_url = updates.image_urls[0] ?? null
  }
  const { error } = await supabase.from('products').update(payload).eq('id', id)
  if (error) throw error
}

export async function deactivateProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').update({ active: false }).eq('id', id)
  if (error) throw error
}

export interface CreateProductInput {
  name: string
  price: number
  stock: number
  category: string
  description?: string
  badge?: string
  image_urls?: string[]
  active?: boolean
  volume_tiers?: VolumeTier[]
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const images = input.image_urls ?? []
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: input.name,
      slug: slugify(input.name),
      price: input.price,
      stock: input.stock,
      category: input.category,
      description: input.description ?? null,
      badge: input.badge ?? null,
      image_url: images[0] ?? null,
      image_urls: images,
      active: input.active ?? true,
      volume_tiers: input.volume_tiers ?? [],
    })
    .select()
    .single()

  if (error) throw error
  return mapProduct(data)
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}
