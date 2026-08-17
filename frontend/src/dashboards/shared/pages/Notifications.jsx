import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, CheckCircle2, XCircle, Info, Megaphone,
  Check, Trash2,
} from 'lucide-react'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from '../../../services/notificationService'

const TYPES = {
  success: { icon: CheckCircle2, color: '#22C55E', bg: 'rgba(34,197,94,.10)'   },
  error:   { icon: XCircle,      color: '#EF4444', bg: 'rgba(239,68,68,.10)'   },
  info:    { icon: Info,          color: '#1E3A8A', bg: 'rgba(30,58,138,.10)'   },
  campaign:{ icon: Megaphone,     color: '#F59E0B', bg: 'rgba(245,158,11,.10)'  },
}

const FILTERS = ['all','unread','success','error','campaign','info']

const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const diff = Math.max(0, Date.now() - date.getTime())
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

export default function Notifications() {
  const [items,   setItems]   = useState([])
  const [filter,  setFilter]  = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotifications()
      .then(setItems)
      .catch(err => console.error('Failed to load notifications', err))
      .finally(() => setLoading(false))
  }, [])

  const unreadCount = items.filter(n => !n.read).length

  const filtered = items.filter(n => {
    if (filter === 'all')    return true
    if (filter === 'unread') return !n.read
    return n.type === filter
  })

  const markRead = id => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read:true } : n))
    markNotificationRead(id).catch(err => console.error('Failed to mark read', err))
  }
  const markAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, read:true })))
    markAllNotificationsRead().catch(err => console.error('Failed to mark all read', err))
  }
  const deleteItem = id => {
    setItems(prev => prev.filter(n => n.id !== id))
    deleteNotification(id).catch(err => console.error('Failed to delete notification', err))
  }
  const clearAll = () => {
    setItems([])
    clearAllNotifications().catch(err => console.error('Failed to clear notifications', err))
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 h-9 rounded-[var(--r-md)] border text-xs font-semibold transition-all hover:shadow-[var(--shadow-sm)]"
                style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
                <Check size={13} /> Mark all read
              </button>
            )}
            {items.length > 0 && (
              <button onClick={clearAll}
                className="flex items-center gap-1.5 px-3 h-9 rounded-[var(--r-md)] border text-xs font-semibold transition-all hover:shadow-[var(--shadow-sm)]"
                style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--error)' }}>
                <Trash2 size={13} /> Clear all
              </button>
            )}
          </div>
        }
      />

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {FILTERS.map(f => {
          const meta = TYPES[f]; const active = filter === f; const Icon = meta?.icon
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
              style={{
                background:  active ? (meta?.bg ?? 'var(--primary-light)') : 'var(--card)',
                borderColor: active ? (meta?.color ?? 'var(--primary)')    : 'var(--border)',
                color:       active ? (meta?.color ?? 'var(--primary)')    : 'var(--text-muted)',
              }}>
              {Icon && <Icon size={11} />}
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'unread' && unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: 'var(--error)' }}>{unreadCount}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="card">
          <EmptyState
            icon={Bell}
            title={loading ? 'Loading notifications' : 'No notifications'}
            message={loading ? 'Fetching the latest activity…' : "You're all caught up. Notifications will appear here."}
          />
        </div>
      )}

      {/* Notification list */}
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {filtered.map((notif, i) => {
            const meta = TYPES[notif.type]; const Icon = meta.icon
            return (
              <motion.div key={notif.id}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, x:30, scale:0.96 }}
                transition={{ duration:0.18, delay: i * 0.03 }}
                onClick={() => markRead(notif.id)}
                // className="card p-4 flex items-start gap-4 cursor-pointer hover:shadow-[var(--shadow-md)] transition-all relative"
                className="group card p-4 flex items-start gap-4 cursor-pointer hover:shadow-[var(--shadow-md)] transition-all relative"
                style={{ borderLeft: !notif.read ? `3px solid ${meta.color}` : '3px solid transparent' }}
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: meta.bg }}>
                  <Icon size={17} style={{ color: meta.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {notif.title}
                      {!notif.read && (
                        <span className="ml-2 w-1.5 h-1.5 rounded-full inline-block align-middle"
                          style={{ background: meta.color }} />
                      )}
                    </p>
                    <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-subtle)' }}>{timeAgo(notif.created_at)}</span>
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{notif.message}</p>
                </div>

                {/* Delete */}
                <button
                  onClick={e => { e.stopPropagation(); deleteItem(notif.id) }}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-alt)] transition-all flex-shrink-0"
                  style={{ color: 'var(--text-subtle)' }}
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
