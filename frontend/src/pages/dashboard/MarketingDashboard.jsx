import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Users, Megaphone, CalendarCheck, Send,
  BarChart2, Bell, ScrollText,
  CheckCircle2, AlertCircle, TrendingUp,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useClient } from '../../context/ClientContext'
import StatCard from '../../components/dashboard/StatCard'
import PageHeader from '../../components/dashboard/PageHeader'
import {
  MOCK_CLIENTS,
  MOCK_CLIENT_CAMPAIGNS,
  MOCK_CLIENT_POSTS,
} from '../../services/mockData'

/* ── Derived KPIs ──────────────────────────────────────────────── */
const assignedClients = MOCK_CLIENTS.length
const activeCampaigns = Object.values(MOCK_CLIENT_CAMPAIGNS).flat().filter(c => c.status === 'active').length
const scheduledPosts  = Object.values(MOCK_CLIENT_POSTS).reduce((s, p) => s + p.scheduled.length, 0)
const pendingPosts    = Object.values(MOCK_CLIENT_POSTS).reduce((s, p) => s + p.drafts.filter(d => d.status === 'review').length, 0)
const publishedPosts  = Object.values(MOCK_CLIENT_POSTS).reduce((s, p) => s + p.published.length, 0)

/* ── Recent notifications ────────────────────────────────────────── */
const RECENT_NOTIFS = [
  { id:1, type:'success', icon:CheckCircle2, iconColor:'#22C55E', iconBg:'rgba(34,197,94,.1)',  title:'Campaign Started',      message:'Summer Sale 2025 is now live.',            time:'5m ago'  },
  { id:2, type:'success', icon:CheckCircle2, iconColor:'#22C55E', iconBg:'rgba(34,197,94,.1)',  title:'Publishing Successful', message:'Instagram post published.',                time:'18m ago' },
  { id:3, type:'error',   icon:AlertCircle,  iconColor:'#EF4444', iconBg:'rgba(239,68,68,.1)',  title:'Publishing Failed',     message:'Facebook post failed. Retry needed.',       time:'1h ago'  },
  { id:4, type:'info',    icon:TrendingUp,   iconColor:'#1E3A8A', iconBg:'rgba(30,58,138,.1)',  title:'Campaign Reminder',     message:'Product Launch Q3 ends in 5 days.',        time:'2h ago'  },
]

/* ── Quick actions — spec-correct ────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: 'Client Workspace', href: '/dashboard/mkt/workspace',  color: '#1E3A8A', bg: 'rgba(30,58,138,.10)',  icon: Users      },
  { label: 'Campaigns',        href: '/dashboard/mkt/campaigns',  color: '#4F46E5', bg: 'rgba(79,70,229,.10)',  icon: Megaphone  },
  { label: 'Scheduling',       href: '/dashboard/mkt/scheduling', color: '#22C55E', bg: 'rgba(34,197,94,.10)',  icon: CalendarCheck },
  { label: 'Publishing Queue', href: '/dashboard/mkt/queue',      color: '#F59E0B', bg: 'rgba(245,158,11,.10)', icon: Send       },
  { label: 'Analytics',        href: '/dashboard/analytics',      color: '#E1306C', bg: 'rgba(225,48,108,.10)', icon: BarChart2  },
  { label: 'Reports',          href: '/dashboard/mkt/reports',    color: '#0A66C2', bg: 'rgba(10,102,194,.10)', icon: ScrollText },
]

export default function MarketingDashboard() {
  const { user }         = useAuth()
  const { selectClient } = useClient()
  const navigate         = useNavigate()
  const hour             = new Date().getHours()
  const greeting         = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

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
            <button onClick={() => navigate('/dashboard/mkt/workspace')}
              className="flex items-center gap-1.5 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold transition-all hover:brightness-95"
              style={{ background:'rgba(255,255,255,0.15)', color:'#fff' }}>
              <Users size={14} /> Client Workspace
            </button>
            <button onClick={() => navigate('/dashboard/mkt/campaigns')}
              className="flex items-center gap-1.5 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold transition-all hover:brightness-95"
              style={{ background:'rgba(255,255,255,0.15)', color:'#fff' }}>
              <Megaphone size={14} /> Campaigns
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── KPI cards — spec-correct ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Assigned Clients"  value={assignedClients}  icon={Users}         iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)"  index={0} />
        <StatCard title="Active Campaigns"  value={activeCampaigns}  icon={Megaphone}     iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)"  index={1} />
        <StatCard title="Scheduled Posts"   value={scheduledPosts}   icon={CalendarCheck} iconColor="#22C55E" iconBg="rgba(34,197,94,.12)"  trend={5} index={2} />
        <StatCard title="Pending Posts"     value={pendingPosts}     icon={Bell}          iconColor="#F59E0B" iconBg="rgba(245,158,11,.12)" index={3} />
        <StatCard title="Published Posts"   value={publishedPosts}   icon={Send}          iconColor="#E1306C" iconBg="rgba(225,48,108,.10)" trend={8} index={4} />
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

      {/* ── Client overview + Recent Notifications ── */}
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

        {/* Recent Notifications */}
        <motion.div
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.3, delay:0.15 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>
              Recent Notifications
            </h2>
            <button onClick={() => navigate('/dashboard/notifications')}
              className="text-xs font-semibold hover:underline" style={{ color:'var(--primary)' }}>
              View all →
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {RECENT_NOTIFS.map(n => {
              const Icon = n.icon
              return (
                <div key={n.id} className="flex items-start gap-3 p-2.5 rounded-[var(--r-md)]"
                  style={{ background:'var(--bg-alt)', border:'1px solid var(--border)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background:n.iconBg }}>
                    <Icon size={13} style={{ color:n.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color:'var(--text)' }}>{n.title}</p>
                    <p className="text-[10px] mt-0.5 leading-relaxed line-clamp-2" style={{ color:'var(--text-muted)' }}>{n.message}</p>
                    <p className="text-[10px] mt-0.5" style={{ color:'var(--text-subtle)' }}>{n.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
