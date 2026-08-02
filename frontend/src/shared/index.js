/**
 * Shared Module Exports
 */

// Components
export { default as Button } from './components/Button'
export { default as Footer } from './components/Footer'
export { default as Input } from './components/Input'
export { default as Logo } from './components/Logo'
export { default as Navbar } from './components/Navbar'
export { default as ThemeToggle } from './components/ThemeToggle'
export { default as Toast } from './components/Toast'

// UI Components
export { default as Avatar } from './components/ui/Avatar'
export { default as Badge } from './components/ui/Badge'
export { default as UIButton } from './components/ui/Button'
export { default as Card } from './components/ui/Card'
export { default as UIInput } from './components/ui/Input'
export { default as Modal } from './components/ui/Modal'
export { default as ProgressBar } from './components/ui/ProgressBar'
export { default as Select } from './components/ui/Select'
export * from './components/ui/Skeleton'
export { default as StatusBadge } from './components/ui/StatusBadge'

// Layouts
export { default as BaseSidebar } from './layouts/BaseSidebar'
export { default as DashboardNavbar } from './layouts/Navbar'

// Context & Hooks
export * from './context/ThemeContext'
export * from './context/SidebarContext'
export * from './hooks/useTheme'

// Pages
export { default as Inbox } from './pages/Inbox'
export { default as Settings } from './pages/Settings'

// Services
export * from './services/settingsService'
