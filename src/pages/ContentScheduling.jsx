import React, { useState, useEffect, useMemo } from 'react'
import StatusBadge from '../components/ui/StatusBadge'
import { useNavigate } from 'react-router-dom'
import { 
  Save, 
  Calendar, 
  Clock, 
  Globe, 
  CheckSquare, 
  Award, 
  Sparkles, 
  HelpCircle, 
  Image as ImageIcon, 
  Film, 
  Layers,
  MapPin, 
  AtSign, 
  Smile, 
  X, 
  AlertCircle, 
  ArrowLeft,
  ChevronRight,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Eye,
  CheckCircle,
  XCircle,
  Play,
  RotateCw,
  Search,
  Sliders,
  TrendingUp,
  Database
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

const TwitterIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
  </svg>
)

const PinterestIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
    <circle cx="12" cy="12" r="5" />
  </svg>
)

const YoutubeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
)

const platformList = [
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/20' },
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
  { id: 'linkedin', name: 'LinkedIn', icon: LinkedinIcon, color: 'text-sky-700 bg-sky-50 dark:bg-sky-950/20' },
  { id: 'twitter', name: 'X / Twitter', icon: TwitterIcon, color: 'text-slate-800 bg-slate-100 dark:bg-slate-800 dark:text-slate-200' },
  { id: 'pinterest', name: 'Pinterest', icon: PinterestIcon, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20' },
  { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, color: 'text-red-600 bg-red-50 dark:bg-red-950/20' }
]

const campaignOptions = ['Nike Summer Launch', 'Adidas Sports Week', 'Apple Event Promotion', 'OrbitSocial Promotion']

const hashtagSuggestions = ['#marketing', '#socialmedia', '#contentcreator', '#orbitsocial', '#growthhacks']

// Initial Queue List Mock Data
const initialQueue = [
  { id: 1, title: 'Nike Zoom Infinity Review', platform: 'Instagram Reel', platformIcon: InstagramIcon, campaign: 'Nike Summer Launch', priority: 'High', date: '2026-07-28', time: '16:30', status: 'Scheduled', thumb: '👟' },
  { id: 2, title: 'Rise of Agentic AI in Frontend', platform: 'LinkedIn Article', platformIcon: LinkedinIcon, campaign: 'None', priority: 'Medium', date: '2026-07-29', time: '10:00', status: 'Queued', thumb: '🤖' },
  { id: 3, title: 'Adidas Ultraboost 26 Launch', platform: 'Facebook Carousel', platformIcon: FacebookIcon, campaign: 'Adidas Sports Week', priority: 'Low', date: '2026-07-30', time: '12:00', status: 'Scheduled', thumb: '🏃‍♂️' },
  { id: 4, title: 'Vite 6 Configuration Tips', platform: 'YouTube Short', platformIcon: YoutubeIcon, campaign: 'None', priority: 'High', date: '2026-07-28', time: '09:00', status: 'Failed', thumb: '⚡' },
  { id: 5, title: '10 High Performance CSS Tips', platform: 'Twitter Thread', platformIcon: TwitterIcon, campaign: 'None', priority: 'Medium', date: '2026-07-27', time: '14:00', status: 'Cancelled', thumb: '✨' }
]

export default function ContentScheduling() {
  const navigate = useNavigate()

  // ── Top Level Workspace Tab ──
  const [workspaceTab, setWorkspaceTab] = useState('composer') // composer vs queue

  // ── Composer Workspace States (Sprint 2 + Recurrence) ──
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram'])
  const [caption, setCaption] = useState('Kickstart your brand campaign with a fresh perspective! 🚀 We are matching clean assets with premium SaaS design guidelines.')
  const [mediaList, setMediaList] = useState([])
  const [uploadProgress, setUploadProgress] = useState(null)
  const [location, setLocation] = useState('')
  
  // Recurrence & Date Details
  const [scheduleDate, setScheduleDate] = useState('2026-07-28')
  const [scheduleTime, setScheduleTime] = useState('16:30')
  const [timezone, setTimezone] = useState('GMT-4 (EST)')
  const [publishImmediately, setPublishImmediately] = useState(false)
  const [recurrence, setRecurrence] = useState('Never')
  const [campaign, setCampaign] = useState('Nike Summer Launch')
  const [previewTab, setPreviewTab] = useState('instagram')

  // Sprint 4: Advanced Recurrence selectors
  const [recStartDate, setRecStartDate] = useState('2026-07-28')
  const [recEndDate, setRecEndDate] = useState('2026-09-30')
  const [occurrences, setOccurrences] = useState(10)
  const [selectedWeekdays, setSelectedWeekdays] = useState(['Mon', 'Wed'])
  const [monthlyOption, setMonthlyOption] = useState('Same date each month')

  // ── Queue & Monitor Workspace States (Sprint 4) ──
  const [queueList, setQueueList] = useState(initialQueue)
  const [searchQuery, setSearchQuery] = useState('')
  const [qPlatformFilter, setQPlatformFilter] = useState('All')
  const [qCampaignFilter, setQCampaignFilter] = useState('All')
  const [qPriorityFilter, setQPriorityFilter] = useState('All')
  
  // Publishing timeline simulation states
  const [activePublishingItem, setActivePublishingItem] = useState(null)
  const [timelineStep, setTimelineStep] = useState(0) // 0: Scheduled, 1: Queued, 2: Publishing, 3: Published, 4: Completed
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Recurrence Preview derivation
  const recurrencePreviewText = useMemo(() => {
    if (recurrence === 'Never') return 'Repeat Once'
    if (recurrence === 'Daily') return `Daily recurrence starting ${recStartDate} until ${recEndDate}`
    if (recurrence === 'Weekly') return `Weekly on ${selectedWeekdays.join(', ')} (Start: ${recStartDate}, Occurrences: ${occurrences})`
    if (recurrence === 'Monthly') return `Monthly on ${monthlyOption} (Start: ${recStartDate})`
    return 'Custom schedule'
  }, [recurrence, recStartDate, recEndDate, occurrences, selectedWeekdays, monthlyOption])

  // simulated upload
  const handleSimulatedUpload = () => {
    setUploadProgress(10)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setMediaList([{ id: Date.now(), url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', emoji: '👟' }])
          setToast('Sneaker shot asset uploaded successfully!')
          return null
        }
        return prev + 30
      })
    }, 150)
  }

  const handleWeekdayToggle = (day) => {
    setSelectedWeekdays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  // ── Queue Methods ──
  const handleMoveUp = (index) => {
    if (index === 0) return
    setQueueList(prev => {
      const updated = [...prev]
      const temp = updated[index]
      updated[index] = updated[index - 1]
      updated[index - 1] = temp
      return updated
    })
    setToast('Queue priority shifted up.')
  }

  const handleMoveDown = (index) => {
    if (index === queueList.length - 1) return
    setQueueList(prev => {
      const updated = [...prev]
      const temp = updated[index]
      updated[index] = updated[index + 1]
      updated[index + 1] = temp
      return updated
    })
    setToast('Queue priority shifted down.')
  }

  const handleDuplicate = (post) => {
    setQueueList(prev => [
      ...prev,
      { ...post, id: Date.now(), title: `${post.title} (Copy)`, date: '2026-07-29' }
    ])
    setToast('Queue post duplicated.')
  }

  const handleDelete = (id) => {
    setQueueList(prev => prev.filter(p => p.id !== id))
    setToast('Post removed from scheduling queue.')
  }

  // Live Publishing Timeline Simulation
  const handlePublishNowSimulated = (post) => {
    setActivePublishingItem(post)
    setTimelineStep(0) // Start at Scheduled
    setToast(`Publishing pipeline initialized for: ${post.title}`)
    
    // Step transitions
    setTimeout(() => setTimelineStep(1), 500)   // -> Queued
    setTimeout(() => setTimelineStep(2), 1000)  // -> Publishing
    setTimeout(() => setTimelineStep(3), 1600)  // -> Published
    setTimeout(() => {
      setTimelineStep(4)  // -> Completed
      // update queue state
      setQueueList(prev => prev.map(p => {
        if (p.id === post.id) return { ...p, status: 'Published' }
        return p
      }))
      setToast(`Completed! ${post.title} is now Live.`)
    }, 2200)
  }

  // Derived Analytics stats
  const analytics = useMemo(() => {
    return {
      waiting: queueList.filter(p => p.status === 'Queued').length,
      today: queueList.filter(p => p.date === '2026-07-28').length,
      failed: queueList.filter(p => p.status === 'Failed').length,
      recurring: recurrence !== 'Never' ? 1 : 0
    }
  }, [queueList, recurrence])

  // Filtered Queue items
  const filteredQueue = useMemo(() => {
    return queueList.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPlatform = qPlatformFilter === 'All' || post.platform.includes(qPlatformFilter)
      const matchesCampaign = qCampaignFilter === 'All' || post.campaign === qCampaignFilter
      const matchesPriority = qPriorityFilter === 'All' || post.priority === qPriorityFilter
      return matchesSearch && matchesPlatform && matchesCampaign && matchesPriority
    })
  }, [queueList, searchQuery, qPlatformFilter, qCampaignFilter, qPriorityFilter])

  // Checklist updates
  const checklist = useMemo(() => {
    return {
      media: mediaList.length > 0,
      caption: caption.trim().length > 0,
      platform: selectedPlatforms.length > 0,
      schedule: publishImmediately || (scheduleDate && scheduleTime),
      campaign: campaign !== 'None'
    }
  }, [mediaList, caption, selectedPlatforms, publishImmediately, scheduleDate, scheduleTime, campaign])

  const scores = useMemo(() => {
    return {
      readability: caption.length > 40 ? 95 : 30,
      length: caption.length > 200 ? 65 : 90,
      hashtags: caption.includes('#') ? 80 : 20,
      media: mediaList.length > 0 ? 100 : 10
    }
  }, [caption, mediaList])

  const charCount = caption.length
  const wordCount = caption.split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-20">
      
      {/* ── Tabs Selector Workspace Header ── */}
      <section className="card bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/60 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {workspaceTab === 'composer' ? 'Content Composer Workspace' : 'Queue & Publishing Monitor'}
          </h1>
          <p className="text-slate-655 dark:text-slate-400 mt-0.5 text-xs font-semibold">
            {workspaceTab === 'composer' 
              ? 'Draft updates, setup recurrence schedules, and preview post designs.' 
              : 'Monitor scheduling timelines, adjust queue priorities, and trigger mock publishing flows.'
            }
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-750 p-1 rounded-xl">
          <button 
            onClick={() => setWorkspaceTab('composer')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${workspaceTab === 'composer' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-750'}`}
          >
            Composer
          </button>
          <button 
            onClick={() => setWorkspaceTab('queue')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${workspaceTab === 'queue' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-750'}`}
          >
            Queue & Monitor
          </button>
        </div>
      </section>

      {/* ── Composer tab active ── */}
      {workspaceTab === 'composer' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Composer left panels */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Social platform selections */}
            <div className="card space-y-4 shadow-card">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700/60 pb-3 flex items-center gap-2">
                <Layers size={16} className="text-indigo-500" />
                Select Social Platforms
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {platformList.map((p) => {
                  const Icon = p.icon
                  const isSelected = selectedPlatforms.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePlatformToggle(p.id)}
                      className={`
                        flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all duration-200
                        ${isSelected 
                          ? 'border-indigo-500 bg-indigo-50/40 text-indigo-700 dark:text-indigo-400 dark:border-indigo-450 dark:bg-indigo-950/20' 
                          : 'border-slate-105 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800/40 text-slate-605 dark:text-slate-300'
                        }
                      `}
                    >
                      <Icon size={16} />
                      <span>{p.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Caption Editor */}
            <div className="card space-y-4 shadow-card">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-500" />
                  Caption Editor
                </h2>
                <span className="text-[10px] text-slate-400 font-bold">Words: {wordCount}</span>
              </div>
              <textarea
                rows={5}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-4 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-205 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 leading-relaxed text-slate-800 dark:text-slate-100"
              />
              <div className="flex flex-wrap gap-2">
                {hashtagSuggestions.map(tag => (
                  <button key={tag} onClick={() => setCaption(prev => prev + ' ' + tag)} className="px-2 py-0.5 bg-indigo-50/50 dark:bg-indigo-950/30 border text-[10px] text-indigo-600 dark:text-indigo-400 rounded-lg">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Media uploads zone */}
            <div className="card space-y-4 shadow-card">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b pb-3">Media Attachments</h2>
              <div 
                onClick={handleSimulatedUpload}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-455 p-6 rounded-2xl text-center cursor-pointer flex flex-col items-center justify-center space-y-1.5"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-955 text-indigo-650 flex items-center justify-center">
                  <Upload size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-750 dark:text-slate-200">Simulate Drag & Drop asset upload</p>
                  <p className="text-[10px] text-slate-400">Add creative sneaker_shot.png to post</p>
                </div>
              </div>

              {uploadProgress && (
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-655" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}

              {mediaList.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-750/30 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-xs font-bold text-slate-655 dark:text-slate-350">sneaker_product_shot.png</span>
                  <button onClick={() => setMediaList([])} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-750 text-rose-500 rounded ml-auto">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

          </div>

          {/* Composer right panels */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Scheduling & Recurrence details */}
            <div className="card space-y-4 shadow-card">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b pb-3 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-500" />
                Scheduling & Recurrence
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase">Publish Date</label>
                  <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full p-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase">Publish Time</label>
                  <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full p-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border rounded-xl" />
                </div>
              </div>

              {/* Recurrence Dropdown options */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase">Recurring Recurrence Mode</label>
                <select 
                  value={recurrence} 
                  onChange={e => setRecurrence(e.target.value)} 
                  className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border rounded-xl"
                >
                  <option value="Never">Repeat Once (Never)</option>
                  <option value="Daily">Daily Recurrence</option>
                  <option value="Weekly">Weekly Recurrence</option>
                  <option value="Monthly">Monthly Recurrence</option>
                  <option value="Custom">Custom Recurrence</option>
                </select>
              </div>

              {/* Sprint 4 Recurrence advanced selections UI */}
              {recurrence !== 'Never' && (
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-750 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Sliders size={14} className="text-indigo-500" />
                    Configure Recurrence Rules
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-450 uppercase">Start Date</label>
                      <input type="date" value={recStartDate} onChange={e => setRecStartDate(e.target.value)} className="w-full p-2 bg-white dark:bg-slate-700 border rounded-lg" />
                    </div>
                    {recurrence === 'Daily' || recurrence === 'Custom' ? (
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-455 uppercase">End Date</label>
                        <input type="date" value={recEndDate} onChange={e => setRecEndDate(e.target.value)} className="w-full p-2 bg-white dark:bg-slate-700 border rounded-lg" />
                      </div>
                    ) : null}
                  </div>

                  {recurrence === 'Weekly' && (
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-slate-450 uppercase block">Occurs on Days</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                          const isActive = selectedWeekdays.includes(day)
                          return (
                            <button
                              key={day}
                              onClick={() => handleWeekdayToggle(day)}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${isActive ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-700 dark:text-indigo-400' : 'bg-white dark:bg-slate-700'}`}
                            >
                              {day}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {recurrence === 'Monthly' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-450 uppercase block">Monthly Option</label>
                      <select value={monthlyOption} onChange={e => setMonthlyOption(e.target.value)} className="w-full p-2 text-xs bg-white dark:bg-slate-700 border rounded-lg">
                        <option value="Same date each month">Same date each month (e.g. 28th)</option>
                        <option value="Last day of month">Last day of month</option>
                        <option value="First Monday">First Monday of each month</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-1 border-t dark:border-slate-700 pt-3">
                    <label className="text-[9px] font-bold text-slate-450 uppercase block">Recurrence Preview Details</label>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold leading-normal">
                      {recurrencePreviewText}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Native Previews tab */}
            <div className="card space-y-4 shadow-card">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b pb-3 flex items-center gap-2">
                <Eye size={16} className="text-indigo-500" />
                Social Previews
              </h2>
              <div className="flex gap-1 border-b pb-1">
                {['instagram', 'facebook', 'linkedin'].map(tab => (
                  <button key={tab} onClick={() => setPreviewTab(tab)} className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize ${previewTab === tab ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30' : 'text-slate-450'}`}>
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-4 bg-slate-50/50 dark:bg-slate-750/30 border rounded-2xl max-w-sm mx-auto text-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-[10px]">AC</div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">alex_creator</span>
                </div>
                <p className="text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">{caption}</p>
                {mediaList.length > 0 && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-200">
                    <img src={mediaList[0].url} alt="Preview sneaker" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ── Queue & Publishing Monitor Tab active ── */}
      {workspaceTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Main (3 Columns): Analytics, Timeline, Queue Table */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Queue Analytics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="stat-card">
                <p className="text-[10px] font-bold text-slate-450 uppercase">Posts Waiting</p>
                <p className="text-xl font-bold text-slate-850 dark:text-slate-100 mt-1">{analytics.waiting}</p>
              </div>
              <div className="stat-card">
                <p className="text-[10px] font-bold text-slate-450 uppercase">Publishing Today</p>
                <p className="text-xl font-bold text-slate-850 dark:text-slate-100 mt-1">{analytics.today}</p>
              </div>
              <div className="stat-card">
                <p className="text-[10px] font-bold text-slate-455 uppercase text-rose-500">Failed Posts</p>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{analytics.failed}</p>
              </div>
              <div className="stat-card">
                <p className="text-[10px] font-bold text-slate-450 uppercase">Recurring Posts</p>
                <p className="text-xl font-bold text-slate-850 dark:text-slate-100 mt-1">{analytics.recurring}</p>
              </div>
            </div>

            {/* Publishing Timeline Simulation */}
            {activePublishingItem && (
              <div className="card space-y-4 shadow-card bg-gradient-to-r from-indigo-50/20 to-slate-50/20 dark:from-indigo-950/10 dark:to-slate-850/10 border-indigo-150/40 dark:border-indigo-900/30">
                <div className="flex justify-between items-center pb-2 border-b dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{activePublishingItem.thumb}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Active publishing pipeline</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{activePublishingItem.title}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400`}>
                    Step {timelineStep + 1} of 5
                  </span>
                </div>

                {/* Animated Line grid */}
                <div className="flex items-center justify-between pt-2 px-4 overflow-x-auto scrollbar-none">
                  {['Scheduled', 'Queued', 'Publishing', 'Published', 'Completed'].map((stepName, stepIndex) => {
                    const isPassed = timelineStep >= stepIndex
                    const isActive = timelineStep === stepIndex
                    return (
                      <div key={stepName} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center space-y-1">
                          <div className={`
                            w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                            ${isActive ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/35 scale-110' :
                              isPassed ? 'bg-emerald-500 text-white' :
                              'bg-slate-200 text-slate-400 dark:bg-slate-700'
                            }
                          `}>
                            {isPassed && !isActive ? '✓' : stepIndex + 1}
                          </div>
                          <span className={`text-[9px] font-bold ${isActive ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-450'}`}>
                            {stepName}
                          </span>
                        </div>
                        {stepIndex < 4 && (
                          <div className="flex-1 h-0.5 mx-2 bg-slate-250 dark:bg-slate-700 relative overflow-hidden">
                            <div className={`h-full bg-emerald-500 transition-all duration-700 ${isPassed ? 'w-full' : 'w-0'}`}></div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Queue Table with Search Filters */}
            <div className="card space-y-4 shadow-card">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search queue posts..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full text-xs bg-slate-50 dark:bg-slate-700 border border-slate-205 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <select value={qPlatformFilter} onChange={e => setQPlatformFilter(e.target.value)} className="px-2.5 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-700 border rounded-xl">
                    <option value="All">All Platforms</option>
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Facebook">Facebook</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitter">Twitter/X</option>
                  </select>
                  <select value={qCampaignFilter} onChange={e => setQCampaignFilter(e.target.value)} className="px-2.5 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-700 border rounded-xl">
                    <option value="All">All Campaigns</option>
                    <option value="Nike Summer Launch">Nike Summer Launch</option>
                    <option value="Adidas Sports Week">Adidas Sports Week</option>
                    <option value="None">No Campaign</option>
                  </select>
                  <select value={qPriorityFilter} onChange={e => setQPriorityFilter(e.target.value)} className="px-2.5 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-700 border rounded-xl">
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Table rendering */}
              {filteredQueue.length === 0 ? (
                <div className="text-center py-12 text-slate-450 text-xs">
                  <AlertCircle size={24} className="mx-auto mb-2 text-slate-400" />
                  No posts match your queue filters.
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-xl dark:border-slate-700/60">
                  <table className="w-full text-xs text-left">
                    <thead className="table-head">
                      <tr>
                        <th className="table-th">Post</th>
                        <th className="table-th">Platform</th>
                        <th className="table-th">Campaign</th>
                        <th className="table-th">Priority</th>
                        <th className="table-th">Schedule</th>
                        <th className="table-th">Status</th>
                        <th className="table-th text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {filteredQueue.map((post, index) => {
                        const PlatformIcon = post.platformIcon
                        return (
                          <tr key={post.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg bg-slate-100 dark:bg-slate-700 p-1 rounded">{post.thumb}</span>
                                <span className="font-bold text-slate-800 dark:text-white line-clamp-1">{post.title}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-350">
                                <PlatformIcon size={12} className="text-indigo-500" />
                                {post.platform}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500 font-semibold">{post.campaign}</td>
                            <td className="py-3 px-3">
                              <StatusBadge status={post.priority === 'High' ? 'danger' : post.priority === 'Medium' ? 'warning' : 'default'} />
                            </td>
                            <td className="py-3 px-3 text-slate-455 font-semibold">{post.date} · {post.time}</td>
                            <td className="py-3 px-3">
                              <StatusBadge status={post.status} dot />
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => handleMoveUp(index)} className="p-1 hover:bg-slate-150 dark:hover:bg-slate-700 rounded text-slate-500" title="Move Up priority">
                                  <ArrowUp size={12} />
                                </button>
                                <button onClick={() => handleMoveDown(index)} className="p-1 hover:bg-slate-150 dark:hover:bg-slate-700 rounded text-slate-500" title="Move Down priority">
                                  <ArrowDown size={12} />
                                </button>
                                <button onClick={() => handleDuplicate(post)} className="p-1 hover:bg-slate-150 dark:hover:bg-slate-700 rounded text-slate-550" title="Duplicate">
                                  <Copy size={12} />
                                </button>
                                <button onClick={() => handlePublishNowSimulated(post)} className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 rounded" title="Publish now (Mock)">
                                  <Play size={12} />
                                </button>
                                <button onClick={() => handleDelete(post.id)} className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 rounded" title="Delete">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right sidebar area (1 Column): Scheduled Publishing monitor widget list */}
          <div className="space-y-6">
            
            <div className="card space-y-4 shadow-card">
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 border-b pb-3 flex items-center gap-1.5">
                <RotateCw size={14} className="text-indigo-500" />
                Publishing Monitor
              </h2>
              <div className="space-y-3">
                {queueList.map((post) => {
                  const PlatformIcon = post.platformIcon
                  return (
                    <div key={post.id} className="p-3 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-105 dark:border-slate-700/60 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-205">
                          <PlatformIcon size={12} />
                          {post.platform}
                        </span>
                        <StatusBadge status={post.status} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-850 dark:text-white truncate">{post.title}</h4>
                        <p className="text-[9px] text-slate-400 mt-0.5">Campaign: {post.campaign} · Time: {post.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Simulated toast at the bottom right */}
      {toast && (
        <div className="fixed bottom-10 right-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 text-sm font-semibold transition-all duration-300 animate-slide-in">
          <span>{toast}</span>
          <button onClick={() => setToast('')} className="text-xs font-bold opacity-80 hover:opacity-100 ml-2">✕</button>
        </div>
      )}

    </div>
  )
}
