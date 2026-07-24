import { useState, useEffect } from 'react'
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
import Toast from '../../components/Toast'
import axiosInstance from '../../api/axios'

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

/* ── Filter sets per role ──────────────────────────────────────── */
const BUSINESS_FILTERS  = ['all', 'scheduled', 'published', 'failed', 'cancelled']
const MARKETING_FILTERS = ['all', 'pending_approval', 'approved', 'rejected', 'published']

export default function Queue() {
  const navigate      = useNavigate()
  const { role }      = useAuth()
  const isMarketing   = role === 'marketing'

  const [queue,  setQueue]  = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [toast,  setToast]  = useState(null)

  useEffect(() => {
    fetchQueue()
  }, [])

  const fetchQueue = async () => {
    setIsLoading(true)
    try {
      const res = await axiosInstance.get('/api/v1/posts/')
      // Filter out drafts for the queue
      const queuedPosts = res.data.filter(p => p.status && p.status.toLowerCase() !== 'draft')
      
      const parsedQueue = queuedPosts.map((q, idx) => {
        // Map backend dates or use fallback text
        let scheduledText = 'No date set'
        if (q.scheduled_for) {
          const d = new Date(q.scheduled_for)
          scheduledText = d.toLocaleString()
        }

        // Map status to snake_case if it has spaces (Pending Approval -> pending_approval)
        const statusClean = q.status.toLowerCase().replace(' ', '_')

        return {
          id: q.id,
          position: idx + 1,
          title: q.title || 'Untitled Post',
          platform: 'x', // Mock platform for now
          scheduledAt: scheduledText,
          status: statusClean,
          submittedBy: null // Or fetch from user context later
        }
      })
      
      setQueue(parsedQueue)
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load queue' })
    } finally {
      setIsLoading(false)
    }
  }

  const filters  = isMarketing ? MARKETING_FILTERS : BUSINESS_FILTERS
  const filtered = filter === 'all' ? queue : queue.filter(q => q.status === filter)

  /* ── Actions ── */
  const updateStatus = async (id, newStatus, uiStatus) => {
    try {
      await axiosInstance.put(`/api/v1/posts/${id}`, { status: newStatus })
      setQueue(prev => prev.map(q => q.id === id ? { ...q, status: uiStatus } : q))
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update status' })
    }
  }

  const removeItem = async (id) => {
    if (!confirm('Are you sure you want to remove this post from the queue?')) return
    try {
      await axiosInstance.delete(`/api/v1/posts/${id}`)
      setToast({ type: 'success', message: 'Post removed' })
      setQueue(prev => prev.filter(q => q.id !== id))
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to remove post' })
    }
  }

  const retryItem     = id => updateStatus(id, 'Scheduled', 'scheduled')
  const approveItem   = id => updateStatus(id, 'Approved', 'approved')
  const rejectItem    = id => updateStatus(id, 'Rejected', 'rejected')
  const resubmitItem  = id => updateStatus(id, 'Pending Approval', 'pending_approval')

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
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto relative">
      <Toast toast={toast} onClose={() => setToast(null)} />
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

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <p style={{ color: 'var(--text-muted)' }}>Loading queue...</p>
        </div>
      ) : (
        <>
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
                const st    = STATUS_STYLES[item.status] || STATUS_STYLES.scheduled
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
        </>
      )}

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
