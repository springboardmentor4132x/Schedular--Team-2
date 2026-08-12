import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import { getPlatformHistory } from '../../../services/publishingService'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import {
  Users, ArrowLeft, TrendingUp, TrendingDown, CheckCircle2, XCircle, FileText, Link2,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'

const PLATFORM_TABS = [
  { id: 'facebook',  label: 'Facebook',  icon: FaFacebook  },
  { id: 'instagram', label: 'Instagram', icon: FaInstagram },
  { id: 'linkedin',  label: 'LinkedIn',  icon: FaLinkedin  },
  { id: 'x',         label: 'X',         icon: FaXTwitter  },
  { id: 'youtube',   label: 'YouTube',   icon: FaYoutube   },
  { id: 'pinterest', label: 'Pinterest', icon: FaPinterest },
]

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
  const [tab, setTab] = useState('instagram')
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

  const tabMeta = PLATFORM_TABS.find((p) => p.id === tab) || PLATFORM_TABS[0]
  const selected = platforms.find((p) => p.id === tab)

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <button onClick={() => navigate('/dashboard/mkt/queue')}
        className="flex items-center gap-1.5 text-sm font-semibold mb-4 hover:underline" style={{ color: 'var(--primary)' }}>
        <ArrowLeft size={15} /> Back to Publishing Center
      </button>
      <PageHeader title="Platform History" subtitle={`Publishing performance for ${activeClient.name}`} />

      {/* Platform tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {PLATFORM_TABS.map((p) => {
          const Icon = p.icon
          const active = tab === p.id
          return (
            <button key={p.id} onClick={() => setTab(p.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:-translate-y-0.5"
              style={{
                background: active ? 'var(--primary)' : 'var(--bg-alt)',
                color: active ? '#fff' : 'var(--text-muted)',
                borderColor: active ? 'var(--primary)' : 'var(--border)',
              }}>
              <Icon size={13} /> {p.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="card p-4 text-sm" style={{ color: 'var(--text-muted)' }}>Loading platform history...</div>
      ) : !selected ? (
        <div className="card p-6">
          <EmptyState icon={FileText} title={`No posts on ${tabMeta.label}`} message="No posts for this platform yet." />
        </div>
      ) : (
        <>
          {/* Selected platform summary card */}
          <div className="card p-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selected.color}`}>
                <selected.icon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold">{selected.name}</h3>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>Last published {selected.lastPublished}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-xl" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Posts</span>
                <p className="font-bold text-sm mt-0.5">{selected.totalPosts.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-1">
                  <span style={{ color: 'var(--text-muted)' }}>Success Rate</span>
                  {selected.successRate >= 95 ? <TrendingUp size={12} style={{ color: '#22C55E' }} /> : <TrendingDown size={12} style={{ color: '#F59E0B' }} />}
                </div>
                <p className="font-bold text-sm mt-0.5">{selected.successRate}%</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Failed Posts</span>
                <p className="font-bold text-sm mt-0.5" style={selected.failedPosts > 10 ? { color: '#EF4444' } : undefined}>{selected.failedPosts}</p>
              </div>
              <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Status</span>
                  <p className="text-xs font-bold mt-0.5" style={{ color: '#22C55E' }}>Connected</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Recent Activity (Last 5 Posts)
              </p>
              <div className="space-y-2">
                {selected.recentActivity.map((day) => (
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

          {/* Published posts history list */}
          <div className="card mt-4">
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
                Post History
              </h3>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {selected.items.length} post{selected.items.length === 1 ? '' : 's'}
              </span>
            </div>
            {selected.items.length === 0 ? (
              <div className="p-4 text-xs" style={{ color: 'var(--text-subtle)' }}>No posts for {selected.name} yet.</div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {selected.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle2 size={14} className="flex-shrink-0" style={{ color: '#22C55E' }} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                          {item.title || `Post #${item.id}`}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                          {item.publishedAt ? new Date(item.publishedAt).toLocaleString() : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={item.status === 'Failed'
                          ? { background: 'rgba(239,68,68,.12)', color: '#EF4444' }
                          : { background: 'rgba(34,197,94,.12)', color: '#22C55E' }}>
                        {item.status === 'Failed' ? 'Failed' : 'Published'}
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-subtle)' }}>
                        <Link2 size={11} /> {item.platformPostId || '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
