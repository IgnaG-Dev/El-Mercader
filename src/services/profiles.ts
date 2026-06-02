import { supabase } from '../lib/supabase'
import type { User } from '../types'

function mapProfile(db: Record<string, unknown>): User {
  return {
    id: db.id as string,
    name: db.name as string,
    email: db.email as string,
    role: db.role as 'user' | 'admin',
    avatar: (db.avatar_url as string) ?? undefined,
    phone: (db.phone as string) ?? undefined,
    dni: (db.dni as string) ?? undefined,
  }
}

export async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return mapProfile(data)
}

export async function updateProfile(
  userId: string,
  updates: { name?: string; phone?: string; dni?: string }
): Promise<void> {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
  if (error) throw error
}

export async function fetchAllProfiles(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapProfile)
}

export async function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
  if (error) throw error
}

export async function deleteProfile(userId: string): Promise<void> {
  const { error } = await supabase.from('profiles').delete().eq('id', userId)
  if (error) throw error
}

export async function createUserViaSignup(
  email: string,
  password: string,
  name: string,
  guild?: string,
  role: 'user' | 'admin' = 'user',
): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession()
  const adminSession = sessionData.session

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, guild: guild ?? null, role } },
  })
  if (error) throw error

  // Restore admin session if it was overwritten
  if (adminSession) {
    await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    })
  }
}
