import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'

// Public Pages
import Landing      from './pages/Landing'
import RoleSelection from './pages/RoleSelection'
import Register     from './pages/Register'
import Login        from './pages/Login'
import Terms        from './pages/Terms'

// Dashboard Pages & Layout
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import SocialAccounts from './pages/SocialAccounts'
import Calendar from './pages/Calendar'
import Analytics from './pages/Analytics'
import Team from './pages/Team'
import Inbox from './pages/Inbox'

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
  const themeProps = { isDark, onToggleTheme }

  return (
    <ThemeProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/"               element={<Landing        {...themeProps} />} />
        <Route path="/role-selection" element={<RoleSelection  {...themeProps} />} />
        <Route path="/register"       element={<Register       {...themeProps} />} />
        <Route path="/login"          element={<Login          {...themeProps} />} />
        <Route path="/terms"          element={<Terms          {...themeProps} />} />
        
        {/* Dashboard Protected Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/calendar"        element={<Calendar />} />
          <Route path="/analytics"       element={<Analytics />} />
          <Route path="/team"            element={<Team />} />
          <Route path="/inbox"           element={<Inbox />} />
          <Route path="/profile"         element={<Profile />} />
          <Route path="/settings"        element={<Settings />} />
          <Route path="/social-accounts" element={<SocialAccounts />} />
        </Route>

        {/* Catch-all */}
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}
