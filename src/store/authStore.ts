import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { User, LoginCredentials, RegisterData } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<{ needsConfirmation: boolean }>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async ({ email, password }) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      },

      register: async ({ name, email, password, phone, dni }) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, phone, dni } },
        })
        if (error) throw error
        return { needsConfirmation: !data.session }
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, isAuthenticated: false })
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: 'el-mercader-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
