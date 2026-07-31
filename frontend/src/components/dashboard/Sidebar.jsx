import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CalendarDays, FileText,
  List, ScrollText, BarChart2, Bell,
  User, Settings, LogOut, ChevronLeft, ChevronRight,
  Link2, Megaphone, ClipboardList, Users, Send, PenSquare,
  BookOpen, Activity,
} from 'lucide-react'
import { useAuth, ROLE_LABELS } from '../../context/AuthContext'
import Logo from '../Logo'


/**
 * Sidebar — always dark navy, collapsible.
 *
 * Business User nav (per spec):
 *   Dashboard · Create Post · Campaigns · Calendar · Drafts ·
 *   Queue · Logs · Connected Accounts · Analytics · Notifications
 *
 * Marketing Team nav (per spec):
 *   Dashboard · Assigned Campaigns · Queue · Calendar ·
 *   Draft Review · Logs · Analytics · Notifications
 *
 * Creator / Admin — minimal placeholder nav
 *
 * Bottom (all roles): Profile · Settings · Logout
 */

const BUSINESS_NAV = [
  { label: 'Dashboard',           icon: LayoutDashboard, href: null },
  { label: 'Marketing Teams',     icon: Users,           href: '/dashboard/marketing-teams' },
  { label: 'Brand Guidelines',    icon: BookOpen,        href: '/dashboard/brand-guidelines' },
  { label: 'Marketing Activity',  icon: Activity,        href: '/dashboard/marketing-activity' },
  { label: 'Connected Accounts',  icon: Link2,           href: '/dashboard/connected-accounts' },
  { label: 'Campaigns',           icon: Megaphone,       href: '/dashboard/campaigns' },
  { label: 'Scheduled Posts',     icon: CalendarDays,    href: '/dashboard/scheduled-posts' },
  { label: 'Published Posts',     icon: Send,            href: '/dashboard/published-posts' },
  { label: 'Analytics',           icon: BarChart2,       href: '/dashboard/analytics' },
  { label: 'Reports',             icon: FileText,        href: '/dashboard/reports' },
  { label: 'Notifications',       icon: Bell,            href: '/dashboard/notifications' },
]

const MARKETING_NAV = [
  { label: 'Dashboard',           icon: LayoutDashboard, href: null },
  { label: 'Client Requests',     icon: ClipboardList,   href: '/dashboard/mkt/requests' },
  { label: 'Clients',             icon: Users,           href: '/dashboard/mkt/clients' },
  { label: 'Brand Guidelines',    icon: BookOpen,        href: '/dashboard/mkt/brand-guidelines' },
  { label: 'Connected Apps',      icon: Link2,           href: '/dashboard/mkt/connected-apps' },
  { label: 'Content Management',  icon: PenSquare,       href: '/dashboard/mkt/content' },
  { label: 'Content Scheduling',  icon: CalendarDays,    href: '/dashboard/mkt/scheduling' },
  { label: 'Publishing Calendar', icon: CalendarDays,    href: '/dashboard/mkt/calendar' },
  { label: 'Campaigns',           icon: Megaphone,       href: '/dashboard/mkt/campaigns' },
  { label: 'Analytics',           icon: BarChart2,       href: '/dashboard/mkt/analytics' },
  { label: 'Reports',             icon: ScrollText,      href: '/dashboard/mkt/reports' },
  { label: 'Notifications',       icon: Bell,            href: '/dashboard/notifications' },
]

const MINIMAL_NAV = [
  { label: 'Dashboard',     icon: LayoutDashboard, href: null },
  { label: 'Notifications', icon: Bell,            href: '/dashboard/notifications' },
]

const BOTTOM_ITEMS = [
  { label: 'Profile',  icon: User,     href: '/dashboard/profile' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
]

function buildNav(role, dashboardRoute) {
  const base =
    role === 'business'  ? BUSINESS_NAV  :
    role === 'marketing' ? MARKETING_NAV :
    MINIMAL_NAV

  return base.map(item =>
    item.href === null ? { ...item, href: dashboardRoute } : item
  )
}

export default function Sidebar({ isDark, collapsed, onCollapse }) {
  const { user, logout, dashboardRoute, role } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }
  const navItems = buildNav(role, dashboardRoute)

  const linkCls = (isActive) => [
    'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium',
    'transition-all duration-150 relative select-none',
    isActive ? 'text-white' : '',
  ].join(' ')

  const activeBg = {
    background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)',
    boxShadow: '0 2px 10px rgba(79,70,229,.35)',
  }

  const hoverEnter = e => {
    if (!e.currentTarget.style.background.includes('gradient'))
      e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
  }
  const hoverLeave = e => {
    if (!e.currentTarget.style.background.includes('gradient'))
      e.currentTarget.style.background = 'transparent'
  }

  const roleAccent = role === 'marketing' ? '#4F46E5' : '#1E3A8A'

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="relative flex flex-col h-full overflow-hidden flex-shrink-0"
      style={{ background: '#0F172A', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* ── Logo / collapse ── */}
      <div
        className="flex items-center justify-between px-4 py-4 min-h-[64px]"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
            >
              <Logo variant="full" theme="dark" />
            </motion.div>
          )}
        </AnimatePresence>

        {collapsed && <div className="mx-auto"><Logo variant="icon" theme="dark" /></div>}

        {!collapsed && (
          <button
            onClick={onCollapse}
            className="p-1.5 rounded-lg transition-colors ml-auto flex-shrink-0"
            style={{ color: '#64748B' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94A3B8' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B' }}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Collapsed expand handle */}
      {collapsed && (
        <button
          onClick={onCollapse}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full border flex items-center justify-center z-10 transition-all"
          style={{ background: '#1E293B', borderColor: 'rgba(255,255,255,0.12)', color: '#64748B' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1E3A8A'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#1E293B'; e.currentTarget.style.color = '#64748B' }}
          aria-label="Expand sidebar"
        >
          <ChevronRight size={12} />
        </button>
      )}

      {/* ── Role badge strip ── */}
      {!collapsed && role && (
        <div
          className="mx-3 mt-3 px-3 py-1.5 rounded-lg flex items-center gap-2"
          style={{ background: `${roleAccent}18`, border: `1px solid ${roleAccent}30` }}
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: roleAccent }} />
          <span className="text-xs font-semibold truncate" style={{ color: roleAccent }}>
            {ROLE_LABELS[role]}
          </span>
        </div>
      )}

      {/* ── Nav items ── */}
      <nav
        className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-0.5"
        aria-label="Sidebar navigation"
        style={{ scrollbarWidth: 'none' }}
      >
        {navItems.map(item => (
          <NavLink
            key={item.label}
            to={item.href}
            end={item.label === 'Dashboard'}
            className={({ isActive }) => linkCls(isActive)}
            style={({ isActive }) => isActive ? activeBg : {}}
            title={collapsed ? item.label : undefined}
            onMouseEnter={hoverEnter}
            onMouseLeave={hoverLeave}
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} style={{ flexShrink: 0, color: isActive ? '#fff' : '#64748B' }} />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap"
                      style={{ color: isActive ? '#fff' : '#94A3B8' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.span
                    layoutId="activeBar"
                    className="absolute right-2 w-1 h-4 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.5)' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Divider ── */}
      <div className="mx-3 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* ── Bottom: Profile + Settings + Logout ── */}
      <div className="px-2 py-3 flex flex-col gap-0.5">
        {BOTTOM_ITEMS.map(item => (
          <NavLink
            key={item.label}
            to={item.href}
            className={({ isActive }) => linkCls(isActive)}
            style={({ isActive }) => isActive ? activeBg : {}}
            title={collapsed ? item.label : undefined}
            onMouseEnter={hoverEnter}
            onMouseLeave={hoverLeave}
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} style={{ flexShrink: 0, color: isActive ? '#fff' : '#64748B' }} />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap"
                      style={{ color: isActive ? '#fff' : '#94A3B8' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`${linkCls(false)} w-full`}
          title={collapsed ? 'Logout' : undefined}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.10)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut size={18} style={{ flexShrink: 0, color: '#EF4444' }} />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap text-sm font-medium"
                style={{ color: '#EF4444' }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── User badge ── */}
      {!collapsed && user && (
        <div
            onClick={() => navigate("/dashboard/profile")}
            className="mx-3 mb-3 px-3 py-2.5 rounded-[10px] flex items-center gap-2.5 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden border"
            style={{ background: 'linear-gradient(135deg, #1E3A8A, #4F46E5)', borderColor: 'rgba(255,255,255,0.16)' }}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name?.[0]?.toUpperCase() ?? 'U'
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate" style={{ color: '#F8FAFC' }}>{user.name}</p>
            <p className="text-xs truncate" style={{ color: '#64748B' }}>{ROLE_LABELS[user.role]}</p>
          </div>
        </div>
      )}

      {collapsed && user && (
        <div className="flex items-center justify-center pb-3 cursor-pointer"
        onClick={() => navigate("/dashboard/profile")}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden border"
            style={{ background: 'linear-gradient(135deg, #1E3A8A, #4F46E5)', borderColor: 'rgba(255,255,255,0.16)' }}
            title={`${user.name} · ${ROLE_LABELS[user.role]}`}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name?.[0]?.toUpperCase() ?? 'U'
            )}
          </div>
        </div>
      )}
    </motion.aside>
  )
}
