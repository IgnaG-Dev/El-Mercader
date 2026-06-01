import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchUserOrders,
  createOrder,
  fetchAllOrdersAdmin,
  updateOrderStatus,
  deleteOrder,
  createOrderAdmin,
  type CreateOrderInput,
  type CreateOrderAdminInput,
} from '../services/orders'
import type { Order } from '../types'

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchUserOrders,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: fetchAllOrdersAdmin,
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })
}

export function useCreateOrderAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOrderAdminInput) => createOrderAdmin(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })
}
