import { useNavigate } from 'react-router-dom'
import BaseSidebar from '../../../shared/layouts/BaseSidebar'
import { useAuth } from '../../../context/AuthContext'
import {
  LayoutDashboard,
  FileText,
  CalendarClock,
  Calendar,
  Bell,
  User,
  Settings,
  Link,
  Megaphone,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/dashboard/creator/dashboard', Icon: LayoutDashboard },
  { label: 'My Posts', to: '/dashboard/creator/my-posts', Icon: FileText },
  { label: 'Content Scheduling', to: '/dashboard/creator/content-scheduling', Icon: CalendarClock },
  { label: 'Publishing Calendar', to: '/dashboard/creator/publishing-calendar', Icon: Calendar },
  { label: 'Campaigns', to: '/dashboard/creator/campaigns', Icon: Megaphone },
  { label: 'Social Accounts', to: '/dashboard/creator/social-accounts', Icon: Link },
  { label: 'Notifications', to: '/dashboard/creator/notifications', Icon: Bell },
  { label: 'Profile', to: '/dashboard/creator/profile', Icon: User },
  { label: 'Settings', to: '/dashboard/creator/settings', Icon: Settings },
]

export default function CreatorSidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const displayName = user?.name || 'Creator'
  const displayEmail = user?.email || ''
  const initials = displayName
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CR'

  return (
    <BaseSidebar
      navItems={navItems}
      panelTitle="Creator Panel"
      brandBadge="Creator"
      user={{ name: displayName, email: displayEmail, avatar: user?.avatar || initials }}
      onLogout={handleLogout}
    />
  )
}
