import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'
import type { UserRole } from '@/types/auth.types'
import { ROLE_DASHBOARD_ROUTES } from '@/types/auth.types'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

/**
 * Route guard for authenticated areas.
 *
 * The auth bootstrap (providers.tsx) guarantees that if a user is present in
 * the store, they are approved AND active. So this only needs to check:
 *   - auth still loading → spinner
 *   - not authenticated → /giris
 *   - authenticated but wrong role → their own dashboard
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/giris" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_DASHBOARD_ROUTES[user.role]} replace />
  }

  return <Outlet />
}
