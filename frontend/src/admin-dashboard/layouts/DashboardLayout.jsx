import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '../../shared/context/SidebarContext'
import Sidebar from './Sidebar'
import Navbar from '../../shared/layouts/Navbar'

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background text-primary">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0 transition-all duration-300">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 bg-background text-primary">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
