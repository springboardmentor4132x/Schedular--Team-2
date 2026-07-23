import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Dashboard from '../pages/Dashboard'
import Profile from '../pages/Profile'
import Settings from '../pages/Settings'
import SocialAccounts from '../pages/SocialAccounts'
import Calendar from '../pages/Calendar'
import Analytics from '../pages/Analytics'
import Team from '../pages/Team'
import Inbox from '../pages/Inbox'
import AdminPlaceholder from '../pages/AdminPlaceholder'

// Creator dashboard imports
import CreatorLayout from '../components/layout/CreatorLayout'
import CreatorDashboard from '../pages/CreatorDashboard'
import CreatorPlaceholder from '../pages/CreatorPlaceholder'
import MyPosts from '../pages/MyPosts'
import ContentScheduling from '../pages/ContentScheduling'
import PublishingCalendar from '../pages/PublishingCalendar'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard shell (Admin) */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/calendar"        element={<Calendar />} />
          <Route path="/analytics"       element={<Analytics />} />
          <Route path="/team"            element={<Team />} />
          <Route path="/inbox"           element={<Inbox />} />
          <Route path="/profile"         element={<Profile />} />
          <Route path="/settings"        element={<Settings />} />
          <Route path="/social-accounts" element={<SocialAccounts />} />
          {/* Admin placeholder routes */}
          <Route path="/users" element={<AdminPlaceholder title="Users" description="Manage platform users here." />} />
          <Route path="/business-accounts" element={<AdminPlaceholder title="Business Accounts" description="Manage business accounts here." />} />
          <Route key="/marketing-teams" path="/marketing-teams" element={<AdminPlaceholder title="Marketing Teams" description="Manage marketing teams here." />} />
          <Route path="/content-creators" element={<AdminPlaceholder title="Content Creators" description="Manage content creators here." />} />
          <Route path="/reports" element={<AdminPlaceholder title="Reports" description="View reports here." />} />
        </Route>

        {/* Creator Dashboard Layout & Routes */}
        <Route element={<CreatorLayout />}>
          <Route path="/creator" element={<Navigate to="/creator/dashboard" replace />} />
          <Route path="/creator/dashboard" element={<CreatorDashboard />} />
          <Route path="/creator/posts" element={<MyPosts />} />
          <Route path="/creator/scheduling" element={<ContentScheduling />} />
          <Route path="/creator/campaigns" element={<CreatorPlaceholder title="Campaigns" description="Manage sponsored brand promotions, tracking client requests, briefs, guidelines, and asset hand-ins." />} />
          <Route path="/creator/calendar" element={<PublishingCalendar />} />
          <Route path="/creator/notifications" element={<CreatorPlaceholder title="Notifications" description="Manage all notifications, direct reviewer feedback comments, and follower activities." />} />
          <Route path="/creator/profile" element={<CreatorPlaceholder title="Profile" description="Adjust your creator public details, profile biography, social links, and settings profile card." />} />
          <Route path="/creator/settings" element={<CreatorPlaceholder title="Settings" description="Customize content creation configurations, preferred platform integrations, and general workspace rules." />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
