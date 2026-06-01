import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchCategories,
  fetchCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryInput,
} from '../services/categories'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchCategoriesAdmin,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CategoryInput> }) =>
      updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    },
  })
}
