import { Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import Dashboard from '../pages/Dashboard'
import Calendar from '../pages/Calendar'
import Team from '../pages/Team'
import SocialAccounts from '../pages/SocialAccounts'
import AdminPlaceholder from '../pages/AdminPlaceholder'
import AdminAnalyticsLayout from '../pages/Analytics/AdminAnalyticsLayout'
import AdminAnalyticsDashboard from '../pages/Analytics/AdminAnalyticsDashboard'
import AdminCreatorPerformance from '../pages/Analytics/AdminCreatorPerformance'
import AdminCampaignAnalytics from '../pages/Analytics/AdminCampaignAnalytics'
import AdminPlatformAnalytics from '../pages/Analytics/AdminPlatformAnalytics'
import AdminAudienceAnalytics from '../pages/Analytics/AdminAudienceAnalytics'
import AdminPerformanceTrends from '../pages/Analytics/AdminPerformanceTrends'
import { Inbox, Profile, Settings } from '../../shared'

import NotificationsPage from '../../shared/pages/NotificationsPage'
import ReportsPage from '../../shared/pages/ReportsPage'

import UsersManagement from '../pages/UsersManagement'
import BusinessAccountsManagement from '../pages/BusinessAccountsManagement'
import MarketingTeamsManagement from '../pages/MarketingTeamsManagement'
import ContentCreatorsManagement from '../pages/ContentCreatorsManagement'

export const adminRoutes = (
  <Route element={<DashboardLayout />}>
    {/* Admin Dashboard Core Routes */}
    <Route path="/admin"              element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="/admin/dashboard"    element={<Dashboard />} />
    <Route path="/dashboard"          element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="/calendar"           element={<Calendar />} />

    {/* Admin Analytics Module Routes (/admin/analytics and /analytics) */}
    <Route element={<AdminAnalyticsLayout />}>
      <Route path="/admin/analytics"            element={<AdminAnalyticsDashboard />} />
      <Route path="/admin/analytics/creators"   element={<AdminCreatorPerformance />} />
      <Route path="/admin/analytics/campaigns"  element={<AdminCampaignAnalytics />} />
      <Route path="/admin/analytics/platforms"  element={<AdminPlatformAnalytics />} />
      <Route path="/admin/analytics/audience"   element={<AdminAudienceAnalytics />} />
      <Route path="/admin/analytics/performance" element={<AdminPerformanceTrends />} />

      {/* Legacy / Direct /analytics paths */}
      <Route path="/analytics"            element={<AdminAnalyticsDashboard />} />
      <Route path="/analytics/creators"   element={<AdminCreatorPerformance />} />
      <Route path="/analytics/campaigns"  element={<AdminCampaignAnalytics />} />
      <Route path="/analytics/platforms"  element={<AdminPlatformAnalytics />} />
      <Route path="/analytics/audience"   element={<AdminAudienceAnalytics />} />
      <Route path="/analytics/performance" element={<AdminPerformanceTrends />} />
    </Route>

    {/* Admin Notifications Routes */}
    <Route path="/admin/notifications" element={<NotificationsPage role="admin" />} />
    <Route path="/notifications"       element={<NotificationsPage role="admin" />} />

    {/* Admin Reports Routes */}
    <Route path="/admin/reports"       element={<ReportsPage role="admin" />} />
    <Route path="/reports"             element={<ReportsPage role="admin" />} />

    {/* Admin User Management Routes */}
    <Route path="/admin/users"         element={<UsersManagement />} />
    <Route path="/users"               element={<UsersManagement />} />

    {/* Admin Business Accounts Routes */}
    <Route path="/admin/business-accounts" element={<BusinessAccountsManagement />} />
    <Route path="/business-accounts"       element={<BusinessAccountsManagement />} />

    {/* Admin Marketing Teams Routes */}
    <Route path="/admin/marketing-teams"   element={<MarketingTeamsManagement />} />
    <Route path="/marketing-teams"         element={<MarketingTeamsManagement />} />

    {/* Admin Content Creators Routes */}
    <Route path="/admin/content-creators"  element={<ContentCreatorsManagement />} />
    <Route path="/content-creators"        element={<ContentCreatorsManagement />} />

    {/* Admin Features & Shared Pages */}
    <Route path="/team"               element={<Team />} />
    <Route path="/inbox"              element={<Inbox />} />
    <Route path="/profile"            element={<Profile />} />
    <Route path="/settings"           element={<Settings />} />
    <Route path="/social-accounts"    element={<SocialAccounts />} />
  </Route>
)
