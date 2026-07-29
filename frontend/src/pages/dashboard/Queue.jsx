import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  List, RefreshCw, Trash2, GripVertical,
  Clock, CheckCircle2, XCircle, AlertTriangle, Plus,
  ThumbsUp, ThumbsDown, Send, Info,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/dashboard/PageHeader'
import EmptyState from '../../components/dashboard/EmptyState'

/* ── Platform meta ─────────────────────────────────────────────── */
const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C' },
  facebook:  { icon: FaFacebook,  color: '#1877F2' },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2' },
  x:         { icon: FaXTwitter,  color: '#000000' },
}

/* ── Status styles ─────────────────────────────────────────────── */
const STATUS_STYLES = {
  scheduled:        { icon: Clock,         color: '#1E3A8A', bg: 'rgba(30,58,138,.12)',   label: 'Scheduled'        },
  publishing:       { icon: RefreshCw,     color: '#F59E0B', bg: 'rgba(245,158,11,.12)',  label: 'Publishing'       },
  published:        { icon: CheckCircle2,  color: '#22C55E', bg: 'rgba(34,197,94,.12)',   label: 'Published'        },
  failed:           { icon: XCircle,       color: '#EF4444', bg: 'rgba(239,68,68,.12)',   label: 'Failed'           },
  pending_approval: { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,.12)',  label: 'Pending Approval' },
  approved:         { icon: CheckCircle2,  color: '#22C55E', bg: 'rgba(34,197,94,.12)',   label: 'Approved'         },
  rejected:         { icon: XCircle,       color: '#EF4444', bg: 'rgba(239,68,68,.12)',   label: 'Rejected'         },
  cancelled:        { icon: XCircle,       color: '#64748B', bg: 'rgba(100,116,139,.12)', label: 'Cancelled'        },
}

/* ── Initial queue data ────────────────────────────────────────── */
const INIT_BUSINESS = [
  { id:1, position:1, title:'Summer Sale Kick-off',    platform:'instagram', scheduledAt:'Today, 2:00 PM',     status:'scheduled',        submittedBy: null },
  { id:2, position:2, title:'Product Feature Post',    platform:'linkedin',  scheduledAt:'Today, 5:30 PM',     status:'scheduled',        submittedBy: null },
  { id:3, position:3, title:'Weekend Engagement Post', platform:'x',         scheduledAt:'Today, 8:00 PM',     status:'scheduled',        submittedBy: null },
  { id:4, position:4, title:'Monday Motivation',       platform:'instagram', scheduledAt:'Tomorrow, 8:00 AM',  status:'scheduled',        submittedBy: null },
  { id:5, position:5, title:'Industry News Share',     platform:'facebook',  scheduledAt:'Tomorrow, 11:00 AM', status:'published',        submittedBy: null },
  { id:6, position:6, title:'Failed Reel Upload',      platform:'instagram', scheduledAt:'Yesterday, 3:00 PM', status:'failed',           submittedBy: null },
  { id:7, position:7, title:'Old Contest Post',        platform:'x',         scheduledAt:'Jul 15, 10:00 AM',   status:'cancelled',        submittedBy: null },
]

const INIT_MARKETING = [
  { id:1, position:1, title:'Summer Sale Kick-off',    platform:'instagram', scheduledAt:'Today, 2:00 PM',     status:'pending_approval', submittedBy:'Alex T.' },
  { id:2, position:2, title:'Product Feature Post',    platform:'linkedin',  scheduledAt:'Today, 5:30 PM',     status:'pending_approval', submittedBy:'Sam R.'  },
  { id:3, position:3, title:'Weekend Engagement Post', platform:'x',         scheduledAt:'Today, 8:00 PM',     status:'approved',         submittedBy:'Jordan L.'},
  { id:4, position:4, title:'Monday Motivation',       platform:'instagram', scheduledAt:'Tomorrow, 8:00 AM',  status:'rejected',         submittedBy:'Alex T.' },
  { id:5, position:5, title:'Industry News Share',     platform:'facebook',  scheduledAt:'Tomorrow, 11:00 AM', status:'pending_approval', submittedBy:'Sam R.'  },
  { id:6, position:6, title:'Weekly Tips Thread',      platform:'x',         scheduledAt:'Jul 22, 10:00 AM',   status:'approved',         submittedBy:'Jordan L.'},
  { id:7, position:7, title:'Old Contest Post',        platform:'x',         scheduledAt:'Jul 15, 10:00 AM',   status:'rejected',         submittedBy:'Alex T.' },
]

/* ── Filter sets per role ──────────────────────────────────────── */
const BUSINESS_FILTERS  = ['all', 'scheduled', 'published', 'failed', 'cancelled']
const MARKETING_FILTERS = ['all', 'pending_approval', 'approved', 'rejected', 'published']

export default function Queue() {
  const navigate      = useNavigate()
  const { role }      = useAuth()
  const isMarketing   = role === 'marketing'

  const [queue,  setQueue]  = useState(isMarketing ? INIT_MARKETING : INIT_BUSINESS)
  const [filter, setFilter] = useState('all')

  const filters  = isMarketing ? MARKETING_FILTERS : BUSINESS_FILTERS
  const filtered = filter === 'all' ? queue : queue.filter(q => q.status === filter)

  /* ── Actions ── */
  const removeItem    = id => setQueue(prev => prev.filter(q => q.id !== id))
  const retryItem     = id => setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'scheduled' } : q))
  const approveItem   = id => setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'approved'  } : q))
  const rejectItem    = id => setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'rejected'  } : q))
  const resubmitItem  = id => setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'pending_approval' } : q))

  /* ── Summary counts ── */
  const summaryBusiness = [
    { label: 'Total in Queue',     value: queue.length,                                                         color: 'var(--text)' },
    { label: 'Scheduled',          value: queue.filter(q => q.status === 'scheduled').length,                   color: '#1E3A8A'     },
    { label: 'Published',          value: queue.filter(q => q.status === 'published').length,                   color: '#22C55E'     },
    { label: 'Failed / Cancelled', value: queue.filter(q => q.status === 'failed' || q.status === 'cancelled').length, color: '#EF4444' },
  ]
  const summaryMarketing = [
    { label: 'Total Posts',        value: queue.length,                                                         color: 'var(--text)' },
    { label: 'Pending Approval',   value: queue.filter(q => q.status === 'pending_approval').length,            color: '#F59E0B'     },
    { label: 'Approved',           value: queue.filter(q => q.status === 'approved').length,                    color: '#22C55E'     },
    { label: 'Rejected',           value: queue.filter(q => q.status === 'rejected').length,                    color: '#EF4444'     },
  ]
  const summary = isMarketing ? summaryMarketing : summaryBusiness

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Publishing Queue"
        subtitle={isMarketing
          ? `${queue.filter(q => q.status === 'pending_approval').length} posts awaiting your approval`
          : `${queue.filter(q => q.status === 'scheduled').length} posts scheduled`
        }
        actions={
          <button
            onClick={() => navigate('/dashboard/create-post')}
            className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105 transition-all"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
          >
            <Plus size={15} />
            {isMarketing ? 'New Submission' : 'Add to Queue'}
          </button>
        }
      />

      {/* ── Marketing workflow banner ── */}
      {isMarketing && (
        <motion.div
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 px-4 py-3 rounded-[var(--r-md)] mb-5 text-xs font-medium"
          style={{
            background: 'rgba(79,70,229,.08)',
            border: '1px solid rgba(79,70,229,.20)',
            color: '#4F46E5',
          }}
        >
          <Info size={15} className="flex-shrink-0 mt-0.5" />
          <span>
            As a Marketing Team member you review and approve posts submitted by your team.
            Approved posts are automatically queued for publishing.
          </span>
        </motion.div>
      )}

      {/* ── Status filter pills ── */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {filters.map(s => {
          const st = STATUS_STYLES[s]; const active = filter === s
          const label = s === 'all' ? 'All'
            : s === 'pending_approval' ? 'Pending Approval'
            : s.charAt(0).toUpperCase() + s.slice(1)
          return (
            <button key={s} onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
              style={{
                background:  active ? (st?.bg ?? 'var(--primary-light)') : 'var(--card)',
                borderColor: active ? (st?.color ?? 'var(--primary)')    : 'var(--border)',
                color:       active ? (st?.color ?? 'var(--primary)')    : 'var(--text-muted)',
              }}>
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Empty ── */}
      {filtered.length === 0 && (
        <div className="card">
          <EmptyState icon={List} title="Queue is empty" message="No posts match this filter." />
        </div>
      )}

      {/* ── Queue list ── */}
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {filtered.map((item, i) => {
            const meta  = PLATFORM_META[item.platform]
            const PIcon = meta?.icon
            const st    = STATUS_STYLES[item.status]
            const SIcon = st?.icon

            return (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18, delay: i * 0.03 }}
                className="card p-4 flex items-center gap-3"
                style={{
                  borderLeft: item.status === 'pending_approval'
                    ? '3px solid #F59E0B'
                    : item.status === 'rejected'
                    ? '3px solid #EF4444'
                    : item.status === 'approved'
                    ? '3px solid #22C55E'
                    : '3px solid transparent',
                }}
              >
                {/* Drag handle — business only */}
                {!isMarketing && (
                  <div className="text-[var(--text-subtle)] cursor-grab flex-shrink-0">
                    <GripVertical size={16} />
                  </div>
                )}

                {/* Position badge */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                >
                  {item.position}
                </div>

                {/* Platform icon */}
                {PIcon && (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${meta.color}15` }}>
                    <PIcon size={16} style={{ color: meta.color }} />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                      {item.scheduledAt}
                    </span>
                    {isMarketing && item.submittedBy && (
                      <>
                        <span style={{ color: 'var(--border)' }}>·</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          By {item.submittedBy}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {SIcon && <SIcon size={13} style={{ color: st.color }} />}
                  <span
                    className="text-xs font-semibold hidden sm:block"
                    style={{ color: st.color }}
                  >
                    {st.label}
                  </span>
                </div>

                {/* ── Role-specific actions ── */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                  {isMarketing ? (
                    /* Marketing: Approve / Reject / Resubmit / Delete */
                    <>
                      {item.status === 'pending_approval' && (
                        <>
                          <button onClick={() => approveItem(item.id)} title="Approve"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:brightness-95"
                            style={{ background: 'rgba(34,197,94,.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,.25)' }}>
                            <ThumbsUp size={11} /> Approve
                          </button>
                          <button onClick={() => rejectItem(item.id)} title="Reject"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:brightness-95"
                            style={{ background: 'rgba(239,68,68,.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,.20)' }}>
                            <ThumbsDown size={11} /> Reject
                          </button>
                        </>
                      )}
                      {item.status === 'rejected' && (
                        <button onClick={() => resubmitItem(item.id)} title="Resubmit"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:shadow-sm"
                          style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
                          <Send size={11} /> Resubmit
                        </button>
                      )}
                      {item.status === 'approved' && (
                        <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                          style={{ background: 'rgba(34,197,94,.08)', color: '#22C55E', border: '1px solid rgba(34,197,94,.20)' }}>
                          Ready to publish
                        </span>
                      )}
                      <button onClick={() => removeItem(item.id)} title="Remove"
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)] transition-colors ml-1"
                        style={{ color: 'var(--text-subtle)' }}>
                        <Trash2 size={13} />
                      </button>
                    </>
                  ) : (
                    /* Business: Retry (failed) / Delete */
                    <>
                      {item.status === 'failed' && (
                        <button onClick={() => retryItem(item.id)} title="Retry"
                          className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)] transition-colors"
                          style={{ color: '#F59E0B' }}>
                          <RefreshCw size={14} />
                        </button>
                      )}
                      <button onClick={() => removeItem(item.id)} title="Remove"
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)] transition-colors"
                        style={{ color: 'var(--error)' }}>
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* ── Summary bar ── */}
      <div className="card p-4 mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summary.map(s => (
          <div key={s.label} className="text-center">
            <p
              className="text-2xl font-extrabold"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: s.color }}
            >
              {s.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
