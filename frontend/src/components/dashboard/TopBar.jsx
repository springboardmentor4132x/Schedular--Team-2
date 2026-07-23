import { useLocation } from 'react-router-dom'
import { Bell, Menu, Search } from 'lucide-react'
import { useState } from 'react'
import ThemeToggle from '../ThemeToggle'
import { useAuth } from '../../context/AuthContext'

/**
 * TopBar — sticky top navigation inside the dashboard layout.
 * Props: isDark, onToggleTheme, onOpenMobileSidebar
 */

const ROUTE_LABELS = {
  '/dashboard/business':    'Dashboard',
  '/dashboard/marketing':   'Dashboard',
  '/dashboard/creator':     'Dashboard',
  '/dashboard/admin':       'Dashboard',
  '/dashboard/create-post': 'Create Post',
  '/dashboard/calendar':    'Publishing Calendar',
  '/dashboard/drafts':      'Drafts',
  '/dashboard/campaigns':   'Campaigns',
  '/dashboard/queue':       'Publishing Queue',
  '/dashboard/logs':        'Publishing Logs',
  '/dashboard/analytics':   'Analytics',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/profile':     'Business Profile',
  '/dashboard/settings':    'Settings',
}

export default function TopBar({ isDark, onToggleTheme, onOpenMobileSidebar }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)

  const pageTitle = ROUTE_LABELS[pathname] ?? 'Dashboard'

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sm:px-6 gap-4 flex-shrink-0 sticky top-0 z-30"
      style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
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
            className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-alt)] relative"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {/* Unread badge */}
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: 'var(--error)' }}
              aria-hidden="true"
            />
          </button>
        </div>

        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

        {/* Avatar */}
        {user && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
            title={user.name}
          >
            {user.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        )}
      </div>

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
    </header>
  )
}
