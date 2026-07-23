import React, { useState, useEffect } from 'react'
import { CardSkeleton, TableSkeleton, ListSkeleton, WidgetSkeleton } from '../components/ui/Skeleton'
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
  TrendingUp,
  Share2,
  Clock,
  MessageSquare,
  Layers,
  ArrowUpRight
} from 'lucide-react'

const Instagram = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const Linkedin = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)

const Facebook = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

const Youtube = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
)

// ── Metric Card Component ──
function MetricCard({ icon: Icon, count, label, trend, trendPositive, badgeColor, badgeText }) {
  return (
    <div className="stat-card cursor-pointer transform hover:-translate-y-1 hover:border-indigo-500/50 dark:hover:border-indigo-450/40 hover:shadow-card-lg transition-all duration-300 ease-out group">
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
        <p className={`text-xs font-semibold mt-1.5 flex items-center gap-1 ${trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
          <span>{trendPositive ? '▲' : '▼'} {trend}</span>
          <span className="text-slate-400 dark:text-slate-500 font-normal">this week</span>
        </p>
      </div>
    </div>
  )
}

// ── Quick Action Card Component ──
function QuickActionCard({ icon: Icon, label, desc, bgAccent }) {
  return (
    <button
      type="button"
      className="flex flex-col items-start gap-2 p-5 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800
                 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 hover:shadow-card-lg hover:-translate-y-1 transition-all duration-300 text-left group focus:outline-none focus:ring-2 focus:ring-indigo-450"
    >
      <div className={`p-2.5 rounded-lg ${bgAccent} text-white transition-transform duration-350 group-hover:scale-105 shadow-sm`}>
        <Icon size={20} />
      </div>
      <div className="mt-2">
        <span className="text-sm font-bold text-slate-850 dark:text-slate-200 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
          {label}
          <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-0.5 group-hover:translate-y-0" />
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-450 mt-1 block leading-relaxed">{desc}</span>
      </div>
    </button>
  )
}

// ── Mock Data for Creator Dashboard ──
const creatorMetrics = [
  { icon: FileEdit, count: '12', label: 'Draft Posts', trend: '+4%', trendPositive: true, badgeColor: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300', badgeText: 'In Progress' },
  { icon: Clock, count: '8', label: 'Scheduled Posts', trend: '+2%', trendPositive: true, badgeColor: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300', badgeText: 'Ready' },
  { icon: CheckCircle, count: '142', label: 'Published Posts', trend: '+15%', trendPositive: true, badgeColor: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300', badgeText: 'Live' },
  { icon: AlertCircle, count: '3', label: 'Pending Reviews', trend: '-1%', trendPositive: false, badgeColor: 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300', badgeText: 'Needs Action' },
]

const quickActions = [
  { icon: PlusCircle, label: 'Create Post', desc: 'Compose a new post update', bgAccent: 'bg-indigo-600' },
  { icon: Upload, label: 'Upload Media', desc: 'Upload to content vault', bgAccent: 'bg-emerald-600' },
  { icon: FileEdit, label: 'Continue Draft', desc: 'Resume where you left off', bgAccent: 'bg-amber-500' },
  { icon: Calendar, label: 'Schedule Content', desc: 'Plan dates for social sharing', bgAccent: 'bg-sky-505 bg-sky-500' },
  { icon: Users, label: 'Join Campaign', desc: 'Collaborate with brands', bgAccent: 'bg-purple-500' },
  { icon: Folder, label: 'Content Library', desc: 'Manage your creative assets', bgAccent: 'bg-pink-500' },
]

const initialCampaigns = [
  { name: 'Nike Summer Launch', status: 'Active', due: 'July 30, 2026', progress: 75, color: 'bg-indigo-600' },
  { name: 'Adidas Sports Week', status: 'Reviewing', due: 'August 05, 2026', progress: 90, color: 'bg-amber-500' },
  { name: 'Apple Event Promotion', status: 'Planning', due: 'September 10, 2026', progress: 20, color: 'bg-rose-500' },
]

const initialDrafts = [
  { title: 'Top 5 Tech Productivity Hacks', platform: 'LinkedIn', campaign: 'None', status: 'Draft', edited: '2 hours ago', icon: Linkedin },
  { title: 'Nike Run Club Review Video', platform: 'Instagram', campaign: 'Nike Summer Launch', status: 'In Review', edited: '5 hours ago', icon: Instagram },
  { title: 'We built a SaaS in 24 hours!', platform: 'YouTube', campaign: 'None', status: 'Draft', edited: '1 day ago', icon: Youtube },
]

const upcomingPosts = [
  { title: 'Morning Workout Routine', platform: 'Instagram Reel', time: 'Today, 4:30 PM', campaign: 'Nike Summer Launch', icon: Instagram },
  { title: 'The Future of AI Coding', platform: 'LinkedIn Article', time: 'Tomorrow, 10:00 AM', campaign: 'None', icon: Linkedin },
  { title: 'OrbitSocial Features Thread', platform: 'Facebook Carousel', time: 'July 23, 2:00 PM', campaign: 'None', icon: Facebook },
  { title: 'How to edit like a pro', platform: 'YouTube Short', time: 'July 25, 9:00 AM', campaign: 'None', icon: Youtube },
]

const initialFeedback = [
  { id: 1, type: 'warning', title: 'Feedback on Nike Reel', time: '10 min ago', text: '"Please shorten the intro by 2 seconds and verify alignment of brand logo." - Sarah (Brand Manager)' },
  { id: 2, type: 'success', title: 'Campaign Approved', time: '2 hours ago', text: 'Adidas Sports Week campaign draft approved. Post is set to auto-publish on August 05.' }
]

const calendarHighlightedDays = [1, 5, 8, 14, 15, 20, 21, 23, 25]

export default function CreatorDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [drafts, setDrafts] = useState(initialDrafts)
  const [feedbackList, setFeedbackList] = useState(initialFeedback)
  const [campaigns, setCampaigns] = useState(initialCampaigns)

  const today = new Date()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const handleClearDrafts = () => {
    setDrafts([])
  }

  const handleRestoreDrafts = () => {
    setDrafts(initialDrafts)
  }

  const handleClearFeedback = () => {
    setFeedbackList([])
  }

  const handleRestoreFeedback = () => {
    setFeedbackList(initialFeedback)
  }

  const handleClearCampaigns = () => {
    setCampaigns([])
  }

  const handleRestoreCampaigns = () => {
    setCampaigns(initialCampaigns)
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="card animate-pulse space-y-3 bg-gradient-to-r from-indigo-50/20 to-purple-50/20">
          <div className="w-72 h-8 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="w-96 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        <div className="card animate-pulse space-y-4">
          <div className="w-48 h-6 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TableSkeleton />
          <TableSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* ── Welcome Section ── */}
      <section aria-label="Welcome section" className="card relative overflow-hidden bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-950/40 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 z-10 relative">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Welcome back, Creator 👋
            </h1>
            <p className="text-slate-650 dark:text-slate-400 mt-1 text-sm font-medium">
              Create, schedule and manage your content efficiently.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <div className="bg-white dark:bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700/60 shadow-sm">
              <span className="text-slate-450 mr-1.5 font-normal">Date:</span>
              {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="bg-white dark:bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700/60 shadow-sm">
              <span className="text-slate-450 mr-1.5 font-normal">Next Post:</span>
              <span className="text-indigo-600 dark:text-indigo-400">4:30 PM (Instagram)</span>
            </div>
            <div className="bg-white dark:bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-center gap-1.5">
              <span className="text-slate-450 font-normal">Productivity Score:</span>
              <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                94% Very Good
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Metric Cards ── */}
      <section aria-label="Creator metric cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {creatorMetrics.map((metric, i) => (
          <MetricCard key={i} {...metric} />
        ))}
      </section>

      {/* ── Quick Action Panel ── */}
      <section aria-label="Quick action panel" className="card border border-indigo-100/50 dark:border-indigo-950/40 shadow-card">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <Sparkles className="text-indigo-500" size={18} />
          Creator Command Center
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, i) => (
            <QuickActionCard key={i} {...action} />
          ))}
        </div>
      </section>

      {/* ── Today's Workspace ── */}
      <section aria-label="Today's Workspace" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Tasks */}
        <div className="card space-y-4 shadow-card">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
            <CheckCircle className="text-indigo-500" size={18} />
            Today's Workspace Tasks
          </h2>
          
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl flex items-start gap-3 border border-slate-100 dark:border-slate-700/60 hover:border-indigo-100 dark:hover:border-indigo-950/80 transition-all duration-300">
              <input type="checkbox" className="mt-1.5 text-indigo-650 rounded focus:ring-indigo-400 w-4 h-4 cursor-pointer" defaultChecked={false} />
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Record B-Roll for Nike Campaign</p>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5 font-medium">Deadline: Today at 5:00 PM · Priority: High</p>
              </div>
            </div>
            
            <div className="p-3.5 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl flex items-start gap-3 border border-slate-100 dark:border-slate-700/60 opacity-80 hover:opacity-100 transition-all duration-300">
              <input type="checkbox" className="mt-1.5 text-indigo-650 rounded focus:ring-indigo-400 w-4 h-4 cursor-pointer" defaultChecked={true} />
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-through opacity-60">Review Adidas Sports Week brief</p>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5 line-through opacity-65">Completed 1 hour ago</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl flex items-start gap-3 border border-slate-100 dark:border-slate-700/60 hover:border-indigo-100 dark:hover:border-indigo-950/80 transition-all duration-300">
              <input type="checkbox" className="mt-1.5 text-indigo-650 rounded focus:ring-indigo-400 w-4 h-4 cursor-pointer" defaultChecked={false} />
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Draft outline for YouTube short</p>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5 font-medium">Deadline: Tomorrow · Priority: Medium</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Feedback with Empty State toggle */}
        <div className="card space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="text-indigo-500" size={18} />
              Reviewer Feedback & Activity
            </h2>
            {feedbackList.length > 0 ? (
              <button onClick={handleClearFeedback} className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline">
                Clear Feedback
              </button>
            ) : (
              <button onClick={handleRestoreFeedback} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Restore
              </button>
            )}
          </div>
          
          {feedbackList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 h-48 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
              <span className="text-2xl mb-1.5">💬</span>
              <p className="font-bold text-sm">No notifications or feedback</p>
              <p className="text-xs mt-1">Reviewers have not posted new comments on your drafts.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {feedbackList.map((item) => (
                <div 
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all duration-300 ${
                    item.type === 'warning' 
                      ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40' 
                      : 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold ${item.type === 'warning' ? 'text-amber-700 dark:text-amber-405' : 'text-emerald-700 dark:text-emerald-405'}`}>
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Brand Campaigns ── */}
      <section aria-label="Brand campaigns" className="card space-y-4 shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="text-indigo-500" size={18} />
            Brand Campaigns
          </h2>
          {campaigns.length > 0 ? (
            <button onClick={handleClearCampaigns} className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline">
              Clear Campaigns
            </button>
          ) : (
            <button onClick={handleRestoreCampaigns} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Restore
            </button>
          )}
        </div>
        
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 h-44 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
            <span className="text-2xl mb-1.5">🚀</span>
            <p className="font-bold text-sm">No campaigns yet</p>
            <p className="text-xs mt-1">You are not currently enrolled in any brand campaigns.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.map((camp, i) => (
              <div key={i} className="p-5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/20 hover:border-indigo-300 dark:hover:border-indigo-900 transition-all duration-300 space-y-3.5 shadow-sm">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-sm text-slate-850 dark:text-slate-100 line-clamp-1">{camp.name}</h3>
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap ${
                    camp.status === 'Active' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-805 dark:text-indigo-300' :
                    camp.status === 'Reviewing' ? 'bg-amber-100 dark:bg-amber-950 text-amber-805 dark:text-amber-300' :
                    'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>{camp.status}</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Due Date: {camp.due}</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Progress</span>
                    <span>{camp.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${camp.color}`} style={{ width: `${camp.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Recent Drafts & Upcoming Schedule ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-label="Drafts and scheduling">
        {/* Recent Drafts Table */}
        <div className="card lg:col-span-2 space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileEdit className="text-indigo-500" size={18} />
              Recent Creative Drafts
            </h2>
            {drafts.length > 0 ? (
              <button onClick={handleClearDrafts} className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline">
                Clear Drafts
              </button>
            ) : (
              <button onClick={handleRestoreDrafts} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Restore
              </button>
            )}
          </div>
          
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
                  {drafts.map((d, i) => {
                    const PlatformIcon = d.icon
                    return (
                      <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{d.title}</td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-350 font-semibold">
                            <PlatformIcon size={14} className="text-indigo-500" />
                            {d.platform}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 font-medium">{d.campaign}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            d.status === 'Draft' ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                            'bg-amber-100 dark:bg-amber-950 text-amber-805 dark:text-amber-300'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400 font-medium text-right">{d.edited}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Schedule */}
        <div className="card space-y-4 shadow-card">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
            <Clock className="text-indigo-500" size={18} />
            Upcoming Publishing Schedule
          </h2>
          
          <div className="space-y-4">
            {upcomingPosts.map((up, i) => {
              const PlatformIcon = up.icon
              return (
                <div key={i} className="flex gap-3 items-start border-l-2 border-indigo-500 pl-3">
                  <div className="p-1 bg-indigo-50 dark:bg-indigo-950/60 rounded text-indigo-600 dark:text-indigo-400 mt-0.5">
                    <PlatformIcon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-805 dark:text-slate-200 truncate">{up.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5 font-medium">{up.time} · {up.platform}</p>
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
        </div>
      </section>

      {/* ── Mini Calendar Widget & Analytics Snapshots ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-label="Calendar and analytics snapshot">
        {/* Mini Calendar Widget */}
        <div className="card space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="text-indigo-500" size={18} />
              Publishing Calendar
            </h2>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              July 2026
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
              <div key={i} className="text-slate-400 font-bold py-1 uppercase text-[10px]">{day}</div>
            ))}
            
            {Array.from({ length: 31 }, (_, i) => {
              const dayNum = i + 1
              const isToday = dayNum === 20
              const hasPost = calendarHighlightedDays.includes(dayNum)
              return (
                <div 
                  key={i} 
                  className={`py-1.5 rounded-lg flex flex-col items-center justify-center relative cursor-pointer font-semibold ${
                    isToday ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-500/30' : 
                    hasPost ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-750 dark:text-indigo-400' :
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

        {/* Analytics Snapshot Widgets */}
        <div className="card lg:col-span-2 space-y-4 shadow-card">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
            <Share2 className="text-indigo-500" size={18} />
            Creator Performance Metrics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Weekly Content Created */}
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 space-y-2">
              <p className="text-xs text-slate-400 font-medium">Weekly Content Created</p>
              <div className="flex justify-between items-end">
                <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">14 Posts</span>
                <span className="text-xs text-emerald-500 font-bold">▲ +12%</span>
              </div>
              <div className="flex gap-1 h-8 items-end pt-2">
                {[4, 6, 8, 5, 9, 7, 10].map((val, i) => (
                  <div key={i} className="flex-1 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-t overflow-hidden">
                    <div className="bg-indigo-650 w-full rounded-t" style={{ height: `${val * 10}%` }}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Engagement Trend */}
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 space-y-2">
              <p className="text-xs text-slate-400 font-medium">Engagement Rate</p>
              <div className="flex justify-between items-end">
                <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">6.8% Average</span>
                <span className="text-xs text-emerald-500 font-bold">▲ +0.5%</span>
              </div>
              <div className="flex gap-1 h-8 items-end pt-2">
                {[6.2, 6.4, 6.3, 6.7, 6.5, 6.8, 6.9].map((val, i) => (
                  <div key={i} className="flex-1 bg-purple-500/20 dark:bg-purple-500/10 rounded-t overflow-hidden">
                    <div className="bg-purple-650 w-full rounded-t" style={{ height: `${(val - 5) * 45}%` }}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Publishing Frequency */}
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 space-y-3">
              <p className="text-xs text-slate-400 font-medium">Platform Distribution</p>
              <div className="space-y-1.5 pt-1">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                    <span>Instagram</span>
                    <span>45%</span>
                  </div>
                  <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                    <div className="bg-pink-500 h-full rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                    <span>LinkedIn</span>
                    <span>35%</span>
                  </div>
                  <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
