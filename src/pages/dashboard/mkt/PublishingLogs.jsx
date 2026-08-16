import { useEffect, useState } from 'react'
import PageHeader from '../../../components/dashboard/PageHeader'
import { useClient } from '../../../context/ClientContext'
import { clientPublishingApi } from '../../../services/mockData'
import EmptyState from '../../../components/dashboard/EmptyState'
import { Users } from 'lucide-react'

export default function PublishingLogs() {
  const { activeClient } = useClient()
  const [logs, setLogs] = useState([])

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!activeClient) return setLogs([])
      const data = await clientPublishingApi.getLogs(activeClient.id)
      if (mounted) setLogs(data)
    }
    load()
    return () => { mounted = false }
  }, [activeClient])

  if (!activeClient) return (<div className="p-6"><div className="card"><EmptyState icon={Users} title="No client selected" message="Select a client to view publishing logs." action={{ label: 'View Clients', onClick: () => {} }} /></div></div>)

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <PageHeader title="Publishing Logs" subtitle={`Logs for ${activeClient.name}`} />
      <div className="space-y-2">
        {logs.length===0 && <div className="card p-4">No logs yet.</div>}
        {logs.map(l=> (
          <div key={l.id} className="card p-3 flex justify-between items-center">
            <div>
              <div className="text-sm font-semibold">{l.platform} · {l.campaign || '—'}</div>
              <div className="text-xs text-[var(--text-subtle)]">{new Date(l.publishedAt).toLocaleString()} · Status: {l.status} · Retries: {l.retryCount}</div>
            </div>
            <div className="text-xs text-[var(--text-subtle)]">{l.platformPostId || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
