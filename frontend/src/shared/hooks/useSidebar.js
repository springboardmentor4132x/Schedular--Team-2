import { useContext } from 'react'
import { SidebarContext } from '../context/SidebarContext'

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    return {
      isCollapsed: false,
      toggleSidebar: () => {},
      isMobileOpen: false,
      toggleMobile: () => {},
      closeMobile: () => {}
    }
  }
  return context
}

export default useSidebar
