import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAllProfiles,
  updateProfile,
  updateUserRole,
  deleteProfile,
  createUserViaSignup,
} from '../services/profiles'

export function useUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchAllProfiles,
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; phone?: string; dni?: string } }) =>
      updateProfile(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'user' | 'admin' }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      email, password, name, role,
    }: { email: string; password: string; name: string; role?: 'user' | 'admin' }) =>
      createUserViaSignup(email, password, name, undefined, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}
