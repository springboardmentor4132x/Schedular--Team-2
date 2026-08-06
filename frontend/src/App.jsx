import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Public pages
import Landing       from './pages/Landing'
import RoleSelection from './pages/RoleSelection'
import Register      from './pages/Register'
import Login         from './pages/Login'
import Terms         from './pages/Terms'
import OAuthCallback from './pages/OAuthCallback'
import SocialAccountsRedirect from './pages/SocialAccountsRedirect'

// Dashboard areas grouped by responsibility
import {
  DashboardLayout,
  RoleGuard,
  AnalyticsPage,
  Notifications,
  Settings,
  Profile,
} from './dashboards/shared'
import {
  BusinessDashboard,
  Campaigns,
  ConnectedAccounts,
  MarketingTeams,
  ScheduledPosts,
  PublishedPosts,
  Reports,
  MarketingActivity,
} from './dashboards/business'
import {
  MarketingDashboard,
  MktClients,
  MktClientWorkspace,
  MktConnectedApps,
  MktContentManagement,
  MktContentLibrary,
  MktContentReview,
  MktContentScheduling,
  MktPublishingCalendar,
  MktCampaigns,
  MktReports,
  MktPublishingCenter,
  MktPublishingLogs,
  MktFailedPosts,
  MktPlatformHistory,
} from './dashboards/marketing'
import { adminRoutes } from './dashboards/admin'
import { creatorRoutes } from './dashboards/creator'
import { ThemeProvider } from './shared/context/ThemeContext'

// Route protection
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
    <ThemeProvider value={themeProps}>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"               element={<Landing       {...themeProps} />} />
        <Route path="/role-selection" element={<RoleSelection {...themeProps} />} />
        <Route path="/register"       element={<Register      {...themeProps} />} />
        <Route path="/login"          element={<Login         {...themeProps} />} />
        <Route path="/terms"          element={<Terms         {...themeProps} />} />
        <Route path="/oauth/callback" element={<OAuthCallback {...themeProps} />} />
        <Route path="/social-accounts" element={<SocialAccountsRedirect />} />

        {adminRoutes}
        {creatorRoutes}

        {/* ── Dashboard (auth-guarded by DashboardLayout) ── */}
        <Route path="/dashboard" element={<DashboardLayout {...themeProps} />}>

        {/* Index → role-specific home */}
        <Route index element={<RoleRedirect />} />

        {/* ── Role home dashboards ── */}
        <Route path="business"  element={<RoleGuard allowed={['business']}>      <BusinessDashboard  /></RoleGuard>} />
        <Route path="marketing" element={<RoleGuard allowed={['marketing']}>     <MarketingDashboard /></RoleGuard>} />

        {/* ── Business-only routes ── */}
        <Route path="campaigns"           element={<RoleGuard allowed={['business']}><Campaigns         /></RoleGuard>} />
        <Route path="connected-accounts"  element={<RoleGuard allowed={['business']}><ConnectedAccounts /></RoleGuard>} />
        <Route path="marketing-teams"     element={<RoleGuard allowed={['business']}><MarketingTeams    /></RoleGuard>} />
        <Route path="marketing-activity"  element={<RoleGuard allowed={['business']}><MarketingActivity /></RoleGuard>} />
        <Route path="scheduled-posts"     element={<RoleGuard allowed={['business']}><ScheduledPosts    /></RoleGuard>} />
        <Route path="published-posts"     element={<RoleGuard allowed={['business']}><PublishedPosts    /></RoleGuard>} />
        <Route path="reports"             element={<RoleGuard allowed={['business']}><Reports           /></RoleGuard>} />

        {/* ── Marketing Team routes (all under /dashboard/mkt/*) ── */}
        <Route path="mkt/clients"    element={<RoleGuard allowed={['marketing']}><MktClients           /></RoleGuard>} />
        <Route path="mkt/workspace"  element={<RoleGuard allowed={['marketing']}><MktClientWorkspace   /></RoleGuard>} />
        <Route path="mkt/connected-apps" element={<RoleGuard allowed={['marketing']}><MktConnectedApps /></RoleGuard>} />
        <Route path="mkt/content"    element={<RoleGuard allowed={['marketing']}><MktContentManagement /></RoleGuard>} />
        <Route path="mkt/content-library" element={<RoleGuard allowed={['marketing']}><MktContentLibrary /></RoleGuard>} />
        <Route path="mkt/content-review" element={<RoleGuard allowed={['marketing']}><MktContentReview /></RoleGuard>} />
        <Route path="mkt/scheduling" element={<RoleGuard allowed={['marketing']}><MktContentScheduling /></RoleGuard>} />
        <Route path="mkt/calendar"   element={<RoleGuard allowed={['marketing']}><MktPublishingCalendar /></RoleGuard>} />
        <Route path="mkt/campaigns"  element={<RoleGuard allowed={['marketing']}><MktCampaigns         /></RoleGuard>} />
        <Route path="mkt/reports"    element={<RoleGuard allowed={['marketing']}><MktReports           /></RoleGuard>} />
        <Route path="mkt/publishing" element={<RoleGuard allowed={['marketing']}><MktPublishingCenter /></RoleGuard>} />
        <Route path="mkt/publishing-logs" element={<RoleGuard allowed={['marketing']}><MktPublishingLogs /></RoleGuard>} />
        <Route path="mkt/publishing-failed" element={<RoleGuard allowed={['marketing']}><MktFailedPosts /></RoleGuard>} />
        <Route path="mkt/publishing-history" element={<RoleGuard allowed={['marketing']}><MktPlatformHistory /></RoleGuard>} />

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
    </ThemeProvider>
  )
}

function RoleRedirect() {
  const { dashboardRoute } = useAuth()
  return <Navigate to={dashboardRoute} replace />
}
