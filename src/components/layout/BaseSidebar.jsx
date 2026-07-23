import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSidebar } from '../../context/SidebarContext'

export default function BaseSidebar({
  navItems,
  brandBadge,
  user = { name: 'John Doe', email: 'john@orbitsocial.com', avatar: 'JD' },
  onLogout,
  panelTitle = 'Navigation'
}) {
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobile } = useSidebar()

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
          flex flex-col min-h-screen bg-sidebar-bg border-r border-sidebar-border flex-shrink-0
          transition-all duration-300 ease-in-out z-30 select-none
          ${/* Mobile drawer placement vs Desktop collapsible placement */ ''}
          fixed md:relative inset-y-0 left-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'w-[72px]' : 'w-[280px]'}
        `}
      >
        {/* Brand / Logo Header (Acts as Collapse Toggle) */}
        <div
          onClick={toggleSidebar}
          title={isCollapsed ? 'Click to expand sidebar' : 'Click to collapse sidebar'}
          className={`
            flex items-center gap-3 py-5 border-b border-white/5 cursor-pointer
            hover:bg-white/[0.03] transition-colors duration-200 group
            ${isCollapsed ? 'px-4 justify-center' : 'px-5'}
          `}
        >
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-white"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>

          <div
            className={`flex items-center justify-between flex-1 min-w-0 transition-all duration-300 ${
              isCollapsed ? 'opacity-0 w-0 pointer-events-none hidden' : 'opacity-100 w-auto'
            }`}
          >
            <span className="text-white font-extrabold text-lg tracking-tight truncate">
              OrbitSocial
            </span>
            {brandBadge && (
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30 flex-shrink-0">
                {brandBadge}
              </span>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && (
            <p className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest transition-opacity duration-300">
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
                      ? 'text-white bg-primary-600/20 border-l-4 border-primary-500 pl-3 !important shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-sidebar-hover'
                  }
                `}
              >
                <div className="flex items-center justify-center flex-shrink-0">
                  {typeof Icon === 'function' && Icon.prototype?.render ? (
                    <Icon size={20} className="sidebar-link-icon" />
                  ) : (
                    <Icon />
                  )}
                </div>

                {!isCollapsed && (
                  <span className="truncate transition-opacity duration-300">
                    {label}
                  </span>
                )}
              </NavLink>

              {/* Floating Tooltip in Collapsed Mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 transform -translate-x-1 group-hover:translate-x-0">
                  {label}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Profile Footer Section */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {/* User Card */}
          <div className="relative group">
            <div
              className={`
                flex items-center rounded-xl hover:bg-sidebar-hover transition-all duration-200 cursor-pointer
                ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'}
              `}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0">
                {user.avatar || 'JD'}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{user.name}</p>
                  <p className="text-slate-500 text-xs truncate">{user.email}</p>
                </div>
              )}
            </div>

            {/* Tooltip for User Details in Collapsed Mode */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50">
                <p className="font-bold">{user.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-600">{user.email}</p>
              </div>
            )}
          </div>

          {/* Logout Action Button */}
          {onLogout && (
            <div className="relative group">
              <button
                type="button"
                onClick={onLogout}
                className={`
                  w-full flex items-center rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-all duration-200 font-semibold text-sm
                  ${isCollapsed ? 'justify-center p-2.5' : 'gap-3.5 px-3.5 py-2.5'}
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

              {/* Tooltip for Logout in Collapsed Mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50">
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
