import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScrollText, Download, RefreshCw, CheckCircle2,
  Calendar, Megaphone, Users,
  ArrowLeft,
} from 'lucide-react'
import {
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatCard from '../../../components/dashboard/StatCard'
import { marketingService } from '../../../services/marketingService'

const TYPE_STYLES = {
  monthly:  { label:'Monthly',  color:'#1E3A8A', bg:'rgba(30,58,138,.12)', icon:Calendar  },
  campaign: { label:'Campaign', color:'#4F46E5', bg:'rgba(79,70,229,.12)', icon:Megaphone },
  client:   { label:'Client',   color:'#22C55E', bg:'rgba(34,197,94,.12)', icon:Users     },
}
const STATUS_STYLES = {
  ready:       { label:'Ready',      color:'#22C55E', bg:'rgba(34,197,94,.12)',  icon:CheckCircle2 },
  in_progress: { label:'Generating', color:'#F59E0B', bg:'rgba(245,158,11,.12)', icon:RefreshCw   },
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[var(--r-md)] px-3 py-2 text-xs shadow-[var(--shadow-md)]"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color ?? p.stroke }}>
          {p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  )
}

function downloadCSV(report) {
  const rows = [
    ['Report', 'Client', 'Type', 'Period', 'Generated', 'Posts', 'Published', 'Campaigns'],
    [report.title, report.client, report.type, report.period, report.generatedAt, report.posts, report.publishedPosts, report.campaigns],
  ]
  const csv = rows.map(r => r.join(',')).join('\n')
  const a = document.createElement('a')
  a.href = `data:text/csv,${encodeURIComponent(csv)}`
  a.download = `${report.title.replace(/\s+/g, '-')}.csv`
  a.click()
}

export default function MarketingReportsPage() {
  const navigate = useNavigate()
  const { activeClient } = useClient()
  const [reports, setReports] = useState([])
  const [trend, setTrend] = useState([])
  const [typeFilter, setTypeFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const result = await marketingService.reports()
        if (!mounted) return
        setReports(result?.reports ?? [])
        setTrend(result?.trend ?? [])
      } catch {
        if (!mounted) return
        setReports([])
        setTrend([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const filtered = reports.filter(r => {
    const matchType   = typeFilter === 'all' || r.type === typeFilter
    const matchClient = clientFilter === 'all' || r.client === clientFilter
    return matchType && matchClient
  })

  const clientComparison = reports.filter(r => r.type === 'client').map(r => ({ name: r.client, posts: r.posts }))
  const clientNames = useMemo(() => ['all', ...new Set(reports.map(r => r.client))], [reports])

  const handleGenerate = async (type) => {
    if (generating) return
    setGenerating(true)
    await new Promise(r => setTimeout(r, 900))
    try {
      // Generate from the real DB-backed reports instead of fake zeros.
      const result = await marketingService.reports()
      const all = result?.reports ?? []
      const generatedAt = new Date().toISOString().split('T')[0]
      const period = new Date().toLocaleString('en-US', { month:'long', year:'numeric' })

      let fresh = []
      if (type === 'monthly') {
        fresh = all.filter(r => r.type === 'monthly').map(r => ({ ...r, generatedAt }))
      } else if (type === 'client') {
        fresh = all
          .filter(r => r.type === 'client' && (!activeClient || r.client === activeClient.name))
          .map(r => ({ ...r, generatedAt }))
      } else {
        fresh = all.filter(r => r.type === 'campaign').map(r => ({ ...r, generatedAt }))
      }

      if (fresh.length === 0) {
        fresh = [{
          id: `${type}-${Date.now()}`, type,
          title: type === 'monthly'
            ? `${period} — All Clients Report`
            : type === 'client'
              ? `${activeClient?.name ?? 'Client'} — Monthly Report`
              : 'Campaign Report',
          client: type === 'client' ? (activeClient?.name ?? 'Client') : 'All Clients',
          period, generatedAt,
          posts: 0, publishedPosts: 0, scheduledPosts: 0, drafts: 0, campaigns: 0, status:'ready',
        }]
      }

      setReports(prev => [...fresh, ...prev.filter(p => !fresh.some(f => f.id === p.id))])
      setTrend(result?.trend ?? [])
      showToast(`Report generated with live data (${fresh.reduce((n, r) => n + (r.posts || 0), 0)} posts).`)
    } catch {
      // Backend unreachable — surface a minimal placeholder.
      setReports(prev => [{
        id: `${type}-${Date.now()}`, type,
        title: 'Report generation failed',
        client: '—', period: '—', generatedAt: new Date().toISOString().split('T')[0],
        posts: 0, publishedPosts: 0, scheduledPosts: 0, drafts: 0, campaigns: 0, status:'ready',
      }, ...prev])
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-[var(--r-md)] text-sm font-semibold shadow-[var(--shadow-lg)]"
            style={{ background: toast.type === 'error' ? 'rgba(239,68,68,.95)' : 'rgba(34,197,94,.95)', color:'#fff' }}>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => navigate(activeClient ? '/dashboard/mkt/workspace' : '/dashboard/marketing')} className="flex items-center gap-1.5 text-sm font-semibold mb-4 hover:underline" style={{ color: 'var(--primary)' }}>
        <ArrowLeft size={15} /> Back
      </button>

      <PageHeader
        title="Reports"
        subtitle="Client, campaign and monthly performance reports."
        actions={
          <div className="flex gap-2">
            <button onClick={() => handleGenerate('monthly')} disabled={generating}
              className="flex items-center gap-1.5 px-3 h-9 rounded-[var(--r-md)] border text-xs font-semibold transition-all"
              style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
              {generating ? <RefreshCw size={12} className="animate-spin" /> : <Calendar size={12} />} Monthly
            </button>
            <button onClick={() => handleGenerate('client')} disabled={generating || !activeClient}
              className="flex items-center gap-1.5 px-3 h-9 rounded-[var(--r-md)] border text-xs font-semibold transition-all"
              style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
              <Users size={12} /> Client
            </button>
            <button onClick={() => handleGenerate('campaign')} disabled={generating}
              className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105"
              style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
              <Megaphone size={14} /> Campaign Report
            </button>
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Reports" value={reports.length} icon={ScrollText} iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)" index={0} />
        <StatCard title="Client Reports" value={reports.filter(r => r.type === 'client').length} icon={Users} iconColor="#22C55E" iconBg="rgba(34,197,94,.12)" index={1} />
        <StatCard title="Campaign Reports" value={reports.filter(r => r.type === 'campaign').length} icon={Megaphone} iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)" index={2} />
        <StatCard title="Ready to Export" value={reports.filter(r => r.status === 'ready').length} icon={CheckCircle2} iconColor="#F59E0B" iconBg="rgba(245,158,11,.12)" index={3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>Monthly Post Volume</h2>
          {trend.length === 0 ? (
            <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Line type="monotone" dataKey="posts" name="Posts" stroke="#1E3A8A" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>Posts by Client</h2>
          {clientComparison.length === 0 ? (
            <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>No clients yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {clientComparison.map(c => (
                <li key={c.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: 'var(--text-muted)' }}>{c.name}</span>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>{c.posts}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-alt)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min((c.posts || 0) * 10, 100)}%`, background: '#1E3A8A' }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>

      {/* Reports table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b flex-wrap gap-2" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>All Reports</h2>
          <div className="flex gap-2 flex-wrap items-center">
            {/* Client filter */}
            <select value={clientFilter} onChange={e => setClientFilter(e.target.value)}
              className="h-7 px-2 rounded-full border text-[10px] font-semibold outline-none"
              style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text-muted)' }}>
              {clientNames.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Clients' : c}</option>
              ))}
            </select>
            {/* Type filter */}
            <div className="flex gap-1.5">
              {['all', 'monthly', 'campaign', 'client'].map(t => {
                const st = TYPE_STYLES[t]
                return (
                  <button key={t} onClick={() => setTypeFilter(t)} className="px-2.5 py-1 rounded-full border text-[10px] font-semibold transition-all" style={{ background: typeFilter === t ? (st?.bg ?? 'var(--primary-light)') : 'var(--card)', borderColor: typeFilter === t ? (st?.color ?? 'var(--primary)') : 'var(--border)', color: typeFilter === t ? (st?.color ?? 'var(--primary)') : 'var(--text-muted)' }}>
                    {t === 'all' ? 'All' : st?.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
                {['Report', 'Type', 'Client', 'Period', 'Generated', 'Posts', 'Published', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((r, i) => {
                  const ts = TYPE_STYLES[r.type]
                  const ss = STATUS_STYLES[r.status]
                  const TIcon = ts?.icon
                  const SIcon = ss?.icon
                  return (
                    <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.02 }} className="hover:bg-[var(--bg-alt)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{r.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit" style={{ background: ts?.bg, color: ts?.color }}>
                          {TIcon && <TIcon size={9} />} {ts?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{r.client}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{r.period}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{r.generatedAt}</td>
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>{r.posts}</td>
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>{r.publishedPosts}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit" style={{ background: ss?.bg, color: ss?.color }}>
                          {SIcon && <SIcon size={9} className={r.status === 'in_progress' ? 'animate-spin' : ''} />}{ss?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.status === 'ready' ? (
                          <button onClick={() => downloadCSV(r)} className="flex items-center gap-1 text-xs font-semibold hover:underline whitespace-nowrap" style={{ color: 'var(--primary)' }}>
                            <Download size={11} /> Export
                          </button>
                        ) : <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>—</span>}
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {!loading && reports.length === 0 && (
          <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--text-subtle)' }}>No reports yet.</div>
        )}
        <div className="px-4 py-3 border-t flex items-center justify-between flex-wrap gap-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
          <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>{filtered.length} of {reports.length} reports</span>
          <button onClick={() => filtered.filter(r => r.status === 'ready').forEach(downloadCSV)}
            className="flex items-center gap-1.5 text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
            <Download size={12} /> Export all ready
          </button>
        </div>
      </motion.div>
    </div>
  )
}
