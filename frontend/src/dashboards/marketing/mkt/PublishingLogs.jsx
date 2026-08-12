import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import { getPublishingLogs, prettyLogResponse } from '../../../services/publishingService'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { Users, ArrowLeft, AlertTriangle, CheckCircle2, Link2 } from 'lucide-react'

const STATUS_STYLES = {
  published: { color: '#22C55E', bg: 'rgba(34,197,94,.10)', label: 'Published' },
  failed:    { color: '#EF4444', bg: 'rgba(239,68,68,.10)', label: 'Failed' },
  cancelled: { color: '#64748B', bg: 'rgba(100,116,139,.10)', label: 'Cancelled' },
}


export default function PublishingLogs() {
  const navigate = useNavigate()
  const { activeClient } = useClient()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!activeClient) return setLogs([])
      setLoading(true)
      const res = await getPublishingLogs({}, activeClient.workspaceId)
      if (mounted) setLogs(res.data)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [activeClient])

  if (!activeClient) {
    return (
      <div className="p-6">
        <div className="card">
          <EmptyState icon={Users} title="No client selected" message="Select a client to view publishing logs."
            action={{ label: 'View Clients', onClick: () => navigate('/dashboard/mkt/clients') }} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <button onClick={() => navigate('/dashboard/mkt/queue')}
        className="flex items-center gap-1.5 text-sm font-semibold mb-4 hover:underline" style={{ color: 'var(--primary)' }}>
        <ArrowLeft size={15} /> Back to Publishing Center
      </button>
      <PageHeader title="Publishing Logs" subtitle={`Logs for ${activeClient.name}`} />

      {loading ? (
        <div className="card p-4 text-sm" style={{ color: 'var(--text-muted)' }}>Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="card p-4">No logs yet.</div>
      ) : (
        <div className="space-y-2">
          {logs.map((l) => {
            const st = STATUS_STYLES[l.status] || STATUS_STYLES.published
            const failed = l.status === 'failed'
            return (
              <div key={l.id} className="card p-4 sm:p-5" style={{ borderLeft: failed ? '3px solid #EF4444' : '3px solid #22C55E' }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {l.platform} · {l.campaign}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-subtle)' }}>
                      {l.date} · Retries: {l.retryCount} · by {l.publishedBy}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: st.color, background: st.bg }}>
                    {st.label || l.status}
                  </span>
                </div>

                {l.caption && (
                  <p className="text-xs mt-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{l.caption}</p>
                )}

                {l.platformPostId && (
                  <div className="flex items-center gap-1 mt-3 text-[11px] font-semibold" style={{ color: '#4F46E5' }}>
                    <Link2 size={11} /> Platform post ID: {l.platformPostId}
                  </div>
                )}

                {failed && l.failureReason && (
                  <div className="flex items-start gap-2 mt-3 p-4 rounded-lg" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)' }}>
                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#EF4444' }} />
                    <p className="text-xs leading-relaxed" style={{ color: '#EF4444' }}>{l.failureReason}</p>
                  </div>
                )}

                <div className="mt-2">
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {failed
                      ? <AlertTriangle size={11} style={{ color: '#EF4444' }} />
                      : <CheckCircle2 size={11} style={{ color: '#22C55E' }} />}
                    API Response
                  </div>
                  <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-all rounded-lg p-4 max-h-48 overflow-y-auto"
                    style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    {prettyLogResponse(l.response)}
                  </pre>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
