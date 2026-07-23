import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardList, Search, Calendar, Users,
  TrendingUp, CheckCircle2, Clock, AlertTriangle,
  BarChart2, FileText, Eye,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/dashboard/PageHeader'
import EmptyState from '../../components/dashboard/EmptyState'

/**
 * AssignedCampaigns — Marketing Team read-only view.
 * Shows campaigns assigned to this team member with:
 *   - Progress tracking
 *   - Task status
 *   - Campaign timeline
 *   - Publishing progress
 *   - Team activity
 */

const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C' },
  facebook:  { icon: FaFacebook,  color: '#1877F2' },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2' },
  x:         { icon: FaXTwitter,  color: '#000000' },
}

const STATUS_STYLES = {
  active:    { label: 'Active',     bg: 'rgba(34,197,94,.12)',   color: '#22C55E' },
  paused:    { label: 'Paused',     bg: 'rgba(245,158,11,.12)',  color: '#F59E0B' },
  completed: { label: 'Completed',  bg: 'rgba(100,116,139,.12)', color: '#64748B' },
  overdue:   { label: 'Overdue',    bg: 'rgba(239,68,68,.12)',   color: '#EF4444' },
}

const TASK_STATUS = {
  done:        { label: 'Done',        icon: CheckCircle2,  color: '#22C55E' },
  in_progress: { label: 'In Progress', icon: Clock,         color: '#1E3A8A' },
  pending:     { label: 'Pending',     icon: AlertTriangle, color: '#F59E0B' },
}

const MY_CAMPAIGNS = [
  {
    id: 1,
    name: 'Summer Sale 2025',
    objective: 'Brand Awareness',
    myRole: 'Content Lead',
    status: 'active',
    start: '2025-07-01',
    end: '2025-07-31',
    progress: 68,
    postsPublished: 16,
    postsTotal: 24,
    platforms: ['instagram', 'facebook', 'x'],
    budget: '$2,400',
    budgetUsed: 68,
    team: ['AJ', 'SR', 'KL'],
    tasks: [
      { id: 1, title: 'Write Instagram carousel copy',       status: 'done',        due: 'Jul 18' },
      { id: 2, title: 'Review Facebook ad creative',        status: 'done',        due: 'Jul 19' },
      { id: 3, title: 'Schedule X thread for final week',   status: 'in_progress', due: 'Jul 22' },
      { id: 4, title: 'Prepare end-of-campaign report',     status: 'pending',     due: 'Aug 1'  },
    ],
    recentActivity: [
      { text: 'Instagram post published',           time: '2h ago',  type: 'success' },
      { text: 'Facebook creative approved',         time: '5h ago',  type: 'success' },
      { text: 'X thread draft submitted for review',time: 'Yesterday',type: 'info'   },
    ],
  },
  {
    id: 2,
    name: 'Product Launch Q3',
    objective: 'Lead Generation',
    myRole: 'Social Strategy',
    status: 'active',
    start: '2025-07-15',
    end: '2025-08-31',
    progress: 34,
    postsPublished: 4,
    postsTotal: 12,
    platforms: ['linkedin', 'instagram'],
    budget: '$5,000',
    budgetUsed: 34,
    team: ['AJ', 'MR'],
    tasks: [
      { id: 1, title: 'LinkedIn thought leadership posts',  status: 'in_progress', due: 'Jul 25' },
      { id: 2, title: 'Instagram product teaser series',   status: 'pending',     due: 'Jul 28' },
      { id: 3, title: 'Audience targeting setup',          status: 'done',        due: 'Jul 20' },
    ],
    recentActivity: [
      { text: 'Strategy document approved',        time: '1d ago',  type: 'success' },
      { text: 'LinkedIn post draft submitted',     time: '2d ago',  type: 'info'    },
    ],
  },
  {
    id: 3,
    name: 'Brand Awareness',
    objective: 'Reach',
    myRole: 'Copywriter',
    status: 'paused',
    start: '2025-06-01',
    end: '2025-07-30',
    progress: 81,
    postsPublished: 29,
    postsTotal: 36,
    platforms: ['instagram', 'facebook', 'linkedin'],
    budget: '$1,200',
    budgetUsed: 81,
    team: ['SR', 'KL', 'DT'],
    tasks: [
      { id: 1, title: 'Final copy review for remaining posts', status: 'pending', due: 'Jul 30' },
      { id: 2, title: 'Engagement response templates',         status: 'done',    due: 'Jun 30' },
    ],
    recentActivity: [
      { text: 'Campaign paused by manager',        time: '3d ago', type: 'info'    },
      { text: '29 posts published successfully',   time: '4d ago', type: 'success' },
    ],
  },
]

function ProgressRing({ pct, size = 56, stroke = 5, color = '#1E3A8A' }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--bg-alt)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize="11" fontWeight="700" fill="var(--text)">
        {pct}%
      </text>
    </svg>
  )
}

export default function AssignedCampaigns() {
  const { user } = useAuth()
  const [search,     setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expanded,   setExpanded]   = useState(1) // first card open by default

  const filtered = MY_CAMPAIGNS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Assigned Campaigns"
        subtitle={`${MY_CAMPAIGNS.filter(c => c.status === 'active').length} active · ${MY_CAMPAIGNS.length} total assigned`}
      />

      {/* ── Summary KPI row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Assigned',    value: MY_CAMPAIGNS.length,                                      color: 'var(--text)' },
          { label: 'Active',            value: MY_CAMPAIGNS.filter(c => c.status === 'active').length,   color: '#1E3A8A'     },
          { label: 'Posts Published',   value: MY_CAMPAIGNS.reduce((s, c) => s + c.postsPublished, 0),  color: '#22C55E'     },
          { label: 'Tasks Pending',     value: MY_CAMPAIGNS.flatMap(c => c.tasks).filter(t => t.status !== 'done').length, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search campaigns…"
            className="w-full h-10 pl-9 pr-4 text-sm rounded-[var(--r-md)] border outline-none"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'active', 'paused', 'completed'].map(s => {
            const st = STATUS_STYLES[s]; const active = statusFilter === s
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                style={{
                  background:  active ? (st?.bg  ?? 'var(--primary-light)') : 'var(--card)',
                  borderColor: active ? (st?.color ?? 'var(--primary)')     : 'var(--border)',
                  color:       active ? (st?.color ?? 'var(--primary)')     : 'var(--text-muted)',
                }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Empty ── */}
      {filtered.length === 0 && (
        <div className="card">
          <EmptyState icon={ClipboardList} title="No campaigns found" message="You have no assigned campaigns matching this filter." />
        </div>
      )}

      {/* ── Campaign accordion cards ── */}
      <div className="flex flex-col gap-4">
        {filtered.map((c, idx) => {
          const st = STATUS_STYLES[c.status]
          const isOpen = expanded === c.id
          const doneTasks = c.tasks.filter(t => t.status === 'done').length

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.06 }}
              className="card overflow-hidden"
            >
              {/* ── Card header — always visible ── */}
              <button
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-[var(--bg-alt)] transition-colors"
                onClick={() => setExpanded(isOpen ? null : c.id)}
              >
                {/* Progress ring */}
                <ProgressRing pct={c.progress} color="#1E3A8A" />

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-base font-bold truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
                      {c.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(79,70,229,.10)', color: '#4F46E5' }}>
                      {c.myRole}
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Calendar size={11} /> {c.start} – {c.end}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {c.postsPublished}/{c.postsTotal} posts published
                    </span>
                  </div>
                </div>

                {/* Platform icons */}
                <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                  {c.platforms.map(p => {
                    const meta = PLATFORM_META[p]; const Icon = meta?.icon
                    return Icon ? (
                      <div key={p} className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: `${meta.color}15` }}>
                        <Icon size={13} style={{ color: meta.color }} />
                      </div>
                    ) : null
                  })}
                </div>

                {/* Chevron */}
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                >
                  <BarChart2 size={16} />
                </motion.div>
              </button>

              {/* ── Expanded detail ── */}
              <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="px-5 pb-5 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-5">

                    {/* ── Tasks ── */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold" style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          My Tasks
                        </h4>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(34,197,94,.10)', color: '#22C55E' }}>
                          {doneTasks}/{c.tasks.length} done
                        </span>
                      </div>

                      {/* Task progress bar */}
                      <div className="w-full h-1.5 rounded-full mb-4" style={{ background: 'var(--bg-alt)' }}>
                        <div className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${(doneTasks / c.tasks.length) * 100}%`, background: '#22C55E' }} />
                      </div>

                      <div className="flex flex-col gap-2">
                        {c.tasks.map(task => {
                          const ts = TASK_STATUS[task.status]
                          const TIcon = ts.icon
                          return (
                            <div key={task.id}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-md)]"
                              style={{
                                background: task.status === 'done' ? 'var(--bg-alt)' : 'var(--card)',
                                border: '1px solid var(--border)',
                                opacity: task.status === 'done' ? 0.65 : 1,
                              }}>
                              <TIcon size={14} style={{ color: ts.color, flexShrink: 0 }} />
                              <span className={`text-sm flex-1 ${task.status === 'done' ? 'line-through' : ''}`}
                                style={{ color: task.status === 'done' ? 'var(--text-subtle)' : 'var(--text)' }}>
                                {task.title}
                              </span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: `${ts.color}15`, color: ts.color }}>
                                  {ts.label}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>Due {task.due}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Publishing progress bar */}
                      <div className="mt-4 p-3 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Publishing Progress</span>
                          <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
                            {c.postsPublished} / {c.postsTotal} posts
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full" style={{ background: 'var(--border)' }}>
                          <div className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${(c.postsPublished / c.postsTotal) * 100}%`,
                              background: 'linear-gradient(90deg, #1E3A8A, #4F46E5)',
                            }} />
                        </div>
                      </div>
                    </div>

                    {/* ── Right column: budget + team + activity ── */}
                    <div className="flex flex-col gap-4">

                      {/* Budget */}
                      <div>
                        <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Budget Overview
                        </h4>
                        <div className="p-3 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Allocated</span>
                            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{c.budget}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full mb-1" style={{ background: 'var(--border)' }}>
                            <div className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${c.budgetUsed}%`,
                                background: c.budgetUsed > 90 ? 'var(--error)' : 'var(--primary)',
                              }} />
                          </div>
                          <span className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>{c.budgetUsed}% used</span>
                        </div>
                      </div>

                      {/* Team */}
                      <div>
                        <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Team
                        </h4>
                        <div className="flex items-center gap-1.5">
                          {c.team.map(m => (
                            <div key={m}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                              style={{ background: 'linear-gradient(135deg, #1E3A8A, #4F46E5)', border: '2px solid var(--card)' }}
                              title={m}>
                              {m}
                            </div>
                          ))}
                          <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                            {c.team.length} members
                          </span>
                        </div>
                      </div>

                      {/* Recent activity */}
                      <div>
                        <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Recent Activity
                        </h4>
                        <div className="flex flex-col gap-2">
                          {c.recentActivity.map((a, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                style={{ background: a.type === 'success' ? '#22C55E' : '#1E3A8A' }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs" style={{ color: 'var(--text)' }}>{a.text}</p>
                                <p className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>{a.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
