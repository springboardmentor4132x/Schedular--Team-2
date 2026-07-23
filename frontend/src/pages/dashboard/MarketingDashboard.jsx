import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  Megaphone, FileText, Send, CheckSquare,
  PenSquare, BarChart2, CalendarDays, List,
  Clock, CheckCircle2, AlertCircle, Users,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/dashboard/StatCard'
import ActivityFeed from '../../components/dashboard/ActivityFeed'
import QuickActions from '../../components/dashboard/QuickActions'
import PageHeader from '../../components/dashboard/PageHeader'

const performanceData = [
  { week: 'W1', assigned: 8,  completed: 6  },
  { week: 'W2', assigned: 12, completed: 10 },
  { week: 'W3', assigned: 9,  completed: 8  },
  { week: 'W4', assigned: 14, completed: 13 },
]

const assignedCampaigns = [
  { id: 1, name: 'Summer Sale 2025',  role: 'Content Lead',    due: 'Jul 25', progress: 68, status: 'active'  },
  { id: 2, name: 'Product Launch Q3', role: 'Social Strategy', due: 'Aug 10', progress: 34, status: 'active'  },
  { id: 3, name: 'Brand Awareness',   role: 'Copywriter',      due: 'Jul 30', progress: 81, status: 'paused'  },
]

const todayTasks = [
  { id: 1, title: 'Review Instagram carousel draft',  priority: 'high',   done: false },
  { id: 2, title: 'Approve LinkedIn post for 5:30 PM', priority: 'high',  done: false },
  { id: 3, title: 'Update Summer Sale hashtag list',   priority: 'medium', done: true  },
  { id: 4, title: 'Reply to brand mention on X',       priority: 'low',    done: false },
  { id: 5, title: 'Export last week\'s analytics',     priority: 'medium', done: true  },
]

const queue = [
  { id: 1, title: 'Summer Sale Announcement',  platform: 'Instagram', time: '2:00 PM',  status: 'scheduled' },
  { id: 2, title: 'Product Launch Teaser',      platform: 'LinkedIn',  time: '5:30 PM',  status: 'pending'   },
  { id: 3, title: 'Weekly Tips Thread',         platform: 'X',         time: '11:00 PM', status: 'scheduled' },
]

const activity = [
  { id: 1, icon: CheckCircle2, iconColor: '#22C55E', iconBg: 'rgba(34,197,94,.1)',   title: 'Post approved by manager',   description: 'Summer Sale Announcement · Instagram',  time: '5m ago',  badge: 'Approved', badgeColor: '#22C55E' },
  { id: 2, icon: Clock,        iconColor: '#1E3A8A', iconBg: 'rgba(30,58,138,.1)',   title: 'Draft submitted for review', description: 'Weekly Tips Thread · X',                time: '30m ago', badge: 'Review',   badgeColor: '#1E3A8A' },
  { id: 3, icon: AlertCircle,  iconColor: '#F59E0B', iconBg: 'rgba(245,158,11,.1)',  title: 'Campaign brief updated',     description: 'Product Launch Q3 — new assets added',  time: '1h ago'                                          },
  { id: 4, icon: Users,        iconColor: '#4F46E5', iconBg: 'rgba(79,70,229,.1)',   title: 'Assigned to new campaign',   description: 'Brand Awareness campaign · Copywriter', time: '2h ago'                                          },
]

const quickActions = [
  { label: 'Create Post',  icon: PenSquare,    href: '/dashboard/create-post', color: '#1E3A8A' },
  { label: 'View Queue',   icon: List,         href: '/dashboard/queue',       color: '#4F46E5' },
  { label: 'Analytics',    icon: BarChart2,    href: '/dashboard/analytics',   color: '#22C55E' },
  { label: 'Calendar',     icon: CalendarDays, href: '/dashboard/calendar',    color: '#F59E0B' },
]

const priorityStyle = {
  high:   { label: 'High',   color: '#EF4444', bg: 'rgba(239,68,68,.10)'   },
  medium: { label: 'Medium', color: '#F59E0B', bg: 'rgba(245,158,11,.10)'  },
  low:    { label: 'Low',    color: '#64748B', bg: 'rgba(100,116,139,.10)' },
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[var(--r-md)] px-3 py-2 text-xs shadow-[var(--shadow-md)]"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  )
}

export default function MarketingDashboard() {
  const { user } = useAuth()
  const doneTasks = todayTasks.filter(t => t.done).length

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">

      {/* Welcome banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-[var(--r-xl)] p-6 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)' }}>
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-1">Marketing Team</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {user?.name ?? 'Welcome back'} 👋
          </h2>
          <p className="text-white/70 text-sm">
            <span className="text-white font-semibold">{todayTasks.length - doneTasks} tasks</span> pending today ·{' '}
            <span className="text-white font-semibold">{queue.length} posts</span> in publishing queue.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Assigned Campaigns" value="3"  icon={Megaphone}   iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)"  trend={0}   index={0} />
        <StatCard title="Tasks Today"        value={`${doneTasks}/${todayTasks.length}`} icon={CheckSquare} iconColor="#22C55E" iconBg="rgba(34,197,94,.12)" index={1} />
        <StatCard title="Queue Posts"        value="7"  icon={List}        iconColor="#F59E0B" iconBg="rgba(245,158,11,.12)" trend={5}   index={2} />
        <StatCard title="Drafts Pending"     value="4"  icon={FileText}    iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)"  trend={-1}  index={3} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Today's Tasks */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
              Today's Tasks
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(34,197,94,.10)', color: '#22C55E' }}>
              {doneTasks}/{todayTasks.length} done
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full mb-4" style={{ background: 'var(--bg-alt)' }}>
            <div className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${(doneTasks / todayTasks.length) * 100}%`, background: '#22C55E' }} />
          </div>
          <div className="flex flex-col gap-2">
            {todayTasks.map(task => {
              const p = priorityStyle[task.priority]
              return (
                <div key={task.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-md)]"
                  style={{
                    background: task.done ? 'var(--bg-alt)' : 'var(--card)',
                    border: '1px solid var(--border)',
                    opacity: task.done ? 0.6 : 1,
                  }}>
                  <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${task.done ? '' : 'border'}`}
                    style={{
                      background: task.done ? '#22C55E' : 'transparent',
                      borderColor: 'var(--border)',
                    }}>
                    {task.done && <CheckCircle2 size={14} style={{ color: '#fff' }} />}
                  </div>
                  <span className={`text-sm flex-1 ${task.done ? 'line-through' : ''}`}
                    style={{ color: task.done ? 'var(--text-subtle)' : 'var(--text)' }}>
                    {task.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: p.bg, color: p.color }}>{p.label}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        <QuickActions actions={quickActions} />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Assigned Campaigns */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
              Assigned Campaigns
            </h2>
            <a href="/dashboard/campaigns" className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              View all →
            </a>
          </div>
          <div className="flex flex-col gap-4">
            {assignedCampaigns.map(c => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{c.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0"
                    style={{
                      background: c.status === 'active' ? 'rgba(34,197,94,.10)' : 'rgba(245,158,11,.10)',
                      color: c.status === 'active' ? '#22C55E' : '#F59E0B',
                    }}>{c.status}</span>
                </div>
                <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {c.role} · Due {c.due}
                </p>
                <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-alt)' }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${c.progress}%`, background: 'var(--primary)' }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            Weekly Task Performance
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={performanceData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="assigned"  name="Assigned"  fill="var(--accent)"   radius={[4,4,0,0]} />
              <Bar dataKey="completed" name="Completed" fill="var(--secondary)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Activity feed */}
      <ActivityFeed items={activity} title="Recent Activity" />
    </div>
  )
}
