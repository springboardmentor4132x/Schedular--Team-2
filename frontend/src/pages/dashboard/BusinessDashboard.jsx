import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  CalendarCheck, Send, FileText, Megaphone,
  PenSquare, CalendarDays, BarChart2, Plus,
  CheckCircle2, Clock, AlertCircle, TrendingUp, List,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/dashboard/StatCard'
import ActivityFeed from '../../components/dashboard/ActivityFeed'
import QuickActions from '../../components/dashboard/QuickActions'
import PageHeader from '../../components/dashboard/PageHeader'

// ── Mock data ──────────────────────────────────────────────────────
const weeklyData = [
  { day: 'Mon', reach: 1200, engagement: 340 },
  { day: 'Tue', reach: 1900, engagement: 520 },
  { day: 'Wed', reach: 1500, engagement: 410 },
  { day: 'Thu', reach: 2400, engagement: 670 },
  { day: 'Fri', reach: 2100, engagement: 590 },
  { day: 'Sat', reach: 1800, engagement: 480 },
  { day: 'Sun', reach: 2800, engagement: 760 },
]

const platformData = [
  { name: 'Instagram', posts: 24, reach: 8400 },
  { name: 'Facebook',  posts: 18, reach: 5200 },
  { name: 'LinkedIn',  posts: 12, reach: 3100 },
  { name: 'X',         posts: 31, reach: 6700 },
]

const upcomingPosts = [
  { id: 1, title: 'Summer Sale Announcement',   platform: 'Instagram', time: 'Today, 2:00 PM',   status: 'scheduled' },
  { id: 2, title: 'Product Launch Teaser',       platform: 'LinkedIn',  time: 'Today, 5:30 PM',   status: 'scheduled' },
  { id: 3, title: 'Customer Spotlight Story',    platform: 'Facebook',  time: 'Tomorrow, 9:00 AM',status: 'draft'     },
  { id: 4, title: 'Weekly Tips Carousel',        platform: 'X',         time: 'Tomorrow, 11:00 AM',status:'scheduled' },
]

const campaigns = [
  { id: 1, name: 'Summer Sale 2025',  budget: '$2,400', status: 'active', progress: 68, color: '#22C55E' },
  { id: 2, name: 'Product Launch Q3', budget: '$5,000', status: 'active', progress: 34, color: '#1E3A8A' },
  { id: 3, name: 'Brand Awareness',   budget: '$1,200', status: 'paused', progress: 81, color: '#F59E0B' },
]

const recentActivity = [
  { id: 1, icon: CheckCircle2, iconColor: '#22C55E', iconBg: 'rgba(34,197,94,.1)',   title: 'Post published successfully', description: 'Instagram · Summer Sale Announcement', time: '2m ago',  badge: 'Published', badgeColor: '#22C55E' },
  { id: 2, icon: Clock,        iconColor: '#1E3A8A', iconBg: 'rgba(30,58,138,.1)',   title: 'Post scheduled',              description: 'LinkedIn · Product Launch Teaser',    time: '14m ago', badge: 'Scheduled', badgeColor: '#1E3A8A' },
  { id: 3, icon: AlertCircle,  iconColor: '#F59E0B', iconBg: 'rgba(245,158,11,.1)',  title: 'Campaign budget at 80%',      description: 'Brand Awareness campaign',           time: '1h ago',  badge: 'Warning',   badgeColor: '#F59E0B' },
  { id: 4, icon: FileText,     iconColor: '#64748B', iconBg: 'rgba(100,116,139,.1)', title: 'Draft saved',                 description: 'Customer Spotlight Story',           time: '2h ago',  badge: 'Draft',     badgeColor: '#64748B' },
  { id: 5, icon: TrendingUp,   iconColor: '#4F46E5', iconBg: 'rgba(79,70,229,.1)',   title: 'Engagement spike detected',   description: '+34% above average this week',       time: '3h ago'                                          },
]

const quickActions = [
  { label: 'Create Post',   icon: PenSquare,    href: '/dashboard/create-post', color: '#1E3A8A' },
  { label: 'Schedule',      icon: CalendarDays, href: '/dashboard/calendar',    color: '#4F46E5' },
  { label: 'Analytics',     icon: BarChart2,    href: '/dashboard/analytics',   color: '#22C55E' },
  { label: 'View Queue',    icon: List,         href: '/dashboard/queue',       color: '#F59E0B' },
]

const platformIcons = {
  Instagram: FaInstagram,
  Facebook:  FaFacebook,
  LinkedIn:  FaLinkedin,
  X:         FaXTwitter,
}

const statusStyle = {
  scheduled: { label: 'Scheduled', color: '#1E3A8A', bg: 'rgba(30,58,138,.10)' },
  draft:     { label: 'Draft',     color: '#64748B', bg: 'rgba(100,116,139,.10)' },
  published: { label: 'Published', color: '#22C55E', bg: 'rgba(34,197,94,.10)' },
}

const CHART_COLORS = {
  reach:      '#1E3A8A',
  engagement: '#4F46E5',
}

// ── Custom Tooltip ─────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[var(--r-md)] px-3 py-2 text-xs shadow-[var(--shadow-md)]"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────
export default function BusinessDashboard() {
  const { user } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">

      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-[var(--r-xl)] p-6 mb-6 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)' }}
      >
        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">{greeting},</p>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-white mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {user?.name ?? 'Welcome back'} 👋
          </h2>
          <p className="text-white/70 text-sm">
            You have <span className="text-white font-semibold">8 posts</span> scheduled today and{' '}
            <span className="text-white font-semibold">3 campaigns</span> running.
          </p>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Scheduled Posts"  value="24"  icon={CalendarCheck} iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)"  trend={12}  index={0} />
        <StatCard title="Published Posts"  value="187" icon={Send}          iconColor="#22C55E" iconBg="rgba(34,197,94,.12)"  trend={8}   index={1} />
        <StatCard title="Drafts"           value="9"   icon={FileText}      iconColor="#F59E0B" iconBg="rgba(245,158,11,.12)" trend={-2}  index={2} />
        <StatCard title="Active Campaigns" value="3"   icon={Megaphone}     iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)"  trend={0}   index={3} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Weekly performance chart — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
              Weekly Performance
            </h2>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: CHART_COLORS.reach }} />
                Reach
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: CHART_COLORS.engagement }} />
                Engagement
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={CHART_COLORS.reach}      stopOpacity={0.2} />
                  <stop offset="95%" stopColor={CHART_COLORS.reach}      stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={CHART_COLORS.engagement} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={CHART_COLORS.engagement} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="reach"      name="Reach"      stroke={CHART_COLORS.reach}      strokeWidth={2} fill="url(#reachGrad)" />
              <Area type="monotone" dataKey="engagement" name="Engagement" stroke={CHART_COLORS.engagement} strokeWidth={2} fill="url(#engGrad)"  />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick actions */}
        <QuickActions actions={quickActions} />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Upcoming posts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
              Upcoming Posts
            </h2>
            <a href="/dashboard/calendar" className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              View calendar →
            </a>
          </div>
          <div className="flex flex-col gap-2">
            {upcomingPosts.map(post => {
              const PlatformIcon = platformIcons[post.platform]
              const s = statusStyle[post.status]
              return (
                <div key={post.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-md)] transition-colors hover:bg-[var(--bg-alt)]"
                  style={{ border: '1px solid var(--border)' }}
                >
                  {PlatformIcon && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--bg-alt)' }}>
                      <PlatformIcon size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{post.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>{post.time}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Platform breakdown bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card p-5"
        >
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            Platform Reach
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={platformData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={68} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="reach" name="Reach" fill="var(--primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Third row: Campaign overview + Activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
              Campaign Overview
            </h2>
            <a href="/dashboard/campaigns" className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              View all →
            </a>
          </div>
          <div className="flex flex-col gap-4">
            {campaigns.map(c => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{c.name}</span>
                  <span className="text-xs font-semibold ml-2 flex-shrink-0" style={{ color: c.color }}>
                    {c.progress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'var(--bg-alt)' }}>
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${c.progress}%`, background: c.color }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>Budget: {c.budget}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: c.status === 'active' ? 'rgba(34,197,94,.10)' : 'rgba(245,158,11,.10)',
                      color:      c.status === 'active' ? '#22C55E'             : '#F59E0B',
                    }}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity feed — spans 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <ActivityFeed items={recentActivity} title="Recent Activity" />
        </motion.div>
      </div>
    </div>
  )
}
