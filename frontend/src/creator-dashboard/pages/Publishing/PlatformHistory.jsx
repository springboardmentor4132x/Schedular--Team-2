import { useState, useEffect } from 'react'
import { getPlatformHistory } from '../../services/publishingService'
import { TrendingUp, TrendingDown, CheckCircle2, XCircle, Clock } from 'lucide-react'

function MiniBar({ successful, failed, total }) {
  if (total === 0) return <div className="h-1.5 w-full rounded-full bg-surface" />
  const successPct = (successful / total) * 100
  return (
    <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden flex">
      <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${successPct}%` }} />
      {failed > 0 && <div className="h-full bg-rose-500 rounded-r-full" style={{ width: `${100 - successPct}%` }} />}
    </div>
  )
}

export default function PlatformHistory() {
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPlatformHistory().then((d) => { setPlatforms(d); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-surface rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse space-y-4">
              <div className="h-6 w-32 bg-surface rounded" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-surface rounded" />
                <div className="h-12 bg-surface rounded" />
              </div>
              <div className="h-20 bg-surface rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Platform History</h1>
        <p className="text-sm text-secondary mt-1">Publishing performance across all connected platforms.</p>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {platforms.map((platform) => (
          <div key={platform.id} className="card card-hover space-y-5">
            {/* Platform Header */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${platform.color}`}>
                {platform.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">{platform.name}</h3>
                <div className="flex items-center gap-1 text-xs text-secondary">
                  <Clock size={10} />
                  <span>Last published {platform.lastPublished}</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-surface border border-default">
                <p className="text-xs text-secondary font-medium">Total Posts</p>
                <p className="text-xl font-bold text-primary mt-0.5">{platform.totalPosts.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-default">
                <p className="text-xs text-secondary font-medium">Success Rate</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xl font-bold text-primary">{platform.successRate}%</p>
                  {platform.successRate >= 95 ? (
                    <TrendingUp size={14} className="text-emerald-500" />
                  ) : (
                    <TrendingDown size={14} className="text-amber-500" />
                  )}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-default">
                <p className="text-xs text-secondary font-medium">Failed Posts</p>
                <p className={`text-xl font-bold mt-0.5 ${platform.failedPosts > 10 ? 'text-rose-600 dark:text-rose-400' : 'text-primary'}`}>
                  {platform.failedPosts}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-default flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <div>
                  <p className="text-xs text-secondary font-medium">Status</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Connected</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Recent Activity (Last 5 Days)</p>
              <div className="space-y-2">
                {platform.recentActivity.map((day) => (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-xs text-secondary w-20 flex-shrink-0">{day.date}</span>
                    <MiniBar successful={day.successful} failed={day.failed} total={day.posts} />
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> {day.successful}
                      </span>
                      {day.failed > 0 && (
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                          <XCircle size={10} /> {day.failed}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
