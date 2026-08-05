import { useState, useEffect } from 'react'
import { getPublishingLogs } from '../../services/publishingService'
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

const statusBadge = {
  published: 'badge-published',
  failed: 'badge-failed',
  cancelled: 'badge-cancelled',
}

export default function PublishingLogs() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const perPage = 10

  const fetchLogs = async () => {
    setLoading(true)
    const res = await getPublishingLogs({ platform: filterPlatform, status: filterStatus, search, page, perPage })
    setLogs(res.data)
    setTotal(res.total)
    setLoading(false)
  }

  useEffect(() => { fetchLogs() }, [page, filterPlatform, filterStatus, search])

  const totalPages = Math.ceil(total / perPage)

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

      {/* Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="table-inner">
            <thead className="table-head">
              <tr>
                <th className="table-th">Date</th>
                <th className="table-th">Platform</th>
                <th className="table-th">Campaign</th>
                <th className="table-th">Status</th>
                <th className="table-th">Response</th>
                <th className="table-th">Retries</th>
                <th className="table-th">Published By</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="table-row">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="table-td"><div className="h-4 w-20 bg-surface rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-td text-center py-12">
                    <p className="text-sm text-secondary font-semibold">No log entries found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="table-row">
                    <td className="table-td whitespace-nowrap">
                      <span className="text-sm text-primary">{log.date}</span>
                    </td>
                    <td className="table-td">
                      <span className="text-sm font-semibold text-primary">{log.platform}</span>
                    </td>
                    <td className="table-td">
                      <span className="text-sm text-primary">{log.campaign}</span>
                    </td>
                    <td className="table-td">
                      <span className={`badge ${statusBadge[log.status] || 'badge-default'}`}>{log.status}</span>
                    </td>
                    <td className="table-td">
                      <span className={`text-xs font-medium ${log.status === 'failed' ? 'text-rose-600 dark:text-rose-400' : 'text-secondary'} truncate max-w-[180px] block`}>
                        {log.response}
                      </span>
                    </td>
                    <td className="table-td text-center">
                      <span className={`text-sm font-bold ${log.retryCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-secondary'}`}>
                        {log.retryCount}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className="text-sm text-secondary">{log.publishedBy}</span>
                    </td>
                    <td className="table-td text-right">
                      <button
                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                        className="btn btn-ghost btn-xs"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-default">
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
    </div>
  )
}
