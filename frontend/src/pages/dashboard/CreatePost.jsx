import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hash, Smile, Send, Save, Clock,
  X, Plus, ChevronDown, Video,
  Eye, Upload, Globe, Lock, Users,
  CheckCircle, AlertCircle, Info,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube } from 'react-icons/fa6'
import PageHeader from '../../components/dashboard/PageHeader'
import { useAuth } from '../../context/AuthContext'

/* ── Constants ─────────────────────────────────────────────────── */
const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: FaInstagram, color: '#E1306C' },
  { id: 'facebook',  label: 'Facebook',  icon: FaFacebook,  color: '#1877F2' },
  { id: 'linkedin',  label: 'LinkedIn',  icon: FaLinkedin,  color: '#0A66C2' },
  { id: 'x',         label: 'X',         icon: FaXTwitter,  color: '#000000' },
  { id: 'youtube',   label: 'YouTube',   icon: FaYoutube,   color: '#FF0000' },
]

const VISIBILITY = [
  { id: 'public',    label: 'Public',    icon: Globe  },
  { id: 'private',   label: 'Private',   icon: Lock   },
  { id: 'followers', label: 'Followers', icon: Users  },
]

const EMOJI_LIST = ['😊','🎉','🔥','💡','✅','📈','🚀','💬','❤️','👍','🌟','📣']
const AUDIENCE_OPTIONS = ['All Followers', 'Targeted Audience', 'Custom Segment']

const RECUR_FREQ = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly']

/* ── Role workflow config ───────────────────────────────────────── */
const WORKFLOW = {
  business: {
    banner: null,
    primaryAction: { label: 'Publish Now', icon: Send, action: 'publish' },
    secondaryAction: { label: 'Schedule Post', icon: Clock, action: 'schedule' },
    hint: null,
  },
  marketing: {
    banner: {
      icon: Info,
      color: '#4F46E5',
      bg: 'rgba(79,70,229,.08)',
      border: 'rgba(79,70,229,.20)',
      message: 'As a Marketing Team member, posts must be submitted for approval before publishing.',
    },
    primaryAction: { label: 'Submit for Approval', icon: CheckCircle, action: 'approval' },
    secondaryAction: { label: 'Save as Draft', icon: Save, action: 'draft' },
    hint: 'Your manager will review and approve this post before it goes live.',
  },
}

/* ── Platform toggle pill ───────────────────────────────────────── */
function PlatformToggle({ platform, selected, onToggle }) {
  const Icon = platform.icon
  const on = selected.includes(platform.id)
  return (
    <button
      type="button"
      onClick={() => onToggle(platform.id)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150"
      style={{
        background:  on ? `${platform.color}15` : 'var(--card)',
        borderColor: on ? platform.color        : 'var(--border)',
        color:       on ? platform.color        : 'var(--text-muted)',
      }}
    >
      <Icon size={13} />
      {platform.label}
    </button>
  )
}

/* ── Live Preview ───────────────────────────────────────────────── */
function LivePreview({ title, caption, hashtags, mediaUrl, platforms }) {
  const active = PLATFORMS.filter(p => platforms.includes(p.id))
  return (
    <div className="card p-5 sticky top-4">
      <div className="flex items-center gap-2 mb-4">
        <Eye size={15} style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-sm font-bold" style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Live Preview
        </h3>
      </div>

      {active.length === 0 && (
        <p className="text-xs text-center py-8" style={{ color: 'var(--text-subtle)' }}>
          Select at least one platform to preview.
        </p>
      )}

      {active.map(p => {
        const Icon = p.icon
        return (
          <div key={p.id} className="mb-4 last:mb-0 rounded-[var(--r-md)] overflow-hidden border"
            style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 px-3 py-2" style={{ background: `${p.color}10` }}>
              <Icon size={13} style={{ color: p.color }} />
              <span className="text-xs font-semibold" style={{ color: p.color }}>{p.label}</span>
            </div>
            <div className="p-3" style={{ background: 'var(--bg-alt)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #1E3A8A, #4F46E5)' }}>O</div>
                <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>OrbitSocial</span>
              </div>
              {mediaUrl ? (
                <img src={mediaUrl} alt="Preview" className="w-full rounded-lg mb-2 object-cover max-h-36" />
              ) : (
                <div className="w-full h-24 rounded-lg mb-2 flex items-center justify-center text-xs"
                  style={{ background: 'var(--border)', color: 'var(--text-subtle)' }}>
                  No media attached
                </div>
              )}
              {title   && <p className="text-xs font-semibold mb-1 truncate" style={{ color: 'var(--text)' }}>{title}</p>}
              {caption && <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-muted)' }}>{caption}</p>}
              {hashtags && <p className="text-xs mt-1 font-medium" style={{ color: p.color }}>{hashtags}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────────── */
export default function CreatePost() {
  const { role } = useAuth()
  const wf = WORKFLOW[role] ?? WORKFLOW.business

  const [title,        setTitle]        = useState('')
  const [caption,      setCaption]      = useState('')
  const [hashtags,     setHashtags]     = useState('')
  const [platforms,    setPlatforms]    = useState(['instagram'])
  const [visibility,   setVisibility]   = useState('public')
  const [audience,     setAudience]     = useState('All Followers')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [recurring,    setRecurring]    = useState(false)
  const [recurFreq,    setRecurFreq]    = useState('Weekly')
  const [mediaFiles,   setMediaFiles]   = useState([])
  const [mediaUrl,     setMediaUrl]     = useState('')
  const [dragging,     setDragging]     = useState(false)
  const [showEmoji,    setShowEmoji]    = useState(false)
  const [toast,        setToast]        = useState(null)

  const fileRef = useRef()

  const togglePlatform = id =>
    setPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])

  const handleDrop = useCallback(e => {
    e.preventDefault(); setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith('image/') || f.type.startsWith('video/')
    )
    if (files.length) { setMediaFiles(files); setMediaUrl(URL.createObjectURL(files[0])) }
  }, [])

  const handleFileChange = e => {
    const files = Array.from(e.target.files)
    if (files.length) { setMediaFiles(files); setMediaUrl(URL.createObjectURL(files[0])) }
  }

  const removeMedia = i => {
    const next = mediaFiles.filter((_, idx) => idx !== i)
    setMediaFiles(next)
    setMediaUrl(next.length ? URL.createObjectURL(next[0]) : '')
  }

  const validate = () => {
    if (!caption.trim()) { showToast('Please write a caption before continuing.', 'error'); return false }
    if (platforms.length === 0) { showToast('Select at least one platform.', 'error'); return false }
    return true
  }

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleAction = action => {
    if (action !== 'draft' && !validate()) return
    const messages = {
      publish:  '🚀 Post published successfully!',
      schedule: '📅 Post scheduled!',
      draft:    '💾 Draft saved!',
      approval: '✅ Post submitted for approval! Your manager will review it shortly.',
    }
    showToast(messages[action] ?? 'Done!', 'success')
  }

  const inputSty = { background: 'var(--bg-alt)', borderColor: 'var(--border)', color: 'var(--text)' }
  const inputCls = 'w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none transition-all focus:border-[var(--primary)]'

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Create Post"
        subtitle={role === 'marketing'
          ? 'Compose your post and submit it for manager approval.'
          : 'Compose, schedule or publish your post directly.'}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left / form ── */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {/* Role workflow banner */}
          {wf.banner && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 px-4 py-3 rounded-[var(--r-md)] text-sm"
              style={{
                background: wf.banner.bg,
                border: `1px solid ${wf.banner.border}`,
                color: wf.banner.color,
              }}
            >
              <wf.banner.icon size={16} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed font-medium">{wf.banner.message}</p>
            </motion.div>
          )}

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-md)] text-sm font-medium"
                style={{
                  background: toast.type === 'success' ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.10)',
                  border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'}`,
                  color: toast.type === 'success' ? '#22C55E' : '#EF4444',
                }}>
                {toast.msg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Platform selector */}
          <div className="card p-5">
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Publish to</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <PlatformToggle key={p.id} platform={p} selected={platforms} onToggle={togglePlatform} />
              ))}
            </div>
          </div>

          {/* Media upload */}
          <div className="card p-5">
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Media</p>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed rounded-[var(--r-md)] p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
              style={{
                borderColor: dragging ? 'var(--primary)' : 'var(--border)',
                background:  dragging ? 'var(--primary-light)' : 'var(--bg-alt)',
              }}
            >
              <Upload size={22} style={{ color: dragging ? 'var(--primary)' : 'var(--text-subtle)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                {dragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                Images, videos, carousels, stories & reels supported
              </p>
            </div>
            <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
            {mediaFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {mediaFiles.map((f, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border"
                    style={{ borderColor: 'var(--border)' }}>
                    {f.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-alt)' }}>
                        <Video size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); removeMedia(i) }}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.6)' }}
                    >
                      <X size={10} style={{ color: '#fff' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Post title */}
          <div className="card p-5">
            <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text)' }}>Post Title</label>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Optional internal title"
              className={inputCls} style={inputSty}
            />
          </div>

          {/* Caption */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Caption <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <span className="text-xs" style={{ color: caption.length > 2000 ? 'var(--error)' : 'var(--text-subtle)' }}>
                {caption.length} / 2200
              </span>
            </div>
            <textarea
              value={caption} onChange={e => setCaption(e.target.value)}
              placeholder="Write your caption here…"
              rows={5}
              className="w-full px-4 py-3 text-sm rounded-[var(--r-md)] border outline-none transition-all resize-none"
              style={inputSty}
            />
            {/* Toolbar */}
            <div className="flex items-center gap-2 mt-2">
              <div className="relative">
                <button
                  type="button" onClick={() => setShowEmoji(v => !v)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--bg-alt)]"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  <Smile size={13} /> Emoji
                </button>
                <AnimatePresence>
                  {showEmoji && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute bottom-full mb-2 left-0 p-2 rounded-[var(--r-md)] shadow-[var(--shadow-lg)] grid grid-cols-6 gap-1 z-50"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)', width: 180 }}
                    >
                      {EMOJI_LIST.map(em => (
                        <button key={em} type="button"
                          onClick={() => { setCaption(c => c + em); setShowEmoji(false) }}
                          className="text-lg hover:scale-125 transition-transform text-center">
                          {em}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                type="button" onClick={() => setCaption(c => c + ' #')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--bg-alt)]"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                <Hash size={13} /> Hashtag
              </button>
            </div>
          </div>

          {/* Hashtags */}
          <div className="card p-5">
            <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text)' }}>Hashtags</label>
            <input
              value={hashtags} onChange={e => setHashtags(e.target.value)}
              placeholder="#yourbrand #marketing #socialmedia"
              className={inputCls} style={inputSty}
            />
          </div>

          {/* Audience + Visibility */}
          <div className="card p-5 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text)' }}>Audience</label>
              <div className="relative">
                <select
                  value={audience} onChange={e => setAudience(e.target.value)}
                  className="w-full h-10 px-4 pr-8 text-sm rounded-[var(--r-md)] border outline-none appearance-none"
                  style={inputSty}
                >
                  {AUDIENCE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 pointer-events-none" style={{ color: 'var(--text-subtle)' }} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text)' }}>Visibility</label>
              <div className="flex gap-2">
                {VISIBILITY.map(v => {
                  const Icon = v.icon; const on = visibility === v.id
                  return (
                    <button key={v.id} type="button" onClick={() => setVisibility(v.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[var(--r-sm)] border text-xs font-semibold transition-all"
                      style={{
                        background:  on ? 'var(--primary-light)' : 'var(--bg-alt)',
                        borderColor: on ? 'var(--primary)'       : 'var(--border)',
                        color:       on ? 'var(--primary)'       : 'var(--text-muted)',
                      }}>
                      <Icon size={12} /> {v.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Schedule — Business shows prominently; Marketing shows as optional target date */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {role === 'marketing' ? 'Requested Publish Time (optional)' : 'Schedule'}
              </p>
              {role === 'marketing' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(79,70,229,.10)', color: '#4F46E5' }}>
                  Awaiting Approval
                </span>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Date</label>
                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                  className={inputCls} style={inputSty} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Time</label>
                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                  className={inputCls} style={inputSty} />
              </div>
            </div>

            {/* Recurring — only for Business */}
            {role !== 'marketing' && (
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                  <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)}
                    className="w-4 h-4 rounded" style={{ accentColor: 'var(--primary)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Recurring post</span>
                </label>
                <AnimatePresence>
                  {recurring && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                        Repeat frequency
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {RECUR_FREQ.map(f => (
                          <button key={f} type="button" onClick={() => setRecurFreq(f)}
                            className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                            style={{
                              background:  recurFreq === f ? 'var(--primary-light)' : 'var(--bg-alt)',
                              borderColor: recurFreq === f ? 'var(--primary)'       : 'var(--border)',
                              color:       recurFreq === f ? 'var(--primary)'       : 'var(--text-muted)',
                            }}>
                            {f}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Marketing note */}
            {role === 'marketing' && (
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-subtle)' }}>
                This is your preferred publish time. Final scheduling is set by the approving manager.
              </p>
            )}
          </div>

          {/* ── Action buttons — role-specific ── */}
          <div className="card p-5">
            {role === 'marketing' ? (
              /* Marketing workflow */
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-3">
                  {/* Primary — Submit for Approval */}
                  <button type="button" onClick={() => handleAction('approval')}
                    className="flex items-center gap-2 px-6 h-11 rounded-[var(--r-md)] text-sm font-semibold text-white transition-all hover:brightness-105"
                    style={{ background: 'linear-gradient(135deg, #1E3A8A, #4F46E5)' }}>
                    <CheckCircle size={16} /> Submit for Approval
                  </button>
                  {/* Secondary — Save Draft */}
                  <button type="button" onClick={() => handleAction('draft')}
                    className="flex items-center gap-2 px-5 h-11 rounded-[var(--r-md)] border text-sm font-semibold transition-all hover:shadow-[var(--shadow-sm)]"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                    <Save size={16} /> Save as Draft
                  </button>
                </div>
                {wf.hint && (
                  <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-subtle)' }}>
                    <AlertCircle size={12} style={{ color: '#4F46E5', flexShrink: 0 }} />
                    {wf.hint}
                  </p>
                )}
              </div>
            ) : (
              /* Business workflow */
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => handleAction('draft')}
                  className="flex items-center gap-2 px-5 h-11 rounded-[var(--r-md)] border text-sm font-semibold transition-all hover:shadow-[var(--shadow-sm)]"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <Save size={16} /> Save Draft
                </button>
                <button type="button" onClick={() => handleAction('schedule')}
                  className="flex items-center gap-2 px-5 h-11 rounded-[var(--r-md)] border text-sm font-semibold transition-all hover:shadow-[var(--shadow-sm)]"
                  style={{ background: 'var(--primary-light)', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                  <Clock size={16} /> Schedule Post
                </button>
                <button type="button" onClick={() => handleAction('publish')}
                  className="flex items-center gap-2 px-6 h-11 rounded-[var(--r-md)] text-sm font-semibold text-white transition-all hover:brightness-105"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                  <Send size={16} /> Publish Now
                </button>
              </div>
            )}
          </div>

        </div>

        {/* ── Right / preview ── */}
        <div className="hidden xl:block">
          <LivePreview title={title} caption={caption} hashtags={hashtags} mediaUrl={mediaUrl} platforms={platforms} />
        </div>

      </div>
    </div>
  )
}
