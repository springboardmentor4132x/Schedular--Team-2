import React from 'react'
import { useNavigate } from 'react-router-dom'
import BaseSidebar from './BaseSidebar'
import { 
  LayoutDashboard, 
  FileText, 
  CalendarClock, 
  Megaphone, 
  Calendar, 
  Bell, 
  User, 
  Settings 
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/creator/dashboard', Icon: LayoutDashboard },
  { label: 'My Posts', to: '/creator/posts', Icon: FileText },
  { label: 'Content Scheduling', to: '/creator/scheduling', Icon: CalendarClock },
  { label: 'Campaigns', to: '/creator/campaigns', Icon: Megaphone },
  { label: 'Publishing Calendar', to: '/creator/calendar', Icon: Calendar },
  { label: 'Notifications', to: '/creator/notifications', Icon: Bell },
  { label: 'Profile', to: '/creator/profile', Icon: User },
  { label: 'Settings', to: '/creator/settings', Icon: Settings },
]

export default function CreatorSidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    alert('Simulated Content Creator logout successful!')
    navigate('/dashboard')
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
