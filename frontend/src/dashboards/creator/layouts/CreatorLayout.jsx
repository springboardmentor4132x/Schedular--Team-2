import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '../../../shared/context/SidebarContext'
import CreatorSidebar from './CreatorSidebar'
import Navbar from '../../../shared/layouts/Navbar'

export default function CreatorLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-alt)' }}>
        <CreatorSidebar />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0 transition-all duration-300">
          <Navbar />
          <main className="dashboard-main flex-1 overflow-y-auto p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
