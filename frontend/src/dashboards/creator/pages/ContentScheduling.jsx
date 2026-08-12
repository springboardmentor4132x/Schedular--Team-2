import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import { useAuth } from '../../../context/AuthContext'
import { uploadMedia, schedulePost, saveDraft, publishPost } from '../../../services/postService'
import { getPlatformIcon, fetchSocialAccounts } from '../../../services/postAdapter'
import { getCampaigns } from '../../../services/campaignService'
import { PLATFORM_OPTIONS } from '../constants/campaigns'
import {
  Calendar,
  Sparkles,
  Layers,
  X,
  Upload,
  Eye,
  Sliders,
  Save,
  Send,
  Folder,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Repeat2,
  ThumbsUp,
  Share2,
  Globe,
  BarChart2,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Play,
  AlertTriangle,
} from 'lucide-react'

const platformList = PLATFORM_OPTIONS.map((p) => ({
  id: p.id,
  name: p.label,
  icon: getPlatformIcon(p.id),
}))

const hashtagSuggestions = ['#marketing', '#socialmedia', '#contentcreator', '#orbitsocial', '#growthhacks']

const STEPS = ['Platforms', 'Caption & Hashtags', 'Media', 'Campaign', 'Schedule', 'Preview']

function todayLocalStr() {
  const d = new Date()
  return d.toLocaleDateString('sv-SE')
}

function daysFromToday(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('sv-SE')
}

// Backend stores X/Twitter as 'x'; the creator platform list uses 'twitter'.
function normalizePlatform(platform = '') {
  const key = String(platform).toLowerCase()
  if (key === 'x' || key === 'twitter') return 'twitter'
  return key
}

export default function ContentScheduling() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [connectedPlatforms, setConnectedPlatforms] = useState([])
  const [platformsLoading, setPlatformsLoading] = useState(true)
  const [caption, setCaption] = useState('Kickstart your brand campaign with a fresh perspective! 🚀 We are matching clean assets with premium SaaS design guidelines.')
  const [mediaList, setMediaList] = useState([])
  const [uploadProgress, setUploadProgress] = useState(null)
  const fileInputRef = useRef(null)

  const [scheduleDate, setScheduleDate] = useState(todayLocalStr())
  const [scheduleTime, setScheduleTime] = useState('')
  const [recurrence, setRecurrence] = useState('Never')
  const [previewTab, setPreviewTab] = useState('instagram')

  const [recStartDate, setRecStartDate] = useState(todayLocalStr())
  const [recEndDate, setRecEndDate] = useState(() => daysFromToday(30))
  const [selectedWeekdays, setSelectedWeekdays] = useState(['Mon', 'Wed'])
  const [monthlyOption, setMonthlyOption] = useState('Same date each month')

  const [hashtags, setHashtags] = useState('#OrbitSocial #ContentCreator')
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  useEffect(() => {
    let mounted = true
    getCampaigns()
      .then((list) => {
        if (mounted) setCampaigns(list)
      })
      .catch(() => {
        if (mounted) setCampaigns([])
      })
    return () => {
      mounted = false
    }
  }, [])

  // Load the creator's connected social accounts so only connected
  // platforms are selectable (parity with the marketing scheduling page).
  useEffect(() => {
    let mounted = true
    fetchSocialAccounts()
      .then((accounts) => {
        if (!mounted) return
        const connected = [...new Set((accounts || []).map(acc => normalizePlatform(acc.platform)))]
        setConnectedPlatforms(connected)
        // Auto-select connected platforms (default to first connected if any).
        setSelectedPlatforms(prev => {
          const stillConnected = prev.filter(p => connected.includes(p))
          return stillConnected.length ? stillConnected : connected.slice(0, 1)
        })
      })
      .catch(() => {
        if (mounted) setConnectedPlatforms([])
      })
      .finally(() => {
        if (mounted) setPlatformsLoading(false)
      })
    return () => { mounted = false }
  }, [])

  const recurrencePreviewText = useMemo(() => {
    if (recurrence === 'Never') return 'Repeat Once'
    if (recurrence === 'Daily') return `Daily recurrence starting ${recStartDate} until ${recEndDate}`
    if (recurrence === 'Weekly') return `Weekly on ${selectedWeekdays.join(', ')} (Start: ${recStartDate})`
    if (recurrence === 'Monthly') return `Monthly on ${monthlyOption} (Start: ${recStartDate})`
    return 'Custom schedule'
  }, [recurrence, recStartDate, recEndDate, selectedWeekdays, monthlyOption])

  const wordCount = caption.split(/\s+/).filter(Boolean).length

  const previewName = user?.name || 'Creator'
  const previewHandle = user?.email?.split('@')[0] || 'creator'
  const previewInitials = previewName
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CR'
  const previewMedia = mediaList[0]?.url || ''

  const hasConnectedPlatforms = !platformsLoading && connectedPlatforms.length > 0
  const effectivePlatforms = selectedPlatforms.filter(p => connectedPlatforms.includes(p))

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadProgress(10)
    try {
      const result = await uploadMedia(file)
      setMediaList([{ id: Date.now(), url: result.media_url, name: file.name, type: file.type }])
      showToast(`${file.name} uploaded successfully!`)
    } catch {
      showToast('Media upload failed.', 'error')
    } finally {
      setUploadProgress(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSimulatedUpload = () => {
    fileInputRef.current?.click()
  }

  const handlePlatformToggle = (id) => {
    setSelectedPlatforms(prev => {
      const next = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
      if (!next.includes(previewTab)) setPreviewTab(next[0] || 'instagram')
      return next
    })
  }

  const handleAddHashtag = (tag) => {
    setHashtags(prev => (prev.includes(tag) ? prev : prev ? `${prev} ${tag}` : tag))
  }

  const handleWeekdayToggle = (day) => {
    setSelectedWeekdays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const resolveSocialAccountIds = async () => {
    const accounts = await fetchSocialAccounts()
    const platformSet = effectivePlatforms
    return accounts
      .filter((acc) => platformSet.includes(normalizePlatform(acc.platform)))
      .map((acc) => acc.id)
  }

  const buildPayload = async (status) => {
    const media = mediaList[0]
    const fullCaption = hashtags.trim() ? `${caption}\n\n${hashtags}` : caption
    const firstLine = fullCaption.split('\n')[0]?.trim() || 'Untitled post'
    const accountIds = await resolveSocialAccountIds()
    return {
      title: firstLine.slice(0, 100),
      caption: fullCaption,
      content_type: media ? (media.type?.startsWith('video') ? 'video' : 'image') : 'text',
      media_url: media?.url || null,
      scheduled_for:
          status === 'Queued' || !scheduleDate || !scheduleTime
              ? null
              : new Date(`${scheduleDate}T${scheduleTime}`).toISOString(),      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      social_account_ids: accountIds,
      campaign_id: selectedCampaign ? Number(selectedCampaign) : null,
      status,
    }
  }
  

  const handleSaveDraft = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await saveDraft(await buildPayload('Draft'))
      showToast('Draft saved successfully!')
      setTimeout(() => navigate('/dashboard/creator/my-posts'), 1000)
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to save draft.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleScheduleClick = () => {
    if (effectivePlatforms.length === 0) {
      showToast('Please select at least one connected platform.', 'error')
      return
    }
    if (!caption.trim()) {
      showToast('Caption cannot be empty.', 'error')
      return
    }
    if (!scheduleDate || !scheduleTime) {
      showToast('Please select a publish date and time.', 'error')
      return
    }
    setConfirmAction('schedule')
  }

  const confirmSchedule = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await schedulePost(await buildPayload('Scheduled'))
      showToast(`Post scheduled for ${scheduleDate} at ${scheduleTime}!`)
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to schedule post. Check the date/time.', 'error')
    } finally {
      setSubmitting(false)
      setConfirmAction(null)
    }
  }

  const handlePublishClick = () => {
    if (effectivePlatforms.length === 0) {
      showToast('Please select at least one connected platform.', 'error')
      return
    }
    if (!caption.trim()) {
      showToast('Caption cannot be empty.', 'error')
      return
    }
    // Publish Now does not need a date/time — it goes out immediately.
    setConfirmAction('publish')
  }

  const confirmPublish = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const created = await schedulePost(await buildPayload('Scheduled'))
      const res = await publishPost(created.id)
      if (res?.status === 'Published') {
        showToast('Post published successfully!')
        setTimeout(() => navigate('/dashboard/creator/my-posts'), 1000)
      } else {
        showToast(res?.message || 'Post could not be published.', 'error')
      }
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to publish post.', 'error')
    } finally {
      setSubmitting(false)
      setConfirmAction(null)
    }
  }

  const stepBadge = (n) => (
    <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-[11px] font-bold flex items-center justify-center shadow-sm flex-shrink-0">{n}</span>
  )

  const sectionTitle = (n, Icon, title) => (
    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
      {stepBadge(n)}
      <Icon size={16} className="text-indigo-500 dark:text-indigo-400" />
      <span>{title}</span>
    </h2>
  )

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in pb-20">

      {/* Header */}
      <section className="card p-5 sm:p-6 relative overflow-hidden bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/50 dark:from-indigo-950/30 dark:via-slate-900/40 dark:to-purple-950/30 border-indigo-100/50 dark:border-indigo-950/40 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create & Schedule Posts</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm font-medium">
              Pick platforms, write your post, attach media, then save, schedule, or publish instantly.
            </p>
            {!platformsLoading && !hasConnectedPlatforms && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/40 px-3 py-1.5 rounded-lg">
                <AlertTriangle size={13} /> Connect at least one social account to schedule or publish posts.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="md" onClick={handleSaveDraft} disabled={submitting || !hasConnectedPlatforms}>
              <Save size={16} />
              <span>Save Draft</span>
            </Button>
            <Button variant="primary" size="md" onClick={handleScheduleClick} disabled={submitting || !hasConnectedPlatforms}>
              <Calendar size={16} />
              <span>Schedule Post</span>
            </Button>
            <Button variant="primary" size="md" onClick={handlePublishClick} disabled={submitting || !hasConnectedPlatforms} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Send size={16} />
              <span>Publish Now</span>
            </Button>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 mt-5 pt-4 border-t border-slate-200/70 dark:border-slate-700/60 flex-wrap">
          {STEPS.map((label, i) => (
            <span key={label} className="flex items-center gap-1.5 text-[10px] font-bold">
              <span className="w-4 h-4 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white text-[9px] flex items-center justify-center">{i + 1}</span>
              <span className="text-slate-500 dark:text-slate-400">{label}</span>
              {i < STEPS.length - 1 && <ChevronRight size={12} className="text-slate-300 dark:text-slate-600" />}
            </span>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        {/* LEFT — Platforms, Caption, Media */}
        <div className="lg:col-span-2 space-y-6">

          <div className="card p-5 space-y-4 shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
              {sectionTitle(1, Layers, 'Select Platforms')}
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                {effectivePlatforms.length} selected
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1">Only your connected accounts can be selected.</p>
            {platformsLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {platformList.map(p => (
                  <div key={p.id} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--bg-alt)' }} />
                ))}
              </div>
            )}
            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2.5 ${platformsLoading ? 'hidden' : ''}`}>
              {platformList.map((p) => {
                const Icon = p.icon
                const connected = connectedPlatforms.includes(p.id)
                const isSelected = selectedPlatforms.includes(p.id) && connected
                return (
                  <button
                    key={p.id}
                    onClick={() => connected && handlePlatformToggle(p.id)}
                    disabled={!connected}
                    title={connected ? p.name : `${p.name} is not connected`}
                    className={`
                      flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all duration-200
                      ${isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 text-indigo-700 shadow-sm dark:text-indigo-400 dark:border-indigo-400 dark:bg-indigo-950/30'
                        : connected
                          ? 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-700/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:border-slate-600'
                          : 'border-slate-100 bg-slate-50/40 dark:border-slate-700/40 dark:bg-slate-800/20 text-slate-300 dark:text-slate-600'}
                    `}
                    style={connected ? undefined : { opacity: 0.6, cursor: 'not-allowed' }}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="truncate">{p.name}</span>
                    {connected && isSelected && <CheckCircle2 size={15} className="text-indigo-500 flex-shrink-0 ml-auto" />}
                    {!connected && (
                      <span className="text-[8px] font-bold uppercase tracking-wide ml-auto" style={{ color: 'var(--text-subtle)' }}>not connected</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card p-5 space-y-4 shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
              {sectionTitle(2, Sparkles, 'Caption & Hashtags')}
              <span className="text-[10px] text-slate-400 font-bold flex-shrink-0 ml-2">{wordCount} words</span>
            </div>
            <textarea
              rows={5}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your main caption here..."
              className="w-full p-4 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 leading-relaxed text-slate-800 dark:text-slate-100 resize-y"
            />
            <div className="flex flex-wrap gap-2">
              {hashtagSuggestions.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleAddHashtag(tag)}
                  className="px-2.5 py-1 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#OrbitSocial #TechReview"
              className="w-full p-3 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="card p-5 space-y-4 shadow-card">
            {sectionTitle(3, ImageIcon, 'Media Attachments')}
            <div
              onClick={handleSimulatedUpload}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 p-6 rounded-2xl text-center cursor-pointer flex flex-col items-center justify-center space-y-1.5 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Upload size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Click to upload media asset</p>
                <p className="text-[10px] text-slate-400">Images / videos (JPG, PNG, MP4)</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {uploadProgress && (
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}

            {mediaList.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
                  <ImageIcon size={15} className="text-indigo-500" />
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">{m.name}</span>
                <button onClick={() => setMediaList([])} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 text-rose-500 rounded ml-auto" title="Remove media">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT — Campaign, Schedule, Preview */}
        <div className="lg:col-span-2 space-y-6">

          <div className="card p-5 space-y-4 shadow-card">
            {sectionTitle(4, Folder, 'Campaign (Optional)')}
            <p className="text-[10px] text-slate-400 -mt-1">Group this post under one of your marketing campaigns.</p>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-slate-100"
            >
              <option value="">No campaign</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="card p-5 space-y-4 shadow-card">
            {sectionTitle(5, Calendar, 'Schedule & Recurrence')}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase">Publish Date</label>
                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full p-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-slate-100" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase">Publish Time</label>
                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full p-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-slate-100" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase">Recurrence Mode</label>
              <select
                value={recurrence}
                onChange={e => setRecurrence(e.target.value)}
                className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-slate-100"
              >
                <option value="Never">Repeat Once (Never)</option>
                <option value="Daily">Daily Recurrence</option>
                <option value="Weekly">Weekly Recurrence</option>
                <option value="Monthly">Monthly Recurrence</option>
                <option value="Custom">Custom Recurrence</option>
              </select>
            </div>

            {recurrence !== 'Never' && (
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Sliders size={14} className="text-indigo-500" />
                  Configure Recurrence Rules
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Start Date</label>
                    <input type="date" value={recStartDate} onChange={e => setRecStartDate(e.target.value)} className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  {recurrence === 'Daily' || recurrence === 'Custom' ? (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">End Date</label>
                      <input type="date" value={recEndDate} onChange={e => setRecEndDate(e.target.value)} className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                  ) : null}
                </div>

                {recurrence === 'Weekly' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Occurs on Days</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                        const isActive = selectedWeekdays.includes(day)
                        return (
                          <button
                            key={day}
                            onClick={() => handleWeekdayToggle(day)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors ${isActive ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-700 dark:text-indigo-400' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
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
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Monthly Option</label>
                    <select value={monthlyOption} onChange={e => setMonthlyOption(e.target.value)} className="w-full p-2 text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      <option value="Same date each month">Same date each month (e.g. 28th)</option>
                      <option value="Last day of month">Last day of month</option>
                      <option value="First Monday">First Monday of each month</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1 border-t dark:border-slate-700 pt-3">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Recurrence Preview Details</label>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold leading-normal">
                    {recurrencePreviewText}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="card p-5 space-y-4 shadow-card">
            {sectionTitle(6, Eye, 'Live Preview')}
            <p className="text-[10px] text-slate-400 -mt-1">See exactly how your post will look on each platform.</p>

            <div className="flex flex-wrap gap-1 border-b border-slate-100 dark:border-slate-700/60 pb-1">
              {platformList.map((p) => {
                const Icon = p.icon
                const isSelected = selectedPlatforms.includes(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => setPreviewTab(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${previewTab === p.id ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30' : `text-slate-400 ${isSelected ? 'hover:text-slate-700 dark:hover:text-slate-200' : 'opacity-50'}`}`}
                  >
                    <Icon size={13} />
                    <span className="capitalize">{p.name.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>

            <div className="max-w-sm mx-auto p-2.5 bg-slate-100/80 dark:bg-slate-900/70 border-2 border-indigo-200/70 dark:border-slate-700 rounded-2xl shadow-[0_10px_30px_rgba(30,58,138,0.10)] dark:shadow-none">

              {previewTab === 'instagram' && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-slate-800 dark:text-slate-100">
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px] flex-shrink-0">
                      <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{previewInitials}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-tight truncate">{previewName}</p>
                      <p className="text-[10px] text-slate-400">@{previewHandle}</p>
                    </div>
                    <span className="text-slate-400 text-sm font-bold">•••</span>
                  </div>
                  <div className="aspect-square bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
                    {previewMedia ? (
                      <img src={previewMedia} alt="Instagram preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px] gap-1">
                        <ImageIcon size={20} />
                        <span>Photo / Video</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-center gap-4 text-slate-700 dark:text-slate-200">
                      <Heart size={16} className="text-rose-500 fill-current" />
                      <MessageCircle size={16} />
                      <span className="ml-auto text-slate-400">
                        <Send size={16} />
                      </span>
                    </div>
                    <p className="text-[10px] font-bold">128 likes</p>
                    <p className="text-xs leading-relaxed">
                      <span className="font-bold">{previewName}</span> {caption}
                    </p>
                    {hashtags.trim() && (
                      <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">{hashtags}</p>
                    )}
                    <p className="text-[10px] text-slate-400">View all 3 comments</p>
                  </div>
                </div>
              )}

              {previewTab === 'facebook' && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-slate-800 dark:text-slate-100">
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">{previewInitials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-tight truncate">{previewName}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">Just now · <Globe size={11} /></p>
                    </div>
                  </div>
                  <p className="px-3 pb-2 text-xs leading-relaxed">{caption}</p>
                  {hashtags.trim() && (
                    <p className="px-3 pb-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400">{hashtags}</p>
                  )}
                  <div className="aspect-video bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
                    {previewMedia ? (
                      <img src={previewMedia} alt="Facebook preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px] gap-1">
                        <ImageIcon size={20} />
                        <span>Photo / Video</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5"><ThumbsUp size={13} className="text-blue-500" /> 12</span>
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><MessageCircle size={13} /> 4</span>
                      <span className="flex items-center gap-1"><Share2 size={13} /> Share</span>
                    </span>
                  </div>
                </div>
              )}

              {previewTab === 'linkedin' && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-slate-800 dark:text-slate-100">
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">{previewInitials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-tight truncate">{previewName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{previewName} · Just now</p>
                    </div>
                    <span className="text-slate-300 text-base font-bold">…</span>
                  </div>
                  <div className="px-3 pb-2 space-y-1.5">
                    <p className="text-xs leading-relaxed">{caption}</p>
                    {hashtags.trim() && (
                      <p className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">{hashtags}</p>
                    )}
                  </div>
                  <div className="aspect-video bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
                    {previewMedia ? (
                      <img src={previewMedia} alt="LinkedIn preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px] gap-1">
                        <ImageIcon size={20} />
                        <span>Photo / Video</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-500">
                    <span className="flex items-center gap-2">
                      <span className="flex items-center gap-1"><ThumbsUp size={13} className="text-sky-600" /> 45</span>
                      <span className="flex items-center gap-1"><MessageCircle size={13} /> 6</span>
                      <span className="flex items-center gap-1"><Repeat2 size={13} /> 3</span>
                    </span>
                    <span>1d</span>
                  </div>
                </div>
              )}

              {previewTab === 'twitter' && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-slate-800 dark:text-slate-100 p-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-slate-400 dark:bg-slate-500 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">{previewInitials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-tight truncate">{previewName} <span className="text-sky-500"><BadgeCheck size={13} className="inline" /></span></p>
                      <p className="text-[10px] text-slate-400">@{previewHandle}</p>
                    </div>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed">{caption}</p>
                  {hashtags.trim() && (
                    <p className="mt-1.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400">{hashtags}</p>
                  )}
                  <div className="mt-2.5 rounded-2xl aspect-video bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
                    {previewMedia ? (
                      <img src={previewMedia} alt="X preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px] gap-1">
                        <ImageIcon size={20} />
                        <span>Image / Video</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5"><MessageCircle size={13} /> 8</span>
                    <span className="flex items-center gap-1.5"><Repeat2 size={13} /> 21</span>
                    <span className="flex items-center gap-1.5 text-rose-500"><Heart size={13} /> 112</span>
                    <span className="flex items-center gap-1.5"><BarChart2 size={13} /> 1.2K</span>
                  </div>
                </div>
              )}

              {previewTab === 'youtube' && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-slate-800 dark:text-slate-100">
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    {previewMedia ? (
                      <img src={previewMedia} alt="YouTube preview" className="w-full h-full object-cover opacity-90" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-400 text-[10px] gap-1">
                        <ImageIcon size={20} />
                        <span>Video thumbnail</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg">
                        <Play size={18} className="fill-current ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">0:42</span>
                  </div>
                  <div className="flex gap-2.5 p-3">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">{previewInitials}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-snug line-clamp-2">{caption || 'Video title appears here'}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{previewName} · 1.2K views · 2 days ago</p>
                    </div>
                  </div>
                </div>
              )}

              {previewTab === 'pinterest' && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden text-slate-800 dark:text-slate-100">
                  <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
                    {previewMedia ? (
                      <img src={previewMedia} alt="Pinterest preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px] gap-1">
                        <ImageIcon size={20} />
                        <span>Pin image</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 w-7 h-7 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center shadow">P</span>
                    <span className="absolute bottom-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow">Save</span>
                  </div>
                  <p className="p-2.5 text-[11px] font-semibold leading-relaxed line-clamp-2">{caption || 'Pin description appears here'}</p>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {createPortal(
        confirmAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div className="w-full max-w-sm rounded-[var(--r-xl)] p-6 shadow-[var(--shadow-lg)] my-auto" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>
                  {confirmAction === 'schedule' ? 'Schedule this post?' : 'Publish this post now?'}
                </h3>
                <button onClick={() => setConfirmAction(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {confirmAction === 'schedule'
                  ? `This post will be scheduled for ${scheduleDate} at ${scheduleTime} on:`
                  : 'This post will be published immediately on:'}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {effectivePlatforms.map((id) => {
                  const p = platformList.find((x) => x.id === id)
                  const Icon = p?.icon
                  return Icon ? (
                    <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: 'rgba(79,70,229,.10)', color: '#4F46E5' }}>
                      <Icon size={12} /> {p.name}
                    </span>
                  ) : null
                })}
              </div>
              {confirmAction === 'publish' && (
                <p className="mt-3 text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle size={13} /> This cannot be undone — publishing starts right away.
                </p>
              )}
              <div className="flex gap-3 pt-5">
                <button onClick={() => setConfirmAction(null)} className="flex-1 h-10 rounded-[var(--r-md)] border text-sm font-semibold" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  Cancel
                </button>
                <button onClick={confirmAction === 'schedule' ? confirmSchedule : confirmPublish} disabled={submitting}
                  className="flex-1 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105"
                  style={{ background: confirmAction === 'publish' ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                  {submitting ? 'Working...' : confirmAction === 'schedule' ? 'Schedule' : 'Publish Now'}
                </button>
              </div>
            </div>
          </div>
        ),
        document.body
      )}

      {createPortal(
        toast && (
          <div className="fixed top-5 inset-x-0 z-[100] flex justify-center px-4 pointer-events-none">
            <div className="flex items-center gap-2.5 px-5 py-3 rounded-[var(--r-xl)] shadow-[var(--shadow-lg)] text-sm font-semibold text-white animate-slide-in pointer-events-auto"
              style={{ background: toast.type === 'error' ? 'linear-gradient(135deg,#DC2626,#EF4444)' : 'linear-gradient(135deg,#059669,#10B981)' }}>
              {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              <span>{toast.msg}</span>
              <button onClick={() => setToast(null)} className="ml-1 text-xs font-bold opacity-80 hover:opacity-100">✕</button>
            </div>
          </div>
        ),
        document.body
      )}

    </div>
  )
}
