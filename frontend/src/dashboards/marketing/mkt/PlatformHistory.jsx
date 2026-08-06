import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import { getPlatformHistory } from '../../../services/publishingService'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { Users, ArrowLeft, TrendingUp, TrendingDown, CheckCircle2, XCircle } from 'lucide-react'

function MiniBar({ successful, failed, total }) {
  if (total === 0) return <div className="h-1.5 w-full rounded-full" style={{ background: 'var(--border)' }} />
  const successPct = (successful / total) * 100
  return (
    <div className="h-1.5 w-full rounded-full overflow-hidden flex" style={{ background: 'var(--border)' }}>
      <div className="h-full rounded-l-full" style={{ width: `${successPct}%`, background: '#22C55E' }} />
      {failed > 0 && <div className="h-full rounded-r-full" style={{ width: `${100 - successPct}%`, background: '#EF4444' }} />}
    </div>
  )
}

export default function PlatformHistory() {
  const navigate = useNavigate()
  const { activeClient } = useClient()
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!activeClient) return setPlatforms([])
      setLoading(true)
      const data = await getPlatformHistory(activeClient.workspaceId)
      if (mounted) setPlatforms(data)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [activeClient])

  if (!activeClient) {
    return (
      <div className="p-6">
        <div className="card">
          <EmptyState icon={Users} title="No client selected" message="Select a client to view platform history."
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
      <PageHeader title="Platform History" subtitle={`Publishing performance for ${activeClient.name}`} />

      {loading ? (
        <div className="card p-4 text-sm" style={{ color: 'var(--text-muted)' }}>Loading platform history...</div>
      ) : platforms.length === 0 ? (
        <div className="card p-4">No platform publishing history yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <div key={platform.id} className="card p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${platform.color}`}>
                  {platform.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold">{platform.name}</h3>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>Last published {platform.lastPublished}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Posts</span>
                  <p className="font-bold text-sm mt-0.5">{platform.totalPosts.toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-xl" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-1">
                    <span style={{ color: 'var(--text-muted)' }}>Success Rate</span>
                    {platform.successRate >= 95 ? <TrendingUp size={12} style={{ color: '#22C55E' }} /> : <TrendingDown size={12} style={{ color: '#F59E0B' }} />}
                  </div>
                  <p className="font-bold text-sm mt-0.5">{platform.successRate}%</p>
                </div>
                <div className="p-2.5 rounded-xl" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Failed Posts</span>
                  <p className="font-bold text-sm mt-0.5" style={platform.failedPosts > 10 ? { color: '#EF4444' } : undefined}>{platform.failedPosts}</p>
                </div>
                <div className="p-2.5 rounded-xl flex items-center gap-2" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                  <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Status</span>
                    <p className="text-xs font-bold mt-0.5" style={{ color: '#22C55E' }}>Connected</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                  Recent Activity (Last 5 Days)
                </p>
                <div className="space-y-2">
                  {platform.recentActivity.map((day) => (
                    <div key={day.date} className="flex items-center gap-3">
                      <span className="text-xs w-20 flex-shrink-0" style={{ color: 'var(--text-subtle)' }}>{day.date}</span>
                      <MiniBar successful={day.successful} failed={day.failed} total={day.posts} />
                      <div className="flex items-center gap-2 flex-shrink-0 text-xs">
                        <span className="font-semibold flex items-center gap-0.5" style={{ color: '#22C55E' }}>
                          <CheckCircle2 size={10} /> {day.successful}
                        </span>
                        {day.failed > 0 && (
                          <span className="font-semibold flex items-center gap-0.5" style={{ color: '#EF4444' }}>
                            <XCircle size={10} /> {day.failed}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
