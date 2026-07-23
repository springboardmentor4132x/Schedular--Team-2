import React, { useState, useMemo, useEffect } from 'react'
import StatusBadge from '../components/ui/StatusBadge'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Layers, 
  Search, 
  Plus, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  X, 
  Edit3, 
  Trash2, 
  Copy, 
  CalendarRange, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Tag
} from 'lucide-react'

// ── Social Icons (Universal inline SVGs) ──
const InstagramIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const FacebookIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

const LinkedinIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)

const YoutubeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
)

const TwitterIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
  </svg>
)

const initialMockPosts = [
  { id: 1, title: 'Nike Zoom Infinity Review', platform: 'Instagram Reel', platformIcon: InstagramIcon, date: '2026-07-28', time: '16:30', campaign: 'Nike Summer Launch', status: 'Scheduled', caption: 'Putting the Zoom Infinity shoes through a premium road test! 👟 Comfort, visual style, and responsiveness are off the charts. #nike #zoom', tagList: ['Sneakers', 'Q3Campaign'], thumb: '👟' },
  { id: 2, title: 'Rise of Agentic AI in Engineering', platform: 'LinkedIn Article', platformIcon: LinkedinIcon, date: '2026-07-21', time: '10:00', campaign: 'None', status: 'Published', caption: 'How AI pair-programming assistants speed up web application cycles and refactor code safely.', tagList: ['AI', 'TechTrends'], thumb: '🤖' },
  { id: 3, title: 'Summer Footwear Highlights', platform: 'Facebook Carousel', platformIcon: FacebookIcon, date: '2026-07-27', time: '12:00', campaign: 'Nike Summer Launch', status: 'Draft', caption: 'Check out the leading footwear designs of this summer! Which one is your choice?', tagList: ['Fashion', 'SummerStyle'], thumb: '🌴' },
  { id: 4, title: 'Vite 6 Configuration Hack', platform: 'YouTube Short', platformIcon: YoutubeIcon, date: '2026-07-29', time: '09:00', campaign: 'None', status: 'Missed', caption: 'Configuring custom PostCSS scrollbar rules in Vite 6 under 60 seconds.', tagList: ['DevHacks', 'Vite'], thumb: '⚡' },
  { id: 5, title: '10 CSS Transition Tips', platform: 'Twitter Thread', platformIcon: TwitterIcon, date: '2026-07-25', time: '14:00', campaign: 'None', status: 'Cancelled', caption: 'Learn how to avoid layout shifts and trigger buttery transition easings on desktop sidebar expansion.', tagList: ['CSS', 'UXTips'], thumb: '✨' },
  { id: 6, title: 'Adidas Ultraboost 26 Review', platform: 'Instagram Reel', platformIcon: InstagramIcon, date: '2026-07-26', time: '18:00', campaign: 'Adidas Sports Week', status: 'Scheduled', caption: '🏃‍♂️ Putting the Adidas Ultraboost 26 to the daily test. Comfort, cushioning, and performance analyzed.', tagList: ['Adidas', 'Running'], thumb: '🏃‍♂️' }
]

// Calendar Utilities for July 2026
// July 1 2026 is a Wednesday. Total 31 Days.
// Grid starts: leading 3 days from June (28, 29, 30), then July (1-31), then leading August (1)
const calendarDaysJuly2026 = [
  { day: 28, month: 'June', isCurrentMonth: false, fullDate: '2026-06-28' },
  { day: 29, month: 'June', isCurrentMonth: false, fullDate: '2026-06-29' },
  { day: 30, month: 'June', isCurrentMonth: false, fullDate: '2026-06-30' },
  ...Array.from({ length: 31 }, (_, i) => {
    const d = i + 1
    const dayStr = d < 10 ? `0${d}` : `${d}`
    return { day: d, month: 'July', isCurrentMonth: true, fullDate: `2026-07-${dayStr}` }
  }),
  { day: 1, month: 'August', isCurrentMonth: false, fullDate: '2026-08-01' }
]

export default function PublishingCalendar() {
  const navigate = useNavigate()

  // State Management
  const [posts, setPosts] = useState(initialMockPosts)
  const [currentDate, setCurrentDate] = useState(new Date('2026-07-22')) // Locked date in July 2026
  const [viewTab, setViewTab] = useState('month') // month, week, day
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('All')
  const [campaignFilter, setCampaignFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedEvent, setSelectedEvent] = useState(null)
  
  // Reschedule Form Inline Drawer State
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')

  // Toast status
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Filtered posts logic
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || post.caption.toLowerCase().includes(search.toLowerCase())
      const matchesPlatform = platformFilter === 'All' || post.platform.includes(platformFilter)
      const matchesCampaign = campaignFilter === 'All' || post.campaign === campaignFilter
      const matchesStatus = statusFilter === 'All' || post.status === statusFilter
      return matchesSearch && matchesPlatform && matchesCampaign && matchesStatus
    })
  }, [posts, search, platformFilter, campaignFilter, statusFilter])

  // Event handlers
  const handleOpenEvent = (event) => {
    setSelectedEvent(event)
    setRescheduleDate(event.date)
    setRescheduleTime(event.time)
  }

  const handleReschedule = () => {
    if (!selectedEvent) return
    setPosts(prev => prev.map(p => {
      if (p.id === selectedEvent.id) {
        return { ...p, date: rescheduleDate, time: rescheduleTime }
      }
      return p
    }))
    setSelectedEvent(null)
    setToast('Post rescheduled successfully!')
  }

  const handleDelete = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id))
    setSelectedEvent(null)
    setToast('Post deleted successfully.')
  }

  const handleDuplicate = (post) => {
    const duplicated = {
      ...post,
      id: Date.now(),
      title: `${post.title} (Copy)`,
      date: '2026-07-29' // Duplicate to a generic date
    }
    setPosts(prev => [...prev, duplicated])
    setToast('Duplicated post draft created.')
  }

  const handleCreatePostSimulated = () => {
    const newPost = {
      id: Date.now(),
      title: 'Quick Content Draft',
      platform: 'Instagram Reel',
      platformIcon: InstagramIcon,
      date: '2026-07-28',
      time: '12:00',
      campaign: 'None',
      status: 'Draft',
      caption: 'Quick drafted update placeholder',
      tagList: ['QuickDraft'],
      thumb: '✍️'
    }
    setPosts(prev => [...prev, newPost])
    setToast('Quick draft added on July 28!')
  }

  // derive posts map by date for quick lookup in Month View
  const postsByDateMap = useMemo(() => {
    const map = {}
    filteredPosts.forEach(post => {
      if (!map[post.date]) map[post.date] = []
      map[post.date].push(post)
    })
    return map
  }, [filteredPosts])

  // upcoming post segments (Today=July 22, Tomorrow=July 23, This Week=Rest of July)
  const upcomingPosts = useMemo(() => {
    const today = '2026-07-22'
    const tomorrow = '2026-07-23'
    return {
      today: filteredPosts.filter(p => p.date === today),
      tomorrow: filteredPosts.filter(p => p.date === tomorrow),
      thisWeek: filteredPosts.filter(p => p.date !== today && p.date !== tomorrow)
    }
  }, [filteredPosts])

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in relative pb-12">
      
      {/* ── Page Header ── */}
      <section aria-label="Page header" className="card bg-gradient-to-r from-indigo-50/50 to-slate-50 dark:from-indigo-950/10 dark:to-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Publishing Calendar</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">Manage and visualize all scheduled content across platforms.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleCreatePostSimulated} className="btn-primary shadow-sm hover:scale-[1.02] active:scale-95 transition-all">
              <Plus size={16} />
              <span>Create Post</span>
            </button>
            <div className="flex bg-slate-100 dark:bg-slate-750 p-1 rounded-xl">
              <button 
                onClick={() => setViewTab('month')} 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewTab === 'month' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-750'}`}
              >
                Month
              </button>
              <button 
                onClick={() => setViewTab('week')} 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewTab === 'week' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-750'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setViewTab('day')} 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewTab === 'day' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-750'}`}
              >
                Day
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters Bar ── */}
      <section aria-label="Filters bar" className="card py-4 space-y-4 shadow-card">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search scheduled posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-205 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Filters Selects */}
          <div className="flex flex-wrap gap-2">
            <select 
              value={platformFilter} 
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-400"
            >
              <option value="All">All Platforms</option>
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Facebook">Facebook</option>
              <option value="YouTube">YouTube</option>
              <option value="Twitter">Twitter/X</option>
            </select>

            <select 
              value={campaignFilter} 
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-400"
            >
              <option value="All">All Campaigns</option>
              <option value="Nike Summer Launch">Nike Summer Launch</option>
              <option value="Adidas Sports Week">Adidas Sports Week</option>
              <option value="None">No Campaign</option>
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-400"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Missed">Missed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Legend Indicator */}
        <div className="flex flex-wrap gap-3.5 items-center text-[10px] font-bold text-slate-450 border-t border-slate-100 dark:border-slate-700/60 pt-3">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Draft</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Scheduled</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Published</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Missed</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Cancelled</span>
        </div>
      </section>

      {/* ── Main Layout: Calendar + Upcoming Schedule widget ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Interactive Calendar grid */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Calendar Container */}
          <div className="card shadow-card">
            
            {/* Calendar Grid Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">July 2026</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full border border-indigo-200/20">
                  Sprint 3 Locked
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700" title="Previous Month">
                  <ChevronLeft size={16} />
                </button>
                <button className="text-xs font-bold px-3 py-1.5 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                  Today
                </button>
                <button className="p-1.5 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700" title="Next Month">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Month View Grid */}
            {viewTab === 'month' && (
              <div className="space-y-1">
                {/* Day labels */}
                <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-1.5">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                {/* Day slots grid */}
                <div className="grid grid-cols-7 gap-1 border-t border-l border-slate-150 dark:border-slate-700/50">
                  {calendarDaysJuly2026.map((dayItem, i) => {
                    const isToday = dayItem.fullDate === '2026-07-22'
                    const dayPosts = postsByDateMap[dayItem.fullDate] || []
                    
                    return (
                      <div
                        key={i}
                        className={`
                          min-h-[90px] p-2 border-r border-b border-slate-150 dark:border-slate-700/50 transition-all flex flex-col justify-between
                          ${dayItem.isCurrentMonth ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-850/40 opacity-40'}
                          ${isToday ? 'ring-2 ring-indigo-500 ring-inset dark:ring-indigo-400' : ''}
                        `}
                      >
                        {/* Day number header */}
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                            {dayItem.day}
                          </span>
                          {isToday && (
                            <span className="text-[8px] bg-indigo-500 text-white font-extrabold px-1 rounded">TODAY</span>
                          )}
                        </div>

                        {/* Scheduled post list inside slot */}
                        <div className="space-y-1.5 mt-1 flex-1 overflow-y-auto max-h-[64px] scrollbar-none">
                          {dayPosts.map(post => {
                            const PlatformIcon = post.platformIcon
                            return (
                              <button
                                key={post.id}
                                onClick={() => handleOpenEvent(post)}
                                className={`
                                  w-full text-[9px] font-bold p-1 rounded text-left flex items-center gap-1 border border-transparent hover:scale-105 transition-all
                                  ${post.status === 'Draft' ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-350' :
                                    post.status === 'Scheduled' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-200/20' :
                                    post.status === 'Published' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' :
                                    post.status === 'Missed' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-750 dark:text-rose-405' :
                                    'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                  }
                                `}
                              >
                                <PlatformIcon size={10} className="flex-shrink-0" />
                                <span className="truncate flex-1 pr-1">{post.title}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Week View Grid */}
            {viewTab === 'week' && (
              <div className="space-y-2">
                <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-1 border-b dark:border-slate-750">
                  {['Sun 26', 'Mon 27', 'Tue 28', 'Wed 29', 'Thu 30', 'Fri 31', 'Sat 1'].map(w => (
                    <div key={w} className="py-2">{w}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 min-h-[220px]">
                  {['2026-07-26', '2026-07-27', '2026-07-28', '2026-07-29', '2026-07-30', '2026-07-31', '2026-08-01'].map((dateStr, i) => {
                    const dayPosts = postsByDateMap[dateStr] || []
                    return (
                      <div key={i} className="p-2 border rounded-xl bg-slate-50/50 dark:bg-slate-850/30 flex flex-col space-y-2">
                        {dayPosts.map(post => {
                          const PlatformIcon = post.platformIcon
                          return (
                            <div 
                              key={post.id} 
                              onClick={() => handleOpenEvent(post)}
                              className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-105 dark:border-slate-700/60 hover:shadow-sm cursor-pointer space-y-1.5"
                            >
                              <div className="flex justify-between items-center">
                                <PlatformIcon size={12} className="text-indigo-500" />
                                <span className="text-[8px] text-slate-400 font-bold">{post.time}</span>
                              </div>
                              <h4 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{post.title}</h4>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Day View Grid */}
            {viewTab === 'day' && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Wednesday, July 22, 2026</h3>
                </div>
                <div className="space-y-3.5 max-w-lg">
                  {postsByDateMap['2026-07-22']?.length > 0 ? (
                    postsByDateMap['2026-07-22'].map(post => {
                      const PlatformIcon = post.platformIcon
                      return (
                        <div 
                          key={post.id}
                          onClick={() => handleOpenEvent(post)}
                          className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/40 border rounded-2xl cursor-pointer hover:border-indigo-500/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{post.thumb}</span>
                            <div>
                              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{post.title}</h4>
                              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <PlatformIcon size={12} />
                                <span>{post.platform} · {post.time}</span>
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={post.status} dot />
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      <AlertCircle size={24} className="mx-auto text-slate-400 mb-2" />
                      No items scheduled for today.
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Upcoming Schedule Panel widget */}
        <div className="space-y-6">
          
          <div className="card space-y-4 shadow-card">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700/60 pb-3 flex items-center gap-2">
              <CalendarIcon size={16} className="text-indigo-500" />
              Upcoming Schedule
            </h2>

            {/* Today's segment */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Today (July 22)</h3>
              {upcomingPosts.today.length > 0 ? (
                upcomingPosts.today.map(post => {
                  const PlatformIcon = post.platformIcon
                  return (
                    <div 
                      key={post.id}
                      onClick={() => handleOpenEvent(post)}
                      className="p-3 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-105 dark:border-slate-700/50 rounded-xl hover:shadow-sm cursor-pointer flex justify-between items-center"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{post.title}</h4>
                        <span className="text-[9px] text-slate-450 flex items-center gap-1.5 mt-0.5">
                          <PlatformIcon size={10} />
                          {post.time}
                        </span>
                      </div>
                      <StatusBadge status={post.status} />
                    </div>
                  )
                })
              ) : (
                <p className="text-[10px] text-slate-400 italic">No posts for today.</p>
              )}
            </div>

            {/* Tomorrow's segment */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Tomorrow (July 23)</h3>
              {upcomingPosts.tomorrow.length > 0 ? (
                upcomingPosts.tomorrow.map(post => {
                  const PlatformIcon = post.platformIcon
                  return (
                    <div 
                      key={post.id}
                      onClick={() => handleOpenEvent(post)}
                      className="p-3 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-105 dark:border-slate-700/50 rounded-xl hover:shadow-sm cursor-pointer flex justify-between items-center"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{post.title}</h4>
                        <span className="text-[9px] text-slate-455 flex items-center gap-1.5 mt-0.5">
                          <PlatformIcon size={10} />
                          {post.time}
                        </span>
                      </div>
                      <StatusBadge status={post.status} />
                    </div>
                  )
                })
              ) : (
                <p className="text-[10px] text-slate-400 italic">No posts for tomorrow.</p>
              )}
            </div>

            {/* Rest of this week */}
            <div className="space-y-2 pt-2 border-t dark:border-slate-750">
              <h3 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Later This Week</h3>
              <div className="space-y-2">
                {upcomingPosts.thisWeek.slice(0, 3).map(post => {
                  const PlatformIcon = post.platformIcon
                  return (
                    <div 
                      key={post.id}
                      onClick={() => handleOpenEvent(post)}
                      className="p-3 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-105 dark:border-slate-700/50 rounded-xl hover:shadow-sm cursor-pointer flex justify-between items-center animate-fade-in"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{post.title}</h4>
                        <span className="text-[9px] text-slate-455 flex items-center gap-1.5 mt-0.5">
                          <PlatformIcon size={10} />
                          {post.date} · {post.time}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── Slide Drawer: Event Details ── */}
      {selectedEvent && (
        <>
          {/* Backdrop overlay */}
          <div 
            onClick={() => setSelectedEvent(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          />

          {/* Drawer container */}
          <aside className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white dark:bg-slate-800 shadow-2xl z-50 border-l border-slate-100 dark:border-slate-700/60 p-6 space-y-6 overflow-y-auto flex flex-col justify-between animate-slide-in">
            <div className="space-y-5">
              
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedEvent.thumb}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedEvent.platform}</h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Post Info Drawer</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Status Badge & Campaign */}
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selectedEvent.status} dot />
                <span className="badge badge-default">
                  Campaign: {selectedEvent.campaign}
                </span>
              </div>

              {/* Title & Caption */}
              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">{selectedEvent.title}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-750 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60 font-medium">
                  {selectedEvent.caption}
                </p>
              </div>

              {/* Media Preview mock (Sneakers or generic box) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Media Content Preview</label>
                <div className="aspect-video w-full rounded-2xl bg-slate-100 dark:bg-slate-750 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700">
                  {selectedEvent.platform.includes('Instagram') || selectedEvent.platform.includes('Facebook') ? (
                    <div className="flex flex-col items-center justify-center p-4">
                      <span className="text-4xl mb-1">{selectedEvent.thumb}</span>
                      <span className="text-[9px] text-slate-500">sneaker_product_shot.png</span>
                    </div>
                  ) : (
                    <span className="text-xs">No media attachment configured</span>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase flex items-center gap-1">
                  <Tag size={10} /> Assigned Tags
                </label>
                <div className="flex flex-wrap gap-1">
                  {selectedEvent.tagList.map(tag => (
                    <span key={tag} className="text-[9px] font-bold px-2 py-0.5 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reschedule inline editor */}
              <div className="space-y-2 pt-2 border-t dark:border-slate-700">
                <label className="text-[10px] font-bold text-slate-450 uppercase flex items-center gap-1">
                  <Clock size={10} /> Reschedule Event
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="p-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border border-slate-205 dark:border-slate-600 rounded-xl"
                  />
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="p-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border border-slate-205 dark:border-slate-600 rounded-xl"
                  />
                </div>
                <button
                  onClick={handleReschedule}
                  className="btn-primary w-full text-xs py-2 px-3 mt-1 shadow-sm font-bold flex justify-center"
                >
                  Apply Reschedule
                </button>
              </div>

            </div>

            {/* Bottom Actions inside drawer */}
            <div className="flex items-center gap-2 border-t dark:border-slate-700 pt-4">
              <button 
                onClick={() => handleDuplicate(selectedEvent)}
                className="btn-ghost flex-1 py-2 px-3 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-sm justify-center"
              >
                <Copy size={12} />
                <span>Duplicate</span>
              </button>
              <button 
                onClick={() => handleDelete(selectedEvent.id)}
                className="btn-ghost flex-1 py-2 px-3 border border-rose-200 hover:bg-rose-950/20 text-rose-500 text-xs font-bold justify-center"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            </div>

          </aside>
        </>
      )}

      {/* Simulated toast at the bottom right */}
      {toast && (
        <div className="fixed bottom-10 right-5 bg-slate-900 dark:bg-slate-105 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 text-sm font-semibold transition-all duration-300 animate-slide-in">
          <span>{toast}</span>
          <button onClick={() => setToast('')} className="text-xs font-bold opacity-80 hover:opacity-100 ml-2">✕</button>
        </div>
      )}

    </div>
  )
}
