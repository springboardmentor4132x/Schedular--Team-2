import { useState, useEffect } from 'react'
import Card from '../../../shared/components/ui/Card'
import Button from '../../../shared/components/ui/Button'
import { CardSkeleton } from '../../../shared/components/ui/Skeleton'
import { getAdminStats } from '../../../services/adminService'
import Toast from '../../../components/Toast'

const ROLE_LABELS = {
  business: 'Business Accounts',
  marketing: 'Marketing Teams',
  creator: 'Content Creators',
  administrator: 'Administrators',
}

const STATUS_COLORS = {
  Planned: 'bg-sky-500',
  Active: 'bg-emerald-500',
  Completed: 'bg-indigo-500',
  Paused: 'bg-amber-500',
  Draft: 'bg-slate-500',
  Scheduled: 'bg-indigo-500',
  Published: 'bg-emerald-500',
  Failed: 'bg-rose-500',
  Cancelled: 'bg-rose-400',
  'Pending Review': 'bg-purple-500',
}

const PLATFORM_COLORS = {
  instagram: 'bg-pink-500',
  facebook: 'bg-blue-600',
  linkedin: 'bg-sky-700',
  twitter: 'bg-slate-700',
  x: 'bg-slate-700',
  youtube: 'bg-red-600',
  pinterest: 'bg-red-500',
}

function Breakdown({ title, data, colorMap = {} }) {
  const entries = Object.entries(data || {})
  const total = entries.reduce((sum, [, v]) => sum + v, 0)

  if (entries.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No data yet.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">{title}</h3>
      <div className="space-y-3">
        {entries.map(([key, value]) => {
          const pct = total ? Math.round((value / total) * 100) : 0
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-200 capitalize">
                  {ROLE_LABELS[key] || key}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">
                  {value} <span className="text-xs text-slate-400 dark:text-slate-500">({pct}%)</span>
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colorMap[key] || 'bg-indigo-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await getAdminStats()
        if (!mounted) return
        setStats(data)
        setError(null)
      } catch (err) {
        if (!mounted) return
        setError(err.response?.data?.detail || 'Failed to load analytics.')
        setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to load analytics.' })
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [refreshKey])

  if (!stats) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <Toast toast={toast} onClose={() => setToast(null)} />
        {error ? (
          <div className="card p-12 flex flex-col items-center justify-center text-center">
            <span className="text-3xl mb-2">⚠️</span>
            <p className="font-semibold text-sm text-rose-600 dark:text-rose-400">{error}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You may not have permission to view admin analytics.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setRefreshKey((k) => k + 1)}>Retry</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </>
        )}
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats.total_users, icon: '🧑‍💼', color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
    { label: 'Connected Social Accounts', value: stats.connected_social_accounts, icon: '🔗', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
    { label: 'Total Campaigns', value: stats.total_campaigns, icon: '🚀', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
    { label: 'Total Posts', value: stats.total_posts, icon: '📝', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
  ]

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Analytics summary">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="p-6 flex items-center gap-4 transition-all duration-300 hover:shadow-card-lg dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1.5">{stat.value}</p>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4" aria-label="Platform breakdowns">
        <Breakdown title="Users by Role" data={stats.users_by_role} colorMap={{ business: 'bg-emerald-500', marketing: 'bg-amber-500', creator: 'bg-indigo-500', administrator: 'bg-rose-500' }} />
        <Breakdown title="Posts by Status" data={stats.posts_by_status} colorMap={STATUS_COLORS} />
        <Breakdown title="Accounts by Platform" data={stats.accounts_by_platform} colorMap={PLATFORM_COLORS} />
        <Breakdown title="Campaigns by Status" data={stats.campaigns_by_status} colorMap={STATUS_COLORS} />
      </section>
    </div>
  )
}
