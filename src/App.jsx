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
import AnalyticsPage         from './pages/dashboard/Analytics'
import Notifications         from './pages/dashboard/Notifications'
import Settings              from './pages/dashboard/Settings'
import Profile               from './pages/dashboard/Profile'

// Business-only pages
import Campaigns         from './pages/dashboard/Campaigns'
import ConnectedAccounts from './pages/dashboard/ConnectedAccounts'
import MarketingTeams    from './pages/dashboard/MarketingTeams'
import ScheduledPosts    from './pages/dashboard/ScheduledPosts'
import PublishedPosts    from './pages/dashboard/PublishedPosts'
import Reports           from './pages/dashboard/Reports'
import MarketingActivity from './pages/dashboard/MarketingActivity'

// Marketing Team pages (under /dashboard/mkt/*)
import MktClients            from './pages/dashboard/mkt/Clients'
import MktClientWorkspace    from './pages/dashboard/mkt/ClientWorkspace'
import MktConnectedApps      from './pages/dashboard/mkt/ConnectedApps'
import MktContentManagement  from './pages/dashboard/mkt/ContentManagement'
import MktContentScheduling  from './pages/dashboard/mkt/ContentScheduling'
import MktPublishingCalendar from './pages/dashboard/mkt/PublishingCalendar'
import MktPublishingCenter   from './pages/dashboard/mkt/PublishingCenter'
import MktCampaigns          from './pages/dashboard/mkt/CampaignManagement'
import MktMarketingReports   from './pages/dashboard/mkt/MarketingReports'
import PublishingDashboard   from './pages/dashboard/PublishingDashboard'
import MktPublishingLogs     from './pages/dashboard/mkt/PublishingLogs'
import MktFailedPosts        from './pages/dashboard/mkt/FailedPosts'
import MktPlatformHistory    from './pages/dashboard/mkt/PlatformHistory'

// Route protection
import RoleGuard from './components/RoleGuard'

// Auth
import { useAuth } from './context/AuthContext'

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
      <Route path="/"               element={<Landing       {...themeProps} />} />
      <Route path="/role-selection" element={<RoleSelection {...themeProps} />} />
      <Route path="/register"       element={<Register      {...themeProps} />} />
      <Route path="/login"          element={<Login         {...themeProps} />} />
      <Route path="/terms"          element={<Terms         {...themeProps} />} />

      {/* ── Dashboard (auth-guarded by DashboardLayout) ── */}
      <Route path="/dashboard" element={<DashboardLayout {...themeProps} />}>

        {/* Index → role-specific home */}
        <Route index element={<RoleRedirect />} />

        {/* ── Role home dashboards ── */}
        <Route path="business"  element={<RoleGuard allowed={['business']}>      <BusinessDashboard  /></RoleGuard>} />
        <Route path="marketing" element={<RoleGuard allowed={['marketing']}>     <MarketingDashboard /></RoleGuard>} />
        <Route path="creator"   element={<RoleGuard allowed={['creator']}>       <CreatorDashboard   /></RoleGuard>} />
        <Route path="admin"     element={<RoleGuard allowed={['administrator']}> <AdminDashboard     /></RoleGuard>} />

        {/* ── Business-only routes ── */}
        <Route path="campaigns"           element={<RoleGuard allowed={['business']}><Campaigns         /></RoleGuard>} />
        <Route path="connected-accounts"  element={<RoleGuard allowed={['business']}><ConnectedAccounts /></RoleGuard>} />
        <Route path="marketing-teams"     element={<RoleGuard allowed={['business']}><MarketingTeams    /></RoleGuard>} />
        <Route path="marketing-activity"  element={<RoleGuard allowed={['business']}><MarketingActivity /></RoleGuard>} />
        <Route path="scheduled-posts"     element={<RoleGuard allowed={['business']}><ScheduledPosts    /></RoleGuard>} />
        <Route path="published-posts"     element={<RoleGuard allowed={['business']}><PublishedPosts    /></RoleGuard>} />
        <Route path="publishing"          element={<RoleGuard allowed={['business','marketing']}><PublishingDashboard /></RoleGuard>} />
        <Route path="reports"             element={<RoleGuard allowed={['business']}><Reports           /></RoleGuard>} />

        {/* ── Marketing Team routes (all under /dashboard/mkt/*) ── */}
        <Route path="mkt/clients"    element={<RoleGuard allowed={['marketing']}><MktClients           /></RoleGuard>} />
        <Route path="mkt/workspace"  element={<RoleGuard allowed={['marketing']}><MktClientWorkspace   /></RoleGuard>} />
        <Route path="mkt/connected-accounts" element={<RoleGuard allowed={['marketing']}><MktConnectedApps /></RoleGuard>} />
        <Route path="mkt/content"    element={<RoleGuard allowed={['marketing']}><MktContentManagement /></RoleGuard>} />
        <Route path="mkt/scheduling" element={<RoleGuard allowed={['marketing']}><MktContentScheduling /></RoleGuard>} />
        <Route path="mkt/calendar"   element={<RoleGuard allowed={['marketing']}><MktPublishingCalendar /></RoleGuard>} />
        <Route path="mkt/queue"      element={<RoleGuard allowed={['marketing']}><MktPublishingCenter  /></RoleGuard>} />
        <Route path="mkt/logs"       element={<RoleGuard allowed={['marketing']}><MktPublishingLogs /></RoleGuard>} />
        <Route path="mkt/failed"     element={<RoleGuard allowed={['marketing']}><MktFailedPosts /></RoleGuard>} />
        <Route path="mkt/history"    element={<RoleGuard allowed={['marketing']}><MktPlatformHistory /></RoleGuard>} />
        <Route path="mkt/campaigns"  element={<RoleGuard allowed={['marketing']}><MktCampaigns         /></RoleGuard>} />
        <Route path="mkt/reports"    element={<RoleGuard allowed={['marketing']}><MktMarketingReports  /></RoleGuard>} />

        {/* ── Shared (both roles) ── */}
        <Route path="analytics"     element={<RoleGuard allowed={['business','marketing']}><AnalyticsPage    /></RoleGuard>} />
        <Route path="notifications" element={<RoleGuard allowed={['business','marketing']}><Notifications /></RoleGuard>} />
        <Route path="profile"       element={<RoleGuard allowed={['business','marketing']}><Profile {...themeProps} /></RoleGuard>} />
        <Route path="settings"      element={<RoleGuard allowed={['business','marketing']}><Settings {...themeProps} /></RoleGuard>} />

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
