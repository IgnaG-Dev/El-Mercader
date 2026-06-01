import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PaymentMethodConfig {
  enabled: boolean
  fee: number
}

export interface FinanceConfig {
  shippingCost: number
  shippingDays: string
  cpOrigen: string
  paymentMethods: {
    mercadopago: PaymentMethodConfig
    transfer: PaymentMethodConfig
  }
}

interface FinanceState extends FinanceConfig {
  updateShipping: (cost: number, days: string) => void
  updateCpOrigen: (cp: string) => void
  togglePaymentMethod: (method: keyof FinanceConfig['paymentMethods']) => void
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      shippingCost: 15000,
      shippingDays: '7 días hábiles',
      cpOrigen: '1043',
      paymentMethods: {
        mercadopago: { enabled: true, fee: 6 },
        transfer: { enabled: true, fee: 0 },
      },
      updateShipping: (cost, days) => set({ shippingCost: cost, shippingDays: days }),
      updateCpOrigen: (cp) => set({ cpOrigen: cp }),
      togglePaymentMethod: (method) => {
        const pm = get().paymentMethods
        set({ paymentMethods: { ...pm, [method]: { ...pm[method], enabled: !pm[method].enabled } } })
      },
    }),
    { name: 'el-mercader-finance' }
  )
)
