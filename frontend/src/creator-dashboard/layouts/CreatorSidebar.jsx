import { useNavigate } from 'react-router-dom'
import BaseSidebar from '../../shared/layouts/BaseSidebar'
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle,
  CalendarClock, 
  Calendar, 
  Bell, 
  User, 
  Settings,
  Send,
  ListOrdered,
  ScrollText,
  AlertCircle,
  History,
  BarChart3
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/creator/dashboard', Icon: LayoutDashboard },
  { label: 'My Posts', to: '/creator/my-posts', Icon: FileText },
  {
    label: 'Content Scheduling',
    Icon: CalendarClock,
    children: [
      { label: 'Create Post', to: '/creator/create-post', Icon: PlusCircle },
      { label: 'Content Scheduling', to: '/creator/content-scheduling', Icon: CalendarClock },
    ],
  },
  { label: 'Publishing Calendar', to: '/creator/publishing-calendar', Icon: Calendar },
  {
    label: 'Publishing',
    Icon: Send,
    children: [
      { label: 'Overview', to: '/creator/publishing', Icon: LayoutDashboard },
      { label: 'Queue', to: '/creator/publishing/queue', Icon: ListOrdered },
      { label: 'Logs', to: '/creator/publishing/logs', Icon: ScrollText },
      { label: 'Failed Posts', to: '/creator/publishing/failed', Icon: AlertCircle },
      { label: 'Platform History', to: '/creator/publishing/history', Icon: History },
    ],
  },
  { label: 'Analytics', to: '/creator/analytics', Icon: BarChart3 },
  { label: 'Notifications', to: '/creator/notifications', Icon: Bell },
  { label: 'Profile', to: '/creator/profile', Icon: User },
  { label: 'Settings', to: '/creator/settings', Icon: Settings },
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
