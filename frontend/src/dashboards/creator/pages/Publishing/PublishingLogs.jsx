import { useState, useEffect } from 'react'
import { getPublishingLogs, prettyLogResponse } from '../../../../services/publishingService'
import {
  Search, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Link2,
} from 'lucide-react'

const PLATFORM_DOT = {
  Instagram: '#E1306C',
  Facebook: '#1877F2',
  LinkedIn: '#0A66C2',
  X: '#374151',
  YouTube: '#FF0000',
  Pinterest: '#E60023',
}

const statusBadge = {
  published: 'badge-published',
  failed: 'badge-failed',
  cancelled: 'badge-cancelled',
}

const statusLabel = {
  published: 'Published',
  failed: 'Failed',
  cancelled: 'Cancelled',
}


export default function PublishingLogs() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const perPage = 10

  useEffect(() => {
    let cancelled = false
    getPublishingLogs({ platform: filterPlatform, status: filterStatus, search, page, perPage })
      .then((res) => {
        if (!cancelled) {
          setLogs(res.data)
          setTotal(res.total)
          setError('')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLogs([])
          setTotal(0)
          setError(err?.response?.data?.detail || 'Failed to load publishing logs.')
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [page, filterPlatform, filterStatus, search])

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Publishing Logs</h1>
        <p className="text-sm text-secondary mt-1">Complete history of all publishing attempts.</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="input-base pl-9"
            />
          </div>
          <select value={filterPlatform} onChange={(e) => { setFilterPlatform(e.target.value); setPage(1) }} className="select-base w-auto min-w-[140px]">
            <option value="">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="X">X</option>
            <option value="Pinterest">Pinterest</option>
            <option value="YouTube">YouTube</option>
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }} className="select-base w-auto min-w-[130px]">
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-4 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm font-semibold">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Log entries */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3 animate-pulse">
              <div className="h-5 w-48 bg-surface rounded" />
              <div className="h-4 w-full bg-surface rounded" />
              <div className="h-24 w-full bg-surface rounded" />
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-secondary font-semibold">No log entries found</p>
          <p className="text-xs text-secondary mt-1">Publishing attempts will appear here once posts are published.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const failed = log.status === 'failed'
            return (
              <div
                key={log.id}
                className="card p-5"
                style={{ borderLeft: failed ? '3px solid #EF4444' : '3px solid #22C55E' }}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: PLATFORM_DOT[log.platform] || '#64748B' }}
                    />
                    <span className="text-sm font-bold text-primary">{log.platform}</span>
                    <span className="text-xs text-secondary truncate max-w-[260px]">{log.campaign}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${statusBadge[log.status] || 'badge-default'}`}>
                      {statusLabel[log.status] || log.status}
                    </span>
                    <span className="text-xs text-secondary whitespace-nowrap">{log.date}</span>
                  </div>
                </div>

                {/* Caption preview */}
                {log.caption && (
                  <p className="text-xs text-secondary leading-relaxed mt-2 line-clamp-2">{log.caption}</p>
                )}

                {/* Meta chips */}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]">
                  <span className="px-2 py-1 rounded-full font-semibold bg-surface text-primary border border-default">
                    Retries: {log.retryCount}
                  </span>
                  <span className="px-2 py-1 rounded-full font-semibold bg-surface text-primary border border-default">
                    by {log.publishedBy}
                  </span>
                  {log.platformPostId && (
                    <span className="px-2 py-1 rounded-full font-semibold flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                      <Link2 size={10} /> Platform post ID: {log.platformPostId}
                    </span>
                  )}
                </div>

                {/* Failure reason — always visible */}
                {failed && log.failureReason && (
                  <div className="flex items-start gap-2 mt-4 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                    <AlertTriangle size={14} className="text-rose-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">{log.failureReason}</p>
                  </div>
                )}

                {/* API response — always visible */}
                <div className="mt-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {failed ? (
                      <AlertTriangle size={12} className="text-rose-500" />
                    ) : (
                      <CheckCircle2 size={12} className="text-emerald-500" />
                    )}
                    <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                      API Response
                    </span>
                  </div>
                  <pre className="text-[11px] leading-relaxed text-secondary whitespace-pre-wrap break-all bg-surface rounded-lg p-4 border border-default max-h-48 overflow-y-auto">
                    {prettyLogResponse(log.response)}
                  </pre>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="card flex items-center justify-between px-4 py-3">
          <p className="text-xs text-secondary">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-ghost btn-xs"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`btn btn-xs ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-ghost btn-xs"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
