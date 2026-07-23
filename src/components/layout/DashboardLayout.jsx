import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '../../context/SidebarContext'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
        {/* Collapsible Sidebar */}
        <Sidebar />

        {/* Main content area - Auto expands smoothly */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0 transition-all duration-300">
          {/* Sticky top navbar */}
          <Navbar />

          {/* Scrollable page content */}
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
