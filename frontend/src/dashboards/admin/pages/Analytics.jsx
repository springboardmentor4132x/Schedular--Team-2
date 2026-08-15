import { useState, useEffect, useCallback } from 'react'
import Card from '../../../shared/components/ui/Card'
import Button from '../../../shared/components/ui/Button'
import { CardSkeleton } from '../../../shared/components/ui/Skeleton'
import AdminReportModal from '../components/AdminReportModal'
import { getAdminAnalyticsSummary, getAdminTopPosts } from '../../../services/adminAnalyticsService'
import Toast from '../../../components/Toast'

// ── Chart Icon ─────────────────────────────────────────────────────────────
const ChartLargeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="w-12 h-12 text-indigo-400 dark:text-indigo-500" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [topPosts, setTopPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [toast, setToast] = useState(null)
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [summaryData, postsData] = await Promise.all([
          getAdminAnalyticsSummary(),
          getAdminTopPosts(),
        ])
        if (!mounted) return
        setSummary(summaryData)
        setTopPosts(postsData)
      } catch (err) {
        if (!mounted) return
        const message = err.response?.data?.detail || 'Failed to load analytics.'
        setError(message)
        setToast({ type: 'error', message })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [refreshKey])

  const handleExport = useCallback(() => {
    if (!summary) return
    const rows = [
      ['Metric', 'Value'],
      ...Object.entries(summary.kpis).map(([key, kpi]) => [kpi.label || key, kpi.value]),
      [],
      ['Top Performing Posts'],
      ['Post', 'Platform', 'Reach', 'Engagement'],
      ...topPosts.map((p) => [p.text, p.platform, p.reach, p.engagement]),
    ]
    const csv = rows.map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-analytics-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [summary, topPosts])

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <span className="text-3xl mb-2">⚠️</span>
          <p className="font-semibold text-sm text-rose-600 dark:text-rose-400">{error || 'Failed to load analytics.'}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You may not have permission to view admin analytics.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setRefreshKey((k) => k + 1)}>Retry</Button>
        </div>
      </div>
    )
  }

  const k = summary.kpis

  const statCards = [
    { label: 'Total Impressions', value: k.totalImpressions?.value ?? '0', icon: '👁️', color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
    { label: 'Engagement Rate', value: k.overallEngagementRate?.value ?? '0%', icon: '💬', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
    { label: 'Link Clicks', value: k.totalClicks?.value ?? '0', icon: '🔗', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
    { label: 'New Followers', value: `+${k.newFollowers?.value ?? '0'}`, icon: '📈', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
  ]

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Summary Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Analytics summary">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-card-lg dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-snug">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1.5">{stat.value}</p>
            </div>
          </Card>
        ))}
      </section>

      {/* Performance Analytics */}
      <Card className="p-12 flex flex-col items-center justify-center text-center min-h-[340px]">
        <ChartLargeIcon />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-5">Performance Analytics</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
          Track engagement, reach, and growth across all your connected social platforms.
          Detailed charts and reports will appear here once data is available.
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="primary" size="md" onClick={() => setReportOpen(true)}>Generate Report</Button>
          <Button variant="secondary" size="md" onClick={handleExport}>Export Data</Button>
        </div>
      </Card>

      {/* Top Performing Posts */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Top Performing Posts</h3>
        {topPosts.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No published post analytics yet.</p>
        ) : (
          <div className="space-y-3">
            {topPosts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{post.text}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{post.platform}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{post.reach}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">{post.engagement}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AdminReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        summary={summary}
        topPosts={topPosts}
      />
    </div>
  )
}
