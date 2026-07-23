import React, { useState, useEffect } from 'react'
import { CardSkeleton, TableSkeleton, ListSkeleton, WidgetSkeleton } from '../components/ui/Skeleton'

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, change, positive, icon, accent }) {
  return (
    <div className="stat-card cursor-pointer transform hover:-translate-y-1 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-card-lg transition-all duration-300 ease-out group">
      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${accent}`}>
        <span className="text-xl">{icon}</span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase text-[10px]">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{value}</p>
        <p className={`text-xs font-semibold mt-1.5 flex items-center gap-1 ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
          <span>{positive ? '▲' : '▼'} {change}</span>
          <span className="text-slate-400 dark:text-slate-500 font-normal">vs last month</span>
        </p>
      </div>
    </div>
  )
}

// ── Quick Action Button ───────────────────────────────────────────────────────

function QuickAction({ emoji, label, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-1.5 p-5 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800
                 hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-card-lg hover:-translate-y-1 transition-all duration-300 text-left group focus:outline-none focus:ring-2 focus:ring-primary-400"
    >
      <span className="text-2xl transition-transform duration-300 group-hover:scale-110">{emoji}</span>
      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {label}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</span>
    </button>
  )
}

// ── Mock Data for Admin Dashboard ─────────────────────────────────────────────

const adminMetrics = [
  { label: 'Total Users', value: '12,345', change: '+5%', positive: true, icon: '🧑‍💼', accent: 'bg-primary-50' },
  { label: 'Business Accounts', value: '842', change: '+2%', positive: true, icon: '🏢', accent: 'bg-emerald-50' },
  { label: 'Marketing Teams', value: '27', change: '+1%', positive: true, icon: '📈', accent: 'bg-amber-50' },
  { label: 'Content Creators', value: '158', change: '-3%', positive: false, icon: '✍️', accent: 'bg-rose-50' },
  { label: 'Connected Social Accounts', value: '4,876', change: '+7%', positive: true, icon: '🔗', accent: 'bg-sky-50' },
  { label: 'Running Campaigns', value: '23', change: '+4%', positive: true, icon: '🚀', accent: 'bg-purple-50' },
  { label: 'Scheduled Posts', value: '89', change: '+6%', positive: true, icon: '📅', accent: 'bg-indigo-50' },
  { label: 'Pending Reviews', value: '14', change: '-2%', positive: false, icon: '🕵️', accent: 'bg-pink-50' },
];

const adminQuickActions = [
  { emoji: '👤', label: 'Add User', desc: 'Create a new platform user' },
  { emoji: '✅', label: 'Approve Business', desc: 'Validate business account' },
  { emoji: '👥', label: 'Create Team', desc: 'Form a new marketing team' },
  { emoji: '📊', label: 'View Reports', desc: 'Access platform analytics' },
  { emoji: '🔗', label: 'Manage Social Accounts', desc: 'Connect/disconnect socials' },
  { emoji: '⚙️', label: 'Platform Settings', desc: 'Configure system options' },
];

const recentUserRegistrations = [
  { name: 'Alice Johnson', email: 'alice@example.com', date: '2026-07-18' },
  { name: 'Bob Smith', email: 'bob@example.com', date: '2026-07-19' },
  { name: 'Carol Lee', email: 'carol@example.com', date: '2026-07-20' },
];

const recentBusinessRequests = [
  { company: 'Acme Corp', contact: 'acme@corp.com', date: '2026-07-17' },
  { company: 'Beta LLC', contact: 'beta@llc.com', date: '2026-07-19' },
];

const platformStatus = [
  { name: 'Server', status: 'Running', usage: '45%' },
  { name: 'API', status: 'Running', usage: '67%' },
  { name: 'Database', status: 'Running', usage: '52%' },
  { name: 'Storage', status: 'Healthy', usage: '78%' },
  { name: 'System Health', status: 'Good', usage: '92%' },
];

const initialActivityTimeline = [
  { event: 'User Registered', time: '2026-07-20 09:15', details: 'Alice Johnson' },
  { event: 'Business Approved', time: '2026-07-20 10:02', details: 'Acme Corp' },
  { event: 'Campaign Created', time: '2026-07-20 11:30', details: 'Summer Launch' },
  { event: 'Post Scheduled', time: '2026-07-20 12:45', details: 'Instagram - New product' },
  { event: 'Team Assigned', time: '2026-07-20 13:20', details: 'Marketing Team A' },
  { event: 'Social Account Connected', time: '2026-07-20 14:05', details: 'Twitter @mybrand' },
];

// ── Dashboard Page ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [timeline, setTimeline] = useState(initialActivityTimeline)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const handleClearTimeline = () => {
    setTimeline([])
  }

  const handleRestoreTimeline = () => {
    setTimeline(initialActivityTimeline)
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="card animate-pulse space-y-3">
          <div className="w-64 h-7 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="w-96 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Tables Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TableSkeleton />
          <TableSkeleton />
        </div>

        {/* Widgets Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">

      {/* Header */}
      <section aria-label="Dashboard header" className="card relative overflow-hidden bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome back, Administrator</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage users, teams, campaigns and platform operations.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-600/40">Current Date: {new Date().toLocaleDateString()}</span>
            <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-600/40">Last Login: 2026-07-19 08:30</span>
            <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200/30 dark:border-emerald-900/30">System Online</span>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section aria-label="Overview stats">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8 gap-4">
          {adminMetrics.map((m, i) => (
            <StatCard key={i} {...m} />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="card" aria-label="Admin quick actions">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {adminQuickActions.map((a, i) => (
            <QuickAction key={i} {...a} />
          ))}
        </div>
      </section>

      {/* System Overview Tables */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4" aria-label="System overview">
        {/* Recent User Registrations */}
        <div className="card space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3">Recent User Registrations</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700/60">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-400 dark:text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Name</th>
                  <th className="py-3 px-4 text-left font-semibold">Email</th>
                  <th className="py-3 px-4 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {recentUserRegistrations.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-850 dark:text-slate-100">{u.name}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-350">{u.email}</td>
                    <td className="py-3 px-4 text-slate-400 dark:text-slate-500 text-xs">{u.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Business Requests */}
        <div className="card space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3">Recent Business Requests</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700/60">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-400 dark:text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Company</th>
                  <th className="py-3 px-4 text-left font-semibold">Contact</th>
                  <th className="py-3 px-4 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {recentBusinessRequests.map((b, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-850 dark:text-slate-100">{b.company}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-350">{b.contact}</td>
                    <td className="py-3 px-4 text-slate-400 dark:text-slate-500 text-xs">{b.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Platform Status Cards */}
      <section aria-label="Platform status" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {platformStatus.map((p, i) => (
          <div key={i} className="card p-5 flex flex-col hover:-translate-y-1 hover:shadow-card-lg transition-all duration-300 ease-out border border-slate-100 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-850 dark:text-slate-200 text-sm">{p.name}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'Running' || p.status === 'Healthy' || p.status === 'Good' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'}`}>{p.status}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Usage Metric: {p.usage}</div>
            <div className="mt-auto h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 rounded-full transition-all duration-500" style={{ width: p.usage }}></div>
            </div>
          </div>
        ))}
      </section>

      {/* Recent Activity Timeline & Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="card lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Recent Activity Timeline</h2>
            {timeline.length > 0 ? (
              <button 
                type="button" 
                onClick={handleClearTimeline}
                className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline"
              >
                Clear Log
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleRestoreTimeline}
                className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                Restore
              </button>
            )}
          </div>
          
          {timeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
              <span className="text-3xl mb-2">📋</span>
              <p className="font-semibold text-sm">No recent activities available</p>
              <p className="text-xs mt-1 leading-relaxed">Platform events will appear here in real-time.</p>
            </div>
          ) : (
            <ul className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-700">
              {timeline.map((item, i) => (
                <li key={i} className="flex items-start gap-3 pl-6 relative">
                  <span className="absolute left-[8px] top-1.5 w-2 h-2 rounded-full bg-primary-600 ring-4 ring-white dark:ring-slate-800"></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      <strong className="font-semibold">{item.event}:</strong> {item.details}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{item.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Analytics Placeholder */}
        <div className="card lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3">Analytics Overview</h2>
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400">
            <span className="text-3xl mb-2">📊</span>
            <p className="font-semibold text-sm">Analytics Engine Configured</p>
            <p className="text-xs mt-1">Platform growth indices will render here.</p>
          </div>
        </div>
      </section>

    </div>
  )
}
