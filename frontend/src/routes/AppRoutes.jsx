import { Routes, Route, Navigate } from 'react-router-dom'
import { useTheme } from '../shared/hooks/useTheme'
import { getAuthRoutes } from '../auth'
import { adminRoutes } from '../admin-dashboard'
import { creatorRoutes } from '../creator-dashboard'

export default function AppRoutes() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const themeProps = { isDark, onToggleTheme: toggleTheme }

  return (
    <Routes>
      {/* Auth & Marketing Routes */}
      {getAuthRoutes(themeProps)}

      {/* Admin Dashboard Routes */}
      {adminRoutes}

      {/* Creator Dashboard Routes */}
      {creatorRoutes}

      {/* Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
