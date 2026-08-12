import { useLocation } from 'react-router-dom'
import { Bell, Menu, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import ThemeToggle from '../ThemeToggle'
import { useAuth } from '../../context/AuthContext'
import { useClient } from '../../context/ClientContext'
import { useNavigate } from "react-router-dom";
import { getNotifications } from '../../services/notificationService'

/**
 * TopBar — sticky top navigation inside the dashboard layout.
 * Props: isDark, onToggleTheme, onOpenMobileSidebar
 */

const ROUTE_LABELS = {
  '/dashboard/business':           'Dashboard',
  '/dashboard/marketing':          'Dashboard',
  '/dashboard/creator':            'Dashboard',
  '/dashboard/admin':              'Dashboard',
  // Business routes
  '/dashboard/marketing-teams':    'Marketing Teams',
  '/dashboard/marketing-activity': 'Marketing Activity',
  '/dashboard/connected-accounts': 'Connected Accounts',
  '/dashboard/campaigns':          'Campaigns',
  '/dashboard/scheduled-posts':    'Scheduled Posts',
  '/dashboard/published-posts':    'Published Posts',
  '/dashboard/reports':            'Reports',
  // Marketing Team routes
  '/dashboard/mkt/clients':        'Clients',
  '/dashboard/mkt/requests':       'Connection Requests',
  '/dashboard/mkt/workspace':      'Client Workspace',
  '/dashboard/mkt/queue':          'Publishing Queue',
  '/dashboard/mkt/connected-apps': 'Connected Apps',
  '/dashboard/mkt/content':        'Content Management',
  '/dashboard/mkt/content-library': 'Content Library',
  '/dashboard/mkt/content-review': 'Content Review',
  '/dashboard/mkt/scheduling':     'Content Scheduling',
  '/dashboard/mkt/calendar':       'Publishing Calendar',
  '/dashboard/mkt/campaigns':      'Campaign Management',
  '/dashboard/mkt/reports':        'Reports',
  '/dashboard/mkt/logs':           'Publishing Logs',
  '/dashboard/mkt/failed':         'Failed Posts',
  '/dashboard/mkt/history':        'Platform History',
  // Shared
  '/dashboard/analytics':          'Analytics',
  '/dashboard/notifications':      'Notifications',
  '/dashboard/profile':            'Profile',
  '/dashboard/settings':           'Settings',
}

export default function TopBar({ isDark, onToggleTheme, onOpenMobileSidebar }) {
  const { user } = useAuth()
  const { activeClient } = useClient()
  const { pathname } = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const navigate = useNavigate()

  const pageTitle = ROUTE_LABELS[pathname] ?? 'Dashboard'

  useEffect(() => {
    let mounted = true
    getNotifications()
      .then(items => { if (mounted) setUnreadCount(items.filter(n => !n.read).length) })
      .catch(() => { if (mounted) setUnreadCount(0) })
    return () => { mounted = false }
  }, [])

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sm:px-6 gap-4 flex-shrink-0 sticky top-0 z-30"
      style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        ...(isDark ? { boxShadow: '0 10px 30px rgba(0,0,0,.28)' } : {}),
      }}
    >
      {/* Left: mobile menu + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg transition-colors hover:bg-[var(--bg-alt)]"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1
            className="text-base sm:text-lg font-bold truncate"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
          >
            {pageTitle}
          </h1>
          {pathname.startsWith('/dashboard/mkt') && activeClient && (
            <p className="text-xs text-[var(--text-muted)] truncate mt-1">
              Managing: {activeClient.name}
            </p>
          )}
        </div>
      </div>

      {/* Right: search, notifications, theme, avatar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Search toggle */}
        <button
          onClick={() => setSearchOpen(v => !v)}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-alt)]"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => navigate("/dashboard/notifications")}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-alt)] relative"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {/* Unread badge — only when there are unread notifications */}
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white"
                style={{ background: 'var(--error)' }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

        {/* Avatar */}
        {user && (
          <div
            onClick={() => navigate("/dashboard/profile")}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer flex-shrink-0 overflow-hidden border"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--secondary))",
              borderColor: "var(--border)",
            }}
            title={user.name}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              user.name?.[0]?.toUpperCase() ?? "U"
            )}
          </div>
        )}

      {/* Inline search bar */}
      {searchOpen && (
        <div
          className="absolute top-16 left-0 right-0 px-4 py-3 border-b z-40"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <input
            autoFocus
            placeholder="Search posts, campaigns, drafts…"
            className="w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none transition-all"
            style={{
              background: 'var(--bg-alt)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
            onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
          />
        </div>
      )}
    </div>
    </header>
  )
}
