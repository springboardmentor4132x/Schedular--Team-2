import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  Search,
  Calendar,
  Send,
  Target,
  Shield,
  ShieldAlert,
  Users,
  UserCheck,
  Building2,
  BarChart2,
  FileText,
  Sparkles,
  AlertOctagon,
  Clock
} from 'lucide-react'
import {
  getNotifications,
  getUnreadCount,
  getSummaryStats,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/notificationService'
import NotificationItem from '../components/notifications/NotificationItem'
import Card from '../components/ui/Card'
import Button from '../components/Button'

export default function NotificationsPage({ role: propRole }) {
  const location = useLocation()

  // Determine role based on route prefix or props
  const role =
    propRole ||
    (location.pathname.startsWith('/admin') || location.pathname.startsWith('/analytics')
      ? 'admin'
      : 'creator')

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [stats, setStats] = useState({ total: 0, unread: 0, critical: 0, today: 0 })
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchNotificationsData = async () => {
    const list = await getNotifications(role)
    setNotifications(list)
    const count = await getUnreadCount(role)
    setUnreadCount(count)
    const summary = await getSummaryStats(role)
    setStats(summary)
    setLoading(false)
  }

  useEffect(() => {
    fetchNotificationsData()
  }, [role])

  const handleMarkAsRead = async (id) => {
    const updated = await markNotificationAsRead(id, role)
    setNotifications(updated)
    const count = await getUnreadCount(role)
    setUnreadCount(count)
    const summary = await getSummaryStats(role)
    setStats(summary)
  }

  const handleMarkAllAsRead = async () => {
    const updated = await markAllNotificationsAsRead(role)
    setNotifications(updated)
    setUnreadCount(0)
    const summary = await getSummaryStats(role)
    setStats(summary)
  }

  // Role-Aware Categories
  const adminCategories = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'unread', label: 'Unread', icon: Sparkles },
    { id: 'security', label: 'Security', icon: ShieldAlert },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'creators', label: 'Creators', icon: UserCheck },
    { id: 'business', label: 'Business Accounts', icon: Building2 },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'publishing', label: 'Publishing', icon: Send },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'reports', label: 'Reports', icon: FileText }
  ]

  const creatorCategories = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar },
    { id: 'publishing', label: 'Publishing', icon: Send },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'team', label: 'Team', icon: Users }
  ]

  const categories = role === 'admin' ? adminCategories : creatorCategories

  // Filtered Notifications Logic
  const filteredNotifications = notifications.filter((item) => {
    let matchesCategory = true
    if (selectedCategory === 'unread') {
      matchesCategory = !item.read
    } else if (selectedCategory !== 'all') {
      matchesCategory = item.category === selectedCategory
    }

    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.relatedEntity &&
        (typeof item.relatedEntity === 'object'
          ? item.relatedEntity.name
          : item.relatedEntity
        )
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* 1. Header Banner */}
      <section aria-label="Notifications Header" className="card relative overflow-hidden bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {role === 'admin' ? 'System Activity & Alert Center' : 'Notifications'}
              </h1>
              {unreadCount > 0 && (
                <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles size={12} />
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs md:text-sm font-medium">
              {role === 'admin'
                ? 'Stay informed about platform events, creator status changes, system alerts, and campaign performance.'
                : 'Stay updated with your scheduled posts, publishing status, campaigns, reviewer feedback, and team alerts.'}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 font-bold text-xs"
            >
              <CheckCheck size={14} />
              <span>Mark All as Read</span>
            </Button>
          )}
        </div>
      </section>

      {/* 2. Admin Compact Summary Bar */}
      {role === 'admin' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Alerts</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5 block">{stats.total}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell size={17} />
            </div>
          </Card>

          <Card className="p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unread</span>
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 block">{stats.unread}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles size={17} />
            </div>
          </Card>

          <Card className="p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Critical</span>
              <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5 block">{stats.critical}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertOctagon size={17} />
            </div>
          </Card>

          <Card className="p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today</span>
              <span className="text-xl font-extrabold text-sky-600 dark:text-sky-400 mt-0.5 block">{stats.today}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Clock size={17} />
            </div>
          </Card>
        </div>
      )}

      {/* 3. Toolbar — Search & Category Filter Tabs */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200/80 dark:border-slate-800">
        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const IconComponent = cat.icon
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <IconComponent size={14} />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>
      </Card>

      {/* 4. Main Notifications List Container */}
      <div className="space-y-3">
        {loading ? (
          <div className="card p-12 text-center text-xs text-slate-400">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="card p-12 text-center space-y-3 border border-slate-200/80 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Bell size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Notifications Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all'
                ? 'No notifications match your search query or selected category filter.'
                : 'You are all caught up! There are no notifications at this time.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <NotificationItem
              key={item.id}
              notification={item}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        )}
      </div>
    </div>
  )
}
