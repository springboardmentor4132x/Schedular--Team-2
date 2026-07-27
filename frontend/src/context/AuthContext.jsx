import { createContext, useContext, useState, useCallback } from 'react'
import { clearStoredProfileImage, getStoredProfileImage, saveStoredProfileImage } from '../services/profileImageService'

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
    if (!raw) return null

    const parsed = JSON.parse(raw)
    const storedAvatar = getStoredProfileImage()
    if (storedAvatar && !parsed.avatar) {
      parsed.avatar = storedAvatar
    }
    return parsed
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

  const login = useCallback((userData) => {
    const storedAvatar = getStoredProfileImage()
    const enriched = {
      id:     userData.id     ?? crypto.randomUUID(),
      name:   userData.name   ?? 'User',
      email:  userData.email  ?? '',
      role:   userData.role   ?? 'business',
      avatar: userData.avatar ?? storedAvatar ?? null,
    }
    setUser(enriched)
    saveUser(enriched)
  }, [])

  const updateAvatar = useCallback((avatar) => {
    setUser(prev => {
      const nextUser = prev ? { ...prev, avatar } : null
      if (nextUser) saveUser(nextUser)
      return nextUser
    })
    if (avatar) saveStoredProfileImage(avatar)
    else clearStoredProfileImage()
  }, [])

  const removeAvatar = useCallback(() => {
    setUser(prev => {
      const nextUser = prev ? { ...prev, avatar: null } : null
      if (nextUser) saveUser(nextUser)
      return nextUser
    })
    clearStoredProfileImage()
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    saveUser(null)
    clearStoredProfileImage()
  }, [])

  const isAuthenticated = Boolean(user)
  const role            = user?.role ?? null
  const dashboardRoute  = ROLE_ROUTES[role] ?? '/'

  return (
    <AuthContext.Provider value={{ user, login, logout, updateAvatar, removeAvatar, isAuthenticated, role, dashboardRoute }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
