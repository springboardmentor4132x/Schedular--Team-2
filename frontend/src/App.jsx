import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Public pages
import Landing       from './pages/Landing'
import RoleSelection from './pages/RoleSelection'
import Register      from './pages/Register'
import Login         from './pages/Login'
import Terms         from './pages/Terms'

// Dashboard layout
import DashboardLayout from './layouts/DashboardLayout'

// Role dashboards
import BusinessDashboard  from './pages/dashboard/BusinessDashboard'
import MarketingDashboard from './pages/dashboard/MarketingDashboard'
import CreatorDashboard   from './pages/dashboard/CreatorDashboard'
import AdminDashboard     from './pages/dashboard/AdminDashboard'

// Shared feature pages
import CreatePost        from './pages/dashboard/CreatePost'
import Calendar          from './pages/dashboard/Calendar'
import Drafts            from './pages/dashboard/Drafts'
import Queue             from './pages/dashboard/Queue'
import Logs              from './pages/dashboard/Logs'
import Analytics         from './pages/dashboard/Analytics'
import Notifications     from './pages/dashboard/Notifications'
import Settings          from './pages/dashboard/Settings'

// Business-only pages
import Campaigns         from './pages/dashboard/Campaigns'
import ConnectedAccounts from './pages/dashboard/ConnectedAccounts'
import Profile           from './pages/dashboard/Profile'

// Marketing-only pages
import AssignedCampaigns from './pages/dashboard/AssignedCampaigns'

// Route protection
import RoleGuard from './components/RoleGuard'

// Auth
import { useAuth } from './context/AuthContext'

/**
 * App
 * Role-based routing:
 *   Business  → full nav with Campaigns, Connected Accounts
 *   Marketing → Assigned Campaigns, Draft Review, no Create Campaign
 *   Creator / Admin → placeholder dashboards only
 *
 * RoleGuard redirects unauthorised roles to their own dashboard
 * instead of showing a 404 or the wrong page.
 */
export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('orbit-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('orbit-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const onToggleTheme = () => setIsDark(d => !d)
  const themeProps    = { isDark, onToggleTheme }

  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/"               element={<Landing        {...themeProps} />} />
      <Route path="/role-selection" element={<RoleSelection  {...themeProps} />} />
      <Route path="/register"       element={<Register       {...themeProps} />} />
      <Route path="/login"          element={<Login          {...themeProps} />} />
      <Route path="/terms"          element={<Terms          {...themeProps} />} />

      {/* ── Dashboard (auth-guarded by DashboardLayout) ── */}
      <Route path="/dashboard" element={<DashboardLayout {...themeProps} />}>

        {/* Index → role-specific home */}
        <Route index element={<RoleRedirect />} />

        {/* ── Role home pages ── */}
        <Route path="business"  element={<RoleGuard allowed={['business']}>  <BusinessDashboard  /></RoleGuard>} />
        <Route path="marketing" element={<RoleGuard allowed={['marketing']}> <MarketingDashboard /></RoleGuard>} />
        <Route path="creator"   element={<RoleGuard allowed={['creator']}>   <CreatorDashboard   /></RoleGuard>} />
        <Route path="admin"     element={<RoleGuard allowed={['administrator']}><AdminDashboard   /></RoleGuard>} />

        {/* ── Business-only routes ── */}
        <Route path="campaigns"
          element={<RoleGuard allowed={['business']}><Campaigns /></RoleGuard>} />
        <Route path="connected-accounts"
          element={<RoleGuard allowed={['business']}><ConnectedAccounts /></RoleGuard>} />

        {/* ── Marketing-only routes ── */}
        <Route path="assigned-campaigns"
          element={<RoleGuard allowed={['marketing']}><AssignedCampaigns /></RoleGuard>} />

        {/* ── Shared routes (Business + Marketing) ── */}
        <Route path="create-post"
          element={<RoleGuard allowed={['business','marketing']}><CreatePost /></RoleGuard>} />
        <Route path="calendar"
          element={<RoleGuard allowed={['business','marketing']}><Calendar /></RoleGuard>} />
        <Route path="drafts"
          element={<RoleGuard allowed={['business','marketing']}><Drafts /></RoleGuard>} />
        <Route path="queue"
          element={<RoleGuard allowed={['business','marketing']}><Queue /></RoleGuard>} />
        <Route path="logs"
          element={<RoleGuard allowed={['business','marketing']}><Logs /></RoleGuard>} />
        <Route path="analytics"
          element={<RoleGuard allowed={['business','marketing']}><Analytics /></RoleGuard>} />
        <Route path="notifications"
          element={<RoleGuard allowed={['business','marketing','creator','administrator']}><Notifications /></RoleGuard>} />
        <Route path="profile"
          element={<RoleGuard allowed={['business','marketing','creator','administrator']}><Profile {...themeProps} /></RoleGuard>} />
        <Route path="settings"
          element={<RoleGuard allowed={['business','marketing','creator','administrator']}><Settings {...themeProps} /></RoleGuard>} />

        {/* Unknown sub-path → role home */}
        <Route path="*" element={<RoleRedirect />} />
      </Route>

      {/* Global catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function RoleRedirect() {
  const { dashboardRoute } = useAuth()
  return <Navigate to={dashboardRoute} replace />
}
