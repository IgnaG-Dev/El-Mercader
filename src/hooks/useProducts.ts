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
  fetchBestSellerIds,
  type CreateProductInput,
} from '../services/products'
import type { Product } from '../types'

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

export function useBestSellers(limit = 6) {
  const { data: allProducts = [], isLoading } = useProducts()
  const { data: ids = [] } = useQuery({
    queryKey: ['best-sellers', limit],
    queryFn: () => fetchBestSellerIds(limit),
    staleTime: 5 * 60 * 1000,
  })

  const products: Product[] = ids.length > 0
    ? ids.map((id) => allProducts.find((p) => p.id === id)).filter((p): p is Product => !!p)
    : allProducts.filter((p) => p.active !== false).slice(0, limit)

  return { products, isLoading }
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
