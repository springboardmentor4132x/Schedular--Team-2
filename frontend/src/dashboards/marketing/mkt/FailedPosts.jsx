import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import { useAuth } from '../../../context/AuthContext'
import { getFailedPosts, retryPublishing } from '../../../services/publishingService'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { Users, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react'

export default function FailedPosts() {
  const navigate = useNavigate()
  const { activeClient } = useClient()
  const { role } = useAuth()
  const [failed, setFailed] = useState([])
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!activeClient) return setFailed([])
      setLoading(true)
      const data = await getFailedPosts(activeClient.workspaceId)
      if (mounted) setFailed(data)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [activeClient])

  const onRetry = async (id) => {
    if (role === 'business') return
    setRetrying(id)
    const res = await retryPublishing(id)
    setRetrying(null)
    if (res && res.success) setFailed(prev => prev.filter(f => f.id !== id))
  }

  if (!activeClient) {
    return (
      <div className="p-6">
        <div className="card">
          <EmptyState icon={Users} title="No client selected" message="Select a client to view failed posts."
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
      <PageHeader title="Failed Posts" subtitle={`Failed posts for ${activeClient.name}`} />

      {loading ? (
        <div className="card p-4 text-sm" style={{ color: 'var(--text-muted)' }}>Loading failed posts...</div>
      ) : failed.length === 0 ? (
        <div className="card p-4">No failed posts. All publishing attempts are successful.</div>
      ) : (
        <div className="space-y-2">
          {failed.map(f => (
            <div key={f.id} className="card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4" style={{ borderLeft: '3px solid #EF4444' }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,.10)' }}>
                  <AlertTriangle size={15} style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <div className="text-sm font-semibold">{f.campaign}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>
                    {f.platform} · Failed {f.failedAt}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#EF4444' }}>{f.errorMessage}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {role !== 'business' && (
                  <button
                    onClick={() => onRetry(f.id)}
                    disabled={retrying === f.id}
                    className="flex items-center gap-1.5 px-3 h-9 rounded-[var(--r-md)] text-xs font-semibold text-white hover:brightness-105"
                    style={{ background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}
                  >
                    <RefreshCw size={13} className={retrying === f.id ? 'animate-spin' : ''} />
                    {retrying === f.id ? 'Retrying...' : 'Retry'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
