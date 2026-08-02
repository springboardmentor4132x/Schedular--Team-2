import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Users, Megaphone, FileText, CalendarCheck, Send,
  PenSquare, BarChart2, ScrollText,
  CheckCircle2, Clock,
  ClipboardList, Handshake,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useClient } from '../../context/ClientContext'
import StatCard from '../../components/dashboard/StatCard'
import ActivityFeed from '../../components/dashboard/ActivityFeed'
import { marketingService } from '../../services/marketingService'

/* ── Quick actions ───────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: 'Connection Requests', href: '/dashboard/mkt/connections', color: '#7C3AED', bg: 'rgba(124,58,237,.10)', icon: Handshake    },
  { label: 'Client Requests',     href: '/dashboard/mkt/requests',   color: '#1E3A8A', bg: 'rgba(30,58,138,.10)',  icon: ClipboardList },
  { label: 'Clients',             href: '/dashboard/mkt/clients',    color: '#4F46E5', bg: 'rgba(79,70,229,.10)',  icon: Users        },
  { label: 'Content',             href: '/dashboard/mkt/content',    color: '#22C55E', bg: 'rgba(34,197,94,.10)',  icon: PenSquare    },
  { label: 'Campaigns',           href: '/dashboard/mkt/campaigns',  color: '#22C55E', bg: 'rgba(34,197,94,.10)',  icon: Megaphone    },
  { label: 'Analytics',           href: '/dashboard/mkt/analytics',  color: '#E1306C', bg: 'rgba(225,48,108,.10)', icon: BarChart2    },
  { label: 'Reports',             href: '/dashboard/mkt/reports',    color: '#0A66C2', bg: 'rgba(10,102,194,.10)', icon: ScrollText   },
]

/* ── Recent activity ─────────────────────────────────────────────── */
export default function MarketingDashboard() {
  const { user }    = useAuth()
  const { selectClient } = useClient()
  const navigate    = useNavigate()
  const hour        = new Date().getHours()
  const greeting    = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const [data, setData] = useState({ clients: [], stats: {} })
  useEffect(() => { marketingService.dashboard().then(setData).catch(() => setData({ clients: [], stats: {} })) }, [])
  const stats = data.stats || {}
  const activity = (data.activity || []).map(post => ({ id:post.id, icon:post.status === 'published' ? CheckCircle2 : Clock, iconColor:post.status === 'published' ? '#22C55E' : '#1E3A8A', iconBg:'rgba(30,58,138,.1)', title:`${post.status.replace('_', ' ')} — ${post.title}`, description:post.platform, time:post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently', badge:post.status, badgeColor:post.status === 'published' ? '#22C55E' : '#1E3A8A' }))

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
              Managing <span className="text-white font-semibold">{stats.assignedClients ?? 0} clients</span> ·{' '}
              <span className="text-white font-semibold">{stats.activeCampaigns ?? 0} active campaigns</span> ·{' '}
              <span className="text-white font-semibold">{stats.scheduledPosts ?? 0} posts scheduled</span>
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
        <StatCard title="Assigned Clients" value={stats.assignedClients ?? 0} icon={Users} iconColor="#22C55E" iconBg="rgba(34,197,94,.12)" index={0} />
        <StatCard title="Draft Posts" value={stats.draftPosts ?? 0} icon={FileText} iconColor="#F59E0B" iconBg="rgba(245,158,11,.12)" index={1} />
        <StatCard title="Scheduled Posts" value={stats.scheduledPosts ?? 0} icon={CalendarCheck} iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)" index={2} />
        <StatCard title="Active Campaigns" value={stats.activeCampaigns ?? 0} icon={Megaphone} iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)" index={3} />
        <StatCard title="Published Posts" value={stats.publishedPosts ?? 0} icon={Send} iconColor="#E1306C" iconBg="rgba(225,48,108,.10)" index={4} />
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
            {data.clients.slice(0,4).map(c => (
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
          <ActivityFeed items={activity} title="Recent Activity" />
        </motion.div>
      </div>
    </div>
  )
}
