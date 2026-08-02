import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { CardSkeleton, TableSkeleton } from '../../../shared/components/ui/Skeleton'
import { timeAgo } from '../../../shared/utils'
import { campaignStatusColor, campaignStatusBadge } from '../constants/campaigns'
import { 
  FileEdit, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  PlusCircle, 
  Upload, 
  Folder, 
  Users, 
  Sparkles,
  Share2,
  Clock,
  MessageSquare,
  Layers,
  ArrowUpRight
} from 'lucide-react'
import { loadMappedPosts } from '../../../services/postAdapter'
import { getCampaigns, getCampaignProgress } from '../../../services/campaignService'

function MetricCard({ icon: Icon, count, label, trend, badgeColor, badgeText }) {
  return (
    <div className="stat-card cursor-pointer transform hover:-translate-y-1 hover:border-indigo-500/50 dark:hover:border-indigo-400/40 hover:shadow-card-lg transition-all duration-300 ease-out group">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 transition-transform duration-300 group-hover:scale-110">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase text-[10px] truncate">{label}</p>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${badgeColor}`}>
            {badgeText}
          </span>
        </div>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{count}</p>
        <p className="text-xs font-semibold mt-1.5 flex items-center gap-1 text-slate-400 dark:text-slate-500">
          {trend}
        </p>
      </div>
    </div>
  )
}

function QuickActionCard({ icon: Icon, label, desc, bgAccent, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-2 p-5 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800
                 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 hover:shadow-card-lg hover:-translate-y-1 transition-all duration-300 text-left group focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
    >
      <div className={`p-2.5 rounded-lg ${bgAccent} text-white transition-transform duration-300 group-hover:scale-105 shadow-sm`}>
        <Icon size={20} />
      </div>
      <div className="mt-2">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
          {label}
          <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-0.5 group-hover:translate-y-0" />
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block leading-relaxed">{desc}</span>
      </div>
    </button>
  )
}

const quickActions = [
  { icon: PlusCircle, label: 'Create Post', desc: 'Compose a new post update', bgAccent: 'bg-indigo-600', link: '/dashboard/creator/content-scheduling' },
  { icon: Upload, label: 'Upload Media', desc: 'Upload to content vault', bgAccent: 'bg-emerald-600', link: '/dashboard/creator/content-scheduling' },
  { icon: FileEdit, label: 'Continue Draft', desc: 'Resume where you left off', bgAccent: 'bg-amber-500', link: '/dashboard/creator/my-posts?tab=drafts' },
  { icon: Calendar, label: 'Schedule Content', desc: 'Plan dates for social sharing', bgAccent: 'bg-sky-500', link: '/dashboard/creator/content-scheduling' },
  { icon: Users, label: 'Join Campaign', desc: 'Collaborate with brands', bgAccent: 'bg-purple-500', link: '/dashboard/creator/campaigns' },
  { icon: Folder, label: 'Content Library', desc: 'Manage your creative assets', bgAccent: 'bg-pink-500', link: '/dashboard/creator/my-posts' },
]

const SCHEDULED_STATUSES = ['Scheduled', 'Queued']
const DRAFT_STATUSES = ['Draft']
const REVIEW_STATUSES = ['In Review', 'Pending Review']

function formatScheduleLabel(iso) {
  if (!iso) return 'Unscheduled'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Unscheduled'
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (sameDay(date, today)) return `Today, ${time}`
  if (sameDay(date, tomorrow)) return `Tomorrow, ${time}`
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`
}

const PLATFORM_BAR_COLORS = {
  Instagram: 'bg-pink-500',
  'X / Twitter': 'bg-slate-500',
  Twitter: 'bg-slate-500',
  LinkedIn: 'bg-blue-600',
  Facebook: 'bg-indigo-500',
  YouTube: 'bg-red-500',
  Pinterest: 'bg-rose-500',
}

export default function CreatorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [today] = useState(() => new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [campaignProgress, setCampaignProgress] = useState({})
  const [trendCounts, setTrendCounts] = useState({ drafts: 0, scheduled: 0, published: 0, reviews: 0 })

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [mapped, camps] = await Promise.all([
          loadMappedPosts(),
          getCampaigns().catch(() => []),
        ])
        const progressMap = {}
        await Promise.all(camps.map(async (c) => {
          try {
            const res = await getCampaignProgress(c.id)
            if (res?.progress) progressMap[c.id] = res.progress.completion_percentage
          } catch {
            /* progress is optional */
          }
        }))
        if (mounted) {
          const now = Date.now()
          const weekAgo = now - 7 * 24 * 60 * 60 * 1000
          const createdThisWeek = (list) => list.filter((p) => p.raw.created_at && new Date(p.raw.created_at).getTime() >= weekAgo).length
          setTrendCounts({
            drafts: createdThisWeek(mapped.filter((p) => DRAFT_STATUSES.includes(p.status))),
            scheduled: createdThisWeek(mapped.filter((p) => SCHEDULED_STATUSES.includes(p.status) && p.raw.scheduled_for)),
            published: createdThisWeek(mapped.filter((p) => p.status === 'Published')),
            reviews: createdThisWeek(mapped.filter((p) => REVIEW_STATUSES.includes(p.status))),
          })
          setPosts(mapped)
          setCampaigns(camps)
          setCampaignProgress(progressMap)
        }
      } catch {
        /* leave defaults */
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const {
    drafts,
    reviewPosts,
    scheduledPosts,
    published,
    nextPost,
    metrics,
    recentPosts,
  } = useMemo(() => {
    const draftsList = posts.filter((p) => DRAFT_STATUSES.includes(p.status))
    const reviewList = posts.filter((p) => REVIEW_STATUSES.includes(p.status))
    const scheduledList = posts
      .filter((p) => SCHEDULED_STATUSES.includes(p.status) && p.raw.scheduled_for)
      .sort((a, b) => new Date(a.raw.scheduled_for) - new Date(b.raw.scheduled_for))
    const publishedList = posts.filter((p) => p.status === 'Published')

    return {
      drafts: draftsList,
      reviewPosts: reviewList,
      scheduledPosts: scheduledList,
      published: publishedList,
      nextPost: scheduledList[0] || null,
      metrics: [
        { icon: FileEdit, count: draftsList.length, label: 'Draft Posts', trend: `${trendCounts.drafts} created this week`, badgeColor: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300', badgeText: 'In Progress' },
        { icon: Clock, count: scheduledList.length, label: 'Scheduled Posts', trend: `${trendCounts.scheduled} created this week`, badgeColor: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300', badgeText: 'Ready' },
        { icon: CheckCircle, count: publishedList.length, label: 'Published Posts', trend: `${trendCounts.published} created this week`, badgeColor: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300', badgeText: 'Live' },
        { icon: AlertCircle, count: reviewList.length, label: 'Pending Reviews', trend: `${trendCounts.reviews} created this week`, badgeColor: 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300', badgeText: 'Needs Action' },
      ],
      recentPosts: [...posts].sort((a, b) => new Date(b.raw.created_at || 0) - new Date(a.raw.created_at || 0)).slice(0, 4),
    }
  }, [posts, trendCounts])

  const {
    weekDays,
    weekCounts,
    weekTotal,
    maxDay,
    maxStatus,
    statusBars,
    platformBars,
    calendarHighlights,
  } = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push(d)
    }
    const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
    const counts = days.map((d) => posts.filter((p) => p.raw.created_at && sameDay(new Date(p.raw.created_at), d)).length)
    const total = counts.reduce((a, b) => a + b, 0)
    const max = Math.max(...counts, 1)

    const maxStatus = Math.max(drafts.length, scheduledPosts.length, published.length, reviewPosts.length, 1)
    const bars = [
      { label: 'Draft', count: drafts.length, color: 'bg-slate-400' },
      { label: 'Scheduled', count: scheduledPosts.length, color: 'bg-indigo-500' },
      { label: 'Published', count: published.length, color: 'bg-emerald-500' },
      { label: 'Pending Review', count: reviewPosts.length, color: 'bg-amber-500' },
    ]

    const platformCount = {}
    posts.forEach((p) => {
      const key = p.platform || 'Unassigned'
      platformCount[key] = (platformCount[key] || 0) + 1
    })
    const platformTotal = Math.max(Object.values(platformCount).reduce((a, b) => a + b, 0), 1)
    const platformBarsList = Object.entries(platformCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([platform, count]) => ({
        platform,
        count,
        percent: Math.round((count / platformTotal) * 100),
        color: PLATFORM_BAR_COLORS[platform] || 'bg-slate-400',
      }))

    const highlights = new Set()
    scheduledPosts.forEach((p) => {
      const d = new Date(p.raw.scheduled_for)
      if (d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()) {
        highlights.add(d.getDate())
      }
    })

    return {
      weekDays: days,
      weekCounts: counts,
      weekTotal: total,
      maxDay: max,
      maxStatus,
      statusBars: bars,
      platformBars: platformBarsList,
      calendarHighlights: highlights,
    }
  }, [posts, drafts, scheduledPosts, published, reviewPosts, today])

  const firstName = (user?.name || '').split(' ')[0] || 'Creator'
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const firstWeekday = new Date(today.getFullYear(), today.getMonth(), 1).getDay()

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="card p-5 sm:p-6 animate-pulse space-y-3 bg-gradient-to-r from-indigo-50/20 to-purple-50/20">
          <div className="w-72 h-8 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="w-96 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TableSkeleton />
          <TableSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      <section aria-label="Welcome section" className="card p-5 sm:p-6 relative overflow-hidden bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-950/40 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 z-10 relative">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">
              Create, schedule and manage your content efficiently.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <div className="bg-white dark:bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700/60 shadow-sm">
              <span className="text-slate-400 mr-1.5 font-normal">Date:</span>
              {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="bg-white dark:bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700/60 shadow-sm">
              <span className="text-slate-400 mr-1.5 font-normal">Next Post:</span>
              {nextPost ? (
                <span className="text-indigo-600 dark:text-indigo-400">{formatScheduleLabel(nextPost.raw.scheduled_for)} ({nextPost.platform})</span>
              ) : (
                <span className="text-slate-500">No upcoming posts</span>
              )}
            </div>
            <div className="bg-white dark:bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700/60 shadow-sm">
              <span className="text-slate-400 mr-1.5 font-normal">Content:</span>
              <span className="text-indigo-600 dark:text-indigo-400">{posts.length} total posts</span>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Creator metric cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <MetricCard key={i} {...metric} />
        ))}
      </section>

      <section aria-label="Quick action panel" className="card p-5 sm:p-6 border border-indigo-100/50 dark:border-indigo-950/40 shadow-card">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <Sparkles className="text-indigo-500" size={18} />
          Creator Command Center
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, i) => (
            <QuickActionCard key={i} {...action} onClick={() => navigate(action.link)} />
          ))}
        </div>
      </section>

      <section aria-label="Recent posts and notifications" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4 shadow-card">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
            <FileEdit className="text-indigo-500" size={18} />
            Recent Posts
          </h2>

          {recentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 h-48 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
              <span className="text-2xl mb-1.5">📝</span>
              <p className="font-bold text-sm">No posts yet</p>
              <p className="text-xs mt-1">Create your first post to see it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post) => {
                const PlatformIcon = post.platformIcon
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => navigate('/dashboard/creator/my-posts')}
                    className="w-full p-3.5 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl flex items-start gap-3 border border-slate-100 dark:border-slate-700/60 hover:border-indigo-100 dark:hover:border-indigo-950/80 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 text-left group cursor-pointer"
                  >
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0">
                      <PlatformIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{post.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        {post.platform} · <span className="text-indigo-600 dark:text-indigo-400">{post.status}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold flex-shrink-0">{timeAgo(post.raw.created_at)}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="card p-5 space-y-4 shadow-card">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
            <MessageSquare className="text-indigo-500" size={18} />
            Reviewer Feedback & Activity
          </h2>

          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 h-48 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
            <span className="text-2xl mb-1.5">💬</span>
            <p className="font-bold text-sm">No notifications or feedback</p>
            <p className="text-xs mt-1">Reviewers have not posted new comments on your drafts.</p>
          </div>
        </div>
      </section>

      <section aria-label="Brand campaigns" className="card p-5 sm:p-6 space-y-4 shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="text-indigo-500" size={18} />
            Brand Campaigns
          </h2>
        </div>

        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 h-44 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
            <span className="text-2xl mb-1.5">🚀</span>
            <p className="font-bold text-sm">No campaigns yet</p>
            <p className="text-xs mt-1">You are not currently enrolled in any brand campaigns.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.map((camp) => {
              const progress = campaignProgress[camp.id] ?? 0
              const due = camp.end_date
                ? new Date(camp.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—'
              return (
                <div key={camp.id} className="p-5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/20 hover:border-indigo-300 dark:hover:border-indigo-900 transition-all duration-300 space-y-3.5 shadow-sm">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">{camp.name}</h3>
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap ${campaignStatusBadge(camp.status)}`}>{camp.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Due Date: {due}</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${campaignStatusColor(camp.status)}`} style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-label="Drafts and scheduling">
        <div className="card p-5 lg:col-span-2 space-y-4 shadow-card">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
            <FileEdit className="text-indigo-500" size={18} />
            Recent Creative Drafts
          </h2>

          {drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 h-48 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
              <span className="text-2xl mb-1.5">📝</span>
              <p className="font-bold text-sm">No drafts available</p>
              <p className="text-xs mt-1">Start writing a new post to save it as a draft.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700/60">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 uppercase tracking-wide bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700/60">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Platform</th>
                    <th className="py-3 px-4">Campaign</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Last Edited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/60">
                  {drafts.map((d) => {
                    const PlatformIcon = d.platformIcon
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{d.title}</td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                            <PlatformIcon size={14} className="text-indigo-500" />
                            {d.platform}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 font-medium">{d.campaign}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            d.status === 'Draft' ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                            'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400 font-medium text-right">{timeAgo(d.raw.updated_at || d.raw.created_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-5 space-y-4 shadow-card">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
            <Clock className="text-indigo-500" size={18} />
            Upcoming Publishing Schedule
          </h2>

          {scheduledPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 h-48 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
              <span className="text-2xl mb-1.5">🗓️</span>
              <p className="font-bold text-sm">Nothing scheduled</p>
              <p className="text-xs mt-1">Schedule content to see it here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledPosts.slice(0, 4).map((up) => {
                const PlatformIcon = up.platformIcon
                return (
                  <div key={up.id} className="flex gap-3 items-start border-l-2 border-indigo-500 pl-3">
                    <div className="p-1 bg-indigo-50 dark:bg-indigo-950/60 rounded text-indigo-600 dark:text-indigo-400 mt-0.5">
                      <PlatformIcon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{up.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{formatScheduleLabel(up.raw.scheduled_for)} · {up.platform}</p>
                      {up.campaign !== 'None' && (
                        <span className="inline-block mt-1.5 text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                          {up.campaign}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-label="Calendar and analytics snapshot">
        <div className="card p-5 space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="text-indigo-500" size={18} />
              Publishing Calendar
            </h2>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
              <div key={i} className="text-slate-400 font-bold py-1 uppercase text-[10px]">{day}</div>
            ))}

            {Array.from({ length: firstWeekday }, (_, i) => (
              <div key={`blank-${i}`}></div>
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => {
              const dayNum = i + 1
              const isToday = dayNum === today.getDate()
              const hasPost = calendarHighlights.has(dayNum)
              return (
                <div
                  key={i}
                  className={`py-1.5 rounded-lg flex flex-col items-center justify-center relative cursor-pointer font-semibold ${
                    isToday ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-500/30' :
                    hasPost ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400' :
                    'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasPost && !isToday && (
                    <span className="absolute bottom-0.5 w-1 h-1 bg-indigo-500 rounded-full"></span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="card p-5 lg:col-span-2 space-y-4 shadow-card">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
            <Share2 className="text-indigo-500" size={18} />
            Creator Performance Metrics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 space-y-2">
              <p className="text-xs text-slate-400 font-medium">Content Created (Last 7 Days)</p>
              <div className="flex justify-between items-end">
                <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">{weekTotal} Posts</span>
              </div>
              <div className="flex gap-1 h-8 items-end pt-2">
                {weekCounts.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-indigo-500/20 dark:bg-indigo-500/10 rounded-t overflow-hidden">
                      <div className="bg-indigo-600 w-full rounded-t" style={{ height: `${(val / maxDay) * 100}%` }}></div>
                    </div>
                    <span className="text-[8px] text-slate-400 font-semibold">
                      {weekDays[i].toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 space-y-2">
              <p className="text-xs text-slate-400 font-medium">Posts by Status</p>
              <div className="flex justify-between items-end">
                <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">{posts.length} Total</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {statusBars.map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                      <span>{bar.label}</span>
                      <span>{bar.count}</span>
                    </div>
                    <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                      <div className={`${bar.color} h-full rounded-full`} style={{ width: `${(bar.count / maxStatus) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 space-y-3">
              <p className="text-xs text-slate-400 font-medium">Platform Distribution</p>
              {platformBars.length === 0 ? (
                <p className="text-xs text-slate-400 pt-2">No platform data yet.</p>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {platformBars.map((bar) => (
                    <div key={bar.platform}>
                      <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                        <span>{bar.platform}</span>
                        <span>{bar.percent}%</span>
                      </div>
                      <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                        <div className={`${bar.color} h-full rounded-full`} style={{ width: `${bar.percent}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
