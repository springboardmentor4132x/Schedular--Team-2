import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone, Search,
  TrendingUp, Calendar, DollarSign, Target,
  CheckCircle2,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import { useAppState } from '../../context/AppStateContext'
import PageHeader from '../../components/dashboard/PageHeader'
import EmptyState from '../../components/dashboard/EmptyState'

/* ── Status styles ─────────────────────────────────────────────── */
const STATUS_STYLES = {
  active:    { label: 'Active',    bg: 'rgba(34,197,94,.12)',    color: '#22C55E' },
  paused:    { label: 'Paused',    bg: 'rgba(245,158,11,.12)',   color: '#F59E0B' },
  completed: { label: 'Completed', bg: 'rgba(100,116,139,.12)',  color: '#64748B' },
  draft:     { label: 'Draft',     bg: 'rgba(30,58,138,.12)',    color: '#1E3A8A' },
}

/* ── Platform icons ────────────────────────────────────────────── */
const PLATFORM_ICONS = {
  instagram: { icon: FaInstagram, color: '#E1306C' },
  facebook:  { icon: FaFacebook,  color: '#1877F2' },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2' },
  x:         { icon: FaXTwitter,  color: '#374151' },
  youtube:   { icon: FaYoutube,   color: '#FF0000' },
  pinterest: { icon: FaPinterest, color: '#E60023' },
}

/* ── Main ───────────────────────────────────────────────────────── */
export default function Campaigns() {
  const { businessCampaigns: campaigns } = useAppState()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = campaigns.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status === 'all' || c.status === status
    return matchSearch && matchStatus
  })

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Campaigns"
        subtitle={`${campaigns.filter(c => c.status === 'active').length} active · ${campaigns.length} total`}
      />

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-subtle)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search campaigns…"
            className="w-full h-10 pl-9 pr-4 text-sm rounded-[var(--r-md)] border outline-none"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['all', 'active', 'paused', 'completed', 'draft'].map(s => {
            const st = STATUS_STYLES[s]
            const active = status === s
            return (
              <button key={s} onClick={() => setStatus(s)}
                className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                style={{
                  background:  active ? (st?.bg    ?? 'var(--primary-light)') : 'var(--card)',
                  borderColor: active ? (st?.color ?? 'var(--primary)')       : 'var(--border)',
                  color:       active ? (st?.color ?? 'var(--primary)')       : 'var(--text-muted)',
                }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="card">
          <EmptyState
            icon={Megaphone}
            title="No campaigns found"
            message={search
              ? 'No campaigns match your search.'
              : 'Your marketing team will create campaigns for you.'}
          />
        </div>
      )}

      {/* ── Campaign cards (view-only) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filtered.map((c, i) => {
            const s = STATUS_STYLES[c.status]
            const budgetPct = c.budget ? Math.round((c.spent / c.budget) * 100) : 0

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="card p-5"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                    <h3 className="text-base font-bold truncate"
                      style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Target size={11} style={{ color: 'var(--text-subtle)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {c.objective}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { icon: DollarSign, label: 'Budget', value: `$${c.budget.toLocaleString()}` },
                    { icon: TrendingUp, label: 'Reach',  value: c.reach >= 1000 ? `${(c.reach / 1000).toFixed(0)}K` : c.reach || '—' },
                    { icon: Megaphone,  label: 'Posts',  value: c.posts || 0 },
                  ].map(m => {
                    const Icon = m.icon
                    return (
                      <div key={m.label}
                        className="flex flex-col items-center gap-0.5 p-2 rounded-lg"
                        style={{ background: 'var(--bg-alt)' }}>
                        <Icon size={12} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                          {m.value}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>
                          {m.label}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Budget progress */}
                {c.budget > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        Budget spent
                      </span>
                      <span className="text-[10px] font-bold"
                        style={{ color: budgetPct > 90 ? 'var(--error)' : 'var(--text)' }}>
                        ${c.spent.toLocaleString()} / ${c.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-alt)' }}>
                      <div className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${budgetPct}%`,
                          background: budgetPct > 90 ? 'var(--error)' : 'var(--primary)',
                        }} />
                    </div>
                  </div>
                )}

                {/* Platform icons */}
                {c.platforms?.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    {c.platforms.map(p => {
                      const meta = PLATFORM_ICONS[p]
                      const Icon = meta?.icon
                      return Icon ? (
                        <div key={p}
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: `${meta.color}15` }}>
                          <Icon size={10} style={{ color: meta.color }} />
                        </div>
                      ) : null
                    })}
                  </div>
                )}

                {/* Dates + completion */}
                <div className="flex items-center justify-between pt-2.5 border-t"
                  style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-1">
                    <Calendar size={10} style={{ color: 'var(--text-subtle)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>
                      {c.start} – {c.end}
                    </span>
                  </div>
                  {c.status === 'completed' ? (
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: '#22C55E' }}>
                      <CheckCircle2 size={10} /> Completed
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold" style={{ color: 'var(--primary)' }}>
                      {c.progress}% complete
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
