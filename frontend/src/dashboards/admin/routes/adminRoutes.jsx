import { Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import Dashboard from '../pages/Dashboard'
import Calendar from '../pages/Calendar'
import Team from '../pages/Team'
import UsersManagement from '../pages/UsersManagement'
import BusinessAccountsManagement from '../pages/BusinessAccountsManagement'
import MarketingTeamsManagement from '../pages/MarketingTeamsManagement'
import ContentCreatorsManagement from '../pages/ContentCreatorsManagement'
import AdminAnalyticsLayout from '../pages/Analytics/AdminAnalyticsLayout'
import AdminAnalyticsDashboard from '../pages/Analytics/AdminAnalyticsDashboard'
import AdminCreatorPerformance from '../pages/Analytics/AdminCreatorPerformance'
import AdminCampaignAnalytics from '../pages/Analytics/AdminCampaignAnalytics'
import AdminPlatformAnalytics from '../pages/Analytics/AdminPlatformAnalytics'
import AdminAudienceAnalytics from '../pages/Analytics/AdminAudienceAnalytics'
import AdminPerformanceTrends from '../pages/Analytics/AdminPerformanceTrends'
import Reports from '../pages/Reports'
import Notifications from '../pages/Notifications'
import { Inbox, Settings } from '../../shared'
import Profile from '../../shared/pages/Profile'

export const adminRoutes = (
  <Route element={<DashboardLayout />}>
    <Route path="/dashboard/admin"    element={<Navigate to="/dashboard/admin/dashboard" replace />} />
    <Route path="/dashboard/admin/dashboard" element={<Dashboard />} />
    <Route path="/calendar"           element={<Calendar />} />
    <Route path="/analytics" element={<AdminAnalyticsLayout />}>
      <Route index element={<AdminAnalyticsDashboard />} />
      <Route path="creators"    element={<AdminCreatorPerformance />} />
      <Route path="campaigns"   element={<AdminCampaignAnalytics />} />
      <Route path="platforms"   element={<AdminPlatformAnalytics />} />
      <Route path="audience"    element={<AdminAudienceAnalytics />} />
      <Route path="performance" element={<AdminPerformanceTrends />} />
    </Route>
    <Route path="/team"               element={<Team />} />
    <Route path="/inbox"              element={<Inbox />} />
    <Route path="/notifications"      element={<Notifications />} />
    <Route path="/profile"            element={<Profile />} />
    <Route path="/settings"           element={<Settings />} />
    <Route path="/users"              element={<UsersManagement />} />
    <Route path="/business-accounts"  element={<BusinessAccountsManagement />} />
    <Route path="/marketing-teams"    element={<MarketingTeamsManagement />} />
    <Route path="/content-creators"   element={<ContentCreatorsManagement />} />
    <Route path="/reports"            element={<Reports />} />
  </Route>
)
