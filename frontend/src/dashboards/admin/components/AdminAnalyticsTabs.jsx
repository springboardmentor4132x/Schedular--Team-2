import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Target, Layers, PieChart, TrendingUp } from 'lucide-react'

const tabs = [
  { label: 'Overview', to: '/analytics', icon: LayoutDashboard, end: true },
  { label: 'Creator Performance', to: '/analytics/creators', icon: Users, end: false },
  { label: 'Campaign Analytics', to: '/analytics/campaigns', icon: Target, end: false },
  { label: 'Platform Analytics', to: '/analytics/platforms', icon: Layers, end: false },
  { label: 'Audience Analytics', to: '/analytics/audience', icon: PieChart, end: false },
  { label: 'Performance Trends', to: '/analytics/performance', icon: TrendingUp, end: false },
]

export default function AdminAnalyticsTabs() {
  return (
    <div className="border-b border-slate-200/80 dark:border-slate-800 mb-6">
      <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => `
                flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }
              `}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
