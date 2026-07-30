import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, Search, X, Eye, Clock, ChevronLeft, ChevronRight,
  Image as ImageIcon, Sparkles, BarChart3, RefreshCw, CheckCircle2,
  Megaphone, Send, CalendarRange
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import StatCard from '../../../components/dashboard/StatCard'
import { MOCK_CAMPAIGNS, MOCK_PUBLISHED_POSTS, MOCK_SCHEDULED_POSTS } from '../../../services/mockData'

const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C', label: 'Instagram' },
  facebook:  { icon: FaFacebook,  color: '#1877F2', label: 'Facebook'  },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2', label: 'LinkedIn'  },
  x:         { icon: FaXTwitter,  color: '#374151', label: 'X'         },
  youtube:   { icon: FaYoutube,   color: '#FF0000', label: 'YouTube'   },
  pinterest: { icon: FaPinterest, color: '#E60023', label: 'Pinterest' },
}

const EVENT_META = {
  scheduled: { label: 'Scheduled Post', color: '#1E3A8A', bg: 'rgba(30,58,138,.12)', icon: CalendarDays },
  published: { label: 'Published Post', color: '#22C55E', bg: 'rgba(34,197,94,.12)', icon: Send },
  campaign:  { label: 'Campaign', color: '#7C3AED', bg: 'rgba(124,58,237,.12)', icon: Megaphone },
  milestone: { label: 'Milestone', color: '#F59E0B', bg: 'rgba(245,158,11,.12)', icon: Sparkles },
}

const STATUS_STYLES = {
  scheduled: { label: 'Scheduled', color: '#1E3A8A', bg: 'rgba(30,58,138,.12)' },
  published: { label: 'Published', color: '#22C55E', bg: 'rgba(34,197,94,.12)' },
  completed: { label: 'Completed', color: '#64748B', bg: 'rgba(100,116,139,.12)' },
  active: { label: 'Active', color: '#7C3AED', bg: 'rgba(124,58,237,.12)' },
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const MILESTONES = [
  { id: 'ms-1', title: 'Summer Sale Campaign Starts', date: '2025-08-01', description: 'Campaign launch milestone', type: 'milestone', platform: 'instagram' },
  { id: 'ms-2', title: 'Product Launch', date: '2025-08-15', description: 'Core product announcement', type: 'milestone', platform: 'linkedin' },
  { id: 'ms-3', title: 'Festival Sale', date: '2025-08-20', description: 'Festival promotion goes live', type: 'milestone', platform: 'facebook' },
  { id: 'ms-4', title: 'Summer Sale Campaign Ends', date: '2025-08-31', description: 'Campaign wrap-up milestone', type: 'milestone', platform: 'x' },
]

function isoDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function getDateValue(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function LoadingSkeleton() {
  return (
    <div className="card p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-28 rounded bg-slate-200/70" />
        <div className="h-10 rounded bg-slate-200/70" />
        <div className="h-20 rounded bg-slate-200/70" />
      </div>
    </div>
  )
}

function EventDrawer({ event, onClose }) {
  if (!event) return null
  const meta = event.type === 'scheduled' || event.type === 'published' ? PLATFORM_META[event.platform] : null
  const Icon = meta?.icon
  const eventMeta = EVENT_META[event.type]
  const EventIcon = eventMeta?.icon

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col shadow-[var(--shadow-lg)] overflow-y-auto" style={{ background: 'var(--card)', borderLeft: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Eye size={16} style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Activity Details</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: eventMeta.bg }}>
                {EventIcon && <EventIcon size={16} style={{ color: eventMeta.color }} />}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{eventMeta.label}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{event.title}</p>
              </div>
            </div>
            {event.status && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: STATUS_STYLES[event.status]?.bg ?? 'rgba(30,58,138,.12)', color: STATUS_STYLES[event.status]?.color ?? '#1E3A8A' }}>{STATUS_STYLES[event.status]?.label ?? event.status}</span>
            )}
          </div>

          {event.type === 'scheduled' && (
            <>
              <div className="rounded-[var(--r-md)] border p-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
                <div className="flex items-center gap-2 mb-2">
                  {Icon && <Icon size={14} style={{ color: meta.color }} />}
                  <span className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Scheduled</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(event.date).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center justify-between"><span>Campaign</span><span className="font-semibold" style={{ color: 'var(--text)' }}>{event.campaign ?? 'No campaign'}</span></div>
                <div className="flex items-center justify-between"><span>Publishing Status</span><span className="font-semibold" style={{ color: 'var(--text)' }}>Queued</span></div>
                <div className="flex items-center justify-between"><span>Marketing Team</span><span className="font-semibold" style={{ color: 'var(--text)' }}>Orbit Growth Team</span></div>
              </div>
              <div className="rounded-[var(--r-md)] border p-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2"><ImageIcon size={13} style={{ color: 'var(--text-muted)' }} /><span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Preview</span></div>
                <div className="h-24 rounded-[var(--r-md)] flex items-center justify-center" style={{ background: 'var(--bg-alt)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>Preview image placeholder</span>
                </div>
                <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{event.caption ?? 'Caption preview will appear here once the team approves content.'}</p>
              </div>
            </>
          )}

          {event.type === 'published' && (
            <>
              <div className="rounded-[var(--r-md)] border p-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>Platform</span><span className="font-semibold" style={{ color: 'var(--text)' }}>{meta?.label}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  <span>Published</span><span className="font-semibold" style={{ color: 'var(--text)' }}>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="grid gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center justify-between"><span>Campaign</span><span className="font-semibold" style={{ color: 'var(--text)' }}>{event.campaign ?? 'General'}</span></div>
                <div className="flex items-center justify-between"><span>Engagement</span><span className="font-semibold" style={{ color: 'var(--text)' }}>{event.engagement ?? '—'}</span></div>
                <div className="flex items-center justify-between"><span>Reach</span><span className="font-semibold" style={{ color: 'var(--text)' }}>{event.reach ?? '—'}</span></div>
                <div className="flex items-center justify-between"><span>Likes</span><span className="font-semibold" style={{ color: 'var(--text)' }}>{event.likes ?? '—'}</span></div>
                <div className="flex items-center justify-between"><span>Comments</span><span className="font-semibold" style={{ color: 'var(--text)' }}>{event.comments ?? '—'}</span></div>
                <div className="flex items-center justify-between"><span>Shares</span><span className="font-semibold" style={{ color: 'var(--text)' }}>{event.shares ?? '—'}</span></div>
              </div>
            </>
          )}

          {event.type === 'campaign' && (
            <>
              <div className="rounded-[var(--r-md)] border p-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>Objective</span><span className="font-semibold" style={{ color: 'var(--text)' }}>{event.objective}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  <span>Budget</span><span className="font-semibold" style={{ color: 'var(--text)' }}>${event.budget?.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>Timeline</span><span className="font-semibold" style={{ color: 'var(--text)' }}>{event.startDate} → {event.endDate}</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'var(--bg-alt)' }}>
                  <div className="h-2 rounded-full" style={{ width: `${event.progress}%`, background: 'linear-gradient(90deg, #1E3A8A, #7C3AED)' }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <div className="rounded-[var(--r-md)] p-2" style={{ background: 'var(--bg-alt)' }}><p className="font-semibold" style={{ color: 'var(--text)' }}>{event.totalPosts}</p><p>Total Posts</p></div>
                  <div className="rounded-[var(--r-md)] p-2" style={{ background: 'var(--bg-alt)' }}><p className="font-semibold" style={{ color: 'var(--text)' }}>{event.scheduledPosts}</p><p>Scheduled</p></div>
                  <div className="rounded-[var(--r-md)] p-2" style={{ background: 'var(--bg-alt)' }}><p className="font-semibold" style={{ color: 'var(--text)' }}>{event.publishedPosts}</p><p>Published</p></div>
                  <div className="rounded-[var(--r-md)] p-2" style={{ background: 'var(--bg-alt)' }}><p className="font-semibold" style={{ color: 'var(--text)' }}>{event.progress}%</p><p>Complete</p></div>
                </div>
              </div>
            </>
          )}

          {event.type === 'milestone' && (
            <div className="rounded-[var(--r-md)] border p-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Milestone Details</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{event.description}</p>
              <p className="text-xs mt-3" style={{ color: 'var(--text)' }}>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}

function CalendarBody({ view, events, onSelect, selectedDate, setSelectedDate, month, setMonth, year, setYear }) {
  const now = new Date()
  const todayStr = isoDate(now.getFullYear(), now.getMonth(), now.getDate())

  if (view === 'month') {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)

    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1)} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color: 'var(--text-muted)' }}><ChevronLeft size={16} /></button>
          <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>{MONTHS[month]} {year}</h2>
          <button onClick={() => month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1)} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color: 'var(--text-muted)' }}><ChevronRight size={16} /></button>
        </div>
        <div className="grid grid-cols-7 mb-2">{DAYS.map(d => <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: 'var(--text-subtle)' }}>{d}</div>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} />
            const iso = isoDate(year, month, day)
            const dayEvents = events.filter(e => (e.type === 'campaign' ? (e.startDate <= iso && iso <= e.endDate) : e.date === iso))
            const isToday = iso === todayStr
            const isSelected = selectedDate === iso
            return (
              <button key={iso} onClick={() => setSelectedDate(iso)} className="min-h-[88px] p-1.5 rounded-[var(--r-sm)] text-left transition-colors" style={{ background: isSelected ? 'var(--primary-light)' : isToday ? 'rgba(30,58,138,.06)' : 'var(--card)', border: `1.5px solid ${isSelected || isToday ? 'var(--primary)' : 'var(--border)'}` }}>
                <span className="text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full mb-1" style={{ background: isToday ? 'var(--primary)' : 'transparent', color: isToday ? '#fff' : 'var(--text)' }}>{day}</span>
                <div className="flex flex-col gap-0.5">
                  {dayEvents.slice(0, 3).map(e => {
                    const chipMeta = EVENT_META[e.type] ?? EVENT_META.scheduled
                    return (
                      <div key={e.id} onClick={() => onSelect(e)} className="flex items-center gap-1 px-1 py-0.5 rounded text-left w-full truncate" style={{ background: `${chipMeta.color}18`, color: chipMeta.color }}>
                        <span className="text-[8px] font-semibold">●</span>
                        <span className="text-[8px] truncate font-medium">{e.title}</span>
                      </div>
                    )
                  })}
                  {dayEvents.length > 3 && <span className="text-[8px] pl-1" style={{ color: 'var(--text-subtle)' }}>+{dayEvents.length - 3}</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (view === 'week') {
    const start = new Date(selectedDate ? new Date(selectedDate) : now)
    const day = start.getDay()
    start.setDate(start.getDate() - day)
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })

    return (
      <div className="card p-5 overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-[720px]">
          {weekDays.map((d, i) => {
            const iso = getDateValue(d)
            const dayEvents = events.filter(e => (e.type === 'campaign' ? (e.startDate <= iso && iso <= e.endDate) : e.date === iso))
            return (
              <div key={iso} className="flex flex-col gap-1">
                <div className="text-center py-2 rounded-lg" style={{ background: iso === todayStr ? 'var(--primary)' : 'var(--bg-alt)' }}>
                  <p className="text-[10px] font-semibold" style={{ color: iso === todayStr ? 'rgba(255,255,255,0.75)' : 'var(--text-subtle)' }}>{DAYS[i]}</p>
                  <p className="text-sm font-bold" style={{ color: iso === todayStr ? '#fff' : 'var(--text)' }}>{d.getDate()}</p>
                </div>
                <div className="flex flex-col gap-1 min-h-[120px] p-1 rounded-b-lg" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                  {dayEvents.length === 0 ? <p className="text-[10px] p-1" style={{ color: 'var(--text-subtle)' }}>No activity</p> : dayEvents.slice(0, 3).map(e => <button key={e.id} onClick={() => onSelect(e)} className="rounded px-1.5 py-1 text-left text-[9px] font-medium truncate" style={{ background: `${(EVENT_META[e.type] ?? EVENT_META.scheduled).color}18`, color: (EVENT_META[e.type] ?? EVENT_META.scheduled).color }}>{e.title}</button>)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const selectedDay = selectedDate ?? todayStr
  const dayEvents = events.filter(e => (e.type === 'campaign' ? (e.startDate <= selectedDay && selectedDay <= e.endDate) : e.date === selectedDay))

  return (
    <div className="card p-5">
      <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>{new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h2>
      {dayEvents.length === 0 ? <EmptyState icon={CalendarDays} title="Nothing happening today" message="No scheduled posts, published posts, or milestones on this day." /> : <div className="flex flex-col gap-2">{dayEvents.map(e => <button key={e.id} onClick={() => onSelect(e)} className="flex items-center gap-3 rounded-[var(--r-md)] p-3 text-left" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${(EVENT_META[e.type] ?? EVENT_META.scheduled).color}18` }}><div className="w-2.5 h-2.5 rounded-full" style={{ background: (EVENT_META[e.type] ?? EVENT_META.scheduled).color }} /></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{e.title}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.type === 'campaign' ? `${e.startDate} → ${e.endDate}` : new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p></div></button>)}</div>}
    </div>
  )
}

export default function ScheduledPosts() {
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('all')
  const [eventType, setEventType] = useState('all')
  const [campaign, setCampaign] = useState('all')
  const [status, setStatus] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [view, setView] = useState('month')
  const [selected, setSelected] = useState(null)
  const [selectedDate, setSelectedDate] = useState(getDateValue(new Date()))
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const id = setTimeout(() => setIsLoading(false), 450)
    return () => clearTimeout(id)
  }, [])

  const baseEvents = useMemo(() => {
    const scheduled = MOCK_SCHEDULED_POSTS.map(post => ({
      id: `scheduled-${post.id}`,
      type: 'scheduled',
      title: post.title,
      date: post.scheduledAt?.split('T')[0] ?? getDateValue(new Date()),
      time: post.scheduledAt?.split('T')[1] ?? '',
      platform: post.platform,
      campaign: post.campaign,
      status: post.status,
      caption: post.caption,
      marketingTeam: 'Orbit Growth Team',
      source: 'scheduled',
    }))

    const published = MOCK_PUBLISHED_POSTS.map(post => ({
      id: `published-${post.id}`,
      type: 'published',
      title: post.title,
      date: post.publishedAt?.split('T')[0] ?? getDateValue(new Date()),
      platform: post.platform,
      campaign: post.campaign,
      status: 'published',
      engagement: `${post.engagement ?? 0} engagements`,
      reach: `${post.reach?.toLocaleString() ?? 0} reach`,
      likes: post.likes ?? 0,
      comments: post.comments ?? 0,
      shares: post.shares ?? 0,
      source: 'published',
    }))

    const campaigns = MOCK_CAMPAIGNS.map(campaign => ({
      id: `campaign-${campaign.id}`,
      type: 'campaign',
      title: campaign.name,
      startDate: campaign.start,
      endDate: campaign.end,
      date: campaign.start,
      objective: campaign.objective,
      budget: campaign.budget,
      progress: campaign.progress,
      totalPosts: campaign.posts,
      scheduledPosts: Math.round(campaign.posts * 0.6),
      publishedPosts: Math.round(campaign.posts * 0.4),
      status: campaign.status,
      platform: 'instagram',
      source: 'campaign',
    }))

    const milestones = MILESTONES.map(item => ({
      id: item.id,
      type: 'milestone',
      title: item.title,
      date: item.date,
      platform: item.platform,
      description: item.description,
      status: 'completed',
      source: 'milestone',
    }))

    return [...scheduled, ...published, ...campaigns, ...milestones]
  }, [])

  const filteredEvents = useMemo(() => {
    const q = search.toLowerCase()
    return baseEvents.filter(event => {
      const matchType = eventType === 'all' || event.type === {
        'Scheduled Posts': 'scheduled',
        'Published Posts': 'published',
        Campaigns: 'campaign',
        Milestones: 'milestone',
      }[eventType]
      const matchPlatform = platform === 'all' || event.platform === platform
      const matchCampaign = campaign === 'all' || event.campaign === campaign
      const matchStatus = status === 'all' || event.status === status
      const eventDate = event.type === 'campaign' ? event.startDate : event.date
      const afterStart = !startDate || eventDate >= startDate
      const beforeEnd = !endDate || eventDate <= endDate
      const matchText = !q || [event.title, event.campaign, event.platform].filter(Boolean).join(' ').toLowerCase().includes(q)
      return matchType && matchPlatform && matchCampaign && matchStatus && afterStart && beforeEnd && matchText
    })
  }, [baseEvents, campaign, endDate, eventType, platform, search, startDate, status])

  const summaryCards = useMemo(() => {
    const scheduledCount = filteredEvents.filter(e => e.type === 'scheduled').length
    const publishedCount = filteredEvents.filter(e => e.type === 'published').length
    const activeCampaigns = filteredEvents.filter(e => e.type === 'campaign' && e.status === 'active').length
    const now = new Date()
    const weekLater = new Date(now)
    weekLater.setDate(now.getDate() + 7)
    const postsThisWeek = filteredEvents.filter(e => {
      if (e.type !== 'scheduled' && e.type !== 'published') return false
      const date = new Date(e.date)
      return date >= now && date <= weekLater
    }).length
    return [
      { title: 'Scheduled Posts', value: scheduledCount, icon: CalendarDays, iconColor: '#1E3A8A', iconBg: 'rgba(30,58,138,.12)' },
      { title: 'Published Posts', value: publishedCount, icon: Send, iconColor: '#22C55E', iconBg: 'rgba(34,197,94,.12)' },
      { title: 'Active Campaigns', value: activeCampaigns, icon: Megaphone, iconColor: '#7C3AED', iconBg: 'rgba(124,58,237,.12)' },
      { title: 'Posts This Week', value: postsThisWeek, icon: BarChart3, iconColor: '#F59E0B', iconBg: 'rgba(245,158,11,.12)' },
    ]
  }, [filteredEvents])

  const upcoming = useMemo(() => filteredEvents.filter(event => event.type === 'scheduled' || event.type === 'milestone').sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 4), [filteredEvents])
  const campaigns = useMemo(() => Array.from(new Set(baseEvents.filter(e => e.type === 'campaign').map(e => e.title))), [baseEvents])

  const resetFilters = () => {
    setSearch('')
    setPlatform('all')
    setEventType('all')
    setCampaign('all')
    setStatus('all')
    setStartDate('')
    setEndDate('')
    setSelected(null)
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Activity Calendar" subtitle="Read-only timeline of scheduled posts, published posts, campaigns and milestones." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map(card => (
          <StatCard key={card.title} title={card.title} value={card.value} icon={card.icon} iconColor={card.iconColor} iconBg={card.iconBg} index={0} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, campaign or platform" className="w-full h-10 pl-9 pr-4 text-sm rounded-[var(--r-md)] border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            </div>
            <div className="flex gap-1 p-1 rounded-[var(--r-md)]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {[['month','Monthly'],['week','Weekly'],['day','Daily']].map(([val,label]) => (
                <button key={val} onClick={() => setView(val)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: view === val ? 'var(--primary)' : 'transparent', color: view === val ? '#fff' : 'var(--text-muted)' }}>{label}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
            <div>
              <label className="text-[10px] font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>Event Type</label>
              <select value={eventType} onChange={e => setEventType(e.target.value)} className="w-full h-9 px-3 text-sm rounded-[var(--r-md)] border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                <option value="all">All</option>
                <option value="Scheduled Posts">Scheduled Posts</option>
                <option value="Published Posts">Published Posts</option>
                <option value="Campaigns">Campaigns</option>
                <option value="Milestones">Milestones</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full h-9 px-3 text-sm rounded-[var(--r-md)] border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                <option value="all">All Platforms</option>
                {Object.entries(PLATFORM_META).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>Campaign</label>
              <select value={campaign} onChange={e => setCampaign(e.target.value)} className="w-full h-9 px-3 text-sm rounded-[var(--r-md)] border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                <option value="all">All Campaigns</option>
                {campaigns.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full h-9 px-3 text-sm rounded-[var(--r-md)] border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="completed">Completed</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div>
              <label className="text-[10px] font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>From</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full h-9 px-3 text-sm rounded-[var(--r-md)] border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            </div>
            <div>
              <label className="text-[10px] font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>To</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full h-9 px-3 text-sm rounded-[var(--r-md)] border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>Today’s Activity</h2>
            <button onClick={resetFilters} className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--primary)' }}><RefreshCw size={12} /> Reset</button>
          </div>
          <div className="flex flex-col gap-2">
            {upcoming.length === 0 ? <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No upcoming items.</p> : upcoming.map(item => (
              <div key={item.id} className="rounded-[var(--r-md)] p-2.5" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{item.title}</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        {Object.entries(EVENT_META).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: meta.color }} />
            <span>{meta.label}</span>
          </div>
        ))}
      </div>

      {isLoading ? <LoadingSkeleton /> : filteredEvents.length === 0 ? <div className="card"><EmptyState icon={CalendarDays} title="No scheduled posts or campaigns available." message="Try adjusting your filters or refresh the calendar." action={{ label: 'Refresh', onClick: resetFilters }} /></div> : (
        <>
          <CalendarBody view={view} events={filteredEvents} onSelect={setSelected} selectedDate={selectedDate} setSelectedDate={setSelectedDate} month={month} setMonth={setMonth} year={year} setYear={setYear} />
          {selected && <EventDrawer event={selected} onClose={() => setSelected(null)} />}
        </>
      )}
    </div>
  )
}
