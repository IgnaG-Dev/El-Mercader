import { create } from 'zustand'

interface UIState {
  stickyBuyBar: boolean
  setStickyBuyBar: (v: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  stickyBuyBar: false,
  setStickyBuyBar: (v) => set({ stickyBuyBar: v }),
}))
