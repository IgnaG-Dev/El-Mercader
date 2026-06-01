import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
