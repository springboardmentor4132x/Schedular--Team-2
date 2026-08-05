import { useState, useEffect } from 'react'
import { getPublishingQueue, pausePublishing, resumePublishing, cancelPublishing } from '../../services/publishingService'
import { Search, Pause, Play, XCircle, CalendarClock, Filter } from 'lucide-react'

const priorityBadge = {
  High: 'badge-danger',
  Medium: 'badge-warning',
  Low: 'badge-default',
}

const statusBadge = {
  queued: 'badge-queued',
  paused: 'badge-pending',
  cancelled: 'badge-cancelled',
}

export default function PublishingQueue() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    getPublishingQueue().then((d) => { setQueue(d); setLoading(false) })
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handlePause = async (id) => {
    const res = await pausePublishing(id)
    if (res.success) {
      setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, status: 'paused' } : q)))
      showToast(res.message)
    }
  }

  const handleResume = async (id) => {
    const res = await resumePublishing(id)
    if (res.success) {
      setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, status: 'queued' } : q)))
      showToast(res.message)
    }
  }

  const handleCancel = async (id) => {
    const res = await cancelPublishing(id)
    if (res.success) {
      setQueue((prev) => prev.filter((q) => q.id !== id))
      showToast(res.message)
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
              <option value="queued">Queued</option>
              <option value="paused">Paused</option>
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
                filtered.map((item) => (
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
                      <span className={`badge ${statusBadge[item.status] || 'badge-default'}`}>{item.status}</span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1">
                        {item.status === 'queued' ? (
                          <button onClick={() => handlePause(item.id)} className="btn btn-ghost btn-xs" title="Pause">
                            <Pause size={14} />
                          </button>
                        ) : item.status === 'paused' ? (
                          <button onClick={() => handleResume(item.id)} className="btn btn-ghost btn-xs" title="Resume">
                            <Play size={14} />
                          </button>
                        ) : null}
                        <button onClick={() => handleCancel(item.id)} className="btn btn-ghost btn-xs text-rose-500 hover:text-rose-600" title="Cancel">
                          <XCircle size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 text-sm font-semibold animate-slide-in">
          <span>{toast}</span>
          <button onClick={() => setToast('')} className="text-xs font-bold opacity-80 hover:opacity-100 ml-2">✕</button>
        </div>
      )}
    </div>
  )
}
