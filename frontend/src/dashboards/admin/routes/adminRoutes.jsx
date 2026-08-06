import { Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import Dashboard from '../pages/Dashboard'
import Calendar from '../pages/Calendar'
import Team from '../pages/Team'
import UserTablePage from '../pages/UserTablePage'
import AdminPlaceholder from '../pages/AdminPlaceholder'
import AdminAnalyticsLayout from '../pages/Analytics/AdminAnalyticsLayout'
import AdminAnalyticsDashboard from '../pages/Analytics/AdminAnalyticsDashboard'
import AdminCreatorPerformance from '../pages/Analytics/AdminCreatorPerformance'
import AdminCampaignAnalytics from '../pages/Analytics/AdminCampaignAnalytics'
import AdminPlatformAnalytics from '../pages/Analytics/AdminPlatformAnalytics'
import AdminAudienceAnalytics from '../pages/Analytics/AdminAudienceAnalytics'
import AdminPerformanceTrends from '../pages/Analytics/AdminPerformanceTrends'
import { Inbox, Settings } from '../../shared'
import Profile from '../../shared/pages/Profile'

export const adminRoutes = (
  <Route element={<DashboardLayout />}>
    <Route path="/dashboard/admin"    element={<Navigate to="/dashboard/admin/dashboard" replace />} />
    <Route path="/dashboard/admin/dashboard" element={<Dashboard />} />
    <Route path="/calendar"           element={<Calendar />} />
    <Route path="/analytics" element={<AdminAnalyticsLayout />}>
      <Route index element={<AdminAnalyticsDashboard />} />
      <Route path="creators" element={<AdminCreatorPerformance />} />
      <Route path="campaigns" element={<AdminCampaignAnalytics />} />
      <Route path="platforms" element={<AdminPlatformAnalytics />} />
      <Route path="audience" element={<AdminAudienceAnalytics />} />
      <Route path="performance" element={<AdminPerformanceTrends />} />
    </Route>
    <Route path="/team"               element={<Team />} />
    <Route path="/inbox"              element={<Inbox />} />
    <Route path="/profile"            element={<Profile />} />
    <Route path="/settings"           element={<Settings />} />
    <Route path="/users"              element={<UserTablePage title="Users" description="Manage all platform users, roles and access." showAddUser />} />
    <Route path="/business-accounts"  element={<UserTablePage title="Business Accounts" description="Manage registered business accounts." roleFilter="business" />} />
    <Route path="/marketing-teams"    element={<UserTablePage title="Marketing Teams" description="Manage marketing teams and their members." roleFilter="marketing" />} />
    <Route path="/content-creators"   element={<UserTablePage title="Content Creators" description="Manage content creators on the platform." roleFilter="creator" />} />
    <Route path="/reports"            element={<AdminPlaceholder title="Reports"          description="View reports here." />} />
  </Route>
)
