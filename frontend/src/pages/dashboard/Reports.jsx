import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Download, RefreshCw, CheckCircle2,
  Clock, BarChart2, Calendar, Megaphone,
  TrendingUp, Eye, Heart, Send, Filter,
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import PageHeader from '../../components/dashboard/PageHeader'
import StatCard from '../../components/dashboard/StatCard'
import { MOCK_REPORTS, MOCK_ANALYTICS } from '../../services/mockData'

/**
 * Reports — Business User
 * Monthly + campaign reports, export button, summary KPI cards,
 * performance chart preview.
 */

const TYPE_STYLES = {
  monthly:  { label: 'Monthly',  color: '#1E3A8A', bg: 'rgba(30,58,138,.12)', icon: Calendar  },
  campaign: { label: 'Campaign', color: '#4F46E5', bg: 'rgba(79,70,229,.12)', icon: Megaphone },
}

const STATUS_STYLES = {
  ready:       { label: 'Ready',       color: '#22C55E', bg: 'rgba(34,197,94,.12)',   icon: CheckCircle2 },
  in_progress: { label: 'Generating',  color: '#F59E0B', bg: 'rgba(245,158,11,.12)',  icon: RefreshCw    },
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

function downloadCSV(report) {
  const rows = [
    ['Report', 'Period', 'Generated', 'Reach', 'Engagement', 'Posts', 'Campaigns'],
    [report.title, report.period, report.generatedAt, report.reach, report.engagement, report.posts, report.campaigns],
  ]
  const csv = rows.map(r => r.join(',')).join('\n')
  const a   = document.createElement('a')
  a.href    = `data:text/csv,${encodeURIComponent(csv)}`
  a.download = `${report.title.replace(/\s+/g,'-')}.csv`
  a.click()
}

export default function Reports() {
  const [reports,    setReports]    = useState(MOCK_REPORTS)
  const [typeFilter, setTypeFilter] = useState('all')
  const [generating, setGenerating] = useState(false)

  const filtered = typeFilter === 'all'
    ? reports
    : reports.filter(r => r.type === typeFilter)

  const handleGenerate = async (type) => {
    setGenerating(true)
    // Simulate API call — swap with reportsApi.generate(type)
    await new Promise(r => setTimeout(r, 1400))
    const newReport = {
      id: Date.now(),
      title: type === 'monthly'
        ? `${new Date().toLocaleString('en-US',{month:'long',year:'numeric'})} Performance Report`
        : 'New Campaign Report',
      type,
      period: type === 'monthly'
        ? new Date().toLocaleString('en-US',{month:'long',year:'numeric'})
        : 'Jul 2025',
      generatedAt: new Date().toISOString().split('T')[0],
      reach: 0, engagement: 0, posts: 0, campaigns: 0,
      status: 'ready',
    }
    setReports(prev => [newReport, ...prev])
    setGenerating(false)
  }

  const totalReach      = MOCK_REPORTS.filter(r => r.status === 'ready').reduce((s, r) => s + r.reach, 0)
  const totalEngagement = MOCK_REPORTS.filter(r => r.status === 'ready').reduce((s, r) => s + r.engagement, 0)

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Reports"
        subtitle="Performance reports for your campaigns and monthly activity."
        actions={
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => handleGenerate('monthly')} disabled={generating}
              className="flex items-center gap-2 px-3 h-9 rounded-[var(--r-md)] border text-xs font-semibold transition-all hover:shadow-[var(--shadow-sm)]"
              style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
              {generating ? <RefreshCw size={13} className="animate-spin" /> : <Calendar size={13} />}
              Monthly
            </button>
            <button onClick={() => handleGenerate('campaign')} disabled={generating}
              className="flex items-center gap-2 px-3 h-9 rounded-[var(--r-md)] border text-xs font-semibold transition-all hover:shadow-[var(--shadow-sm)]"
              style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
              <Megaphone size={13} /> Campaign
            </button>
            <button
              onClick={() => { filtered.filter(r => r.status === 'ready').forEach(r => { const a = document.createElement('a'); a.href = `data:application/pdf,${encodeURIComponent(r.title)}`; a.download = `${r.title.replace(/\s+/g,'-')}.pdf`; a.click() }) }}
              className="flex items-center gap-2 px-3 h-9 rounded-[var(--r-md)] border text-xs font-semibold transition-all hover:shadow-[var(--shadow-sm)]"
              style={{ background:'rgba(239,68,68,.06)', borderColor:'rgba(239,68,68,.25)', color:'#EF4444' }}>
              <Download size={13} /> Export PDF
            </button>
            <button
              onClick={() => { filtered.filter(r => r.status === 'ready').forEach(downloadCSV) }}
              className="flex items-center gap-2 px-3 h-9 rounded-[var(--r-md)] text-xs font-semibold text-white transition-all hover:brightness-105"
              style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
              <Download size={13} /> Export Excel
            </button>
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Reports"     value={reports.length}                                      icon={FileText}  iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)"  index={0} />
        <StatCard title="Lifetime Reach"    value={`${(totalReach/1000).toFixed(0)}K`}                 icon={Eye}       iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)"  trend={18} index={1} />
        <StatCard title="Lifetime Engagement" value={`${(totalEngagement/1000).toFixed(1)}K`}          icon={TrendingUp} iconColor="#22C55E" iconBg="rgba(34,197,94,.12)"  trend={12} index={2} />
        <StatCard title="Campaign Reports"  value={reports.filter(r => r.type === 'campaign').length}  icon={Megaphone} iconColor="#F59E0B" iconBg="rgba(245,158,11,.12)" index={3} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Monthly growth chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5 lg:col-span-2"
        >
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            Monthly Performance Overview
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MOCK_ANALYTICS.monthly} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
              <YAxis              tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Line type="monotone" dataKey="reach"      name="Reach"      stroke="#1E3A8A" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="engagement" name="Engagement" stroke="#4F46E5" strokeWidth={2}   dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Report type summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-5"
        >
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            Report Summary
          </h2>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Monthly Reports',  count: reports.filter(r=>r.type==='monthly').length,  color: '#1E3A8A', icon: Calendar  },
              { label: 'Campaign Reports', count: reports.filter(r=>r.type==='campaign').length, color: '#4F46E5', icon: Megaphone },
              { label: 'Ready to Export',  count: reports.filter(r=>r.status==='ready').length,  color: '#22C55E', icon: CheckCircle2 },
              { label: 'In Progress',      count: reports.filter(r=>r.status==='in_progress').length, color: '#F59E0B', icon: RefreshCw },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.color}15` }}>
                    <Icon size={15} style={{ color: s.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{s.label}</span>
                      <span className="text-sm font-bold" style={{ color: s.color }}>{s.count}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-alt)' }}>
                      <div className="h-1.5 rounded-full"
                        style={{ width: `${Math.min((s.count / reports.length) * 100, 100)}%`, background: s.color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Reports list */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card overflow-hidden">

        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            All Reports
          </h2>
          <div className="flex gap-1.5">
            {['all','monthly','campaign'].map(t => {
              const st = TYPE_STYLES[t]
              return (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                  style={{
                    background:  typeFilter === t ? (st?.bg ?? 'var(--primary-light)') : 'var(--card)',
                    borderColor: typeFilter === t ? (st?.color ?? 'var(--primary)')    : 'var(--border)',
                    color:       typeFilter === t ? (st?.color ?? 'var(--primary)')    : 'var(--text-muted)',
                  }}>
                  {t === 'all' ? 'All Types' : st?.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
                {['Report','Type','Period','Generated','Reach','Engagement','Posts','Status',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((r, i) => {
                  const ts  = TYPE_STYLES[r.type]
                  const ss  = STATUS_STYLES[r.status]
                  const SIcon = ss?.icon
                  const TIcon = ts?.icon
                  const isInProgress = r.status === 'in_progress'
                  return (
                    <motion.tr key={r.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-[var(--bg-alt)] transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{r.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit"
                          style={{ background: ts?.bg, color: ts?.color }}>
                          {TIcon && <TIcon size={9} />}
                          {ts?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {r.period}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {r.generatedAt}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>
                        {r.reach > 0 ? `${(r.reach/1000).toFixed(0)}K` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>
                        {r.engagement > 0 ? r.engagement.toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>
                        {r.posts > 0 ? r.posts : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit"
                          style={{ background: ss?.bg, color: ss?.color }}>
                          {SIcon && <SIcon size={9} className={isInProgress ? 'animate-spin' : ''} />}
                          {ss?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.status === 'ready' ? (
                          <button
                            onClick={() => downloadCSV(r)}
                            className="flex items-center gap-1 text-xs font-semibold hover:underline whitespace-nowrap"
                            style={{ color: 'var(--primary)' }}
                          >
                            <Download size={11} /> Export
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>—</span>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
          <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>
            {filtered.length} of {reports.length} reports
          </span>
          <button
            onClick={() => {
              filtered.filter(r => r.status === 'ready').forEach(downloadCSV)
            }}
            className="flex items-center gap-1.5 text-xs font-semibold hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            <Download size={12} /> Export all ready reports
          </button>
        </div>
      </motion.div>
    </div>
  )
}
