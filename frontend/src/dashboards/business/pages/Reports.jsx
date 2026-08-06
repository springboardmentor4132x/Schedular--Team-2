import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Download, RefreshCw, CheckCircle2,
  Calendar, Megaphone, Filter, TrendingUp,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatCard from '../../../components/dashboard/StatCard'
import { fetchBusinessAnalytics, fetchReports } from '../services/businessService'

const TYPE_STYLES = {
  monthly: { label: 'Monthly', color: '#1E3A8A', bg: 'rgba(30,58,138,.12)', icon: Calendar },
  campaign: { label: 'Campaign', color: '#4F46E5', bg: 'rgba(79,70,229,.12)', icon: Megaphone },
}

const STATUS_STYLES = {
  ready: { label: 'Ready', color: '#22C55E', bg: 'rgba(34,197,94,.12)', icon: CheckCircle2 },
  in_progress: { label: 'Generating', color: '#F59E0B', bg: 'rgba(245,158,11,.12)', icon: RefreshCw },
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[var(--r-md)] px-3 py-2 text-xs shadow-[var(--shadow-md)]"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color ?? p.stroke }}>
          {p.name}: <span className="font-bold">{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

const downloadCSV = (report) => {
  const rows = [
    ['Report', 'Period', 'Generated', 'Posts', 'Published Posts', 'Scheduled Posts', 'Draft Posts', 'Campaigns'],
    [report.title, report.period, report.generatedAt, report.posts, report.publishedPosts, report.scheduledPosts, report.draftPosts, report.campaigns],
  ]
  const csv = rows.map(row => row.join(',')).join('\n')
  const link = document.createElement('a')
  link.href = `data:text/csv,${encodeURIComponent(csv)}`
  link.download = `${report.title.replace(/\s+/g, '-')}.csv`
  link.click()
}

export default function Reports() {
  const [reports, setReports] = useState([])
  const [analytics, setAnalytics] = useState({ monthly: [], platformSplit: [] })
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [reportsData, analyticsData] = await Promise.all([
          fetchReports(),
          fetchBusinessAnalytics({ days: 30 }),
        ])
        if (active) {
          setReports(reportsData ?? [])
          setAnalytics(analyticsData ?? {})
          setLoading(false)
        }
      } catch {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const monthly = useMemo(() => (analytics.monthly ?? []).map(item => ({ month: item.label, posts: item.posts ?? 0 })), [analytics.monthly])
  const totalMonthlyPosts = monthly.reduce((sum, item) => sum + item.posts, 0)

  const filtered = useMemo(() => typeFilter === 'all' ? reports : reports.filter(report => report.type === typeFilter), [reports, typeFilter])
  const readyCount = reports.filter(report => report.status === 'ready').length
  const campaignCount = reports.filter(report => report.type === 'campaign').length
  const monthlyCount = reports.filter(report => report.type === 'monthly').length
  const inProgressCount = reports.filter(report => report.status === 'in_progress').length

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Reports" subtitle="Database-derived summaries for monthly activity and campaigns." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Reports" value={reports.length} icon={FileText} iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)" index={0} />
        <StatCard title="6-Month Posts" value={totalMonthlyPosts} icon={TrendingUp} iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)" index={1} />
        <StatCard title="Ready to Export" value={readyCount} icon={CheckCircle2} iconColor="#22C55E" iconBg="rgba(34,197,94,.12)" index={2} />
        <StatCard title="Campaign Reports" value={campaignCount} icon={Megaphone} iconColor="#F59E0B" iconBg="rgba(245,158,11,.12)" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            Monthly Publishing Trend
          </h2>
          {monthly.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-xs" style={{ color: 'var(--text-subtle)' }}>
              No publishing data in the last 6 months yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip />} />
                <Line type="monotone" dataKey="posts" name="Posts" stroke="#1E3A8A" strokeWidth={2.5} dot={{ r: 3, fill: '#1E3A8A' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            Report Summary
          </h2>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Monthly Reports', count: monthlyCount, color: '#1E3A8A', icon: Calendar },
              { label: 'Campaign Reports', count: campaignCount, color: '#4F46E5', icon: Megaphone },
              { label: 'Ready to Export', count: readyCount, color: '#22C55E', icon: CheckCircle2 },
              { label: 'In Progress', count: inProgressCount, color: '#F59E0B', icon: RefreshCw },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15` }}>
                    <Icon size={15} style={{ color: s.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{s.label}</span>
                      <span className="text-sm font-bold" style={{ color: s.color }}>{s.count}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-alt)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${reports.length ? Math.min((s.count / reports.length) * 100, 100) : 0}%`, background: s.color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'monthly', 'campaign'].map(item => {
            const style = TYPE_STYLES[item]
            const activeChip = typeFilter === item
            return (
              <button key={item} onClick={() => setTypeFilter(item)} className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all" style={{ background: activeChip ? (style?.bg ?? 'var(--primary-light)') : 'var(--card)', borderColor: activeChip ? (style?.color ?? 'var(--primary)') : 'var(--border)', color: activeChip ? (style?.color ?? 'var(--primary)') : 'var(--text-muted)' }}>
                {item === 'all' ? 'All Types' : style?.label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}><Filter size={12} /> Generated from live campaign and post data</div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)' }} />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
                  {['Report', 'Type', 'Period', 'Generated', 'Posts', 'Published', 'Scheduled', 'Drafts', 'Status', ''].map(head => (
                    <th key={head} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filtered.map((report, index) => {
                    const typeStyle = TYPE_STYLES[report.type]
                    const statusStyle = STATUS_STYLES[report.status]
                    const TypeIcon = typeStyle?.icon
                    const StatusIcon = statusStyle?.icon
                    return (
                      <motion.tr key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: index * 0.02 }} className="hover:bg-[var(--bg-alt)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="px-4 py-3 max-w-[220px]"><p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{report.title}</p></td>
                        <td className="px-4 py-3"><span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit" style={{ background: typeStyle?.bg, color: typeStyle?.color }}>{TypeIcon && <TypeIcon size={9} />}{typeStyle?.label}</span></td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{report.period}</td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{report.generatedAt}</td>
                        <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>{report.posts ?? '—'}</td>
                        <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>{report.publishedPosts ?? '—'}</td>
                        <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>{report.scheduledPosts ?? '—'}</td>
                        <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>{report.draftPosts ?? '—'}</td>
                        <td className="px-4 py-3"><span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit" style={{ background: statusStyle?.bg, color: statusStyle?.color }}>{StatusIcon && <StatusIcon size={9} className={report.status === 'in_progress' ? 'animate-spin' : ''} />}{statusStyle?.label}</span></td>
                        <td className="px-4 py-3">{report.status === 'ready' ? <button onClick={() => downloadCSV(report)} className="flex items-center gap-1 text-xs font-semibold hover:underline whitespace-nowrap" style={{ color: 'var(--primary)' }}><Download size={11} /> Export</button> : <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>—</span>}</td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
            <span className="text-xs" style={{ color: 'var(--text-subtle)' }}> {filtered.length} of {reports.length} reports</span>
            <button onClick={() => filtered.filter(report => report.status === 'ready').forEach(downloadCSV)} className="flex items-center gap-1.5 text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}><Download size={12} /> Export all ready reports</button>
          </div>
        </div>
      )}
    </div>
  )
}
