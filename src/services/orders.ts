import { supabase } from '../lib/supabase'
import type { Order, CartItem } from '../types'

interface OrderItemRow {
  product_id: string
  product_name: string
  product_image: string
  quantity: number
  unit_price: number
}

function mapOrder(db: Record<string, unknown>): Order {
  const items = ((db.order_items as OrderItemRow[]) ?? []).map((item) => ({
    product: {
      id: item.product_id,
      slug: '',
      name: item.product_name,
      price: Number(item.unit_price),
      image: item.product_image ?? '',
      images: item.product_image ? [item.product_image] : [],
      category: 'base',
      stock: 0,
    },
    quantity: item.quantity,
  }))

  return {
    id: db.id as string,
    userId: db.user_id as string,
    items,
    total: Number(db.total),
    status: db.status as Order['status'],
    createdAt: (db.created_at as string).split('T')[0],
    paymentMethod: (db.payment_method as string) ?? undefined,
    address: (db.shipping_address as Order['address']) ?? undefined,
  }
}

export interface CreateOrderInput {
  items: CartItem[]
  total: number
  paymentMethod: string
  shippingAddress: {
    name: string
    email: string
    phone: string
    street: string
    city: string
    province: string
    postalCode: string
  }
}

export async function fetchUserOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapOrder)
}

export async function createOrder(input: CreateOrderInput): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user?.id ?? null,
      total: input.total,
      payment_method: input.paymentMethod,
      shipping_address: input.shippingAddress,
      status: 'pending',
    })
    .select()
    .single()

  if (orderError) throw orderError

  const itemRows = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    product_name: item.product.name,
    product_image: item.product.image,
    quantity: item.quantity,
    unit_price: item.product.price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(itemRows)
  if (itemsError) throw itemsError

  return order.id as string
}

export async function fetchAllOrdersAdmin(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapOrder)
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}

export async function deleteOrder(id: string): Promise<void> {
  await supabase.from('order_items').delete().eq('order_id', id)
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw error
}

export interface CreateOrderAdminInput {
  userId?: string
  items: { productId: string; productName: string; productImage: string; quantity: number; unitPrice: number }[]
  total: number
  paymentMethod: string
  status: Order['status']
  shippingAddress?: {
    name: string; email: string; phone: string
    street: string; city: string; province: string; postalCode: string
  }
}

export async function createOrderAdmin(input: CreateOrderAdminInput): Promise<string> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: input.userId ?? null,
      total: input.total,
      payment_method: input.paymentMethod,
      shipping_address: input.shippingAddress ?? null,
      status: input.status,
    })
    .select()
    .single()

  if (orderError) throw orderError

  if (input.items.length > 0) {
    const itemRows = input.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_image: item.productImage,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }))
    const { error: itemsError } = await supabase.from('order_items').insert(itemRows)
    if (itemsError) throw itemsError
  }

  return order.id as string
}
