import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Clock, CheckCircle2,
  Calendar, Megaphone, Activity,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatCard from '../../../components/dashboard/StatCard'
import EmptyState from '../../../components/dashboard/EmptyState'
import { fetchMarketingActivity } from '../services/businessService'

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

export default function MarketingActivity() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ assigned_team: null, content_assignments: [], timeline: [], campaign_summary: { active: 0, completed: 0 } })

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await fetchMarketingActivity()
        if (active) {
          setData(response ?? {})
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

  const counts = useMemo(() => ({
    draft: contentAssignments.filter(item => item.status === 'draft').length,
    review: contentAssignments.filter(item => item.status === 'review' || item.status === 'pending_approval').length,
    scheduled: contentAssignments.filter(item => item.status === 'scheduled').length,
    published: contentAssignments.filter(item => item.status === 'published').length,
  }), [contentAssignments])

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Marketing Activity" subtitle="Live team activity, assignments, and campaign summary from the database." />

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)' }} />)}
        </div>
      ) : (
        <>
          <div className="card p-5 mb-4">
            <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>Assigned Marketing Team</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                {String(data.assigned_team?.name ?? 'Team').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{data.assigned_team?.name ?? 'No marketing team assigned'}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{data.assigned_team?.members?.length ?? 0} members</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {(data.assigned_team?.members ?? []).map(member => (
                <span key={member} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'var(--bg-alt)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{member}</span>
              ))}
              {(data.assigned_team?.members ?? []).length === 0 && <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>No team members returned yet.</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard title="Draft Posts" value={counts.draft} icon={FileText} iconColor="#64748B" iconBg="rgba(100,116,139,.12)" index={0} />
            <StatCard title="Posts Under Review" value={counts.review} icon={Clock} iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)" index={1} />
            <StatCard title="Scheduled Posts" value={counts.scheduled} icon={Calendar} iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)" index={2} />
            <StatCard title="Published Posts" value={counts.published} icon={CheckCircle2} iconColor="#22C55E" iconBg="rgba(34,197,94,.12)" index={3} />
          </div>

          <div className="card overflow-hidden mb-4">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>Content Assignment</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Recent content items and their live status</p>
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
                        <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{item.assignedTo}</td>
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="card p-5">
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
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}><Megaphone size={14} style={{ color: 'var(--primary)' }} /> Campaign data is sourced from the backend workspace.</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="card p-5 lg:col-span-2">
              <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>Recent Activity Timeline</h2>
              <div className="flex flex-col gap-3">
                {timeline.length === 0 ? (
                  <EmptyState icon={Activity} title="No recent activity" message="The backend has not returned recent activity items yet." />
                ) : timeline.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.type === 'published' ? 'rgba(34,197,94,.12)' : item.type === 'scheduled' ? 'rgba(30,58,138,.12)' : 'rgba(79,70,229,.12)' }}>
                      {item.type === 'published' ? <CheckCircle2 size={15} style={{ color: '#22C55E' }} /> : item.type === 'scheduled' ? <Calendar size={15} style={{ color: '#1E3A8A' }} /> : <Megaphone size={15} style={{ color: '#4F46E5' }} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{item.text}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.actor} · {item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
