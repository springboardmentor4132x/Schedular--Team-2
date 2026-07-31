import { useNavigate } from 'react-router-dom'
import BaseSidebar from '../../../shared/layouts/BaseSidebar'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CalendarClock,
  Calendar,
  Bell,
  User,
  Settings,
  Link
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/dashboard/creator/dashboard', Icon: LayoutDashboard },
  { label: 'My Posts', to: '/dashboard/creator/my-posts', Icon: FileText },
  { label: 'Create Post', to: '/dashboard/creator/create-post', Icon: PlusCircle },
  { label: 'Content Scheduling', to: '/dashboard/creator/content-scheduling', Icon: CalendarClock },
  { label: 'Publishing Calendar', to: '/dashboard/creator/publishing-calendar', Icon: Calendar },
  { label: 'Social Accounts', to: '/dashboard/creator/social-accounts', Icon: Link },
  { label: 'Notifications', to: '/dashboard/creator/notifications', Icon: Bell },
  { label: 'Profile', to: '/dashboard/creator/profile', Icon: User },
  { label: 'Settings', to: '/dashboard/creator/settings', Icon: Settings },
]

export default function CreatorSidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <BaseSidebar
      navItems={navItems}
      panelTitle="Creator Panel"
      brandBadge="Creator"
      user={{ name: 'Alex Creator', email: 'alex@orbitsocial.com', avatar: 'AC' }}
      onLogout={handleLogout}
    />
  )
}
