import { supabase } from '../lib/supabase'
import type { Address } from '../types'

function mapAddress(db: Record<string, unknown>): Address {
  return {
    id: db.id as string,
    label: db.label as string,
    street: db.street as string,
    city: db.city as string,
    province: db.province as string,
    postalCode: db.postal_code as string,
    isDefault: db.is_default as boolean,
  }
}

export async function fetchAddresses(): Promise<Address[]> {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapAddress)
}

export async function createAddress(addr: Omit<Address, 'id'>): Promise<Address> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: user.id,
      label: addr.label,
      street: addr.street,
      city: addr.city,
      province: addr.province,
      postal_code: addr.postalCode,
      is_default: addr.isDefault ?? false,
    })
    .select()
    .single()

  if (error) throw error
  return mapAddress(data)
}

export async function setDefaultAddress(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
  const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id)
  if (error) throw error
}

export async function updateAddress(id: string, addr: Partial<Omit<Address, 'id'>>): Promise<Address> {
  const patch: Record<string, unknown> = {}
  if (addr.label !== undefined) patch.label = addr.label
  if (addr.street !== undefined) patch.street = addr.street
  if (addr.city !== undefined) patch.city = addr.city
  if (addr.province !== undefined) patch.province = addr.province
  if (addr.postalCode !== undefined) patch.postal_code = addr.postalCode
  if (addr.isDefault !== undefined) patch.is_default = addr.isDefault

  const { data, error } = await supabase
    .from('addresses')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapAddress(data)
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase.from('addresses').delete().eq('id', id)
  if (error) throw error
}
