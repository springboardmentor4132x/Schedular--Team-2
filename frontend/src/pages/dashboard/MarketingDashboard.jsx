import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Users, Megaphone, FileText, CalendarCheck, Send,
  PenSquare, BarChart2, Bell, Link2, ScrollText,
  CheckCircle2, Clock, AlertCircle, TrendingUp,
  ClipboardList,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useClient } from '../../context/ClientContext'
import StatCard from '../../components/dashboard/StatCard'
import ActivityFeed from '../../components/dashboard/ActivityFeed'
import PageHeader from '../../components/dashboard/PageHeader'
import {
  MOCK_CLIENTS,
  MOCK_CLIENT_CAMPAIGNS,
  MOCK_CLIENT_POSTS,
} from '../../services/mockData'

function readReviewRequests() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('orbit-client-requests') ?? '[]')
  } catch {
    return []
  }
}

function readApprovedClients() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('orbit-approved-clients') ?? '[]')
  } catch {
    return []
  }
}

/* ── Derived KPIs from mock data ─────────────────────────────────── */
const assignedClients  = MOCK_CLIENTS.length
const activeCampaigns  = Object.values(MOCK_CLIENT_CAMPAIGNS).flat().filter(c => c.status === 'active').length
const draftPosts       = Object.values(MOCK_CLIENT_POSTS).reduce((s, p) => s + p.drafts.length, 0)
const scheduledPosts   = Object.values(MOCK_CLIENT_POSTS).reduce((s, p) => s + p.scheduled.length, 0)
const publishedPosts   = Object.values(MOCK_CLIENT_POSTS).reduce((s, p) => s + p.published.length, 0)

/* ── Quick actions ───────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: 'Client Requests',     href: '/dashboard/mkt/requests',   color: '#1E3A8A', bg: 'rgba(30,58,138,.10)',  icon: ClipboardList },
  { label: 'Clients',             href: '/dashboard/mkt/clients',    color: '#4F46E5', bg: 'rgba(79,70,229,.10)',  icon: Users        },
  { label: 'Content',             href: '/dashboard/mkt/content',    color: '#22C55E', bg: 'rgba(34,197,94,.10)',  icon: PenSquare    },
  { label: 'Campaigns',           href: '/dashboard/mkt/campaigns',  color: '#22C55E', bg: 'rgba(34,197,94,.10)',  icon: Megaphone    },
  { label: 'Analytics',           href: '/dashboard/mkt/analytics',  color: '#E1306C', bg: 'rgba(225,48,108,.10)', icon: BarChart2    },
  { label: 'Reports',             href: '/dashboard/mkt/reports',    color: '#0A66C2', bg: 'rgba(10,102,194,.10)', icon: ScrollText   },
]

/* ── Recent activity ─────────────────────────────────────────────── */
const ACTIVITY = [
  { id:1, icon:CheckCircle2, iconColor:'#22C55E', iconBg:'rgba(34,197,94,.1)',   title:'Post published — OrbitSocial Inc.', description:'Instagram · Summer Sale Announcement',      time:'2m ago',  badge:'Published', badgeColor:'#22C55E' },
  { id:2, icon:Clock,        iconColor:'#1E3A8A', iconBg:'rgba(30,58,138,.1)',   title:'Post scheduled — BlueWave Retail',  description:'Facebook · Summer Collection Drop',         time:'18m ago', badge:'Scheduled', badgeColor:'#1E3A8A' },
  { id:3, icon:AlertCircle,  iconColor:'#F59E0B', iconBg:'rgba(245,158,11,.1)',  title:'Draft submitted for review',        description:'OrbitSocial · Customer Success Story',      time:'1h ago',  badge:'Review',    badgeColor:'#F59E0B' },
  { id:4, icon:TrendingUp,   iconColor:'#4F46E5', iconBg:'rgba(79,70,229,.1)',   title:'Campaign milestone reached',        description:'Summer Sale 2025 · 68% progress',           time:'2h ago'                                          },
  { id:5, icon:Users,        iconColor:'#E1306C', iconBg:'rgba(225,48,108,.1)',  title:'New client workspace opened',       description:'Stellar SaaS · Product Hunt Launch',        time:'3h ago'                                          },
]

export default function MarketingDashboard() {
  const { user }    = useAuth()
  const { selectClient } = useClient()
  const navigate    = useNavigate()
  const hour        = new Date().getHours()
  const greeting    = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const reviewRequests = readReviewRequests()
  const approvedClients = readApprovedClients()

  const pendingRequests = reviewRequests.filter(item => item.status === 'pending').length
  const rejectedRequests = reviewRequests.filter(item => item.status === 'rejected').length

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">

      {/* ── Welcome banner ── */}
      <motion.div
        initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.35 }}
        className="rounded-[var(--r-xl)] p-6 mb-6 overflow-hidden relative"
        style={{ background:'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)' }}
      >
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">{greeting},</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2"
              style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
              {user?.name ?? 'Welcome back'} 👋
            </h2>
            <p className="text-white/70 text-sm">
              Managing <span className="text-white font-semibold">{assignedClients} clients</span> ·{' '}
              <span className="text-white font-semibold">{activeCampaigns} active campaigns</span> ·{' '}
              <span className="text-white font-semibold">{scheduledPosts} posts scheduled</span>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => navigate('/dashboard/mkt/clients')}
              className="flex items-center gap-1.5 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold transition-all hover:brightness-95"
              style={{ background:'rgba(255,255,255,0.15)', color:'#fff' }}>
              <Users size={14} /> View Clients
            </button>
            <button onClick={() => navigate('/dashboard/mkt/content')}
              className="flex items-center gap-1.5 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold transition-all hover:brightness-95"
              style={{ background:'rgba(255,255,255,0.15)', color:'#fff' }}>
              <PenSquare size={14} /> Create Content
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── KPI cards — spec-correct ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Pending Client Requests" value={pendingRequests} icon={ClipboardList} iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)" index={0} />
        <StatCard title="Approved Clients" value={approvedClients.length} icon={Users} iconColor="#22C55E" iconBg="rgba(34,197,94,.12)" index={1} />
        <StatCard title="Rejected Requests" value={rejectedRequests} icon={AlertCircle} iconColor="#EF4444" iconBg="rgba(239,68,68,.12)" index={2} />
        <StatCard title="Active Campaigns" value={activeCampaigns} icon={Megaphone} iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)" index={3} />
        <StatCard title="Published Posts" value={publishedPosts} icon={Send} iconColor="#E1306C" iconBg="rgba(225,48,108,.10)" trend={8} index={4} />
      </div>

      {/* ── Quick actions ── */}
      <motion.div
        initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.3, delay:0.05 }}
        className="card p-5 mb-4"
      >
        <h2 className="text-sm font-bold mb-4" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map(a => {
            const Icon = a.icon
            return (
              <button key={a.label} onClick={() => navigate(a.href)}
                className="flex flex-col items-center gap-2 p-4 rounded-[var(--r-md)] border transition-all hover:shadow-[var(--shadow-sm)] hover:-translate-y-0.5"
                style={{ background:'var(--bg-alt)', borderColor:'var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:a.bg }}>
                  <Icon size={18} style={{ color:a.color }} />
                </div>
                <span className="text-xs font-semibold text-center leading-tight" style={{ color:'var(--text-muted)' }}>{a.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Client overview + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Client cards */}
        <motion.div
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.3, delay:0.1 }}
          className="card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>
              Assigned Clients
            </h2>
            <button onClick={() => navigate('/dashboard/mkt/clients')}
              className="text-xs font-semibold hover:underline" style={{ color:'var(--primary)' }}>
              View all →
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {MOCK_CLIENTS.slice(0,4).map(c => (
              <div key={c.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-md)] hover:bg-[var(--bg-alt)] transition-colors cursor-pointer"
                style={{ border:'1px solid var(--border)' }}
                onClick={() => { selectClient(c); navigate('/dashboard/mkt/workspace') }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background:c.logoColor }}>
                  {c.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color:'var(--text)' }}>{c.name}</p>
                  <p className="text-xs" style={{ color:'var(--text-subtle)' }}>{c.industry} · {c.lastActivity}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background:`${c.logoColor}15`, color:c.logoColor }}>
                    {c.activeCampaigns} campaigns
                  </span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0`}
                    style={{ background: c.status === 'active' ? '#22C55E' : '#F59E0B' }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity */}
        <motion.div
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.3, delay:0.15 }}
        >
          <ActivityFeed items={ACTIVITY} title="Recent Activity" />
        </motion.div>
      </div>
    </div>
  )
}
