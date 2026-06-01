import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchProducts,
  fetchProduct,
  fetchProductBySlug,
  fetchAllProductsAdmin,
  updateProduct,
  deactivateProduct,
  createProduct,
  deleteProduct,
  type CreateProductInput,
} from '../services/products'

export function useProducts(category?: string) {
  return useQuery({
    queryKey: ['products', category ?? 'all'],
    queryFn: () => fetchProducts(category),
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  })
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', 'slug', slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  })
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: fetchAllProductsAdmin,
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateProduct>[1] }) =>
      updateProduct(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })
}

export function useDeactivateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deactivateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })
}
