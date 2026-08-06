import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPublishingDashboard } from '../../../../services/publishingService'
import { CardSkeleton } from '../../../../shared/components/ui/Skeleton'
import {
  PlusCircle,
  Calendar,
  ListOrdered,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react'

function StatCard({ icon, label, value, change, positive, accent }) {
  return (
    <div className="stat-card card-hover">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-secondary uppercase tracking-wider truncate">{label}</p>
        <p className="text-2xl font-bold text-primary mt-1">{value}</p>
        {change && (
          <span className={`text-xs font-semibold ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  )
}

function StatusDot({ status }) {
  const colors = {
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
  }
  return <span className={`w-2 h-2 rounded-full ${colors[status] || 'bg-slate-400'} inline-block`} />
}

const statusBadgeClass = {
  published: 'badge-published',
  scheduled: 'badge-scheduled',
  queued: 'badge-queued',
  failed: 'badge-failed',
}

export default function PublishingDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublishingDashboard().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="card animate-pulse space-y-3">
          <div className="w-64 h-7 rounded bg-surface" />
          <div className="w-96 h-4 rounded bg-surface" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <section className="card relative overflow-hidden bg-gradient-to-r from-indigo-50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/20 border border-default shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Publishing Dashboard</h1>
            <p className="text-secondary mt-1">Monitor and manage all your social media publishing activity.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate('/dashboard/creator/content-scheduling')} className="btn btn-primary btn-md">
              <PlusCircle size={16} /> Create Post
            </button>
            <button onClick={() => navigate('/dashboard/creator/publishing-calendar')} className="btn btn-outline btn-md">
              <Calendar size={16} /> Calendar
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {data.stats.map((s, i) => <StatCard key={i} {...s} />)}
      </section>

      {/* Quick Actions */}
      <section className="card">
        <h2 className="text-base font-bold text-primary mb-4 border-b border-default pb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Create Post', icon: PlusCircle, desc: 'Write and schedule a new post', to: '/dashboard/creator/content-scheduling' },
            { label: 'Publishing Calendar', icon: Calendar, desc: 'View your content calendar', to: '/dashboard/creator/publishing-calendar' },
            { label: 'Open Queue', icon: ListOrdered, desc: 'Manage the publishing queue', to: '/dashboard/creator/publishing/queue' },
            { label: 'View Logs', icon: FileText, desc: 'Check publishing history', to: '/dashboard/creator/publishing/logs' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className="flex flex-col items-start gap-1.5 p-5 rounded-xl border border-default bg-card
                         hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-card-lg hover:-translate-y-1
                         transition-all duration-300 text-left group cursor-pointer"
            >
              <action.icon size={22} className="text-indigo-500 dark:text-indigo-400 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-sm font-bold text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{action.label}</span>
              <span className="text-xs text-secondary leading-relaxed">{action.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="card lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-default pb-3">
            <h2 className="text-base font-bold text-primary">Recent Publishing Activity</h2>
            <button onClick={() => navigate('/dashboard/creator/publishing/logs')} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              View All <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {data.recentActivity.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-hover transition-colors">
                <span className={`badge ${statusBadgeClass[item.status] || 'badge-default'}`}>{item.status}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{item.action}</p>
                  <p className="text-xs text-secondary">{item.platform} · {item.campaign}</p>
                </div>
                <span className="text-xs text-secondary whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Publishing Status */}
        <div className="card space-y-4">
          <h2 className="text-base font-bold text-primary border-b border-default pb-3">Platform Status</h2>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <CheckCircle2 size={14} className="text-emerald-500" /> <span className="text-primary">{data.publishingStatus.healthy} Healthy</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <AlertTriangle size={14} className="text-amber-500" /> <span className="text-primary">{data.publishingStatus.warning} Warning</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <XCircle size={14} className="text-rose-500" /> <span className="text-primary">{data.publishingStatus.error} Error</span>
            </div>
          </div>
          <div className="space-y-2">
            {data.publishingStatus.platforms.map((p) => (
              <div key={p.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-hover transition-colors">
                <div className="flex items-center gap-2.5">
                  <StatusDot status={p.status} />
                  <span className="text-sm font-semibold text-primary">{p.name}</span>
                </div>
                <span className="text-xs text-secondary">Synced {p.lastSync}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b border-default pb-3">
            <h2 className="text-base font-bold text-primary">Today's Schedule</h2>
            <span className="text-xs font-semibold text-secondary">{data.todaySchedule.length} posts</span>
          </div>
          <div className="space-y-2">
            {data.todaySchedule.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-hover transition-colors">
                <div className="w-16 text-center flex-shrink-0">
                  <Clock size={12} className="text-secondary mx-auto mb-0.5" />
                  <span className="text-xs font-bold text-primary">{item.time}</span>
                </div>
                <div className="w-px h-8 bg-surface border-r border-default flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{item.content}</p>
                  <p className="text-xs text-secondary">{item.platform}</p>
                </div>
                <span className={`badge ${statusBadgeClass[item.status] || 'badge-default'}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b border-default pb-3">
            <h2 className="text-base font-bold text-primary">Upcoming Schedule</h2>
            <button onClick={() => navigate('/dashboard/creator/publishing-calendar')} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              Full Calendar <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {data.upcomingSchedule.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-hover transition-colors">
                <div className="w-16 text-center flex-shrink-0">
                  <p className="text-[10px] font-semibold text-secondary uppercase">{item.date}</p>
                  <p className="text-xs font-bold text-primary">{item.time}</p>
                </div>
                <div className="w-px h-8 bg-surface border-r border-default flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{item.content}</p>
                  <p className="text-xs text-secondary">{item.platform}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
