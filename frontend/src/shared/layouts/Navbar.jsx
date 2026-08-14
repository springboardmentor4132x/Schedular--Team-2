import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { useSidebar } from '../hooks/useSidebar'
import NotificationCenter from '../components/notifications/NotificationCenter'
import CommandPalette from '../components/navigation/CommandPalette'

const pageTitles = {
  '/admin/dashboard': { label: 'Admin Dashboard', sub: 'Manage the OrbitSocial platform, creators, campaigns, analytics, and system operations.' },
  '/dashboard': { label: 'Admin Dashboard',  sub: 'Manage the OrbitSocial platform, creators, campaigns, analytics, and system operations.' },
  '/admin': { label: 'Admin Dashboard', sub: 'Manage the OrbitSocial platform, creators, campaigns, analytics, and system operations.' },
  '/calendar':  { label: 'Calendar',   sub: 'Manage your scheduled posts' },
  '/analytics': { label: 'Admin Analytics Overview',  sub: 'System-wide performance, creator metrics, and campaign ROI' },
  '/analytics/creators': { label: 'Creator Performance Matrix', sub: 'Granular creator performance, engagement, reach, and status' },
  '/analytics/campaigns': { label: 'Admin Campaign Analytics', sub: 'Campaign ROI, participant count, and completion benchmarks' },
  '/analytics/platforms': { label: 'System Platform Analytics', sub: 'Comparative analytics across Instagram, Facebook, LinkedIn, X, etc.' },
  '/analytics/audience': { label: 'System Audience Demographics', sub: 'Age, gender, country, city, language, and active hours' },
  '/analytics/performance': { label: 'System Performance Trends', sub: 'Historical system-wide performance trends across timeframes' },
  '/team':      { label: 'Team',       sub: 'Manage team members' },
  '/inbox':     { label: 'Inbox',      sub: 'Your messages and notifications' },
  '/profile':   { label: 'My Profile', sub: 'Manage your personal information' },
  '/settings':  { label: 'Account Settings', sub: 'Manage your OrbitSocial account preferences and security' },
  '/social-accounts': { label: 'Social Accounts', sub: 'Manage all connected social media platforms from one place' },
  '/business-accounts': { label: 'Business Accounts', sub: 'Manage business accounts, connected platforms, campaigns, and account activity.' },
  '/admin/business-accounts': { label: 'Business Accounts', sub: 'Manage business accounts, connected platforms, campaigns, and account activity.' },
  '/marketing-teams': { label: 'Marketing Teams', sub: 'Manage teams, members, business accounts, and campaign responsibilities.' },
  '/admin/marketing-teams': { label: 'Marketing Teams', sub: 'Manage teams, members, business accounts, and campaign responsibilities.' },
  '/content-creators': { label: 'Content Creators', sub: 'Manage creators, performance, campaigns, and connected social platforms.' },
  '/admin/content-creators': { label: 'Content Creators', sub: 'Manage creators, performance, campaigns, and connected social platforms.' },
  '/creator/dashboard': { label: 'Creator Dashboard', sub: 'Welcome back, Creator 👋' },
  '/creator/my-posts': { label: 'My Posts', sub: 'Manage your created posts and drafts' },
  '/creator/posts': { label: 'My Posts', sub: 'Manage your created posts and drafts' },
  '/creator/create-post': { label: 'Create Post', sub: 'Compose, schedule, and publish new content' },
  '/creator/content-scheduling': { label: 'Content Scheduling', sub: 'Plan your content publishing times' },
  '/creator/scheduling': { label: 'Content Scheduling', sub: 'Plan your content publishing times' },
  '/creator/campaigns': { label: 'Campaigns', sub: 'Track campaign collaborations' },
  '/creator/publishing-calendar': { label: 'Publishing Calendar', sub: 'Visual schedule of posts' },
  '/creator/calendar': { label: 'Publishing Calendar', sub: 'Visual schedule of posts' },
  '/reports': { label: 'Reports & Export', sub: 'Generate, inspect, and export system-wide analytics, campaigns, and audience reports' },
  '/admin/reports': { label: 'Admin Reports & Export', sub: 'Generate, inspect, and export system-wide analytics, campaigns, and audience reports' },
  '/creator/reports': { label: 'Creator Reports & Export', sub: 'Generate, inspect, and export content engagement, campaign deliverables, and growth reports' },
  '/creator/notifications': { label: 'Notifications', sub: 'Stay updated with your audience and reviewer feedback' },
  '/creator/profile': { label: 'Creator Profile', sub: 'Manage your creator profile details' },
  '/creator/settings': { label: 'Creator Settings', sub: 'Manage your creator preference settings' },
  '/creator/analytics': { label: 'Creator Analytics', sub: 'Track performance, audience growth, campaign ROI, and platform comparisons' },
  '/creator/analytics/content': { label: 'Content Analytics', sub: 'Granular metrics for individual published posts across platforms' },
  '/creator/analytics/audience': { label: 'Audience Analytics', sub: 'Follower growth, demographics, and active times' },
  '/creator/analytics/campaigns': { label: 'Campaign Analytics', sub: 'Sponsored promotions, ROI tracking, and campaign benchmarks' },
  '/creator/analytics/platforms': { label: 'Platform Comparison', sub: 'Comparative analytics across all connected platforms' },
  '/users': { label: 'User Management', sub: 'Manage user profiles, roles, authentication status, and platform access permissions.' },
  '/admin/users': { label: 'User Management', sub: 'Manage user profiles, roles, authentication status, and platform access permissions.' },
  '/admin/notifications': { label: 'System Notifications', sub: 'Stay informed about platform events, user activity, and critical system alerts.' },
  '/notifications': { label: 'System Notifications', sub: 'Stay informed about platform events, user activity, and critical system alerts.' },
  '/creator/publishing': { label: 'Publishing Dashboard', sub: 'Manage your publishing workflow, queue status, and platform activity.' },
  '/creator/publishing/queue': { label: 'Publishing Queue', sub: 'Inspect scheduled posts, upcoming publishing windows, and priority dispatch.' },
  '/creator/publishing/logs': { label: 'Publishing Logs', sub: 'Review live publishing audit trails, platform response codes, and timestamps.' },
  '/creator/publishing/failed': { label: 'Failed Posts', sub: 'Diagnose publishing errors, inspect API messages, and retry failed transmissions.' },
  '/creator/publishing/history': { label: 'Platform History', sub: 'Historical records of all successful and dispatched multi-platform posts.' },
}

const getPageMeta = (pathname) => {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.startsWith('/creator/analytics')) {
    return { label: 'Creator Analytics', sub: 'Track performance, audience growth, campaign ROI, and platform comparisons' }
  }
  if (pathname.startsWith('/admin') || pathname === '/dashboard') {
    return { label: 'Admin Dashboard', sub: 'Manage the OrbitSocial platform, creators, campaigns, analytics, and system operations.' }
  }
  return { label: 'Admin Dashboard', sub: 'Manage the OrbitSocial platform, creators, campaigns, analytics, and system operations.' }
}

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-5 h-5">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-4 h-4 text-slate-400 dark:text-slate-500">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-4 h-4" aria-hidden="true">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-4 h-4" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

export default function Navbar() {
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const page = getPageMeta(pathname)

  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const notifRef = useRef(null)
  const userMenuRef = useRef(null)

  const handleLogout = () => {
    setShowUserMenu(false)
    navigate('/login')
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(prev => !prev)
      } else if (e.key === 'Escape') {
        setShowNotifications(false)
        setShowUserMenu(false)
      }
    }

    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  const sidebarCtx = useSidebar()

  return (
    <header className="relative flex items-center justify-between px-6 py-4
                       bg-card
                       border-b border-default z-20">
      <div className="flex items-center gap-3">
        {sidebarCtx && (
          <button
            type="button"
            onClick={sidebarCtx.toggleMobile}
            className="p-2 -ml-2 rounded-lg text-secondary hover:bg-hover md:hidden focus:outline-none"
            aria-label="Open mobile menu"
          >
            <MenuIcon />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-primary leading-tight">
            {page.label}
          </h1>
          {page.sub && (
            <p className="text-sm text-secondary mt-0.5">{page.sub}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Command Palette Trigger */}
        <div 
          onClick={() => setIsCommandPaletteOpen(true)}
          className="relative hidden sm:flex items-center cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsCommandPaletteOpen(true); } }}
          title="Open Command Palette (Ctrl+K / ⌘K)"
        >
          <span className="absolute left-3 pointer-events-none text-secondary group-hover:text-primary transition-colors">
            <SearchIcon />
          </span>
          <input
            id="navbar-search"
            type="text"
            readOnly
            placeholder="Search or press ⌘K…"
            className="pl-9 pr-14 py-2 text-xs md:text-sm
                       bg-surface
                       border border-default
                       text-primary
                       placeholder:text-secondary
                       rounded-lg focus:outline-none focus:ring-2
                       focus:ring-indigo-300 focus:border-indigo-400
                       w-56 transition-all duration-150 cursor-pointer group-hover:border-indigo-400/50"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-secondary bg-card border border-default shadow-xs pointer-events-none">
            ⌘K
          </kbd>
        </div>

        <button
          id="navbar-theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-lg text-secondary
                     hover:bg-hover
                     hover:text-primary
                     transition-colors duration-150
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        <div className="relative" ref={notifRef}>
          {/* Notification Center Popover */}
          <NotificationCenter />
        </div>

        <div className="w-px h-6 bg-surface border-r border-default" />

        <div className="relative" ref={userMenuRef}>
          <button
            id="navbar-user-menu"
            type="button"
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              setShowNotifications(false)
            }}
            className={`flex items-center gap-2 rounded-lg p-1 transition-colors duration-150 focus:outline-none ${
              showUserMenu
                ? 'bg-hover'
                : 'hover:bg-hover'
            }`}
            aria-label="User menu"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600
                            flex items-center justify-center text-white text-xs font-bold shadow-sm">
              JD
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`w-4 h-4 text-secondary transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-card rounded-2xl shadow-card-lg border border-default overflow-hidden transform origin-top-right transition-all duration-200 ease-out z-50">
              <div className="p-4 bg-surface border-b border-default flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                  JD
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary truncate">John Doe</p>
                  <p className="text-xs text-secondary truncate">john@orbitsocial.com</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
                    Pro Plan
                  </span>
                </div>
              </div>

              <div className="p-1.5 space-y-0.5">
                {[
                  { label: 'Profile', to: '/profile' },
                  { label: 'Settings', to: '/settings' },
                  { label: 'Social Accounts', to: '/social-accounts' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setShowUserMenu(false)
                      navigate(item.to)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-hover rounded-xl transition-all duration-150 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    setToastMessage('Help documentation is coming soon!')
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-hover rounded-xl transition-all duration-150 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
                >
                  Help
                </button>
                <div className="h-px bg-surface border-t border-default my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all duration-150 font-semibold focus:outline-none focus:ring-1 focus:ring-rose-400 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Role-Aware Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-card border border-default text-primary px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 text-sm font-semibold transition-all duration-300 animate-slide-in">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            className="text-xs font-bold opacity-80 hover:opacity-100 ml-2 text-secondary"
          >
            ✕
          </button>
        </div>
      )}
    </header>
  )
}
