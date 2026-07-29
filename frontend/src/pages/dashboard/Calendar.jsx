import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/dashboard/PageHeader'

/* ── Mock posts ─────────────────────────────────────────────────── */
const POSTS = [
  { id:1, title:'Summer Sale Kick-off',   date:'2025-07-21', platform:'instagram', status:'scheduled', time:'10:00' },
  { id:2, title:'LinkedIn Thought Post',  date:'2025-07-21', platform:'linkedin',  status:'published', time:'09:00' },
  { id:3, title:'Product Teaser Video',   date:'2025-07-23', platform:'instagram', status:'draft',     time:'14:00' },
  { id:4, title:'Facebook Campaign Ad',   date:'2025-07-24', platform:'facebook',  status:'scheduled', time:'11:30' },
  { id:5, title:'X Thread Recap',         date:'2025-07-25', platform:'x',         status:'scheduled', time:'16:00' },
  { id:6, title:'Customer Spotlight',     date:'2025-07-28', platform:'facebook',  status:'draft',     time:'09:30' },
  { id:7, title:'Weekly Tips Carousel',   date:'2025-07-14', platform:'instagram', status:'published', time:'12:00' },
  { id:8, title:'Blog Post Promo',        date:'2025-07-17', platform:'linkedin',  status:'published', time:'08:00' },
]

const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C' },
  facebook:  { icon: FaFacebook,  color: '#1877F2' },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2' },
  x:         { icon: FaXTwitter,  color: '#000000' },
}

const STATUS_COLORS = {
  scheduled: { bg: 'rgba(30,58,138,.12)',   text: '#1E3A8A' },
  published: { bg: 'rgba(34,197,94,.12)',   text: '#22C55E' },
  draft:     { bg: 'rgba(100,116,139,.12)', text: '#64748B' },
  failed:    { bg: 'rgba(239,68,68,.12)',   text: '#EF4444' },
}

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const PLATFORM_FILTERS = ['all','instagram','facebook','linkedin','x']

/* ── Helpers ────────────────────────────────────────────────────── */
function isoDate(y, m, d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

/* ── Month grid ─────────────────────────────────────────────────── */
function MonthView({ year, month, posts, onDayClick, selectedDay }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const today = new Date()
  const todayStr = isoDate(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div>
      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold py-2" style={{ color: 'var(--text-subtle)' }}>{d}</div>
        ))}
      </div>
      {/* Cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />
          const iso = isoDate(year, month, day)
          const dayPosts = posts.filter(p => p.date === iso)
          const isToday = iso === todayStr
          const isSelected = iso === selectedDay
          return (
            <motion.button
              key={iso}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onDayClick(iso)}
              className="relative min-h-[72px] p-1.5 rounded-[var(--r-sm)] text-left transition-colors"
              style={{
                background: isSelected ? 'var(--primary-light)' : isToday ? 'var(--bg-alt)' : 'var(--card)',
                border: `1.5px solid ${isSelected ? 'var(--primary)' : isToday ? 'var(--secondary)' : 'var(--border)'}`,
              }}
            >
              <span className={`text-xs font-bold ${isToday ? 'text-white rounded-full w-5 h-5 flex items-center justify-center' : ''}`}
                style={{
                  background: isToday ? 'var(--primary)' : 'transparent',
                  color: isToday ? '#fff' : 'var(--text)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: isToday ? 20 : 'auto', height: isToday ? 20 : 'auto',
                  borderRadius: isToday ? '50%' : 0,
                }}>
                {day}
              </span>
              {/* Post dots */}
              <div className="flex flex-wrap gap-0.5 mt-1">
                {dayPosts.slice(0, 3).map(p => {
                  const meta = PLATFORM_META[p.platform]
                  return (
                    <div key={p.id} className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: meta?.color ?? 'var(--primary)' }} />
                  )
                })}
                {dayPosts.length > 3 && (
                  <span className="text-[9px]" style={{ color: 'var(--text-subtle)' }}>+{dayPosts.length-3}</span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Post list for selected day ─────────────────────────────────── */
function DayPosts({ date, posts }) {
  if (!date) return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>Click a day to view scheduled posts.</p>
    </div>
  )
  const dayPosts = posts.filter(p => p.date === date)
  if (dayPosts.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{date}</p>
      <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>No posts scheduled.</p>
    </div>
  )
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>{date}</p>
      {dayPosts.map(post => {
        const meta = PLATFORM_META[post.platform]
        const Icon = meta?.icon
        const s = STATUS_COLORS[post.status]
        return (
          <div key={post.id} className="flex items-center gap-3 p-3 rounded-[var(--r-md)]"
            style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
            {Icon && <Icon size={14} style={{ color: meta.color, flexShrink: 0 }} />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{post.title}</p>
              <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>{post.time}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: s.bg, color: s.text }}>{post.status}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────────── */
export default function Calendar() {
  const navigate = useNavigate()
  const now = new Date()
  const [viewYear,  setViewYear]  = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selected,  setSelected]  = useState(null)
  const [filter,    setFilter]    = useState('all')
  const [view,      setView]      = useState('month') // month | week

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1) } else setViewMonth(m => m-1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1) } else setViewMonth(m => m+1) }

  const filteredPosts = filter === 'all' ? POSTS : POSTS.filter(p => p.platform === filter)

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Publishing Calendar"
        subtitle="Visualize your entire publishing schedule."
        actions={
          <button onClick={() => navigate('/dashboard/create-post')}
            className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold text-white transition-all hover:brightness-105"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
            <Plus size={15} /> New Post
          </button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">

        {/* Calendar panel */}
        <div className="xl:col-span-3 card p-5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            {/* Month nav */}
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)] transition-colors"
                style={{ color: 'var(--text-muted)' }}>
                <ChevronLeft size={16} />
              </button>
              <h2 className="text-base font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)', minWidth: 160 }}>
                {MONTHS[viewMonth]} {viewYear}
              </h2>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)] transition-colors"
                style={{ color: 'var(--text-muted)' }}>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Platform filter pills */}
            <div className="flex flex-wrap gap-1.5">
              {PLATFORM_FILTERS.map(f => {
                const meta = PLATFORM_META[f]
                const Icon = meta?.icon
                const active = filter === f
                return (
                  <button key={f} onClick={() => setFilter(f)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                    style={{
                      background:  active ? (meta?.color ? `${meta.color}15` : 'var(--primary-light)') : 'var(--card)',
                      borderColor: active ? (meta?.color ?? 'var(--primary)') : 'var(--border)',
                      color:       active ? (meta?.color ?? 'var(--primary)') : 'var(--text-muted)',
                    }}>
                    {Icon && <Icon size={11} />}
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                )
              })}
            </div>
          </div>

          <MonthView
            year={viewYear} month={viewMonth}
            posts={filteredPosts}
            onDayClick={setSelected}
            selectedDay={selected}
          />

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <div key={s} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.text }} />
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            Scheduled Posts
          </h3>
          <DayPosts date={selected} posts={filteredPosts} />
        </div>
      </div>

      {/* Upcoming table */}
      <div className="card p-5 mt-4">
        <h3 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
          Upcoming Schedule
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Post','Platform','Date','Time','Status'].map(h => (
                  <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {POSTS.sort((a,b) => a.date.localeCompare(b.date)).map(post => {
                const meta = PLATFORM_META[post.platform]
                const Icon = meta?.icon
                const s = STATUS_COLORS[post.status]
                return (
                  <tr key={post.id} className="hover:bg-[var(--bg-alt)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2.5 pr-4 font-medium" style={{ color: 'var(--text)' }}>{post.title}</td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-1.5">
                        {Icon && <Icon size={13} style={{ color: meta.color }} />}
                        <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{post.platform}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-xs" style={{ color: 'var(--text-muted)' }}>{post.date}</td>
                    <td className="py-2.5 pr-4 text-xs" style={{ color: 'var(--text-muted)' }}>{post.time}</td>
                    <td className="py-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: s.bg, color: s.text }}>{post.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
