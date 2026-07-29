import { Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import Dashboard from '../pages/Dashboard'
import Calendar from '../pages/Calendar'
import Analytics from '../pages/Analytics'
import Team from '../pages/Team'
import SocialAccounts from '../pages/SocialAccounts'
import AdminPlaceholder from '../pages/AdminPlaceholder'
import { Inbox, Profile, Settings } from '../../shared'

export const adminRoutes = (
  <Route element={<DashboardLayout />}>
    <Route path="/admin"              element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="/admin/dashboard"    element={<Dashboard />} />
    <Route path="/dashboard"          element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="/calendar"           element={<Calendar />} />
    <Route path="/analytics"          element={<Analytics />} />
    <Route path="/team"               element={<Team />} />
    <Route path="/inbox"              element={<Inbox />} />
    <Route path="/profile"            element={<Profile />} />
    <Route path="/settings"           element={<Settings />} />
    <Route path="/social-accounts"    element={<SocialAccounts />} />
    <Route path="/users"              element={<AdminPlaceholder title="Users"            description="Manage platform users here." />} />
    <Route path="/business-accounts"  element={<AdminPlaceholder title="Business Accounts" description="Manage business accounts here." />} />
    <Route path="/marketing-teams"    element={<AdminPlaceholder title="Marketing Teams"  description="Manage marketing teams here." />} />
    <Route path="/content-creators"   element={<AdminPlaceholder title="Content Creators" description="Manage content creators here." />} />
    <Route path="/reports"            element={<AdminPlaceholder title="Reports"          description="View reports here." />} />
  </Route>
)
