import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, Target, Layers, TrendingUp } from 'lucide-react'

const tabs = [
  { label: 'Overview', to: '/creator/analytics', icon: LayoutDashboard, end: true },
  { label: 'Content', to: '/creator/analytics/content', icon: FileText, end: false },
  { label: 'Audience', to: '/creator/analytics/audience', icon: Users, end: false },
  { label: 'Campaign', to: '/creator/analytics/campaigns', icon: Target, end: false },
  { label: 'Platforms', to: '/creator/analytics/platforms', icon: Layers, end: false },
  { label: 'Performance', to: '/creator/analytics/performance', icon: TrendingUp, end: false },
]

export default function AnalyticsTabs() {
  return (
    <div className="border-b border-default mb-6">
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
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-secondary hover:text-primary hover:bg-hover'
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
