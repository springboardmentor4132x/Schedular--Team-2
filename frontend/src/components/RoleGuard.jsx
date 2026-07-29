import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * RoleGuard
 * Wraps a route element and redirects to the user's own dashboard
 * if their role is not in the `allowed` array.
 *
 * Usage:
 *   <Route path="campaigns" element={
 *     <RoleGuard allowed={['business']}>
 *       <Campaigns />
 *     </RoleGuard>
 *   } />
 *
 * Props:
 *   allowed  — string[]  — roles that may access this route
 *   children — ReactNode — the protected page component
 */
export default function RoleGuard({ allowed, children }) {
  const { role, dashboardRoute, isAuthenticated } = useAuth()

  // DashboardLayout already handles the unauthenticated case,
  // but guard defensively here too.
  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (!allowed.includes(role)) {
    return <Navigate to={dashboardRoute} replace />
  }

  return children
}
