import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAddresses,
  createAddress,
  setDefaultAddress,
  deleteAddress,
} from '../services/addresses'
import type { Address } from '../types'

export function useAddresses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
    enabled: options?.enabled !== false,
  })
}

export function useCreateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (addr: Omit<Address, 'id'>) => createAddress(addr),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  })
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  })
}
