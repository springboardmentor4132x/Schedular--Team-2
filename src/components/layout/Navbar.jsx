import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useSidebar } from '../../context/SidebarContext'

const pageTitles = {
  '/dashboard': { label: 'Dashboard',  sub: 'Welcome back, John 👋' },
  '/calendar':  { label: 'Calendar',   sub: 'Manage your scheduled posts' },
  '/analytics': { label: 'Analytics',  sub: 'Track your performance' },
  '/team':      { label: 'Team',       sub: 'Manage team members' },
  '/inbox':     { label: 'Inbox',      sub: 'Your messages and notifications' },
  '/profile':   { label: 'My Profile', sub: 'Manage your personal information' },
  '/settings':  { label: 'Account Settings', sub: 'Manage your OrbitSocial account preferences and security' },
  '/social-accounts': { label: 'Social Accounts', sub: 'Manage all connected social media platforms from one place' },
  '/creator/dashboard': { label: 'Creator Dashboard', sub: 'Welcome back, Creator 👋' },
  '/creator/posts': { label: 'My Posts', sub: 'Manage your created posts' },
  '/creator/scheduling': { label: 'Content Scheduling', sub: 'Plan your content publishing times' },
  '/creator/campaigns': { label: 'Campaigns', sub: 'Track campaign collaborations' },
  '/creator/calendar': { label: 'Publishing Calendar', sub: 'Visual schedule of posts' },
  '/creator/notifications': { label: 'Notifications', sub: 'Stay updated with your audience and reviewer feedback' },
  '/creator/profile': { label: 'Creator Profile', sub: 'Manage your creator profile details' },
  '/creator/settings': { label: 'Creator Settings', sub: 'Manage your creator preference settings' },
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-5 h-5">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-5 h-5">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const page = pageTitles[pathname] ?? { label: 'Page', sub: '' }

  // State for dropdown menus
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Realistic mock notifications
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'comment', title: 'Sarah Miller', message: 'commented on product launch copy', time: '10 min ago', read: false },
    { id: 2, type: 'access', title: 'Alex Johnson', message: 'requested workspace access', time: '1 hour ago', read: false },
    { id: 3, type: 'facebook', title: 'Facebook Sync', message: 'connection updated successfully', time: '5 hours ago', read: true },
    { id: 4, type: 'alert', title: 'Instagram Token', message: 'expires in 3 days', time: '2 days ago', read: true },
  ])

  // Dropdown element references for click-outside check
  const notifRef = useRef(null)
  const userMenuRef = useRef(null)

  // Unread badge count
  const unreadCount = notifications.filter(n => !n.read).length

  // Handlers
  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const handleNotificationClick = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const handleLogout = () => {
    setShowUserMenu(false)
    setToastMessage('Logout action simulated successfully!')
  }

  // Keyboard navigation & click outside behavior
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
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

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  let sidebarCtx = null
  try {
    sidebarCtx = useSidebar()
  } catch (e) {
    // context optional fallback
  }

  return (
    <header className="relative flex items-center justify-between px-6 py-4
                       bg-white dark:bg-slate-800
                       border-b border-slate-100 dark:border-slate-700 z-20">
      {/* Left — Mobile Menu & Page title */}
      <div className="flex items-center gap-3">
        {sidebarCtx && (
          <button
            type="button"
            onClick={sidebarCtx.toggleMobile}
            className="p-2 -ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 md:hidden focus:outline-none"
            aria-label="Open mobile menu"
          >
            <MenuIcon />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {page.label}
          </h1>
          {page.sub && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{page.sub}</p>
          )}
        </div>
      </div>

      {/* Right — Search + actions */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative hidden sm:flex items-center">
          <span className="absolute left-3 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            id="navbar-search"
            type="search"
            placeholder="Search…"
            className="pl-9 pr-4 py-2 text-sm
                       bg-slate-50 dark:bg-slate-700
                       border border-slate-200 dark:border-slate-600
                       text-slate-800 dark:text-slate-100
                       placeholder:text-slate-400 dark:placeholder:text-slate-500
                       rounded-lg focus:outline-none focus:ring-2
                       focus:ring-primary-300 focus:border-primary-400
                       w-52 transition-all duration-150"
          />
        </div>

        {/* Theme toggle */}
        <button
          id="navbar-theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400
                     hover:bg-slate-100 dark:hover:bg-slate-700
                     hover:text-slate-800 dark:hover:text-slate-200
                     transition-colors duration-150
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Notification bell container */}
        <div className="relative" ref={notifRef}>
          <button
            id="navbar-notifications"
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowUserMenu(false)
            }}
            className={`relative p-2 rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
              showNotifications
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            aria-label="Notifications"
            aria-expanded={showNotifications}
            aria-haspopup="true"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-bold text-white bg-primary-600 rounded-full leading-none ring-2 ring-white dark:ring-slate-800 min-w-[16px] h-[16px] flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-card-lg dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-700 overflow-hidden transform origin-top-right transition-all duration-200 ease-out z-50">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline focus:outline-none"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item.id)}
                      className={`flex gap-3 p-4 cursor-pointer transition-colors duration-150 ${
                        item.read
                          ? 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/60'
                          : 'bg-primary-50/30 hover:bg-primary-50/50 dark:bg-primary-950/10 dark:hover:bg-primary-950/20'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                        item.type === 'comment' ? 'bg-indigo-500' :
                        item.type === 'access' ? 'bg-emerald-500' :
                        item.type === 'facebook' ? 'bg-blue-600' : 'bg-amber-500'
                      }`}>
                        {item.title.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{item.title}</span> {item.message}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">{item.time}</span>
                      </div>
                      {!item.read && (
                        <div className="w-2 h-2 rounded-full bg-primary-600 self-center flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700 p-2 text-center bg-slate-50 dark:bg-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1.5 focus:outline-none"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-600" />

        {/* Avatar container */}
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
                ? 'bg-slate-100 dark:bg-slate-700'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            aria-label="User menu"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600
                            flex items-center justify-center text-white text-xs font-bold shadow-sm">
              JD
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* User Menu Dropdown Panel */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-card-lg dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-700 overflow-hidden transform origin-top-right transition-all duration-200 ease-out z-50">
              {/* User Header Profile Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                  JD
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">John Doe</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">john@orbitsocial.com</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-full">
                    Pro Plan
                  </span>
                </div>
              </div>

              {/* Menu Links */}
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
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-all duration-150 font-semibold focus:outline-none focus:ring-1 focus:ring-primary-400"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    setToastMessage('Help documentation is coming soon!')
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-all duration-150 font-semibold focus:outline-none focus:ring-1 focus:ring-primary-400"
                >
                  Help
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all duration-150 font-semibold focus:outline-none focus:ring-1 focus:ring-rose-400"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sleek Alert Toast at the bottom right */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 text-sm font-semibold transition-all duration-300 animate-slide-in">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            className="text-xs font-bold opacity-80 hover:opacity-100 ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </header>
  )
}
