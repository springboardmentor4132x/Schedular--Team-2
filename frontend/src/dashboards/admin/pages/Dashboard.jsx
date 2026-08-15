import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/ui/Button'
import { CardSkeleton, TableSkeleton } from '../../../shared/components/ui/Skeleton'
import { getAdminStats, getAdminActivity, getAdminUsers } from '../../../services/adminService'
import Toast from '../../../components/Toast'

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="stat-card cursor-pointer transform hover:-translate-y-1 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-card-lg transition-all duration-300 ease-out group">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${accent}`}>
        <span className="text-xl">{icon}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase text-[10px]">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  )
}

function QuickAction({ emoji, label, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-1.5 p-5 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800
                 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-card-lg hover:-translate-y-1 transition-all duration-300 text-left group focus:outline-none focus:ring-2 focus:ring-indigo-400"
    >
      <span className="text-2xl transition-transform duration-300 group-hover:scale-110">{emoji}</span>
      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {label}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</span>
    </button>
  )
}

const quickActions = [
  { emoji: '👤', label: 'Add User', desc: 'Create a new platform user', to: '/users' },
  { emoji: '👥', label: 'Create Team', desc: 'Form a new marketing team', to: '/marketing-teams' },
  { emoji: '📊', label: 'View Reports', desc: 'Access platform analytics', to: '/reports' },
  { emoji: '⚙️', label: 'Platform Settings', desc: 'Configure system options', to: '/settings' },
]

function formatLastLogin(value) {
  if (!value) return '—'
  try {
    const d = new Date(value)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return '—'
  }
}

function formatTime(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [activities, setActivities] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const [statsData, activityData, usersData] = await Promise.all([
          getAdminStats(),
          getAdminActivity(),
          getAdminUsers({}),
        ])
        if (!mounted) return
        setStats(statsData)
        setActivities(activityData?.activities || [])
        setRecentUsers((usersData || []).slice(0, 5))
        setError(null)
      } catch (err) {
        if (!mounted) return
        setError(err.response?.data?.detail || 'Failed to load dashboard data.')
        setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to load dashboard data.' })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [refreshKey])

  const refresh = () => setRefreshKey((k) => k + 1)

  if (loading || !stats) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <Toast toast={toast} onClose={() => setToast(null)} />

        {error ? (
          <div className="card p-12 flex flex-col items-center justify-center text-center">
            <span className="text-3xl mb-2">⚠️</span>
            <p className="font-semibold text-sm text-rose-600 dark:text-rose-400">{error}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You may not have permission to view admin analytics.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={refresh}>Retry</Button>
          </div>
        ) : (
          <>
            <div className="card p-5 sm:p-6 animate-pulse space-y-3">
              <div className="w-64 h-7 rounded bg-slate-200 dark:bg-slate-700"></div>
              <div className="w-96 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TableSkeleton />
              <TableSkeleton />
            </div>
          </>
        )}
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats.total_users, icon: '🧑‍💼', accent: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { label: 'Marketing Teams', value: stats.users_by_role?.marketing || 0, icon: '📈', accent: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Content Creators', value: stats.users_by_role?.creator || 0, icon: '✍️', accent: 'bg-rose-50 dark:bg-rose-950/40' },
    { label: 'Connected Social Accounts', value: stats.connected_social_accounts, icon: '🔗', accent: 'bg-sky-50 dark:bg-sky-950/40' },
    { label: 'Running Campaigns', value: stats.running_campaigns, icon: '🚀', accent: 'bg-purple-50 dark:bg-purple-950/40' },
    { label: 'Scheduled Posts', value: stats.scheduled_posts, icon: '📅', accent: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { label: 'Published Posts', value: stats.published_posts, icon: '✅', accent: 'bg-emerald-50 dark:bg-emerald-950/40' },
  ]

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section aria-label="Dashboard header" className="card p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome back, Administrator</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1.5 text-sm">Manage users, teams, campaigns and platform operations.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="bg-slate-100 dark:bg-slate-700 px-3.5 py-2 rounded-lg border border-slate-200/50 dark:border-slate-600/40">Current Date: {new Date().toLocaleDateString()}</span>
            <span className="bg-slate-100 dark:bg-slate-700 px-3.5 py-2 rounded-lg border border-slate-200/50 dark:border-slate-600/40">Last Login: {formatLastLogin(stats?.admin?.last_login)}</span>
            <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-3.5 py-2 rounded-lg border border-emerald-200/30 dark:border-emerald-900/30">System Online</span>
          </div>
        </div>
      </section>

      <section aria-label="Overview stats">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((m, i) => (
            <StatCard key={i} {...m} />
          ))}
        </div>
      </section>

      <section className="card p-6" aria-label="Admin quick actions">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5 border-b border-slate-100 dark:border-slate-700 pb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((a, i) => (
            <QuickAction key={i} {...a} onClick={() => navigate(a.to)} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4" aria-label="Platform overview">
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-4">Recent User Registrations</h2>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No registrations yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700/60">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-400 dark:text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Name</th>
                    <th className="py-3 px-4 text-left font-semibold">Email</th>
                    <th className="py-3 px-4 text-left font-semibold">Role</th>
                    <th className="py-3 px-4 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">
                        {u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : u.username}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                      <td className="py-3 px-4 capitalize text-slate-500 dark:text-slate-400 text-xs">{u.role}</td>
                      <td className="py-3 px-4 text-slate-400 dark:text-slate-500 text-xs whitespace-nowrap">{formatTime(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-4">Recent Platform Activity</h2>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
              <span className="text-3xl mb-2">📋</span>
              <p className="font-semibold text-sm">No recent activities available</p>
              <p className="text-xs mt-1 leading-relaxed">Platform events will appear here in real-time.</p>
            </div>
          ) : (
            <ul className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-700">
              {activities.map((item, i) => (
                <li key={`${item.type}-${item.id}-${i}`} className="flex items-start gap-3 pl-6 relative">
                  <span className="absolute left-[8px] top-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-800"></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      <strong className="font-semibold">{item.event}:</strong> {item.details}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{formatTime(item.time)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
