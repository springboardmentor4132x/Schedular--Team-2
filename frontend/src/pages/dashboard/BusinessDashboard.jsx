import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  Link2, Megaphone, CalendarCheck, Send,
  CalendarDays, BarChart2, Users, TrendingUp,
  CheckCircle2, Clock, AlertCircle, FileText,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/dashboard/StatCard'
import ActivityFeed from '../../components/dashboard/ActivityFeed'
import PageHeader from '../../components/dashboard/PageHeader'
import {
  MOCK_CONNECTED_ACCOUNTS,
  MOCK_CAMPAIGNS,
  MOCK_SCHEDULED_POSTS,
  MOCK_PUBLISHED_POSTS,
  MOCK_ANALYTICS,
} from '../../services/mockData'

/* ── Derived counts from mock data ────────────────────────────── */
const connectedCount  = MOCK_CONNECTED_ACCOUNTS.filter(a => a.status === 'connected' || a.status === 'warning').length
const campaignCount   = MOCK_CAMPAIGNS.filter(c => c.status === 'active').length
const scheduledCount  = MOCK_SCHEDULED_POSTS.filter(p => p.status === 'scheduled').length
const publishedCount  = MOCK_PUBLISHED_POSTS.length

/* ── Quick actions ────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: 'Marketing Teams',    href: '/dashboard/marketing-teams',    color: '#1E3A8A', bg: 'rgba(30,58,138,.10)',   icon: Users },
  { label: 'Campaigns',          href: '/dashboard/campaigns',           color: '#4F46E5', bg: 'rgba(79,70,229,.10)',   icon: Megaphone },
  { label: 'Scheduled Posts',    href: '/dashboard/scheduled-posts',     color: '#22C55E', bg: 'rgba(34,197,94,.10)',   icon: CalendarCheck },
  { label: 'Connected Accounts', href: '/dashboard/connected-accounts',  color: '#F59E0B', bg: 'rgba(245,158,11,.10)',  icon: Link2 },
  { label: 'Analytics',          href: '/dashboard/analytics',           color: '#E1306C', bg: 'rgba(225,48,108,.10)',  icon: BarChart2 },
  { label: 'Reports',            href: '/dashboard/reports',             color: '#0A66C2', bg: 'rgba(10,102,194,.10)', icon: FileText },
]

/* ── Recent activity ──────────────────────────────────────────── */
const ACTIVITY = [
  { id:1, icon:CheckCircle2, iconColor:'#22C55E', iconBg:'rgba(34,197,94,.1)',   title:'Post published successfully',  description:'Instagram · Summer Sale Announcement',  time:'2m ago',  badge:'Published', badgeColor:'#22C55E' },
  { id:2, icon:Clock,        iconColor:'#1E3A8A', iconBg:'rgba(30,58,138,.1)',   title:'Post scheduled',               description:'LinkedIn · Product Launch Teaser',      time:'14m ago', badge:'Scheduled', badgeColor:'#1E3A8A' },
  { id:3, icon:AlertCircle,  iconColor:'#F59E0B', iconBg:'rgba(245,158,11,.1)',  title:'Campaign budget at 80%',       description:'Brand Awareness campaign',             time:'1h ago',  badge:'Warning',   badgeColor:'#F59E0B' },
  { id:4, icon:Users,        iconColor:'#4F46E5', iconBg:'rgba(79,70,229,.1)',   title:'Marketing team assigned',      description:'Digital Spark Agency · Summer Sale',   time:'2h ago',  badge:'Assigned',  badgeColor:'#4F46E5' },
  { id:5, icon:TrendingUp,   iconColor:'#E1306C', iconBg:'rgba(225,48,108,.1)', title:'Engagement spike detected',    description:'+34% above average this week',         time:'3h ago'  },
]

/* ── Upcoming scheduled posts (from mock) ─────────────────────── */
const UPCOMING = MOCK_SCHEDULED_POSTS.slice(0, 4)

const PLATFORM_ICONS = {
  instagram: { icon: FaInstagram, color: '#E1306C' },
  facebook:  { icon: FaFacebook,  color: '#1877F2' },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2' },
  x:         { icon: FaXTwitter,  color: '#374151' },
}

const STATUS_STYLE = {
  scheduled: { label: 'Scheduled', color: '#1E3A8A', bg: 'rgba(30,58,138,.10)' },
  pending:   { label: 'Pending',   color: '#F59E0B', bg: 'rgba(245,158,11,.10)' },
  published: { label: 'Published', color: '#22C55E', bg: 'rgba(34,197,94,.10)' },
}

const C = { primary: '#1E3A8A', secondary: '#4F46E5' }

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[var(--r-md)] px-3 py-2 text-xs shadow-[var(--shadow-md)]"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function BusinessDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">

      {/* ── Welcome banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-[var(--r-xl)] p-6 mb-6 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)' }}
      >
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">{greeting},</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {user?.name ?? 'Welcome back'} 👋
            </h2>
            <p className="text-white/70 text-sm">
              You have{' '}
              <span className="text-white font-semibold">{scheduledCount} posts</span> scheduled and{' '}
              <span className="text-white font-semibold">{campaignCount} campaigns</span> running.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate('/dashboard/marketing-teams')}
              className="flex items-center gap-1.5 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold transition-all hover:brightness-95"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)' }}
            >
              <Users size={14} /> Marketing Teams
            </button>
            <button
              onClick={() => navigate('/dashboard/campaigns')}
              className="flex items-center gap-1.5 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold transition-all hover:brightness-95"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)' }}
            >
              <Megaphone size={14} /> Campaigns
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── KPI cards — spec-correct ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Connected Accounts" value={connectedCount}
          icon={Link2} iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)"
          trend={0} trendLabel="platforms linked" index={0}
        />
        <StatCard
          title="Active Campaigns" value={campaignCount}
          icon={Megaphone} iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)"
          trend={0} trendLabel="running now" index={1}
        />
        <StatCard
          title="Scheduled Posts" value={scheduledCount}
          icon={CalendarCheck} iconColor="#22C55E" iconBg="rgba(34,197,94,.12)"
          trend={12} index={2}
        />
        <StatCard
          title="Published Posts" value={publishedCount}
          icon={Send} iconColor="#F59E0B" iconBg="rgba(245,158,11,.12)"
          trend={8} index={3}
        />
      </div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="card p-5 mb-4"
      >
        <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map(a => {
            const Icon = a.icon
            return (
              <button
                key={a.label}
                onClick={() => navigate(a.href)}
                className="flex flex-col items-center gap-2 p-4 rounded-[var(--r-md)] border transition-all hover:shadow-[var(--shadow-sm)] hover:-translate-y-0.5"
                style={{ background: 'var(--bg-alt)', borderColor: 'var(--border)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: a.bg }}>
                  <Icon size={18} style={{ color: a.color }} />
                </div>
                <span className="text-xs font-semibold text-center leading-tight" style={{ color: 'var(--text-muted)' }}>
                  {a.label}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Main grid: Chart + Upcoming posts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Weekly analytics chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
              Analytics Overview
            </h2>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              {[[C.primary,'Reach'],[C.secondary,'Engagement']].map(([c,n]) => (
                <span key={n} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} />{n}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MOCK_ANALYTICS.weekly} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="bizReachGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.primary}    stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.primary}    stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="bizEngGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.secondary}  stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.secondary}  stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day"  tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
              <YAxis               tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="reach"      name="Reach"      stroke={C.primary}   strokeWidth={2} fill="url(#bizReachGrad)" />
              <Area type="monotone" dataKey="engagement" name="Engagement" stroke={C.secondary} strokeWidth={2} fill="url(#bizEngGrad)"  />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 pt-3 border-t flex gap-4" style={{ borderColor: 'var(--border)' }}>
            {[
              { label: 'Total Reach', value: '61K' },
              { label: 'Engagement', value: '9.2K' },
              { label: 'Impressions', value: '89K' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-base font-extrabold" style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>{s.label}</p>
              </div>
            ))}
            <button
              onClick={() => navigate('/dashboard/analytics')}
              className="ml-auto text-xs font-semibold hover:underline self-end"
              style={{ color: 'var(--primary)' }}
            >
              Full analytics →
            </button>
          </div>
        </motion.div>

        {/* Platform reach bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
              Platform Split
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={MOCK_ANALYTICS.platformSplit.map(p => ({ name: p.name, value: p.value }))}
              layout="vertical"
              margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} unit="%" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={v => [`${v}%`, 'Share']} />
              <Bar dataKey="value" name="Share" fill="var(--primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Upcoming scheduled posts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
              Upcoming Scheduled Posts
            </h2>
            <button
              onClick={() => navigate('/dashboard/scheduled-posts')}
              className="text-xs font-semibold hover:underline"
              style={{ color: 'var(--primary)' }}
            >
              View all →
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {UPCOMING.map(post => {
              const meta  = PLATFORM_ICONS[post.platform]
              const Icon  = meta?.icon
              const s     = STATUS_STYLE[post.status] ?? STATUS_STYLE.scheduled
              const dt    = new Date(post.scheduledAt)
              const label = dt.toLocaleDateString('en-US', { month:'short', day:'numeric' }) +
                            ' · ' + dt.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })
              return (
                <div key={post.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-md)] transition-colors hover:bg-[var(--bg-alt)]"
                  style={{ border: '1px solid var(--border)' }}
                >
                  {Icon && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${meta.color}15` }}>
                      <Icon size={14} style={{ color: meta.color }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{post.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>{label}</p>
                  </div>
                  {post.campaign && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full hidden sm:block flex-shrink-0"
                      style={{ background: 'rgba(79,70,229,.10)', color: '#4F46E5' }}>
                      {post.campaign}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Campaign overview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
              Campaign Overview
            </h2>
            <button
              onClick={() => navigate('/dashboard/campaigns')}
              className="text-xs font-semibold hover:underline"
              style={{ color: 'var(--primary)' }}
            >
              View all →
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {MOCK_CAMPAIGNS.filter(c => c.status === 'active').map(c => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{c.name}</span>
                  <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color: 'var(--primary)' }}>
                    {c.progress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'var(--bg-alt)' }}>
                  <div className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${c.progress}%`, background: 'linear-gradient(90deg, #1E3A8A, #4F46E5)' }} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>Budget: ${c.budget.toLocaleString()}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,.10)', color: '#22C55E' }}>
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Activity feed ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <ActivityFeed items={ACTIVITY} title="Recent Activity" />
      </motion.div>
    </div>
  )
}
