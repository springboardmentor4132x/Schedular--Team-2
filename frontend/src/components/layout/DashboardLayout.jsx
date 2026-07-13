import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Sticky top navbar */}
        <Navbar />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
