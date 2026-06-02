import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { inject } from '@vercel/analytics'
import './index.css'
import App from './App.tsx'

inject()
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'

async function syncUserFromSession(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profile) {
    useAuthStore.getState().setUser({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as 'user' | 'admin',
      avatar: profile.avatar_url ?? undefined,
      phone: profile.phone ?? undefined,
      dni: profile.dni ?? undefined,
    })
  }
}

// Initialize auth state from existing session
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    syncUserFromSession(session.user.id)
  } else {
    useAuthStore.getState().setUser(null)
  }
})

// Keep auth state in sync
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    syncUserFromSession(session.user.id)
  } else {
    useAuthStore.getState().setUser(null)
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
