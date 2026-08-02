import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import Card from '../../../shared/components/ui/Card'
import ProgressBar from '../../../shared/components/ui/ProgressBar'
import { CardSkeleton } from '../../../shared/components/ui/Skeleton'
import { getCampaignById, getCampaignSummary, getCampaignProgress } from '../../../services/campaignService'
import { campaignStatusBadge, formatBudget, durationLabel } from '../constants/campaigns'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Target,
  FileText,
  TrendingUp,
  Eye,
  MousePointerClick,
  Wallet,
} from 'lucide-react'

const ESTIMATED_REACH_PER_POST = 1500
const ESTIMATED_ENGAGEMENT_RATE = 0.04

function StatCard({ icon: Icon, label, value, accent, sub }) {
  return (
    <div className="stat-card">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 truncate">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight tabular-nums">{value}</p>
        {sub && <p className="text-xs font-semibold mt-1 text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

export default function CampaignAnalytics() {
  const navigate = useNavigate()
  const { id } = useParams()
  const campaignId = Number(id)

  const [campaign, setCampaign] = useState(null)
  const [summary, setSummary] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const camp = await getCampaignById(campaignId).catch(() => null)
        if (!mounted) return
        if (!camp) {
          setTimeout(() => navigate('/dashboard/creator/campaigns'), 1000)
          return
        }
        setCampaign(camp)
        const [summ, prog] = await Promise.all([
          getCampaignSummary(campaignId).catch(() => null),
          getCampaignProgress(campaignId).catch(() => null),
        ])
        if (!mounted) return
        setSummary(summ?.summary || null)
        setProgress(prog?.progress || null)
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [campaignId, navigate])

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
        <div className="card p-5 sm:p-6 h-28 animate-pulse bg-slate-100/60 dark:bg-slate-800/40"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (!campaign) return null

  const published = progress?.published ?? 0
  const scheduled = progress?.scheduled ?? 0
  const drafts = progress?.drafts ?? 0
  const total = progress?.total_posts ?? 0
  const completion = progress?.completion_percentage ?? 0
  const estimatedReach = published * ESTIMATED_REACH_PER_POST
  const estimatedEngagement = Math.round(estimatedReach * ESTIMATED_ENGAGEMENT_RATE)
  const budget = Number(campaign.budget) || 0
  const costPerPost = total > 0 ? budget / total : 0

  const distribution = [
    { label: 'Published', value: published, color: 'bg-emerald-500' },
    { label: 'Scheduled', value: scheduled, color: 'bg-sky-500' },
    { label: 'Drafts', value: drafts, color: 'bg-amber-500' },
  ]

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in pb-12">
      {/* Header */}
      <section aria-label="Page header" className="card p-5 sm:p-6 relative overflow-hidden bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-950/40 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/creator/campaigns/${campaignId}`)} className="px-0 text-slate-500 mb-2">
              <ArrowLeft size={14} />
              Back to Campaign
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Campaign Analytics</h1>
              {campaign && <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${campaignStatusBadge(campaign.status)}`}>{campaign.status}</span>}
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">
              {campaign ? `Performance summary for "${campaign.name}". Detailed engagement analytics arrive in later modules.` : 'Campaign performance summary.'}
            </p>
          </div>
          <Button variant="outline" size="md" onClick={() => navigate(`/dashboard/creator/campaigns/${campaignId}/timeline`)}>
            <CalendarDays size={16} />
            View Timeline
          </Button>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Posts" value={total} accent="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" sub="content in campaign" />
        <StatCard icon={CheckCircle2} label="Published" value={published} accent="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" sub="live on platforms" />
        <StatCard icon={Clock} label="Scheduled" value={scheduled} accent="bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400" sub="awaiting publication" />
        <StatCard icon={Target} label="Completion" value={`${completion}%`} accent="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400" sub="overall progress" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress + distribution */}
        <Card className="p-5 sm:p-6 space-y-5">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-3">Campaign Progress</h2>
            <ProgressBar value={completion} max={100} showLabel label="Completion" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3">Post Distribution</h3>
            <div className="space-y-2">
              {distribution.map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${d.color}`}></span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-20">{d.label}</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full transition-all duration-700`} style={{ width: `${total > 0 ? (d.value / total) * 100 : 0}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tabular-nums w-6 text-right">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
          {campaign && (
            <p className="text-xs text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700/60">
              Timeline: {durationLabel(campaign.start_date, campaign.end_date)} · {formatBudget(budget)} budget
            </p>
          )}
        </Card>

        {/* Estimated performance */}
        <Card className="p-5 sm:p-6 space-y-5">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">Estimated Performance</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-4 rounded-xl border border-slate-100 dark:border-slate-700/60 p-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                <Eye size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Estimated Reach</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">{estimatedReach.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-0.5">Based on ~{ESTIMATED_REACH_PER_POST.toLocaleString()} reach per published post</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-slate-100 dark:border-slate-700/60 p-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <MousePointerClick size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Est. Engagement</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">{estimatedEngagement.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-0.5">At a {Math.round(ESTIMATED_ENGAGEMENT_RATE * 100)}% engagement rate</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-slate-100 dark:border-slate-700/60 p-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cost Per Post</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">{total > 0 ? formatBudget(costPerPost) : '—'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatBudget(budget)} budget across {total} posts</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Status summary */}
        <Card className="p-5 sm:p-6 space-y-5">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">Campaign Summary</h2>
          <div className="space-y-3">
            {[
              { label: 'Status', value: campaign.status },
              { label: 'Total posts', value: summary?.total_posts ?? total },
              { label: 'Published posts', value: summary?.published_posts ?? published },
              { label: 'Scheduled posts', value: summary?.scheduled_posts ?? scheduled },
              { label: 'Draft posts', value: summary?.draft_posts ?? drafts },
              { label: 'Priority', value: campaign.priority || '—' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{row.label}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Campaign analytics will be expanded with real engagement metrics, reach, impressions and ROI tracking in later modules.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/creator/campaigns/${campaignId}`)}>
                <TrendingUp size={14} />
                Campaign Details
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/creator/campaigns/${campaignId}/assign-posts`)}>
                Assign Posts
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
