import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LocationState {
  city: string
  province: string
  street: string
  postalCode: string
  setLocation: (loc: Partial<Pick<LocationState, 'city' | 'province' | 'street' | 'postalCode'>>) => void
  clearLocation: () => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      city: '',
      province: '',
      street: '',
      postalCode: '',
      setLocation: (loc) => set((prev) => ({ ...prev, ...loc })),
      clearLocation: () => set({ city: '', province: '', street: '', postalCode: '' }),
    }),
    { name: 'el-mercader-location' }
  )
)
