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
  Settings 
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/creator/dashboard', Icon: LayoutDashboard },
  { label: 'My Posts', to: '/creator/my-posts', Icon: FileText },
  { label: 'Create Post', to: '/creator/create-post', Icon: PlusCircle },
  { label: 'Content Scheduling', to: '/creator/content-scheduling', Icon: CalendarClock },
  { label: 'Publishing Calendar', to: '/creator/publishing-calendar', Icon: Calendar },
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
