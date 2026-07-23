import { createContext, useContext, useState, useCallback } from 'react'

/**
 * AuthContext
 * Provides user state, login, logout and role helpers to the whole app.
 * User object shape:
 *   { id, name, email, role, avatar }
 * Roles: 'business' | 'marketing' | 'creator' | 'administrator'
 * Persisted in localStorage as 'orbit-user'.
 */

const AuthContext = createContext(null)

// Role → default dashboard route
export const ROLE_ROUTES = {
  business:      '/dashboard/business',
  marketing:     '/dashboard/marketing',
  creator:       '/dashboard/creator',
  administrator: '/dashboard/admin',
}

// Role → human-readable label
export const ROLE_LABELS = {
  business:      'Business User',
  marketing:     'Marketing Team',
  creator:       'Content Creator',
  administrator: 'Administrator',
}

function loadUser() {
  try {
    const raw = localStorage.getItem('orbit-user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveUser(user) {
  try {
    if (user) localStorage.setItem('orbit-user', JSON.stringify(user))
    else localStorage.removeItem('orbit-user')
  } catch { /* ignore */ }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  // Call this after a successful API login
  const login = useCallback((userData) => {
    const enriched = {
      id:     userData.id     ?? crypto.randomUUID(),
      name:   userData.name   ?? 'User',
      email:  userData.email  ?? '',
      role:   userData.role   ?? 'business',
      avatar: userData.avatar ?? null,
    }
    setUser(enriched)
    saveUser(enriched)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    saveUser(null)
  }, [])

  // Quick role checks
  const isAuthenticated = Boolean(user)
  const role            = user?.role ?? null
  const dashboardRoute  = ROLE_ROUTES[role] ?? '/'

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, role, dashboardRoute }}>
      {children}
    </AuthContext.Provider>
  )
}

// Convenience hook
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
