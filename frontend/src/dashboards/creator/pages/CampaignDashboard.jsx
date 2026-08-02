import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import Card from '../../../shared/components/ui/Card'
import ProgressBar from '../../../shared/components/ui/ProgressBar'
import { CardSkeleton } from '../../../shared/components/ui/Skeleton'
import { getCampaigns, getCampaignProgress } from '../../../services/campaignService'
import {
  campaignStatusBadge,
  campaignStatusColor,
  formatBudget,
  durationLabel,
  getPlatformLabel,
} from '../constants/campaigns'
import {
  PlusCircle,
  ArrowRight,
  Calendar,
  Wallet,
  Target,
  Rocket,
  TrendingUp,
  CheckCircle2,
  Search,
  Layers,
  Link2,
} from 'lucide-react'

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'name', label: 'Name A–Z' },
  { id: 'budget', label: 'Highest budget' },
  { id: 'progress', label: 'Most progress' },
]

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="stat-card">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 truncate">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight tabular-nums">{value}</p>
      </div>
    </div>
  )
}

export default function CampaignDashboard() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('newest')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const list = await getCampaigns()
        if (!mounted) return
        setCampaigns(list)
        const results = await Promise.allSettled(list.map((c) => getCampaignProgress(c.id)))
        if (!mounted) return
        const map = {}
        list.forEach((c, i) => {
          const value = results[i].status === 'fulfilled' ? results[i].value?.progress : null
          if (value) map[c.id] = value
        })
        setProgressMap(map)
      } catch {
        if (mounted) setCampaigns([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const stats = useMemo(() => {
    const total = campaigns.length
    const active = campaigns.filter((c) => c.status?.toLowerCase() === 'active').length
    const completed = campaigns.filter((c) => c.status?.toLowerCase() === 'completed').length
    const budget = campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0)
    return { total, active, completed, budget }
  }, [campaigns])

  const filtered = useMemo(() => {
    let list = campaigns
    if (statusFilter !== 'All') {
      list = list.filter((c) => c.status?.toLowerCase() === statusFilter.toLowerCase())
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((c) =>
        [c.name, c.category, c.objective, c.description].filter(Boolean).some((v) => v.toLowerCase().includes(q))
      )
    }
    const sorted = [...list]
    switch (sortOrder) {
      case 'oldest':
        sorted.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
        break
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'budget':
        sorted.sort((a, b) => (Number(b.budget) || 0) - (Number(a.budget) || 0))
        break
      case 'progress':
        sorted.sort((a, b) => (progressMap[b.id]?.completion_percentage || 0) - (progressMap[a.id]?.completion_percentage || 0))
        break
      default:
        sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    }
    return sorted
  }, [campaigns, search, statusFilter, sortOrder, progressMap])

  const availableStatuses = useMemo(() => {
    const set = new Set(campaigns.map((c) => c.status).filter(Boolean))
    return ['All', ...set]
  }, [campaigns])

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in pb-12">
      {/* Page Header */}
      <section aria-label="Page header" className="card p-5 sm:p-6 relative overflow-hidden bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-950/40 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-block bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold mb-2">
              Campaign Management
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Campaigns</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">Plan objectives, track publishing progress and organize your content under marketing campaigns.</p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('/dashboard/creator/campaigns/new')}>
            <PlusCircle size={16} />
            <span>New Campaign</span>
          </Button>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Layers} label="Total Campaigns" value={stats.total} accent="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" />
        <StatCard icon={Rocket} label="Active" value={stats.active} accent="bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} accent="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={Wallet} label="Total Budget" value={formatBudget(stats.budget)} accent="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" />
      </div>

      {/* Toolbar */}
      <div className="card p-4 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <div className="relative w-full lg:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="input-base !pl-10"
            aria-label="Search campaigns"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-base w-auto" aria-label="Filter by status">
            {availableStatuses.map((s) => <option key={s} value={s}>{s === 'All' ? 'All statuses' : s}</option>)}
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="input-base w-auto" aria-label="Sort campaigns">
            {SORT_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Campaign grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
            <Target size={28} />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">No campaigns yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Create your first campaign to group related posts around a single marketing objective and track its progress.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('/dashboard/creator/campaigns/new')}>
            <PlusCircle size={16} />
            <span>Create Campaign</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((campaign) => {
            const progress = progressMap[campaign.id] || { total_posts: 0, published: 0, scheduled: 0, drafts: 0, completion_percentage: 0 }
            const platforms = campaign.target_platforms || []
            return (
              <Card key={campaign.id} hover className="p-5 flex flex-col gap-4" onClick={() => navigate(`/dashboard/creator/campaigns/${campaign.id}`)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${campaignStatusColor(campaign.status)}`}>
                      <TrendingUp size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">{campaign.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {campaign.category || 'Uncategorized'} · {campaign.priority || 'Medium'} priority
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap ${campaignStatusBadge(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>

                {campaign.objective && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                    <Target size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{campaign.objective}</span>
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" />{durationLabel(campaign.start_date, campaign.end_date)}</span>
                  <span className="flex items-center gap-1.5 ml-auto"><Wallet size={14} className="text-slate-400" />{formatBudget(campaign.budget)}</span>
                </div>

                {platforms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {platforms.slice(0, 4).map((p) => (
                      <span key={p} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {getPlatformLabel(p)}
                      </span>
                    ))}
                    {platforms.length > 4 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">+{platforms.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="mt-auto space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">{progress.published} published · {progress.scheduled} scheduled</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{progress.completion_percentage}%</span>
                  </div>
                  <ProgressBar value={progress.completion_percentage} max={100} />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/creator/campaigns/${campaign.id}`) }}
                  >
                    View Details
                    <ArrowRight size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/creator/campaigns/${campaign.id}/assign-posts`) }}
                    className="border border-slate-200 dark:border-slate-700"
                  >
                    <Link2 size={14} />
                    Assign Posts
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
