import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck, Search, X, ChevronLeft, ChevronRight,
  Clock, Eye, Info, Filter,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import PageHeader from '../../components/dashboard/PageHeader'
import EmptyState from '../../components/dashboard/EmptyState'
import StatCard from '../../components/dashboard/StatCard'
import { MOCK_SCHEDULED_POSTS, MOCK_CAMPAIGNS } from '../../services/mockData'

/* ── Platform meta ─────────────────────────────────────────────── */
const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C', label: 'Instagram' },
  facebook:  { icon: FaFacebook,  color: '#1877F2', label: 'Facebook'  },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2', label: 'LinkedIn'  },
  x:         { icon: FaXTwitter,  color: '#374151', label: 'X'         },
  youtube:   { icon: FaYoutube,   color: '#FF0000', label: 'YouTube'   },
  pinterest: { icon: FaPinterest, color: '#E60023', label: 'Pinterest' },
}

/* ── Status styles ─────────────────────────────────────────────── */
const STATUS_STYLES = {
  scheduled: { label: 'Scheduled', color: '#1E3A8A', bg: 'rgba(30,58,138,.12)'   },
  pending:   { label: 'Pending',   color: '#F59E0B', bg: 'rgba(245,158,11,.12)'  },
  failed:    { label: 'Failed',    color: '#EF4444', bg: 'rgba(239,68,68,.12)'   },
  cancelled: { label: 'Cancelled', color: '#64748B', bg: 'rgba(100,116,139,.12)' },
}

const CONTENT_TYPE_COLORS = {
  Text:     { color: '#64748B', bg: 'rgba(100,116,139,.10)' },
  Image:    { color: '#0A66C2', bg: 'rgba(10,102,194,.10)'  },
  Video:    { color: '#E1306C', bg: 'rgba(225,48,108,.10)'  },
  Carousel: { color: '#4F46E5', bg: 'rgba(79,70,229,.10)'   },
  Story:    { color: '#F59E0B', bg: 'rgba(245,158,11,.10)'  },
  Reel:     { color: '#22C55E', bg: 'rgba(34,197,94,.10)'   },
}

const CAMPAIGNS = ['All', ...Array.from(new Set(MOCK_SCHEDULED_POSTS.map(p => p.campaign).filter(Boolean)))]
const ITEMS_PER_PAGE = 8

/* ── Post Detail Modal ─────────────────────────────────────────── */
function PostDetailModal({ post, onClose }) {
  if (!post) return null
  const meta = PLATFORM_META[post.platform]
  const Icon = meta?.icon
  const st   = STATUS_STYLES[post.status] ?? STATUS_STYLES.scheduled
  const ct   = CONTENT_TYPE_COLORS[post.contentType] ?? CONTENT_TYPE_COLORS.Text
  const dt   = new Date(post.scheduledAt)
  const lu   = new Date(post.lastUpdated)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-lg rounded-[var(--r-xl)] shadow-[var(--shadow-lg)] overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Eye size={16} style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>
              Post Details
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          {/* Title + badges */}
          <div>
            <h3 className="text-base font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>
              {post.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>
                {st.label}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: ct.bg, color: ct.color }}>
                {post.contentType}
              </span>
              {Icon && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${meta.color}15`, color: meta.color }}>
                  <Icon size={9} /> {meta.label}
                </span>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Platform',     value: meta?.label ?? post.platform },
              { label: 'Campaign',     value: post.campaign ?? '—'         },
              { label: 'Scheduled Date', value: dt.toLocaleDateString('en-US', { weekday:'short', month:'long', day:'numeric', year:'numeric' }) },
              { label: 'Scheduled Time', value: dt.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }) },
              { label: 'Content Type', value: post.contentType              },
              { label: 'Created By',   value: post.createdBy                },
              { label: 'Last Updated', value: lu.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) + ' · ' + lu.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }) },
              { label: 'Media',        value: post.media ? 'Yes — media attached' : 'No media' },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Caption */}
          <div className="p-4 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Caption</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{post.caption}</p>
          </div>

          {/* Read-only notice removed */}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Main ───────────────────────────────────────────────────────── */
export default function ScheduledPosts() {
  const [search,     setSearch]     = useState('')
  const [platform,   setPlatform]   = useState('all')
  const [campaign,   setCampaign]   = useState('All')
  const [status,     setStatus]     = useState('all')
  const [dateFrom,   setDateFrom]   = useState('')
  const [dateTo,     setDateTo]     = useState('')
  const [page,       setPage]       = useState(1)
  const [selected,   setSelected]   = useState(null)
  const [showFilters,setShowFilters]= useState(false)

  /* ── Derived filtered list ── */
  const filtered = useMemo(() => {
    return MOCK_SCHEDULED_POSTS.filter(p => {
      const matchSearch   = p.title.toLowerCase().includes(search.toLowerCase())
      const matchPlatform = platform === 'all' || p.platform === platform
      const matchCampaign = campaign === 'All' || p.campaign === campaign
      const matchStatus   = status === 'all' || p.status === status
      const dt = new Date(p.scheduledAt)
      const matchFrom  = !dateFrom || dt >= new Date(dateFrom)
      const matchTo    = !dateTo   || dt <= new Date(dateTo + 'T23:59:59')
      return matchSearch && matchPlatform && matchCampaign && matchStatus && matchFrom && matchTo
    })
  }, [search, platform, campaign, status, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const resetPage = () => setPage(1)

  /* ── KPI counts ── */
  const counts = {
    scheduled: MOCK_SCHEDULED_POSTS.filter(p => p.status === 'scheduled').length,
    pending:   MOCK_SCHEDULED_POSTS.filter(p => p.status === 'pending').length,
    failed:    MOCK_SCHEDULED_POSTS.filter(p => p.status === 'failed').length,
    cancelled: MOCK_SCHEDULED_POSTS.filter(p => p.status === 'cancelled').length,
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Scheduled Posts"
        subtitle={`${MOCK_SCHEDULED_POSTS.length} total`}
      />

      {/* ── KPI summary ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard title="Scheduled" value={counts.scheduled} icon={CalendarCheck} iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)" index={0} />
        <StatCard title="Pending"   value={counts.pending}   icon={Clock}         iconColor="#F59E0B" iconBg="rgba(245,158,11,.12)" index={1} />
        <StatCard title="Failed"    value={counts.failed}    icon={X}             iconColor="#EF4444" iconBg="rgba(239,68,68,.12)"  index={2} />
        <StatCard title="Cancelled" value={counts.cancelled} icon={X}             iconColor="#64748B" iconBg="rgba(100,116,139,.12)" index={3} />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); resetPage() }}
              placeholder="Search posts…"
              className="w-full h-10 pl-9 pr-4 text-sm rounded-[var(--r-md)] border outline-none"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
          </div>

          {/* Status pills */}
          <div className="flex flex-wrap gap-1.5">
            {['all', 'scheduled', 'pending', 'failed', 'cancelled'].map(s => {
              const st = STATUS_STYLES[s]; const active = status === s
              return (
                <button key={s} onClick={() => { setStatus(s); resetPage() }}
                  className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                  style={{
                    background:  active ? (st?.bg  ?? 'var(--primary-light)') : 'var(--card)',
                    borderColor: active ? (st?.color ?? 'var(--primary)')     : 'var(--border)',
                    color:       active ? (st?.color ?? 'var(--primary)')     : 'var(--text-muted)',
                  }}>
                  {s === 'all' ? 'All' : st?.label}
                </button>
              )
            })}
          </div>

          {/* More filters toggle */}
          <button onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-1.5 px-3 h-10 rounded-[var(--r-md)] border text-xs font-semibold transition-all ml-auto"
            style={{
              background:  showFilters ? 'var(--primary-light)' : 'var(--card)',
              borderColor: showFilters ? 'var(--primary)' : 'var(--border)',
              color:       showFilters ? 'var(--primary)' : 'var(--text-muted)',
            }}>
            <Filter size={13} /> Filters {showFilters && <X size={11} />}
          </button>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-3">
              {/* Platform filter */}
              <div className="flex flex-wrap gap-1.5">
                {['all', 'instagram', 'facebook', 'linkedin', 'x', 'youtube', 'pinterest'].map(p => {
                  const meta = PLATFORM_META[p]; const Icon = meta?.icon; const active = platform === p
                  return (
                    <button key={p} onClick={() => { setPlatform(p); resetPage() }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all"
                      style={{
                        background:  active ? (meta ? `${meta.color}15` : 'var(--primary-light)') : 'var(--card)',
                        borderColor: active ? (meta?.color ?? 'var(--primary)') : 'var(--border)',
                        color:       active ? (meta?.color ?? 'var(--primary)') : 'var(--text-muted)',
                      }}>
                      {Icon && <Icon size={11} />}
                      {p === 'all' ? 'All Platforms' : null}
                    </button>
                  )
                })}
              </div>

              {/* Campaign filter */}
              <select value={campaign} onChange={e => { setCampaign(e.target.value); resetPage() }}
                className="h-9 pl-3 pr-7 text-xs font-semibold rounded-[var(--r-md)] border outline-none appearance-none"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                {CAMPAIGNS.map(c => <option key={c}>{c}</option>)}
              </select>

              {/* Date range */}
              <div className="flex items-center gap-2">
                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); resetPage() }}
                  className="h-9 px-3 text-xs rounded-[var(--r-md)] border outline-none"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>to</span>
                <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); resetPage() }}
                  className="h-9 px-3 text-xs rounded-[var(--r-md)] border outline-none"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="card">
          <EmptyState icon={CalendarCheck} title="No scheduled posts found" message="Try adjusting your filters." />
        </div>
      )}

      {/* ── Posts table ── */}
      {filtered.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
                  {['Post Title', 'Campaign', 'Platform', 'Content Type', 'Scheduled Date', 'Time', 'Status', 'Created By', 'Last Updated', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((post, i) => {
                  const meta = PLATFORM_META[post.platform]; const Icon = meta?.icon
                  const st   = STATUS_STYLES[post.status] ?? STATUS_STYLES.scheduled
                  const ct   = CONTENT_TYPE_COLORS[post.contentType] ?? CONTENT_TYPE_COLORS.Text
                  const dt   = new Date(post.scheduledAt)
                  const lu   = new Date(post.lastUpdated)
                  return (
                    <motion.tr key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onClick={() => setSelected(post)}>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{post.title}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {post.campaign
                          ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(79,70,229,.10)', color: '#4F46E5' }}>{post.campaign}</span>
                          : <span style={{ color: 'var(--text-subtle)' }}>—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {Icon && (
                          <div className="flex items-center gap-1.5">
                            <Icon size={13} style={{ color: meta.color }} />
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{meta.label}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: ct.bg, color: ct.color }}>
                          {post.contentType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {post.createdBy}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {lu.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={e => { e.stopPropagation(); setSelected(post) }}
                          className="flex items-center gap-1 text-xs font-semibold hover:underline"
                          style={{ color: 'var(--primary)' }}>
                          <Eye size={11} /> View
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer + Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
            <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>
              Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} posts
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-[var(--card)] transition-colors disabled:opacity-40"
                style={{ color: 'var(--text-muted)' }}>
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                <button key={pg} onClick={() => setPage(pg)}
                  className="w-7 h-7 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: pg === page ? 'var(--primary)' : 'transparent',
                    color:      pg === page ? '#fff' : 'var(--text-muted)',
                  }}>
                  {pg}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-[var(--card)] transition-colors disabled:opacity-40"
                style={{ color: 'var(--text-muted)' }}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selected && <PostDetailModal post={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  )
}
