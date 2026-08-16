import { useEffect, useState } from 'react'
import PageHeader from '../../../components/dashboard/PageHeader'
import { useClient } from '../../../context/ClientContext'
import { clientPublishingApi } from '../../../services/mockData'
import EmptyState from '../../../components/dashboard/EmptyState'
import { Users } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'

export default function FailedPosts() {
  const { activeClient } = useClient()
  const { role } = useAuth()
  const [failed, setFailed] = useState([])

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!activeClient) return setFailed([])
      const data = await clientPublishingApi.getFailed(activeClient.id)
      if (mounted) setFailed(data)
    }
    load()
    return () => { mounted = false }
  }, [activeClient])

  const onRetry = async (id) => {
    if (role === 'business') return
    const res = await clientPublishingApi.retry(activeClient.id, id)
    if (res && res.success) setFailed(prev => prev.filter(f => f.id !== id))
    else setFailed(prev => prev.map(f => f.id===id?res.item:f))
  }

  if (!activeClient) return (<div className="p-6"><div className="card"><EmptyState icon={Users} title="No client selected" message="Select a client to view failed posts." action={{ label: 'View Clients', onClick: () => {} }} /></div></div>)

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <PageHeader title="Failed Posts" subtitle={`Failed posts for ${activeClient.name}`} />
      <div className="space-y-2">
        {failed.length===0 && <div className="card p-4">No failed posts.</div>}
        {failed.map(f=> (
          <div key={f.id} className="card p-3 flex justify-between items-center">
            <div>
              <div className="text-sm font-semibold">{f.title}</div>
              <div className="text-xs text-[var(--text-subtle)]">Reason: {f.failureReason || 'Unknown'} · Retries: {f.retryCount||0}</div>
            </div>
            <div className="flex items-center gap-2">
              {role!=='business' && <button onClick={()=>onRetry(f.id)} className="btn">Retry</button>}
              <button className="btn">Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
