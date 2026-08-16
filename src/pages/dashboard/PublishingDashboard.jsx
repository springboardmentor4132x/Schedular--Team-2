import { useEffect, useState } from 'react'
import PageHeader from '../../components/dashboard/PageHeader'
import { useClient } from '../../context/ClientContext'
import { clientPublishingApi } from '../../services/mockData'
import { PublishingPanel } from './mkt/PublishingCenter'
import EmptyState from '../../components/dashboard/EmptyState'
import { Users } from 'lucide-react'

export default function PublishingDashboard() {
  const { activeClient } = useClient()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!activeClient) return setStats(null)
      const d = await clientPublishingApi.getDashboard(activeClient.id)
      if (mounted) setStats(d)
    }
    load()
    return () => { mounted = false }
  }, [activeClient])

  if (!activeClient) return (
    <div className="p-6"><div className="card"><EmptyState icon={Users} title="No client selected" message="Select a client to view publishing." action={{ label: 'View Clients', onClick: () => {} }} /></div></div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <PageHeader title="Publishing Dashboard" subtitle={`Overview for ${activeClient.name}`} />

      {stats ? (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-5">
            <div className="card p-3 text-center"><p className="text-xl font-extrabold">{stats.totalScheduled}</p><p className="text-[10px] mt-0.5">Total Scheduled</p></div>
            <div className="card p-3 text-center"><p className="text-xl font-extrabold">{stats.pendingApproval}</p><p className="text-[10px] mt-0.5">Pending Approval</p></div>
            <div className="card p-3 text-center"><p className="text-xl font-extrabold">{stats.publishingQueue}</p><p className="text-[10px] mt-0.5">Publishing Queue</p></div>
            <div className="card p-3 text-center"><p className="text-xl font-extrabold">{stats.published}</p><p className="text-[10px] mt-0.5">Published</p></div>
            <div className="card p-3 text-center"><p className="text-xl font-extrabold">{stats.failed}</p><p className="text-[10px] mt-0.5">Failed</p></div>
            <div className="card p-3 text-center"><p className="text-xl font-extrabold">{stats.cancelled}</p><p className="text-[10px] mt-0.5">Cancelled</p></div>
          </div>

          <h3 className="text-sm font-semibold mb-2">Recent Activity</h3>
          <div className="space-y-2 mb-6">
            {stats.recentActivity.map(a=> (
              <div key={a.id} className="card p-3 text-sm">{a.platform} · {a.campaign || '—'} · {new Date(a.publishedAt).toLocaleString()} · {a.status}</div>
            ))}
          </div>

          <h3 className="text-sm font-semibold mb-2">Publishing Queue</h3>
          <PublishingPanel />
        </div>
      ) : (
        <div className="card p-6">Loading...</div>
      )}
    </div>
  )
}
