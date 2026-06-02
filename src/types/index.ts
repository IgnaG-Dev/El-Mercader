export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  avatar?: string
  phone?: string
  dni?: string
}

export interface VolumeTier {
  qty: number
  price: number
}

export interface Product {
  id: string
  slug: string
  name: string
  price: number
  image: string
  images: string[]
  category: string
  badge?: string
  description?: string
  stock: number
  rating?: number
  reviews?: number
  active?: boolean
  volumeTiers?: VolumeTier[]
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  address?: Address
  paymentMethod?: string
  receiptUrl?: string
}

export interface Address {
  id: string
  label: string
  street: string
  city: string
  province: string
  postalCode: string
  isDefault?: boolean
}

export interface GuildMember {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  joinedAt: string
  totalOrders: number
  totalSpent: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
  dni?: string
}
