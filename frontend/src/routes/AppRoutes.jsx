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

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard shell */}
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

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
