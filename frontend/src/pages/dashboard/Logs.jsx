import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ScrollText, Download, RefreshCw, Search,
  CheckCircle2, XCircle, Clock, Filter,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import PageHeader from '../../components/dashboard/PageHeader'

const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C' },
  facebook:  { icon: FaFacebook,  color: '#1877F2' },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2' },
  x:         { icon: FaXTwitter,  color: '#000000' },
}

const STATUS_STYLES = {
  published: { icon: CheckCircle2, color: '#22C55E', bg: 'rgba(34,197,94,.12)',   label: 'Published' },
  failed:    { icon: XCircle,      color: '#EF4444', bg: 'rgba(239,68,68,.12)',   label: 'Failed'    },
  scheduled: { icon: Clock,        color: '#1E3A8A', bg: 'rgba(30,58,138,.12)',   label: 'Scheduled' },
}

const LOGS = [
  { id:1,  title:'Summer Sale Kick-off',    platform:'instagram', date:'2025-07-20', time:'10:02 AM', status:'published', campaign:'Summer Sale 2025',  reach:4200, engagement:340 },
  { id:2,  title:'LinkedIn Thought Post',   platform:'linkedin',  date:'2025-07-20', time:'09:05 AM', status:'published', campaign:null,                reach:1800, engagement:120 },
  { id:3,  title:'X Thread Recap',          platform:'x',         date:'2025-07-19', time:'04:00 PM', status:'published', campaign:null,                reach:3100, engagement:290 },
  { id:4,  title:'Facebook Campaign Ad',    platform:'facebook',  date:'2025-07-19', time:'11:33 AM', status:'failed',    campaign:'Brand Awareness',   reach:0,    engagement:0   },
  { id:5,  title:'Instagram Reel Upload',   platform:'instagram', date:'2025-07-18', time:'03:10 PM', status:'failed',    campaign:'Summer Sale 2025',  reach:0,    engagement:0   },
  { id:6,  title:'Product Feature Post',    platform:'linkedin',  date:'2025-07-18', time:'08:00 AM', status:'published', campaign:'Product Launch Q3', reach:2400, engagement:198 },
  { id:7,  title:'Customer Spotlight',      platform:'facebook',  date:'2025-07-17', time:'09:30 AM', status:'published', campaign:null,                reach:5600, engagement:430 },
  { id:8,  title:'Weekly Tips Carousel',    platform:'instagram', date:'2025-07-14', time:'12:00 PM', status:'published', campaign:null,                reach:6700, engagement:520 },
  { id:9,  title:'Blog Post Promo',         platform:'linkedin',  date:'2025-07-14', time:'08:15 AM', status:'published', campaign:null,                reach:1900, engagement:145 },
  { id:10, title:'Weekend Contest Post',    platform:'x',         date:'2025-07-13', time:'10:00 AM', status:'published', campaign:'Brand Awareness',   reach:8900, engagement:670 },
]

const COLS = ['Post','Platform','Date','Time','Status','Reach','Engagement','Actions']

export default function Logs() {
  const [search,  setSearch]  = useState('')
  const [status,  setStatus]  = useState('all')
  const [platform,setPlatform]= useState('all')

  const filtered = LOGS.filter(l => {
    const matchS = search ? l.title.toLowerCase().includes(search.toLowerCase()) : true
    const matchSt = status   === 'all' || l.status   === status
    const matchPl = platform === 'all' || l.platform === platform
    return matchS && matchSt && matchPl
  })

  const exportCSV = () => {
    const rows = [COLS.join(','), ...filtered.map(l =>
      [l.title, l.platform, l.date, l.time, l.status, l.reach, l.engagement].join(',')
    )].join('\n')
    const a = document.createElement('a'); a.href = `data:text/csv,${encodeURIComponent(rows)}`
    a.download = 'publishing-logs.csv'; a.click()
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Publishing Logs"
        subtitle={`${LOGS.length} total log entries`}
        actions={
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] border text-sm font-semibold transition-all hover:shadow-[var(--shadow-sm)]"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            <Download size={15} /> Export CSV
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs…"
            className="w-full h-10 pl-9 pr-4 text-sm rounded-[var(--r-md)] border outline-none"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all','published','failed','scheduled'].map(s => {
            const st = STATUS_STYLES[s]; const active = status === s
            return (
              <button key={s} onClick={() => setStatus(s)}
                className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                style={{
                  background:  active ? (st?.bg ?? 'var(--primary-light)') : 'var(--card)',
                  borderColor: active ? (st?.color ?? 'var(--primary)') : 'var(--border)',
                  color:       active ? (st?.color ?? 'var(--primary)') : 'var(--text-muted)',
                }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            )
          })}
          {['all','instagram','facebook','linkedin','x'].map(p => {
            const meta = PLATFORM_META[p]; const Icon = meta?.icon; const active = platform === p
            return (
              <button key={p} onClick={() => setPlatform(p)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all"
                style={{
                  background:  active ? (meta ? `${meta.color}15` : 'var(--primary-light)') : 'var(--card)',
                  borderColor: active ? (meta?.color ?? 'var(--primary)') : 'var(--border)',
                  color:       active ? (meta?.color ?? 'var(--primary)') : 'var(--text-muted)',
                }}>
                {Icon && <Icon size={11} />} {p === 'all' ? 'All' : null}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
                {COLS.map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-sm" style={{ color: 'var(--text-subtle)' }}>No logs match your filters.</td></tr>
              )}
              {filtered.map((log, i) => {
                const meta  = PLATFORM_META[log.platform]; const PIcon = meta?.icon
                const st    = STATUS_STYLES[log.status];   const SIcon = st?.icon
                return (
                  <motion.tr key={log.id}
                    initial={{ opacity:0 }} animate={{ opacity:1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-[var(--bg-alt)] transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-3 font-medium max-w-[200px]">
                      <p className="truncate" style={{ color: 'var(--text)' }}>{log.title}</p>
                      {log.campaign && (
                        <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-subtle)' }}>{log.campaign}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {PIcon && <PIcon size={13} style={{ color: meta.color }} />}
                        <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{log.platform}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{log.date}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{log.time}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {SIcon && <SIcon size={12} style={{ color: st.color }} />}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>
                      {log.reach > 0 ? log.reach.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>
                      {log.engagement > 0 ? log.engagement.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {log.status === 'failed' ? (
                        <button className="flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: '#F59E0B' }}>
                          <RefreshCw size={11} /> Retry
                        </button>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>—</span>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div className="px-4 py-3 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
          <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>
            Showing {filtered.length} of {LOGS.length} logs
          </span>
          <div className="flex gap-4 text-xs">
            <span style={{ color: '#22C55E' }}>{LOGS.filter(l => l.status === 'published').length} published</span>
            <span style={{ color: '#EF4444' }}>{LOGS.filter(l => l.status === 'failed').length} failed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
