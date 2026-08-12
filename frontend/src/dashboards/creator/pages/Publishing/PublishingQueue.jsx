import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getPublishingQueue, pausePublishing, resumePublishing, cancelPublishing, retryPublishing,
} from '../../../../services/publishingService'
import { publishPost } from '../../../../services/postService'
import {
  Search, Pause, Play, XCircle, CalendarClock, Filter,
  Send, RefreshCw, CheckCircle2, Loader2, AlertTriangle,
} from 'lucide-react'

const priorityBadge = {
  High: 'badge-danger',
  Medium: 'badge-warning',
  Low: 'badge-default',
}

const STATUS_META = {
  queued:     { badge: 'badge-queued',     label: 'Queued',     color: '#1E3A8A' },
  processing: { badge: 'badge-warning',    label: 'Processing', color: '#F59E0B' },
  paused:     { badge: 'badge-pending',    label: 'Paused',     color: '#64748B' },
  completed:  { badge: 'badge-published',  label: 'Completed',  color: '#22C55E' },
  failed:     { badge: 'badge-failed',     label: 'Failed',     color: '#EF4444' },
  cancelled:  { badge: 'badge-cancelled',  label: 'Cancelled',  color: '#94A3B8' },
}

export default function PublishingQueue() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [toast, setToast] = useState(null)
  const [busy, setBusy] = useState(null)
  const [confirmCancel, setConfirmCancel] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadQueue = async () => {
    setLoading(true)
    try {
      const data = await getPublishingQueue()
      setQueue(data)
    } catch {
      setQueue([])
      showToast('Failed to load the publishing queue.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    getPublishingQueue()
      .then((data) => { if (!cancelled) setQueue(data) })
      .catch(() => { if (!cancelled) setQueue([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handlePause = async (item) => {
    if (busy) return
    setBusy(`pause-${item.id}`)
    try {
      const res = await pausePublishing(item.id)
      showToast(res.message || 'Scheduled publishing paused.')
      loadQueue()
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to pause this post.', 'error')
    } finally {
      setBusy(null)
    }
  }

  const handleResume = async (item) => {
    if (busy) return
    setBusy(`resume-${item.id}`)
    try {
      const res = await resumePublishing(item.id)
      showToast(res.message || 'Scheduled publishing resumed.')
      loadQueue()
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to resume this post.', 'error')
    } finally {
      setBusy(null)
    }
  }

  const handlePublishNow = async (item) => {
    if (busy) return
    setBusy(`publish-${item.id}`)
    try {
      const res = await publishPost(item.post_id)
      const ok = res?.status === 'Published'
      showToast(ok ? 'Post published successfully!' : (res?.message || 'Publishing failed.'), ok ? 'success' : 'error')
      loadQueue()
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Publishing failed.', 'error')
      loadQueue()
    } finally {
      setBusy(null)
    }
  }

  const handleRetry = async (item) => {
    if (busy) return
    setBusy(`retry-${item.id}`)
    try {
      const res = await retryPublishing(item.post_id)
      showToast(res.message || 'Post re-queued for publishing.', res.success ? 'success' : 'error')
      loadQueue()
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to retry this post.', 'error')
    } finally {
      setBusy(null)
    }
  }

  const confirmCancelEntry = async () => {
    if (!confirmCancel || busy) return
    setBusy(`cancel-${confirmCancel.id}`)
    try {
      const res = await cancelPublishing(confirmCancel.id)
      showToast(res.message || 'Scheduled publishing cancelled.')
      setConfirmCancel(null)
      loadQueue()
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to cancel this post.', 'error')
    } finally {
      setBusy(null)
    }
  }

  const filtered = queue.filter((q) => {
    if (filterPlatform && q.platform !== filterPlatform) return false
    if (filterStatus && q.status !== filterStatus) return false
    if (search) {
      const s = search.toLowerCase()
      return q.campaign.toLowerCase().includes(s) || q.platform.toLowerCase().includes(s) || q.content.toLowerCase().includes(s)
    }
    return true
  })

  const platforms = [...new Set(queue.map((q) => q.platform))]

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Publishing Queue</h1>
          <p className="text-sm text-secondary mt-1">{filtered.length} posts in queue</p>
        </div>
        <button onClick={loadQueue} className="btn btn-ghost btn-sm" title="Refresh queue">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              placeholder="Search queue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9"
            />
          </div>
          <div className="flex gap-3">
            <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="select-base w-auto min-w-[140px]">
              <option value="">All Platforms</option>
              {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select-base w-auto min-w-[130px]">
              <option value="">All Status</option>
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <option key={key} value={key}>{meta.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="table-inner">
            <thead className="table-head">
              <tr>
                <th className="table-th">#</th>
                <th className="table-th">Platform</th>
                <th className="table-th">Campaign</th>
                <th className="table-th">Scheduled Time</th>
                <th className="table-th">Priority</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="table-row">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="table-td"><div className="h-4 w-20 bg-surface rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-td text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-secondary">
                      <Filter size={32} className="opacity-40" />
                      <p className="text-sm font-semibold">No items match your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const meta = STATUS_META[item.status] || STATUS_META.queued
                  return (
                    <tr key={item.id} className="table-row">
                      <td className="table-td font-bold text-primary">{item.position}</td>
                      <td className="table-td">
                        <span className="text-sm font-semibold text-primary">{item.platform}</span>
                      </td>
                      <td className="table-td">
                        <div>
                          <p className="text-sm font-semibold text-primary">{item.campaign}</p>
                          <p className="text-xs text-secondary truncate max-w-[200px]">{item.content}</p>
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-1.5">
                          <CalendarClock size={14} className="text-secondary" />
                          <span className="text-sm text-primary">{item.scheduledTime}</span>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className={`badge ${priorityBadge[item.priority] || 'badge-default'}`}>{item.priority}</span>
                      </td>
                      <td className="table-td">
                        <span className={`badge ${meta.badge}`}>{meta.label}</span>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center justify-end gap-1">
                          {item.status === 'queued' && (
                            <>
                              <button
                                onClick={() => handlePublishNow(item)}
                                disabled={busy === `publish-${item.id}`}
                                className="btn btn-ghost btn-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                                title="Publish now"
                              >
                                {busy === `publish-${item.id}` ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                              </button>
                              <button onClick={() => handlePause(item)} disabled={busy === `pause-${item.id}`} className="btn btn-ghost btn-xs" title="Pause">
                                <Pause size={14} />
                              </button>
                            </>
                          )}
                          {item.status === 'paused' && (
                            <button onClick={() => handleResume(item)} disabled={busy === `resume-${item.id}`} className="btn btn-ghost btn-xs" title="Resume">
                              <Play size={14} />
                            </button>
                          )}
                          {item.status === 'failed' && (
                            <button
                              onClick={() => handleRetry(item)}
                              disabled={busy === `retry-${item.id}`}
                              className="btn btn-ghost btn-xs text-amber-600 dark:text-amber-400"
                              title="Retry"
                            >
                              {busy === `retry-${item.id}` ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                            </button>
                          )}
                          {item.status === 'completed' && (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 size={13} /> Done
                            </span>
                          )}
                          {['queued', 'paused'].includes(item.status) && (
                            <button
                              onClick={() => setConfirmCancel(item)}
                              disabled={busy === `cancel-${item.id}`}
                              className="btn btn-ghost btn-xs text-rose-500 hover:text-rose-600"
                              title="Cancel"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top-center toast */}
      {createPortal(
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white"
              style={{ background: toast.type === 'error' ? 'linear-gradient(135deg,#DC2626,#EF4444)' : 'linear-gradient(135deg,#059669,#22C55E)' }}
            >
              {toast.type === 'error' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
              <span>{toast.msg}</span>
              <button onClick={() => setToast(null)} className="ml-2 text-xs font-bold opacity-80 hover:opacity-100">✕</button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Cancel confirmation modal */}
      {createPortal(
        confirmCancel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl my-auto bg-card border border-default">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-primary">Cancel this scheduled post?</h3>
                <button onClick={() => setConfirmCancel(null)} className="p-1.5 rounded-lg hover:bg-hover text-secondary">
                  <XCircle size={16} />
                </button>
              </div>
              <p className="text-xs leading-relaxed text-secondary">
                "{confirmCancel.campaign}" will no longer be published automatically. The post stays in your library and can be rescheduled later.
              </p>
              <div className="flex gap-3 pt-5">
                <button
                  onClick={() => setConfirmCancel(null)}
                  disabled={busy === `cancel-${confirmCancel.id}`}
                  className="flex-1 h-10 rounded-xl border border-default text-sm font-semibold text-primary hover:bg-hover"
                >
                  Keep Scheduled
                </button>
                <button
                  onClick={confirmCancelEntry}
                  disabled={busy === `cancel-${confirmCancel.id}`}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold text-white hover:brightness-105"
                  style={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)' }}
                >
                  {busy === `cancel-${confirmCancel.id}` ? 'Cancelling...' : 'Cancel Post'}
                </button>
              </div>
            </div>
          </div>
        ),
        document.body
      )}
    </div>
  )
}
