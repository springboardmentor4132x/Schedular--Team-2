import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import { getPublishingLogs } from '../../../services/publishingService'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { Users, ArrowLeft } from 'lucide-react'

const STATUS_STYLES = {
  published: { color: '#22C55E', bg: 'rgba(34,197,94,.10)' },
  failed:    { color: '#EF4444', bg: 'rgba(239,68,68,.10)' },
  cancelled: { color: '#64748B', bg: 'rgba(100,116,139,.10)' },
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
      <button onClick={() => navigate('/dashboard/mkt/publishing')}
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
            return (
              <div key={l.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{l.platform} · {l.campaign}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-subtle)' }}>
                    {l.date} · Retries: {l.retryCount} · by {l.publishedBy}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: st.color, background: st.bg }}>
                    {l.status}
                  </span>
                  <div className="text-xs max-w-[220px] truncate" style={{ color: 'var(--text-subtle)' }} title={l.response}>
                    {l.response}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
