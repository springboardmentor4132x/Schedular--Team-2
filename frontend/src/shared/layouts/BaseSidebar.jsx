import { NavLink } from 'react-router-dom'
import { useSidebar } from '../hooks/useSidebar'
import { useTheme } from '../hooks/useTheme'
import Logo from '../../components/Logo'

export default function BaseSidebar({
  navItems,
  brandBadge,
  user = { name: 'John Doe', email: 'john@orbitsocial.com', avatar: 'JD' },
  onLogout,
  panelTitle = 'Navigation'
}) {
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobile } = useSidebar()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Aside element */}
      <aside
        className={`
          flex flex-col min-h-screen flex-shrink-0
          transition-all duration-300 ease-in-out z-30 select-none
          fixed md:relative inset-y-0 left-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'w-[72px]' : 'w-[280px]'}
          ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)]'}
        `}
      >
        {/* Brand / Logo Header */}
        <div
          onClick={toggleSidebar}
          title={isCollapsed ? 'Click to expand sidebar' : 'Click to collapse sidebar'}
          className={`
            flex items-center gap-3 py-4 min-h-[64px] border-b cursor-pointer
            transition-colors duration-200 group
            ${isCollapsed ? 'px-4 justify-center' : 'px-5'}
            ${isDark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-slate-200 hover:bg-slate-50'}
          `}
        >
          <div className="flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Logo variant={isCollapsed ? 'icon' : 'full'} theme={isDark ? 'dark' : 'light'} />
          </div>

          <div
            className={`flex items-center justify-between flex-1 min-w-0 transition-all duration-300 ${
              isCollapsed ? 'opacity-0 w-0 pointer-events-none hidden' : 'opacity-100 w-auto'
            }`}
          >
            {brandBadge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                {brandBadge}
              </span>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && (
            <p className={`px-3 mb-2 text-xs font-bold uppercase tracking-widest transition-opacity duration-300 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {panelTitle}
            </p>
          )}

          {navItems.map(({ label, to, Icon }) => (
            <div key={to} className="relative group">
              <NavLink
                to={to}
                onClick={closeMobile}
                id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                className={({ isActive }) => `
                  sidebar-link flex items-center transition-all duration-200 rounded-xl font-semibold text-sm
                  ${isCollapsed ? 'justify-center px-0 py-3' : 'gap-3.5 px-3.5 py-2.5'}
                  ${
                    isActive
                      ? isDark
                        ? 'text-white bg-indigo-600/20 border-l-4 border-indigo-500 pl-3 shadow-sm'
                        : 'text-indigo-700 bg-indigo-50 border-l-4 border-indigo-500 pl-3 shadow-sm'
                      : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }
                `}
              >
                <div className="flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="sidebar-link-icon" />
                </div>

                {!isCollapsed && (
                  <span className="truncate transition-opacity duration-300">
                    {label}
                  </span>
                )}
              </NavLink>

              {isCollapsed && (
                <div className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 transform -translate-x-1 group-hover:translate-x-0 ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}>
                  {label}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Profile Footer Section */}
        <div className={`p-3 border-t space-y-2 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <div className="relative group">
            <div
              className={`
                flex items-center rounded-xl hover:bg-sidebar-hover transition-all duration-200 cursor-pointer
                ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'}
                ${isDark ? '' : 'hover:bg-slate-50'}
              `}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0">
                {user.avatar || 'JD'}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
                  <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{user.email}</p>
                </div>
              )}
            </div>

            {isCollapsed && (
              <div className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}>
                <p className="font-bold">{user.name}</p>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
              </div>
            )}
          </div>

          {onLogout && (
            <div className="relative group">
              <button
                type="button"
                onClick={onLogout}
                className={`
                  w-full flex items-center rounded-xl transition-all duration-200 font-semibold text-sm
                  ${isCollapsed ? 'justify-center p-2.5' : 'gap-3.5 px-3.5 py-2.5'}
                  ${isDark ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/20' : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'}
                `}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 flex-shrink-0"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>

                {!isCollapsed && <span className="truncate">Logout</span>}
              </button>

              {isCollapsed && (
                <div className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 ${isDark ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  Logout
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
