import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import { useAuth } from '../context/AuthContext'

/**
 * DashboardLayout
 * - Guards: redirects unauthenticated users to /login
 * - Sidebar (collapsible on desktop, drawer on mobile)
 * - TopBar (sticky)
 * - Animated <Outlet /> for page transitions
 * Props: isDark, onToggleTheme
 */
export default function DashboardLayout({ isDark, onToggleTheme }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [collapsed,    setCollapsed]    = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-alt)' }}>

      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:flex h-full">
        <Sidebar
          isDark={isDark}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(v => !v)}
        />
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
              style={{ width: 240 }}
            >
              <Sidebar
                isDark={isDark}
                collapsed={false}
                onCollapse={() => setMobileOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          isDark={isDark}
          onToggleTheme={onToggleTheme}
          onOpenMobileSidebar={() => setMobileOpen(true)}
        />

        {/* Page content with fade transition */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
