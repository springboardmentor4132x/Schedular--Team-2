import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import { deletePost, updatePost, createPost } from '../../../services/postService'
import { loadMappedPosts } from '../../../services/postAdapter'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Trash2, 
  Copy, 
  AlertCircle,
  Tag
} from 'lucide-react'

function buildCalendarDays(year, month) {
  const firstDay = new Date(Date.UTC(year, month - 1, 1))
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getDate()
  const leading = (firstDay.getUTCDay() + 6) % 7

  const days = []
  for (let i = leading - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(year, month - 1, 0 - i))
    days.push({ day: d.getUTCDate(), month: d.toLocaleString('en', { month: 'long' }), isCurrentMonth: false, fullDate: d.toISOString().slice(0, 10) })
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    const dayStr = d < 10 ? `0${d}` : `${d}`
    const monthStr = month < 10 ? `0${month}` : `${month}`
    days.push({ day: d, month: new Date(year, month - 1, d).toLocaleString('en', { month: 'long' }), isCurrentMonth: true, fullDate: `${year}-${monthStr}-${dayStr}` })
  }
  const remaining = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remaining; i += 1) {
    const d = new Date(Date.UTC(year, month, i))
    days.push({ day: d.getUTCDate(), month: d.toLocaleString('en', { month: 'long' }), isCurrentMonth: false, fullDate: d.toISOString().slice(0, 10) })
  }
  return days
}

function todayISO() {
  const now = new Date()
  const m = now.getMonth() + 1
  const d = now.getDate()
  return `${now.getFullYear()}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`
}

export default function PublishingCalendar() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewTab, setViewTab] = useState('month')
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('All')
  const [campaignFilter, setCampaignFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedEvent, setSelectedEvent] = useState(null)

  const today = todayISO()
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const calendarDays = buildCalendarDays(currentYear, currentMonth)
  const monthLabel = now.toLocaleString('en', { month: 'long', year: 'numeric' })

  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  useEffect(() => {
    let mounted = true
    loadMappedPosts()
      .then((mapped) => {
        if (mounted) setPosts(mapped)
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || post.caption.toLowerCase().includes(search.toLowerCase())
      const matchesPlatform = platformFilter === 'All' || post.platform.includes(platformFilter)
      const matchesCampaign = campaignFilter === 'All' || post.campaign === campaignFilter
      const matchesStatus = statusFilter === 'All' || post.status === statusFilter
      return matchesSearch && matchesPlatform && matchesCampaign && matchesStatus
    })
  }, [posts, search, platformFilter, campaignFilter, statusFilter])

  const campaignOptions = useMemo(() => {
    const values = new Set(posts.map((p) => p.campaign).filter(Boolean))
    return ['All', ...values]
  }, [posts])

  const handleOpenEvent = (event) => {
    setSelectedEvent(event)
    setRescheduleDate(event.date)
    setRescheduleTime(event.clock || event.time || '')
  }

  const handleReschedule = async () => {
    if (!selectedEvent) return
    try {
      const scheduledFor = `${rescheduleDate}T${rescheduleTime || '00:00'}:00`
      await updatePost(selectedEvent.id, { scheduled_for: scheduledFor })
      setPosts(prev => prev.map(p => {
        if (p.id === selectedEvent.id) {
          return { ...p, date: rescheduleDate, time: rescheduleTime }
        }
        return p
      }))
      setSelectedEvent(null)
      setToast('Post rescheduled successfully!')
    } catch {
      setToast('Failed to reschedule post.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deletePost(id)
      setPosts(prev => prev.filter(p => p.id !== id))
      setSelectedEvent(null)
      setToast('Post deleted successfully.')
    } catch {
      setToast('Failed to delete post.')
    }
  }

  const handleDuplicate = async (post) => {
    try {
      const created = await createPost({
        title: `${post.title} (Copy)`,
        caption: post.caption,
        content_type: 'text',
        status: 'Draft',
      })
      const duplicated = {
        ...post,
        id: created.id,
        title: `${post.title} (Copy)`,
        date: today,
      }
      setPosts(prev => [...prev, duplicated])
      setToast('Duplicated post draft created.')
    } catch {
      setToast('Failed to duplicate post.')
    }
  }

  const handleCreatePostSimulated = () => {
    navigate('/dashboard/creator/content-scheduling')
  }

  const postsByDateMap = useMemo(() => {
    const map = {}
    filteredPosts.forEach(post => {
      if (!map[post.date]) map[post.date] = []
      map[post.date].push(post)
    })
    return map
  }, [filteredPosts])

  const upcomingPosts = useMemo(() => {
    const tomorrowDate = new Date()
    tomorrowDate.setDate(tomorrowDate.getDate() + 1)
    const tomorrowISO = `${tomorrowDate.getFullYear()}-${(tomorrowDate.getMonth() + 1) < 10 ? '0' + (tomorrowDate.getMonth() + 1) : tomorrowDate.getMonth() + 1}-${tomorrowDate.getDate() < 10 ? '0' + tomorrowDate.getDate() : tomorrowDate.getDate()}`
    return {
      today: filteredPosts.filter(p => p.date === today),
      tomorrow: filteredPosts.filter(p => p.date === tomorrowISO),
      thisWeek: filteredPosts.filter(p => p.date !== today && p.date !== tomorrowISO)
    }
  }, [filteredPosts, today])

  const weekDays = useMemo(() => {
    const start = new Date()
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return {
        iso: `${d.getFullYear()}-${(d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1}-${d.getDate() < 10 ? '0' + d.getDate() : d.getDate()}`,
        label: d.toLocaleString('en', { weekday: 'short', day: 'numeric' }),
      }
    })
  }, [])

  const todayLabel = new Date().toLocaleString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in relative pb-12">
      
      <section aria-label="Page header" className="card p-5 sm:p-6 bg-gradient-to-r from-indigo-50/50 to-slate-50 dark:from-indigo-950/10 dark:to-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Publishing Calendar</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">Manage and visualize all scheduled content across platforms.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleCreatePostSimulated} className="btn btn-primary btn-md">
              <Plus size={16} />
              <span>Create Post</span>
            </button>
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
              <button 
                onClick={() => setViewTab('month')} 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewTab === 'month' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
              >
                Month
              </button>
              <button 
                onClick={() => setViewTab('week')} 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewTab === 'week' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setViewTab('day')} 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewTab === 'day' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
              >
                Day
              </button>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Filters bar" className="card px-5 sm:px-6 py-4 space-y-4 shadow-card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search scheduled posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white"
            />
          </div>

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
              {campaignOptions.map((option) => (
                <option key={option} value={option}>{option === 'All' ? 'All Campaigns' : option}</option>
              ))}
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-400"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Queued">Queued</option>
              <option value="Published">Published</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3.5 items-center text-[10px] font-bold text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-3">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Draft</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Scheduled / Queued</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Published</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Failed</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Cancelled</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        <div className="lg:col-span-3 space-y-4">
          
          <div className="card p-5 shadow-card">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">{monthLabel}</span>
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

            {viewTab === 'month' && (
              <div className="space-y-1">
                {loading && posts.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-2"><span className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>Loading scheduled posts...</span>
                  </div>
                )}
                <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-1.5">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 border-t border-l border-slate-100 dark:border-slate-700/50">
                  {calendarDays.map((dayItem, i) => {
                    const isToday = dayItem.fullDate === today
                    const dayPosts = postsByDateMap[dayItem.fullDate] || []
                    
                    return (
                      <div
                        key={i}
                        className={`
                          min-h-[90px] p-2 border-r border-b border-slate-100 dark:border-slate-700/50 transition-all flex flex-col justify-between
                          ${dayItem.isCurrentMonth ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/40 opacity-40'}
                          ${isToday ? 'ring-2 ring-indigo-500 ring-inset dark:ring-indigo-400' : ''}
                        `}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                            {dayItem.day}
                          </span>
                          {isToday && (
                            <span className="text-[8px] bg-indigo-500 text-white font-extrabold px-1 rounded">TODAY</span>
                          )}
                        </div>

                        <div className="space-y-1.5 mt-1 flex-1 overflow-y-auto max-h-[64px] scrollbar-none">
                          {dayPosts.map(post => {
                            const PlatformIcon = post.platformIcon
                            return (
                              <button
                                key={post.id}
                                onClick={() => handleOpenEvent(post)}
                                className={`
                                  w-full text-[9px] font-bold p-1 rounded text-left flex items-center gap-1 border border-transparent hover:scale-105 transition-all
                                  ${post.status === 'Draft' ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' :
                                    ['Scheduled', 'Queued'].includes(post.status) ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400' :
                                    post.status === 'Published' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' :
                                    post.status === 'Failed' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400' :
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

            {viewTab === 'week' && (
              <div className="space-y-2">
                <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-1 border-b dark:border-slate-700">
                  {weekDays.map(w => (
                    <div key={w.iso} className="py-2">{w.label}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 min-h-[220px]">
                  {weekDays.map(dayItem => {
                    const dayPosts = postsByDateMap[dayItem.iso] || []
                    return (
                      <div key={dayItem.iso} className="p-2 border rounded-xl bg-slate-50/50 dark:bg-slate-800/30 flex flex-col space-y-2">
                        {dayPosts.map(post => {
                          const PlatformIcon = post.platformIcon
                          return (
                            <div 
                              key={post.id} 
                              onClick={() => handleOpenEvent(post)}
                              className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/60 hover:shadow-sm cursor-pointer space-y-1.5"
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

            {viewTab === 'day' && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{todayLabel}</h3>
                </div>
                <div className="space-y-3.5 max-w-lg">
                  {postsByDateMap[today]?.length > 0 ? (
                    postsByDateMap[today].map(post => {
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

        <div className="space-y-6">
          <div className="card p-5 space-y-4 shadow-card">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700/60 pb-3 flex items-center gap-2">
              <CalendarIcon size={16} className="text-indigo-500" />
              Upcoming Schedule
            </h2>

            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today</h3>
              {upcomingPosts.today.length > 0 ? (
                upcomingPosts.today.map(post => {
                  const PlatformIcon = post.platformIcon
                  return (
                    <div 
                      key={post.id}
                      onClick={() => handleOpenEvent(post)}
                      className="p-3 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-xl hover:shadow-sm cursor-pointer flex justify-between items-center"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{post.title}</h4>
                        <span className="text-[9px] text-slate-400 flex items-center gap-1.5 mt-0.5">
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

            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tomorrow</h3>
              {upcomingPosts.tomorrow.length > 0 ? (
                upcomingPosts.tomorrow.map(post => {
                  const PlatformIcon = post.platformIcon
                  return (
                    <div 
                      key={post.id}
                      onClick={() => handleOpenEvent(post)}
                      className="p-3 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-xl hover:shadow-sm cursor-pointer flex justify-between items-center"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{post.title}</h4>
                        <span className="text-[9px] text-slate-400 flex items-center gap-1.5 mt-0.5">
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

            <div className="space-y-2 pt-2 border-t dark:border-slate-700">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Later This Week</h3>
              <div className="space-y-2">
                {upcomingPosts.thisWeek.slice(0, 3).map(post => {
                  const PlatformIcon = post.platformIcon
                  return (
                    <div 
                      key={post.id}
                      onClick={() => handleOpenEvent(post)}
                      className="p-3 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-xl hover:shadow-sm cursor-pointer flex justify-between items-center animate-fade-in"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{post.title}</h4>
                        <span className="text-[9px] text-slate-400 flex items-center gap-1.5 mt-0.5">
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

      {selectedEvent && (
        <>
          <div 
            onClick={() => setSelectedEvent(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          />

          <aside className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white dark:bg-slate-800 shadow-2xl z-50 border-l border-slate-100 dark:border-slate-700/60 p-6 space-y-6 overflow-y-auto flex flex-col justify-between animate-slide-in">
            <div className="space-y-5">
              
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

              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selectedEvent.status} dot />
                <span className="badge badge-default">
                  Campaign: {selectedEvent.campaign}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">{selectedEvent.title}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-700/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60 font-medium">
                  {selectedEvent.caption}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Media Content Preview</label>
                <div className="aspect-video w-full rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700">
                  {selectedEvent.platform.includes('Instagram') || selectedEvent.platform.includes('Facebook') ? (
                    <div className="flex flex-col items-center justify-center p-4">
                      <span className="text-4xl mb-1">{selectedEvent.thumb}</span>
                      <span className="text-[9px] text-slate-500">Media preview placeholder</span>
                    </div>
                  ) : (
                    <span className="text-xs">No media attachment configured</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Tag size={10} /> Assigned Tags
                </label>
                <div className="flex flex-wrap gap-1">
                  {(selectedEvent.tagList || []).map(tag => (
                    <span key={tag} className="text-[9px] font-bold px-2 py-0.5 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t dark:border-slate-700">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Clock size={10} /> Reschedule Event
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="p-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl"
                  />
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="p-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl"
                  />
                </div>
                <button
                  onClick={handleReschedule}
                  className="btn btn-primary btn-sm w-full mt-1"
                >
                  Apply Reschedule
                </button>
              </div>

            </div>

            <div className="flex items-center gap-2 border-t dark:border-slate-700 pt-4">
              <button 
                onClick={() => handleDuplicate(selectedEvent)}
                className="btn btn-outline btn-sm flex-1"
              >
                <Copy size={12} />
                <span>Duplicate</span>
              </button>
              <button 
                onClick={() => handleDelete(selectedEvent.id)}
                className="btn btn-sm flex-1 border border-rose-200 dark:border-rose-900 bg-transparent text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            </div>

          </aside>
        </>
      )}

      {toast && (
        <div className="fixed bottom-10 right-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 text-sm font-semibold transition-all duration-300 animate-slide-in">
          <span>{toast}</span>
          <button onClick={() => setToast('')} className="text-xs font-bold opacity-80 hover:opacity-100 ml-2">✕</button>
        </div>
      )}

    </div>
  )
}
