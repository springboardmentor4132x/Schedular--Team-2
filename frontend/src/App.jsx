import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing      from './pages/Landing'
import RoleSelection from './pages/RoleSelection'
import Register     from './pages/Register'
import Login        from './pages/Login'
import Terms        from './pages/Terms'

/**
 * App — root component
 * Manages dark/light theme state + all routes
 * Theme is stored in localStorage as 'orbit-theme'
 */
export default function App() {
  
  // Read saved theme from localStorage, fall back to OS preference
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('orbit-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Apply 'dark' class to <html> and save to localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('orbit-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const onToggleTheme = () => setIsDark(d => !d)

  // Pass isDark + onToggleTheme as props — no Context API needed
  const themeProps = { isDark, onToggleTheme }

  return (
    <Routes>
      <Route path="/"               element={<Landing        {...themeProps} />} />
      <Route path="/role-selection" element={<RoleSelection  {...themeProps} />} />
      <Route path="/register"       element={<Register       {...themeProps} />} />
      <Route path="/login"          element={<Login          {...themeProps} />} />
      <Route path="/terms"          element={<Terms          {...themeProps} />} />
      {/* Catch-all → home */}
      <Route path="*"               element={<Navigate to="/" replace />} />
    </Routes>
  )
}
