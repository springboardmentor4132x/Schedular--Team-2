import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Users, Megaphone, CalendarCheck, Send, FileText,
  BarChart2, PenSquare, ArrowLeft,
  MapPin, Globe, TrendingUp, Eye, Heart,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import { useClient } from '../../../context/ClientContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatCard from '../../../components/dashboard/StatCard'
import EmptyState from '../../../components/dashboard/EmptyState'
import { marketingService } from '../../../services/marketingService'

const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C', label: 'Instagram' },
  facebook:  { icon: FaFacebook,  color: '#1877F2', label: 'Facebook'  },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2', label: 'LinkedIn'  },
  x:         { icon: FaXTwitter,  color: '#374151', label: 'X'         },
  youtube:   { icon: FaYoutube,   color: '#FF0000', label: 'YouTube'   },
  pinterest: { icon: FaPinterest, color: '#E60023', label: 'Pinterest' },
}

const STATUS_STYLE = {
  scheduled: { label:'Scheduled', color:'#1E3A8A', bg:'rgba(30,58,138,.10)' },
  pending:   { label:'Pending',   color:'#F59E0B', bg:'rgba(245,158,11,.10)' },
  draft:     { label:'Draft',     color:'#64748B', bg:'rgba(100,116,139,.10)' },
  review:    { label:'In Review', color:'#4F46E5', bg:'rgba(79,70,229,.10)' },
}

const QUICK_NAV = [
  { label:'Content',    icon:PenSquare,    href:'/dashboard/mkt/content',    color:'#4F46E5', bg:'rgba(79,70,229,.10)'  },
  { label:'Scheduling', icon:CalendarCheck,href:'/dashboard/mkt/scheduling', color:'#1E3A8A', bg:'rgba(30,58,138,.10)'  },
  { label:'Calendar',   icon:CalendarCheck,href:'/dashboard/mkt/calendar',   color:'#F59E0B', bg:'rgba(245,158,11,.10)' },
  { label:'Campaigns',  icon:Megaphone,    href:'/dashboard/mkt/campaigns',  color:'#E1306C', bg:'rgba(225,48,108,.10)' },
  { label:'Analytics',  icon:BarChart2,    href:'/dashboard/mkt/analytics',  color:'#0A66C2', bg:'rgba(10,102,194,.10)' },
]

export default function ClientWorkspace() {
  const navigate = useNavigate()
  const { activeClient } = useClient()
  const [workspaceData, setWorkspaceData] = useState({ campaigns: [], posts: [] })
  useEffect(() => { if (activeClient) marketingService.workspace(activeClient.id).then(setWorkspaceData).catch(() => setWorkspaceData({ campaigns: [], posts: [] })) }, [activeClient])

  if (!activeClient) {
    return (
      <div className="p-6">
        <div className="card">
          <EmptyState
            icon={Users}
            title="No client selected"
            message="Go back to Clients and open a workspace."
            action={{ label:'View Clients', onClick:() => navigate('/dashboard/mkt/clients') }}
          />
        </div>
      </div>
    )
  }

  const c        = activeClient
  const campaigns = workspaceData.campaigns ?? []
  const allPosts = workspaceData.posts ?? []
  const posts = { drafts: allPosts.filter(p => p.status === 'draft'), scheduled: allPosts.filter(p => p.status === 'scheduled'), published: allPosts.filter(p => p.status === 'published') }
  const analytics = {}

  const activeCampaigns = campaigns.filter(x => x.status?.toLowerCase() === 'active')
  const recentScheduled = posts.scheduled.slice(0, 3)

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">

      {/* Back */}
      <button onClick={() => navigate('/dashboard/mkt/clients')}
        className="flex items-center gap-1.5 text-sm font-semibold mb-4 hover:underline"
        style={{ color:'var(--primary)' }}>
        <ArrowLeft size={15} /> Back to Clients
      </button>

      <PageHeader
        title={`${c.name} — Workspace`}
        subtitle={`${c.industry} · ${c.location}`}
      />

      {/* Client identity banner */}
      <motion.div
        initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
        className="rounded-[var(--r-xl)] p-5 mb-6 flex items-center gap-5 flex-wrap"
        style={{ background:`${c.logoColor}10`, border:`1px solid ${c.logoColor}25` }}
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          style={{ background:c.logoColor }}>
          {c.logo}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-extrabold mb-1" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>
            {c.name}
          </h2>
          <div className="flex items-center gap-4 flex-wrap text-xs" style={{ color:'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><MapPin size={11} />{c.location}</span>
            <span className="flex items-center gap-1"><Globe size={11} />{c.website}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: c.status==='active' ? 'rgba(34,197,94,.12)':'rgba(245,158,11,.12)', color: c.status==='active' ? '#22C55E':'#F59E0B' }}>
              {c.status.charAt(0).toUpperCase()+c.status.slice(1)}
            </span>
          </div>
        </div>
        {/* Connected platforms */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {c.connectedPlatforms.map(p => {
            const meta = PLATFORM_META[p]; const Icon = meta?.icon
            return Icon ? (
              <div key={p} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background:`${meta.color}15` }}>
                <Icon size={16} style={{ color:meta.color }} />
              </div>
            ) : null
          })}
        </div>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Campaigns"   value={campaigns.length}       icon={Megaphone}    iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)"  index={0} />
        <StatCard title="Scheduled"   value={posts.scheduled.length} icon={CalendarCheck}iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)"  index={1} />
        <StatCard title="Drafts"      value={posts.drafts.length}    icon={FileText}     iconColor="#F59E0B" iconBg="rgba(245,158,11,.12)" index={2} />
        <StatCard title="Published"   value={posts.published.length} icon={Send}         iconColor="#22C55E" iconBg="rgba(34,197,94,.12)"  index={3} />
        <StatCard title="Reach"       value={analytics.reach ? `${(analytics.reach/1000).toFixed(0)}K` : '—'} icon={Eye} iconColor="#E1306C" iconBg="rgba(225,48,108,.10)" index={4} />
      </div>

      {/* Quick navigation */}
      <motion.div
        initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        transition={{ delay:0.05 }}
        className="card p-5 mb-4"
      >
        <h2 className="text-sm font-bold mb-4" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>
          Quick Navigation
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_NAV.map(a => {
            const Icon = a.icon
            return (
              <button key={a.label} onClick={() => navigate(a.href)}
                className="flex flex-col items-center gap-2 p-4 rounded-[var(--r-md)] border transition-all hover:shadow-[var(--shadow-sm)] hover:-translate-y-0.5"
                style={{ background:'var(--bg-alt)', borderColor:'var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:a.bg }}>
                  <Icon size={18} style={{ color:a.color }} />
                </div>
                <span className="text-xs font-semibold" style={{ color:'var(--text-muted)' }}>{a.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Active campaigns */}
        <motion.div
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.1 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>
              Active Campaigns
            </h2>
            <button onClick={() => navigate('/dashboard/mkt/campaigns')}
              className="text-xs font-semibold hover:underline" style={{ color:'var(--primary)' }}>
              Manage →
            </button>
          </div>
          {activeCampaigns.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color:'var(--text-subtle)' }}>No active campaigns</p>
          ) : (
            <div className="flex flex-col gap-3">
              {activeCampaigns.map(cam => (
                <div key={cam.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate" style={{ color:'var(--text)' }}>{cam.name}</span>
                    <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color:'var(--primary)' }}>{cam.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background:'var(--bg-alt)' }}>
                    <div className="h-1.5 rounded-full" style={{ width:`${cam.progress}%`, background:'linear-gradient(90deg,#1E3A8A,#4F46E5)' }} />
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color:'var(--text-subtle)' }}>
                    {cam.objective} · ${cam.budget.toLocaleString()} budget
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Upcoming scheduled */}
        <motion.div
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.15 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>
              Upcoming Scheduled
            </h2>
            <button onClick={() => navigate('/dashboard/mkt/scheduling')}
              className="text-xs font-semibold hover:underline" style={{ color:'var(--primary)' }}>
              View all →
            </button>
          </div>
          {recentScheduled.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color:'var(--text-subtle)' }}>No scheduled posts</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentScheduled.map(p => {
                const meta = PLATFORM_META[p.platform]; const Icon = meta?.icon
                const s    = STATUS_STYLE[p.status] ?? STATUS_STYLE.scheduled
                const dt   = new Date(p.scheduledAt)
                return (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)]"
                    style={{ background:'var(--bg-alt)', border:'1px solid var(--border)' }}>
                    {Icon && <Icon size={13} style={{ color:meta.color, flexShrink:0 }} />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color:'var(--text)' }}>{p.title}</p>
                      <p className="text-[10px]" style={{ color:'var(--text-subtle)' }}>
                        {dt.toLocaleDateString('en-US',{month:'short',day:'numeric'})} · {dt.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background:s.bg, color:s.color }}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Engagement summary */}
        <motion.div
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.2 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>
              Engagement Summary
            </h2>
            <button onClick={() => navigate('/dashboard/analytics')}
              className="text-xs font-semibold hover:underline" style={{ color:'var(--primary)' }}>
              Full analytics →
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label:'Reach',       value: analytics.reach       ? `${(analytics.reach/1000).toFixed(0)}K`       : '—', icon:Eye,        color:'#1E3A8A' },
              { label:'Engagement',  value: analytics.engagement  ? `${(analytics.engagement/1000).toFixed(1)}K`  : '—', icon:Heart,      color:'#E1306C' },
              { label:'Impressions', value: analytics.impressions ? `${(analytics.impressions/1000).toFixed(0)}K` : '—', icon:TrendingUp, color:'#4F46E5' },
              { label:'Clicks',      value: analytics.clicks      ? analytics.clicks.toLocaleString()             : '—', icon:TrendingUp, color:'#22C55E' },
              { label:'Followers',   value: analytics.followers   ? `${(analytics.followers/1000).toFixed(1)}K`   : '—', icon:Users,      color:'#F59E0B' },
            ].map(m => {
              const Icon = m.icon
              return (
                <div key={m.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background:`${m.color}15` }}>
                      <Icon size={12} style={{ color:m.color }} />
                    </div>
                    <span className="text-xs" style={{ color:'var(--text-muted)' }}>{m.label}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color:'var(--text)' }}>{m.value}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
