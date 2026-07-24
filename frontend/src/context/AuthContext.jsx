import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axiosInstance from '../api/axios'

/**
 * AuthContext
 * Provides user state, login, register, logout, and role helpers to the app.
 * User object shape from /api/v1/auth/me:
 *   { id, username, email, role, first_name, last_name, phone, ... }
 * Persisted in localStorage as 'orbit-user' and 'orbit-token'.
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
  const [loading, setLoading] = useState(true)

  // Verify token on mount and fetch user profile
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('orbit-token')
      if (token) {
        try {
          const res = await axiosInstance.get('/api/v1/auth/me')
          setUser(res.data)
          saveUser(res.data)
        } catch (error) {
          // Response interceptor handles 401s and clears tokens
          setUser(null)
          saveUser(null)
        }
      } else {
        setUser(null)
        saveUser(null)
      }
      setLoading(false)
    }
    verifyToken()
  }, [])

  const login = useCallback(async (email, password) => {
    // FastAPI OAuth2PasswordBearer requires form-urlencoded data for login
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    const res = await axiosInstance.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const token = res.data.access_token
    localStorage.setItem('orbit-token', token)

    // Fetch user details immediately after login
    const userRes = await axiosInstance.get('/api/v1/auth/me')
    const userData = userRes.data

    setUser(userData)
    saveUser(userData)
    
    return userData
  }, [])

  const register = useCallback(async (userData) => {
    const res = await axiosInstance.post('/api/v1/auth/register', userData)
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('orbit-token')
    setUser(null)
    saveUser(null)
  }, [])

  const isAuthenticated = Boolean(user)
  const role            = user?.role ?? null
  const dashboardRoute  = ROLE_ROUTES[role] ?? '/'

  // Do not render children until initial token verification is complete
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading session...</div>
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, role, dashboardRoute }}>
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
