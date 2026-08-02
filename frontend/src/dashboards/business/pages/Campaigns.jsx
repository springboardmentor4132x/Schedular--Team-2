import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone, Search,
  Calendar, DollarSign,
  Target, MoreHorizontal, CheckCircle2,
} from 'lucide-react'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { fetchCampaignProgress, fetchCampaigns } from '../services/businessService'

const STATUS_STYLES = {
  active:    { label:'Active',    bg:'rgba(34,197,94,.12)',   color:'#22C55E' },
  paused:    { label:'Paused',    bg:'rgba(245,158,11,.12)',  color:'#F59E0B' },
  completed: { label:'Completed', bg:'rgba(100,116,139,.12)', color:'#64748B' },
  draft:     { label:'Draft',     bg:'rgba(30,58,138,.12)',   color:'#1E3A8A' },
}

const normalizeStatus = (status) => String(status ?? '').toLowerCase() || 'draft'

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState('all')
  useEffect(() => {
      let active = true

      const load = async () => {
        try {
          const data = await fetchCampaigns()
          const enriched = await Promise.all((data ?? []).map(async campaign => {
            try {
              const progressResponse = await fetchCampaignProgress(campaign.id)
              return {
                ...campaign,
                status: normalizeStatus(campaign.status),
                target_platforms: campaign.target_platforms ?? [],
                progress: progressResponse?.progress ?? {},
              }
            } catch {
              return {
                ...campaign,
                status: normalizeStatus(campaign.status),
                target_platforms: campaign.target_platforms ?? [],
                progress: {},
              }
            }
          }))

          if (active) {
            setCampaigns(enriched)
            setLoading(false)
          }
        } catch {
          if (active) setLoading(false)
        }
      }

      load()
      return () => { active = false }
  }, [])

  const filtered = useMemo(() => campaigns.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status === 'all' || c.status === status
    return matchSearch && matchStatus
  }), [campaigns, search, status])

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Campaigns"
        subtitle={`${campaigns.filter(c => c.status === 'active').length} active campaigns`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-subtle)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns…"
            className="w-full h-10 pl-9 pr-4 text-sm rounded-[var(--r-md)] border outline-none"
            style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }} />
        </div>
        <div className="flex gap-1.5">
          {['all','active','paused','completed','draft'].map(s => {
            const st = STATUS_STYLES[s]
            const active = status === s
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
        </div>
      </div>

      {/* Empty */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-64 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={Megaphone} title="No campaigns found" message="Your marketing team will create campaigns for you." /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((c, i) => {
              const s = STATUS_STYLES[c.status]
              const progress = c.progress ?? {}
              const totalPosts = Number.isFinite(Number(progress.total_posts)) ? Number(progress.total_posts) : 0
              const publishedCount = Number.isFinite(Number(progress.published)) ? Number(progress.published) : 0
              const scheduledCount = Number.isFinite(Number(progress.scheduled)) ? Number(progress.scheduled) : 0
              const draftCount = Number.isFinite(Number(progress.drafts)) ? Number(progress.drafts) : 0
              const completionPct = Number.isFinite(Number(progress.completion_percentage)) ? Number(progress.completion_percentage) : 0
              const budgetVal = Number.isFinite(Number(c.budget)) ? Number(c.budget) : 0
              return (
                <motion.div key={c.id}
                  initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, scale:0.95 }}
                  transition={{ duration:0.2, delay: i * 0.05 }}
                  className="card p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background:s.bg, color:s.color }}>{s.label}</span>
                      </div>
                      <h3 className="text-base font-bold truncate" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>
                        {c.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Target size={11} style={{ color:'var(--text-subtle)' }} />
                        <span className="text-xs" style={{ color:'var(--text-muted)' }}>{c.objective}</span>
                      </div>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)] transition-colors" style={{ color:'var(--text-muted)' }}>
                      <MoreHorizontal size={15} />
                    </button>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { icon:DollarSign, label:'Budget', value:`$${budgetVal.toLocaleString()}` },
                      { icon:Megaphone,   label:'Posts',  value: totalPosts },
                      { icon:CheckCircle2, label:'Published', value: publishedCount },
                    ].map(m => {
                      const Icon = m.icon
                      return (
                        <div key={m.label} className="flex flex-col items-center gap-0.5 p-2 rounded-lg"
                          style={{ background:'var(--bg-alt)' }}>
                          <Icon size={12} style={{ color:'var(--text-muted)' }} />
                          <span className="text-xs font-bold" style={{ color:'var(--text)' }}>{m.value}</span>
                          <span className="text-[10px]" style={{ color:'var(--text-subtle)' }}>{m.label}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Completion progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs" style={{ color:'var(--text-muted)' }}>Completion</span>
                      <span className="text-xs font-bold" style={{ color: completionPct === 100 ? '#22C55E' : 'var(--text)' }}>
                        {publishedCount}/{totalPosts} published · {completionPct}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background:'var(--bg-alt)' }}>
                      <div className="h-2 rounded-full transition-all duration-500"
                        style={{ width:`${completionPct}%`, background: completionPct === 100 ? '#22C55E' : 'var(--primary)' }} />
                    </div>
                  </div>

                  {/* Date + status counts */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={11} style={{ color:'var(--text-subtle)' }} />
                      <span className="text-[11px]" style={{ color:'var(--text-subtle)' }}>
                        {c.start_date ? new Date(c.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'} – {c.end_date ? new Date(c.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {scheduledCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background:'rgba(30,58,138,.10)', color:'#1E3A8A' }}>{scheduledCount} scheduled</span>
                      )}
                      {draftCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background:'rgba(100,116,139,.10)', color:'#64748B' }}>{draftCount} drafts</span>
                      )}
                    </div>
                  </div>

          {/* Footer actions — view only for Business User */}
                  {c.status !== 'completed' && (
                    <div className="flex gap-2 pt-3 mt-3 border-t" style={{ borderColor:'var(--border)' }}>
                      <span className="flex items-center gap-1 text-xs" style={{ color:'var(--text-subtle)' }}>
                        Managed by your marketing team
                      </span>
                    </div>
                  )}
                  {c.status === 'completed' && (
                    <div className="flex items-center gap-1 pt-3 mt-3 border-t text-xs" style={{ borderColor:'var(--border)', color:'#22C55E' }}>
                      <CheckCircle2 size={12} /> Campaign completed
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}