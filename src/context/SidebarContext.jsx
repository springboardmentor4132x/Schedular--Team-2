import React, { createContext, useContext, useState, useEffect } from 'react'

const SidebarContext = createContext()

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('orbitsocial_sidebar_collapsed')
      return saved === 'true'
    } catch {
      return false
    }
  })

  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('orbitsocial_sidebar_collapsed', isCollapsed)
    } catch (e) {
      // Ignore localStorage write errors
    }
  }, [isCollapsed])

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev)
  }

  const toggleMobile = () => {
    setIsMobileOpen(prev => !prev)
  }

  const closeMobile = () => {
    setIsMobileOpen(false)
  }

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        isMobileOpen,
        toggleMobile,
        closeMobile
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
