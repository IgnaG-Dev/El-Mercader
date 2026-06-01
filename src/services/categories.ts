import { supabase } from '../lib/supabase'

export interface Category {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  sortOrder: number
  active: boolean
}

function mapCategory(db: Record<string, unknown>): Category {
  return {
    id: db.id as string,
    slug: db.slug as string,
    name: db.name as string,
    description: (db.description as string) ?? undefined,
    icon: (db.icon as string) ?? undefined,
    sortOrder: (db.sort_order as number) ?? 0,
    active: db.active as boolean,
  }
}

export async function fetchCategoriesAdmin(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapCategory)
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapCategory)
}

export interface CategoryInput {
  slug: string
  name: string
  description?: string
  icon?: string
  sortOrder?: number
  active?: boolean
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      slug: input.slug,
      name: input.name,
      description: input.description ?? null,
      icon: input.icon ?? null,
      sort_order: input.sortOrder ?? 0,
      active: input.active ?? true,
    })
    .select()
    .single()
  if (error) throw error
  return mapCategory(data)
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<void> {
  const updates: Record<string, unknown> = {}
  if (input.name !== undefined) updates.name = input.name
  if (input.slug !== undefined) updates.slug = input.slug
  if (input.description !== undefined) updates.description = input.description
  if (input.icon !== undefined) updates.icon = input.icon
  if (input.sortOrder !== undefined) updates.sort_order = input.sortOrder
  if (input.active !== undefined) updates.active = input.active

  const { error } = await supabase.from('categories').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}
