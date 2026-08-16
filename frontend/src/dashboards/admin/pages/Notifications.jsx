import { useState, useEffect } from 'react'
import {
  Bell,
  CheckCheck,
  Search,
  Send,
  Target,
  ShieldAlert,
  Shield,
  Users,
  Sparkles,
  AlertOctagon,
  Clock,
} from 'lucide-react'
import Card from '../../../shared/components/ui/Card'
import Button from '../../../shared/components/ui/Button'
import NotificationItem from '../components/notifications/NotificationItem'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../../services/notificationService'

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'unread', label: 'Unread', icon: Sparkles },
  { id: 'publishing', label: 'Publishing', icon: Send },
  { id: 'campaign', label: 'Campaigns', icon: Target },
  { id: 'account', label: 'Account', icon: Shield },
  { id: 'collaboration', label: 'Collaboration', icon: Users },
  { id: 'system', label: 'System', icon: ShieldAlert },
]

function isToday(value) {
  if (!value) return false
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return false
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const list = await getNotifications()
        if (!mounted) return
        setNotifications(list || [])
      } catch {
        if (!mounted) return
        setNotifications([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length
  const criticalCount = notifications.filter((n) => n.type === 'error').length
  const todayCount = notifications.filter((n) => isToday(n.created_at)).length

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch {
      // ignore backend errors — the UI already reflects the optimistic state
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      // ignore
    }
  }

  const filteredNotifications = notifications.filter((item) => {
    let matchesCategory = true
    if (selectedCategory === 'unread') {
      matchesCategory = !item.read
    } else if (selectedCategory !== 'all') {
      matchesCategory = item.category === selectedCategory
    }

    const matchesSearch =
      searchQuery.trim() === '' ||
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.message || '').toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* 1. Header Banner */}
      <section
        aria-label="Notifications Header"
        className="card relative overflow-hidden bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                System Activity & Alert Center
              </h1>
              {unreadCount > 0 && (
                <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles size={12} />
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs md:text-sm font-medium">
              Stay informed about platform events, creator status changes, system alerts, and campaign performance.
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

      {/* 2. Admin Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Alerts</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5 block">{notifications.length}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Bell size={17} />
          </div>
        </Card>

        <Card className="p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unread</span>
            <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 block">{unreadCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles size={17} />
          </div>
        </Card>

        <Card className="p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Critical</span>
            <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5 block">{criticalCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertOctagon size={17} />
          </div>
        </Card>

        <Card className="p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today</span>
            <span className="text-xl font-extrabold text-sky-600 dark:text-sky-400 mt-0.5 block">{todayCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Clock size={17} />
          </div>
        </Card>
      </div>

      {/* 3. Toolbar — Search & Category Tabs */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar py-0.5">
          {CATEGORIES.map((cat) => {
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
                {cat.id !== 'all' && cat.id !== 'unread' && (
                  <span className={`px-1.5 rounded-full text-[9px] font-extrabold ${isSelected ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                    {notifications.filter((n) => n.category === cat.id).length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

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

      {/* 4. Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card p-12 text-center text-xs text-slate-400">Loading notifications...</div>
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
