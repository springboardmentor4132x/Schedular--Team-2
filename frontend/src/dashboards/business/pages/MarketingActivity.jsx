import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Clock, CheckCircle2, Calendar, Megaphone,
  AlertCircle, Activity,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatCard from '../../../components/dashboard/StatCard'
import EmptyState from '../../../components/dashboard/EmptyState'
import { fetchCampaignProgress, fetchCampaigns, fetchMarketingActivity } from '../services/businessService'

const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C' },
  facebook: { icon: FaFacebook, color: '#1877F2' },
  linkedin: { icon: FaLinkedin, color: '#0A66C2' },
  x: { icon: FaXTwitter, color: '#374151' },
}

const STATUS_STYLES = {
  draft: { label: 'Draft', color: '#64748B', bg: 'rgba(100,116,139,.12)' },
  review: { label: 'In Review', color: '#4F46E5', bg: 'rgba(79,70,229,.12)' },
  pending_approval: { label: 'Pending Approval', color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
  scheduled: { label: 'Scheduled', color: '#1E3A8A', bg: 'rgba(30,58,138,.12)' },
  published: { label: 'Published', color: '#22C55E', bg: 'rgba(34,197,94,.12)' },
  failed: { label: 'Failed', color: '#EF4444', bg: 'rgba(239,68,68,.12)' },
}

const initials = (name) => String(name ?? '')
  .split(' ')
  .filter(Boolean)
  .map(part => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()

const TIMELINE_TYPE = {
  published: { icon: CheckCircle2, color: '#22C55E', bg: 'rgba(34,197,94,.10)' },
  scheduled: { icon: Calendar, color: '#1E3A8A', bg: 'rgba(30,58,138,.10)' },
  draft: { icon: FileText, color: '#64748B', bg: 'rgba(100,116,139,.10)' },
  review: { icon: Clock, color: '#4F46E5', bg: 'rgba(79,70,229,.10)' },
  approval: { icon: AlertCircle, color: '#F59E0B', bg: 'rgba(245,158,11,.10)' },
  campaign: { icon: Megaphone, color: '#E1306C', bg: 'rgba(225,48,108,.10)' },
}

export default function MarketingActivity() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ assigned_team: null, content_assignments: [], timeline: [], campaign_summary: { active: 0, completed: 0 } })
  const [campaignProgress, setCampaignProgress] = useState([])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await fetchMarketingActivity()
        const campaigns = await fetchCampaigns().catch(() => [])
        const activeCampaigns = (campaigns ?? []).filter(campaign => String(campaign.status ?? '').toLowerCase() === 'active')
        const progress = await Promise.all(
          activeCampaigns.map(async campaign => {
            const detail = await fetchCampaignProgress(campaign.id).catch(() => null)
            return {
              id: campaign.id,
              name: campaign.name,
              progress: detail?.progress?.completion_percentage ?? 0,
            }
          })
        )
        if (active) {
          setData(response ?? {})
          setCampaignProgress(progress)
          setLoading(false)
        }
      } catch {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const contentAssignments = useMemo(() => data.content_assignments ?? [], [data.content_assignments])
  const timeline = data.timeline ?? []
  const campaignSummary = data.campaign_summary ?? { active: 0, completed: 0 }
  const members = data.assigned_team?.members ?? []

  const counts = useMemo(() => ({
    draft: contentAssignments.filter(item => item.status === 'draft').length,
    review: contentAssignments.filter(item => item.status === 'review' || item.status === 'pending_approval').length,
    scheduled: contentAssignments.filter(item => item.status === 'scheduled').length,
    published: contentAssignments.filter(item => item.status === 'published').length,
  }), [contentAssignments])

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Marketing Activity" subtitle="Monitor all activity from your assigned marketing team." />

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)' }} />)}
        </div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="card p-5 mb-4">
            <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>Assigned Marketing Team</h2>
            <div className="flex items-start gap-5 flex-wrap">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-base font-bold" style={{ background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                  {initials(data.assigned_team?.name || 'Team')}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                    {data.assigned_team?.name ?? 'No marketing team assigned'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{members.length} members</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
                    <span className="text-[10px] font-semibold" style={{ color: '#22C55E' }}>Active</span>
                  </div>
                </div>
              </div>

              <div className="w-px self-stretch hidden sm:block" style={{ background: 'var(--border)' }} />

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Team Members</p>
                {members.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>No team members returned yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {members.map(member => (
                      <div key={member} className="flex items-center gap-2 px-2.5 py-2 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                          {initials(member)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{member}</p>
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#22C55E' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard title="Draft Posts" value={counts.draft} icon={FileText} iconColor="#64748B" iconBg="rgba(100,116,139,.12)" index={0} />
            <StatCard title="Posts Under Review" value={counts.review} icon={Clock} iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)" index={1} />
            <StatCard title="Scheduled Posts" value={counts.scheduled} icon={Calendar} iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)" index={2} />
            <StatCard title="Published Posts" value={counts.published} icon={CheckCircle2} iconColor="#22C55E" iconBg="rgba(34,197,94,.12)" index={3} />
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="card overflow-hidden mb-4">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>Content Assignment</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>All content items and their current status across team members</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
                    {['Content Title', 'Assigned To', 'Platform', 'Status', 'Campaign', 'Scheduled Date'].map(head => (
                      <th key={head} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contentAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8"><EmptyState icon={FileText} title="No content assignments" message="The backend has not returned any content items yet." /></td>
                    </tr>
                  ) : contentAssignments.map((item, index) => {
                    const platformMeta = PLATFORM_META[item.platform]
                    const PlatformIcon = platformMeta?.icon
                    const statusMeta = STATUS_STYLES[item.status] ?? STATUS_STYLES.draft
                    return (
                      <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }} className="hover:bg-[var(--bg-alt)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="px-4 py-3 max-w-[220px]"><p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{item.title}</p></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                              {initials(item.assignedTo)}
                            </div>
                            <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{item.assignedTo}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{PlatformIcon && <div className="flex items-center gap-1.5"><PlatformIcon size={13} style={{ color: platformMeta.color }} /><span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{item.platform}</span></div>}</td>
                        <td className="px-4 py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: statusMeta.bg, color: statusMeta.color }}>{statusMeta.label}</span></td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{item.campaign ? <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(79,70,229,.10)', color: '#4F46E5' }}>{item.campaign}</span> : <span style={{ color: 'var(--text-subtle)' }}>—</span>}</td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{item.scheduledDate}</td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} className="card p-5">
              <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>Campaign Summary</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-[var(--r-md)] text-center" style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.20)' }}>
                  <p className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#22C55E' }}>{campaignSummary.active ?? 0}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Active</p>
                </div>
                <div className="p-3 rounded-[var(--r-md)] text-center" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                  <p className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#64748B' }}>{campaignSummary.completed ?? 0}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Completed</p>
                </div>
              </div>
              {campaignProgress.length === 0 ? (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}><Megaphone size={14} style={{ color: 'var(--primary)' }} /> No active campaigns with tracked progress yet.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {campaignProgress.map(campaign => (
                    <div key={campaign.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{campaign.name}</span>
                        <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color: 'var(--primary)' }}>{campaign.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-alt)' }}>
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${campaign.progress}%`, background: 'linear-gradient(90deg,#1E3A8A,#4F46E5)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} className="card p-5 lg:col-span-2">
              <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>Recent Activity Timeline</h2>
              <div className="flex flex-col">
                {timeline.length === 0 ? (
                  <EmptyState icon={Activity} title="No recent activity" message="The backend has not returned recent activity items yet." />
                ) : timeline.map((item, i) => {
                  const meta = TIMELINE_TYPE[item.type] ?? TIMELINE_TYPE.campaign
                  const Icon = meta.icon
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }} className="flex items-start gap-3 pb-4 relative">
                      {i < timeline.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-px" style={{ background: 'var(--border)' }} />
                      )}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10" style={{ background: meta.bg }}>
                        <Icon size={14} style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm" style={{ color: 'var(--text)' }}>{item.text}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>{item.actor}</span>
                          <span style={{ color: 'var(--border)' }}>·</span>
                          <span className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>{item.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
