import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2, Edit3, Copy, Save, BookOpen,
  Send, Search, X, Hash, Smile, Upload,
  ArrowLeft, Plus, Users,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import FileUploadField from '../../../components/dashboard/FileUploadField'
import { LibraryPanel } from './ContentLibrary'
import { ReviewPanel } from './ContentReview'
import { SchedulingPanel } from './ContentScheduling'
import { PublishingPanel } from './PublishingCenter'
import { contentApi, CONTENT_MAX_FILE_SIZE, ACCEPTED_FILE_TYPES } from '../../../services/contentApi'
import { MOCK_CLIENT_POSTS, MOCK_CLIENT_CAMPAIGNS } from '../../../services/mockData'

const PLATFORMS = [
  { id:'instagram', label:'Instagram', icon:FaInstagram, color:'#E1306C' },
  { id:'facebook',  label:'Facebook',  icon:FaFacebook,  color:'#1877F2' },
  { id:'linkedin',  label:'LinkedIn',  icon:FaLinkedin,  color:'#0A66C2' },
  { id:'x',         label:'X',         icon:FaXTwitter,  color:'#374151' },
  { id:'youtube',   label:'YouTube',   icon:FaYoutube,   color:'#FF0000' },
  { id:'pinterest', label:'Pinterest', icon:FaPinterest, color:'#E60023' },
]

const STATUS_STYLES = {
  draft:  { label:'Draft',     color:'#334155', bg:'rgba(148,163,184,.16)' },
  review: { label:'In Review', color:'#4338CA', bg:'rgba(99,102,241,.12)' },
}

const EMOJI_LIST = ['😊','🎉','🔥','💡','✅','📈','🚀','💬','❤️','👍','🌟','📣']

function PlatformToggle({ platform, selected, onToggle }) {
  const on = selected.includes(platform.id)
  const Icon = platform.icon
  return (
    <button type="button" onClick={() => onToggle(platform.id)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
      style={{
        background:  on ? `${platform.color}15` : 'var(--card)',
        borderColor: on ? platform.color : 'var(--border)',
        color:       on ? platform.color : 'var(--text-muted)',
      }}>
      <Icon size={12} />{platform.label}
    </button>
  )
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.draft
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: style.bg, color: style.color }}>
      {style.label}
    </span>
  )
}

export default function ContentManagement() {
  const navigate = useNavigate()
  const { activeClient } = useClient()
  const [tab, setTab] = useState('Drafts')
  const [drafts, setDrafts] = useState([])
  const [search, setSearch] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editId, setEditId] = useState(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const [toast, setToast] = useState(null)
  const [mediaFiles, setMediaFiles] = useState([])
  const [fileUploadError, setFileUploadError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', caption: '', hashtags: '', platforms:['instagram'], campaign:'', status:'draft', scheduleDate:'', scheduleTime:'09:00',
  })

  const clientPosts = activeClient ? (MOCK_CLIENT_POSTS[activeClient.id] ?? { drafts: [], scheduled: [], published: [] }) : { drafts: [], scheduled: [], published: [] }
  const campaigns = activeClient ? (MOCK_CLIENT_CAMPAIGNS[activeClient.id] ?? []) : []
  const stats = {
    drafts:  drafts.filter(d => d.status === 'draft').length,
    review:  drafts.filter(d => d.status === 'review').length,
    scheduled: clientPosts.scheduled.length,
    published: clientPosts.published.length,
  }

  const upd = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const togglePlatform = id => upd('platforms', form.platforms.includes(id) ? form.platforms.filter(p => p !== id) : [...form.platforms, id])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleUploadFiles = files => {
    const accepted = files.filter(file => {
      const isAccepted = ACCEPTED_FILE_TYPES.includes(file.type) || /\.(doc|docx|ppt|pptx)$/i.test(file.name)
      if (!isAccepted) {
        setFileUploadError('Unsupported file type. Please upload a valid image, video, audio, PDF, or document.')
        return false
      }
      if (file.size > CONTENT_MAX_FILE_SIZE) {
        setFileUploadError('File exceeds maximum size of 100 MB.')
        return false
      }
      return true
    })
    if (accepted.length === 0) return
    setFileUploadError('')
    setMediaFiles(accepted)
  }

  const handleRemoveFile = index => setMediaFiles(prev => prev.filter((_, idx) => idx !== index))

  const handleSave = async status => {
    if (!activeClient) {
      showToast('Select a client before saving content.', 'error')
      return
    }
    if (!form.title.trim()) {
      showToast('Add a title before saving.', 'error')
      return
    }
    if (!form.caption.trim()) {
      showToast('Add a caption or description before saving.', 'error')
      return
    }
    if (mediaFiles.length === 0) {
      showToast('Upload a file before saving.', 'error')
      return
    }
    if (status === 'scheduled' && (!form.scheduleDate || !form.scheduleTime)) {
      showToast('Select a schedule date and time for scheduled content.', 'error')
      return
    }

    const payload = {
      title: form.title,
      caption: form.caption,
      campaign: form.campaign || null,
      platform: form.platforms[0] || 'instagram',
      status,
      tags: form.hashtags.split(/[,\s]+/).filter(Boolean),
      scheduledAt: form.scheduleDate && form.scheduleTime ? `${form.scheduleDate}T${form.scheduleTime}` : null,
      uploadedBy: activeClient.name,
    }

    try {
      setIsSaving(true)
      const saved = await contentApi.uploadContent(activeClient.id, payload, mediaFiles[0], progress => setUploadProgress(progress))
      setDrafts(prev => [saved, ...prev])
      showToast(status === 'review' ? 'Submitted for review' : 'Content saved successfully.')
      setShowEditor(false)
      setMediaFiles([])
      setUploadProgress(0)
      setForm({ title:'', caption:'', hashtags:'', platforms:['instagram'], campaign:'', status:'draft', scheduleDate:'', scheduleTime:'09:00' })
    } catch (error) {
      showToast(error.message || 'Upload failed. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const openNew = () => {
    setForm({ title:'', caption:'', hashtags:'', platforms:['instagram'], campaign:'', status:'draft', scheduleDate:'', scheduleTime:'09:00' })
    setMediaFiles([])
    setEditId(null)
    setShowEditor(true)
  }

  const openEdit = draft => {
    setForm({
      title: draft.title,
      caption: draft.caption,
      hashtags: draft.tags?.join(' ') ?? '',
      platforms: [draft.platform],
      campaign: draft.campaign || '',
      status: draft.status,
      scheduleDate: draft.scheduledAt ? draft.scheduledAt.split('T')[0] : '',
      scheduleTime: draft.scheduledAt ? draft.scheduledAt.split('T')[1]?.slice(0,5) : '09:00',
    })
    setEditId(draft.id)
    setMediaFiles([])
    setShowEditor(true)
  }

  const handleDelete = id => {
    setDrafts(prev => prev.filter(item => item.id !== id))
    showToast('Draft removed')
  }

  const handleDuplicate = id => {
    const source = drafts.find(item => item.id === id)
    if (!source) return
    setDrafts(prev => [
      { ...source, id:`d${Date.now()}`, title:`${source.title} (Copy)`, updatedAt:'Just now' },
      ...prev,
    ])
    showToast('Draft duplicated')
  }

  const filteredDrafts = drafts.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.caption.toLowerCase().includes(search.toLowerCase())
  )

  const inputStyle = { background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }
  const inputClass = 'w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none transition-all'

  if (!activeClient) {
    return (
      <div className="p-6"><div className="card">
        <EmptyState icon={Users} title="No client selected" message="Select a client first."
          action={{ label:'View Clients', onClick:() => navigate('/dashboard/mkt/clients') }} />
      </div></div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      {toast && (
        <AnimatePresence>
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="fixed top-4 right-4 z-50 rounded-[var(--r-md)] px-4 py-3 text-sm font-semibold shadow-[var(--shadow-lg)]"
            style={{ background: toast.type === 'error' ? 'rgba(239,68,68,.95)' : 'rgba(34,197,94,.95)', color:'#fff' }}>
            {toast.message}
          </motion.div>
        </AnimatePresence>
      )}

      <button onClick={() => navigate('/dashboard/mkt/workspace')}
        className="flex items-center gap-1.5 text-sm font-semibold mb-4 hover:underline"
        style={{ color:'var(--primary)' }}>
        <ArrowLeft size={15} /> Back to Workspace
      </button>

      <PageHeader
        title="Content Management"
        subtitle={`Managing content for ${activeClient.name}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTab('Library')}
              className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold border border-white/15 text-white hover:brightness-110 transition-all"
              style={{ background:'rgba(255,255,255,0.08)' }}>
              <BookOpen size={15} /> Library
            </button>
            <button onClick={openNew}
              className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105 transition-all"
              style={{ background:'linear-gradient(135deg, #1E3A8A, #4F46E5)' }}>
              <Plus size={15} /> New Post
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 items-center mb-5">
        {['Library','Drafts','Review','Schedule','Publishing'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-[var(--r-md)] text-sm font-semibold ${tab===t ? 'text-white' : 'text-[var(--text-muted)]'}`}
            style={{ background: tab===t ? 'linear-gradient(135deg,#1E3A8A,#4F46E5)' : 'var(--card)' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Drafts' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
          <div className="card p-5 xl:col-span-2">
            <h2 className="text-sm font-bold mb-3" style={{ color:'var(--text)' }}>Client snapshot</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color:'var(--text-muted)' }}>BUSINESS</p>
                <p className="font-semibold" style={{ color:'var(--text)' }}>{activeClient.name}</p>
                <p className="text-sm" style={{ color:'var(--text-muted)' }}>{activeClient.industry} · {activeClient.location}</p>
                <p className="mt-2 text-sm" style={{ color:'var(--text-muted)' }}>{activeClient.email}</p>
                <p className="text-sm truncate" style={{ color:'var(--text-muted)' }}>{activeClient.website}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color:'var(--text-muted)' }}>CONNECTED PLATFORMS</p>
                <div className="flex flex-wrap gap-2">
                  {activeClient.connectedPlatforms.map(platformId => {
                    const platform = PLATFORMS.find(item => item.id === platformId)
                    if (!platform) return null
                    const Icon = platform.icon
                    return (
                      <span key={platformId} className="flex items-center gap-1 px-3 py-1 rounded-full border text-[11px]"
                        style={{ borderColor: platform.color, color: platform.color }}>
                        <Icon size={12} /> {platform.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold" style={{ color:'var(--text)' }}>Workflow at a glance</h2>
              <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background:'rgba(30,58,138,.08)', color:'#1E3A8A' }}>Live</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm" style={{ color:'var(--text-muted)' }}>
              <div className="rounded-[var(--r-md)] p-4" style={{ background:'var(--bg-alt)' }}>
                <p className="text-lg font-semibold" style={{ color:'var(--text)' }}>{stats.drafts}</p>
                <p className="mt-1 text-xs">Drafts</p>
              </div>
              <div className="rounded-[var(--r-md)] p-4" style={{ background:'var(--bg-alt)' }}>
                <p className="text-lg font-semibold" style={{ color:'var(--text)' }}>{stats.review}</p>
                <p className="mt-1 text-xs">In review</p>
              </div>
              <div className="rounded-[var(--r-md)] p-4" style={{ background:'var(--bg-alt)' }}>
                <p className="text-lg font-semibold" style={{ color:'var(--text)' }}>{stats.scheduled}</p>
                <p className="mt-1 text-xs">Scheduled</p>
              </div>
              <div className="rounded-[var(--r-md)] p-4" style={{ background:'var(--bg-alt)' }}>
                <p className="text-lg font-semibold" style={{ color:'var(--text)' }}>{stats.published}</p>
                <p className="mt-1 text-xs">Published</p>
              </div>
            </div>
            <button onClick={() => setTab('Library')}
              className="mt-5 w-full h-10 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-110"
              style={{ background:'linear-gradient(135deg, #1E3A8A, #4F46E5)' }}>
              Open library
            </button>
          </div>
        </div>
      )}

      {/* Library / Review / Schedule / Publishing panels */}
      {tab === 'Library' && <LibraryPanel />}
      {tab === 'Review' && <ReviewPanel />}
      {tab === 'Schedule' && <SchedulingPanel />}
      {tab === 'Publishing' && <PublishingPanel />}

      <div className="card p-5 mb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-subtle)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drafts…"
              className="w-full h-10 pl-10 pr-4 text-sm rounded-[var(--r-md)] border outline-none"
              style={inputStyle} />
          </div>
          <button onClick={openNew}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-[var(--r-md)] bg-[var(--primary)] text-sm font-semibold text-white hover:brightness-105"
            style={{ background:'linear-gradient(135deg, #1E3A8A, #4F46E5)' }}>
            <Plus size={14} /> New draft
          </button>
        </div>
      </div>

      {filteredDrafts.length === 0 && !showEditor ? (
        <div className="card p-6 text-center">
          <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>No drafts yet</p>
          <p className="text-xs mt-2" style={{ color:'var(--text-muted)' }}>Start by creating a post for this client.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          <AnimatePresence>
            {filteredDrafts.map((draft, index) => {
              const platform = PLATFORMS.find(item => item.id === draft.platform)
              const Icon = platform?.icon
              const style = STATUS_STYLES[draft.status] ?? STATUS_STYLES.draft
              return (
                <motion.div key={draft.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.96 }}
                  transition={{ duration:0.2, delay:index * 0.04 }}
                  className="card p-5 flex flex-col gap-4 hover:shadow-[var(--shadow-md)] transition-shadow">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {Icon && <Icon size={14} style={{ color:platform.color }} />}
                      <span className="text-xs font-semibold capitalize" style={{ color:'var(--text)' }}>{platform?.label || draft.platform}</span>
                    </div>
                    <StatusBadge status={draft.status} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold" style={{ color:'var(--text)' }}>{draft.title}</h3>
                    <p className="text-xs leading-relaxed line-clamp-3" style={{ color:'var(--text-muted)' }}>{draft.caption}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-[var(--text-muted)]">
                    {draft.tags?.map(tag => <span key={tag} className="px-2 py-1 rounded-full" style={{ background:'var(--bg-alt)' }}>#{tag}</span>)}
                    {draft.campaign && <span className="px-2 py-1 rounded-full" style={{ background:'rgba(59,130,246,.12)', color:'#2563EB' }}>{draft.campaign}</span>}
                    {draft.scheduledAt && (
                      <span className="px-2 py-1 rounded-full" style={{ background:'rgba(14,165,233,.12)', color:'#0369A1' }}>{new Date(draft.scheduledAt).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor:'var(--border)' }}>
                    <button onClick={() => openEdit(draft)} className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline">
                      <Edit3 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDuplicate(draft.id)} className="flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)] hover:underline">
                      <Copy size={12} /> Duplicate
                    </button>
                    <button onClick={() => handleDelete(draft.id)} className="ml-auto flex items-center gap-1 text-xs font-semibold text-[#dc2626] hover:underline">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-start justify-end"
            onClick={() => setShowEditor(false)}>
            <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }} transition={{ duration:0.25, ease:'easeInOut' }}
              className="w-full max-w-xl h-full overflow-y-auto flex flex-col"
              style={{ background:'var(--card)', borderLeft:'1px solid var(--border)' }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:'var(--border)' }}>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{editId ? 'Edit post' : 'New draft'}</p>
                  <h2 className="text-lg font-bold" style={{ color:'var(--text)' }}>{activeClient.name}</h2>
                </div>
                <button onClick={() => setShowEditor(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color:'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color:'var(--text)' }}>Publish to</p>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map(platform => (
                      <PlatformToggle key={platform.id} platform={platform} selected={form.platforms} onToggle={togglePlatform} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Caption *</label>
                  <textarea value={form.caption} onChange={e => upd('caption', e.target.value)}
                    rows={4} className="w-full px-4 py-3 text-sm rounded-[var(--r-md)] border outline-none resize-none"
                    style={inputStyle} placeholder="Write the post caption here..." />
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button type="button" onClick={() => setShowEmoji(v => !v)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full border text-xs"
                      style={{ borderColor:'var(--border)', color:'var(--text-muted)' }}>
                      <Smile size={12} /> Emoji
                    </button>
                    <button type="button" onClick={() => upd('caption', `${form.caption} #`)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full border text-xs"
                      style={{ borderColor:'var(--border)', color:'var(--text-muted)' }}>
                      <Hash size={12} /> Hashtag
                    </button>
                  </div>
                  <AnimatePresence>
                    {showEmoji && (
                      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
                        className="mt-3 grid grid-cols-6 gap-2 p-3 rounded-[var(--r-md)] border" style={{ background:'var(--bg)', borderColor:'var(--border)' }}>
                        {EMOJI_LIST.map(em => (
                          <button key={em} type="button" onClick={() => { upd('caption', form.caption + em); setShowEmoji(false) }}
                            className="text-base text-center">{em}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Campaign</label>
                  <select value={form.campaign} onChange={e => upd('campaign', e.target.value)} className={inputClass} style={inputStyle}>
                    <option value="">None</option>
                    {campaigns.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Post title</label>
                  <input value={form.title} onChange={e => upd('title', e.target.value)} placeholder="Internal title" className={inputClass} style={inputStyle} />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Hashtags</label>
                  <input value={form.hashtags} onChange={e => upd('hashtags', e.target.value)} placeholder="#brand #launch" className={inputClass} style={inputStyle} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Schedule date</label>
                    <input type="date" value={form.scheduleDate} onChange={e => upd('scheduleDate', e.target.value)} className={inputClass} style={inputStyle} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Schedule time</label>
                    <input type="time" value={form.scheduleTime} onChange={e => upd('scheduleTime', e.target.value)} className={inputClass} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <FileUploadField
                    files={mediaFiles}
                    onFilesChange={handleUploadFiles}
                    error={fileUploadError}
                    onFileRemove={handleRemoveFile}
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-3 h-2 rounded-full overflow-hidden bg-[var(--bg-alt)]">
                      <div className="h-full bg-[var(--primary)] transition-all" style={{ width:`${uploadProgress}%` }} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-3 border-t" style={{ borderColor:'var(--border)' }}>
                  <button onClick={() => handleSave('draft')}
                    className="flex items-center justify-center gap-2 px-4 h-10 rounded-[var(--r-md)] border text-sm font-semibold"
                    style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
                    <Save size={14} /> Save Draft
                  </button>
                  <button onClick={() => handleSave('review')}
                    className="flex items-center justify-center gap-2 px-4 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white"
                    style={{ background:'linear-gradient(135deg, #1E3A8A, #4F46E5)' }}>
                    <Send size={14} /> Submit for Review
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
