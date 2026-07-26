import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone, Plus, Search, Edit3, Trash2, Eye,
  X, CheckCircle2, Clock, AlertTriangle, TrendingUp,
  Calendar, DollarSign, ArrowLeft, Users, ChevronDown,
  Film, Image, MessageCircle, Sparkles, Share2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { api, MOCK_CLIENT_CAMPAIGNS, MOCK_CLIENT_POSTS, MOCK_MARKETING_TEAMS } from '../../../services/mockData'

const PLATFORM_META = [
  { id:'instagram', label:'Instagram', color:'#E1306C' },
  { id:'facebook',  label:'Facebook',  color:'#1877F2' },
  { id:'linkedin',  label:'LinkedIn',  color:'#0A66C2' },
  { id:'x',         label:'X',         color:'#374151' },
  { id:'youtube',   label:'YouTube',   color:'#FF0000' },
  { id:'pinterest', label:'Pinterest', color:'#E60023' },
]

const CAMPAIGN_STATUSES = {
  active:    { label:'Active',    color:'#22C55E', bg:'rgba(34,197,94,.12)' },
  paused:    { label:'Paused',    color:'#F59E0B', bg:'rgba(245,158,11,.12)' },
  completed: { label:'Completed', color:'#64748B', bg:'rgba(100,116,139,.12)' },
  draft:     { label:'Draft',     color:'#1E3A8A', bg:'rgba(30,58,138,.12)' },
}

const PRIORITY_OPTIONS = ['High', 'Medium', 'Low']
const OBJECTIVES = ['Brand Awareness', 'Lead Generation', 'Sales', 'Engagement', 'Reach', 'Traffic']
const VIEW_MODES = ['table', 'cards']
const CONTENT_STATES = ['draft', 'scheduled', 'published', 'rejected']
const SHARED_INPUT_STYLE = { background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div initial={{ scale:0.96 }} animate={{ scale:1 }} exit={{ scale:0.96 }}
        className="w-full max-w-sm rounded-[var(--r-xl)] p-6" style={{ background:'var(--card)', border:'1px solid var(--border)' }}>
        <h2 className="text-base font-bold mb-2" style={{ color:'var(--text)' }}>{title}</h2>
        <p className="text-sm mb-5" style={{ color:'var(--text-muted)' }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 h-10 rounded-[var(--r-md)] border text-sm font-semibold"
            style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white"
            style={{ background:'#EF4444' }}>Delete</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Badge({ label, color, bg }) {
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color, background:bg || 'rgba(148,163,184,.12)' }}>
      {label}
    </span>
  )
}

function ContentPreviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs" style={{ color:'var(--text-muted)' }}>
      <span>{label}</span>
      <span className="text-right" style={{ color:'var(--text)' }}>{value || '-'}</span>
    </div>
  )
}

function ContentFormDrawer({ open, onClose, businessUser, campaign, platforms, assignedTeam, contentItem, onSave, onSchedule }) {
  const isEdit = Boolean(contentItem)
  const [form, setForm] = useState(() => ({
    title: contentItem?.title || '',
    caption: contentItem?.caption || '',
    hashtags: contentItem?.hashtags?.join(' ') || '',
    cta: contentItem?.cta || 'Learn More',
    assignedTo: contentItem?.assignedTo || assignedTeam.name,
    priority: contentItem?.priority || 'Medium',
    platforms: contentItem?.platforms || platforms.map(p => p.id),
    mediaType: contentItem?.mediaType || 'image',
    mediaPreview: contentItem?.mediaPreview || '',
    scheduleDate: contentItem?.scheduledAt?.split('T')[0] || '',
    scheduleTime: contentItem?.scheduledAt?.split('T')[1] || '09:00',
    approval: contentItem?.approval || 'pending',
    copies: contentItem?.copies || 1,
  }))

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-end" onClick={onClose}>
          <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }} transition={{ duration:0.25, ease:'easeInOut' }}
            className="w-full max-w-xl h-full overflow-y-auto flex flex-col" style={{ background:'var(--card)', borderLeft:'1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:'var(--border)' }}>
              <div>
                <p className="text-xs text-[var(--text-muted)]">{isEdit ? 'Edit content' : 'Add content'}</p>
                <h2 className="text-lg font-bold" style={{ color:'var(--text)' }}>{campaign.name}</h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color:'var(--text-muted)' }}><X size={16} /></button>
            </div>
            <div className="p-5 flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-[var(--r-md)] p-4" style={{ background:'var(--bg-alt)' }}>
                  <p className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color:'var(--text-muted)' }}>Business user</p>
                  <p className="font-semibold" style={{ color:'var(--text)' }}>{businessUser.name}</p>
                  <p className="text-xs" style={{ color:'var(--text-muted)' }}>{businessUser.industry} · {businessUser.location}</p>
                </div>
                <div className="rounded-[var(--r-md)] p-4" style={{ background:'var(--bg-alt)' }}>
                  <p className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color:'var(--text-muted)' }}>Campaign</p>
                  <p className="font-semibold" style={{ color:'var(--text)' }}>{campaign.name}</p>
                  <p className="text-xs" style={{ color:'var(--text-muted)' }}>{campaign.objective}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Platform selection</label>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map(platform => (
                      <button key={platform.id} type="button" onClick={() => {
                        const has = form.platforms.includes(platform.id)
                        update('platforms', has ? form.platforms.filter(id => id !== platform.id) : [...form.platforms, platform.id])
                      }}
                        className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                        style={{
                          background: form.platforms.includes(platform.id) ? `${platform.color}15` : 'var(--card)',
                          borderColor: form.platforms.includes(platform.id) ? platform.color : 'var(--border)',
                          color: form.platforms.includes(platform.id) ? platform.color : 'var(--text-muted)',
                        }}>
                        {platform.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Caption</label>
                    <textarea value={form.caption} onChange={e => update('caption', e.target.value)} rows={4}
                      className="w-full px-4 py-3 text-sm rounded-[var(--r-md)] border outline-none resize-none"
                      style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Hashtags</label>
                    <input value={form.hashtags} onChange={e => update('hashtags', e.target.value)}
                      className="w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none"
                      style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }}
                      placeholder="#sales #launch" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Call to action</label>
                    <input value={form.cta} onChange={e => update('cta', e.target.value)}
                      className="w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none"
                      style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }}
                      placeholder="Learn More" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Priority</label>
                    <select value={form.priority} onChange={e => update('priority', e.target.value)}
                      className="w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none"
                      style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }}>
                      {PRIORITY_OPTIONS.map(priority => <option key={priority}>{priority}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Assign team member</label>
                    <input value={form.assignedTo} onChange={e => update('assignedTo', e.target.value)}
                      className="w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none"
                      style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Copies</label>
                    <input type="number" min={1} value={form.copies} onChange={e => update('copies', Number(e.target.value))}
                      className="w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none" style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Assign team member</label>
                  <input value={form.assignedTo} onChange={e => update('assignedTo', e.target.value)}
                    className="w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none"
                    style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }} />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Media preview</label>
                  <div className="h-40 rounded-[var(--r-md)] border border-dashed flex items-center justify-center text-sm"
                    style={{ borderColor:'var(--border)', color:'var(--text-muted)' }}>
                    {form.mediaPreview ? form.mediaPreview : 'Drag or click to upload images/videos (placeholder)'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Schedule date</label>
                    <input type="date" value={form.scheduleDate} onChange={e => update('scheduleDate', e.target.value)}
                      className="w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none"
                      style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Schedule time</label>
                    <input type="time" value={form.scheduleTime} onChange={e => update('scheduleTime', e.target.value)}
                      className="w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none"
                      style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 border-t" style={{ borderColor:'var(--border)' }}>
                <button onClick={onClose} className="flex-1 h-10 rounded-[var(--r-md)] border text-sm font-semibold"
                  style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>Cancel</button>
                <div className="flex gap-2 flex-col sm:flex-row w-full">
                  <button onClick={() => onSave({ ...form, action:'draft' })}
                    className="flex-1 h-10 rounded-[var(--r-md)] border text-sm font-semibold"
                    style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
                    Save draft
                  </button>
                  <button onClick={() => onSchedule({ ...form, action:'schedule' })}
                    className="flex-1 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white"
                    style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                    Schedule content
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ContentViewDrawer({ open, onClose, content, businessUser, campaign }) {
  if (!content) return null
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-end" onClick={onClose}>
          <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }} transition={{ duration:0.25, ease:'easeInOut' }}
            className="w-full max-w-xl h-full overflow-y-auto flex flex-col" style={{ background:'var(--card)', borderLeft:'1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:'var(--border)' }}>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Content details</p>
                <h2 className="text-lg font-bold" style={{ color:'var(--text)' }}>{content.title}</h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color:'var(--text-muted)' }}><X size={16} /></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 gap-3">
                <ContentPreviewRow label="Business User" value={businessUser.name} />
                <ContentPreviewRow label="Campaign" value={campaign.name} />
                <ContentPreviewRow label="Objective" value={campaign.objective} />
                <ContentPreviewRow label="Platform" value={content.platforms.join(', ')} />
                <ContentPreviewRow label="Assigned member" value={content.assignedTo} />
                <ContentPreviewRow label="Schedule" value={content.scheduledAt || 'Not scheduled'} />
                <ContentPreviewRow label="Publishing status" value={content.status} />
                <ContentPreviewRow label="Approval" value={content.approval} />
                <ContentPreviewRow label="Created" value={content.createdAt} />
                <ContentPreviewRow label="Updated" value={content.updatedAt} />
              </div>
              <div className="rounded-[var(--r-md)] p-4" style={{ background:'var(--bg-alt)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--text)' }}>Caption</p>
                <p className="text-sm" style={{ color:'var(--text)' }}>{content.caption}</p>
              </div>
              <div className="rounded-[var(--r-md)] p-4" style={{ background:'var(--bg-alt)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--text)' }}>Media preview</p>
                <div className="h-44 rounded-[var(--r-md)] border border-dashed flex items-center justify-center" style={{ borderColor:'var(--border)', color:'var(--text-muted)' }}>
                  {content.mediaPreview || 'Preview placeholder'}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ScheduleConfirmationModal({ open, onCancel, onConfirm, content }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div initial={{ scale:0.96 }} animate={{ scale:1 }} exit={{ scale:0.96 }}
            className="w-full max-w-md rounded-[var(--r-xl)] p-6" style={{ background:'var(--card)', border:'1px solid var(--border)' }}>
            <h2 className="text-base font-bold mb-2" style={{ color:'var(--text)' }}>Schedule Content</h2>
            <p className="text-sm mb-5" style={{ color:'var(--text-muted)' }}>
              Schedule "{content?.title}" for publishing and add it to the campaign timeline.
            </p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 h-10 rounded-[var(--r-md)] border text-sm font-semibold"
                style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>Cancel</button>
              <button onClick={onConfirm} className="flex-1 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white"
                style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>Schedule</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function createInitialContentItems(clientPosts) {
  const createItem = (post, defaultStatus, approval) => ({
    id: post.id,
    title: post.title,
    campaign: post.campaign,
    objective: '',
    platform: post.platform,
    platforms: [post.platform],
    caption: post.caption,
    hashtags: post.tags || [],
    cta: 'Learn More',
    assignedTo: 'Digital Spark Agency',
    priority: 'Medium',
    status: defaultStatus,
    approval,
    scheduledAt: post.scheduledAt || '',
    createdAt: post.createdAt || post.scheduledAt || '2025-07-18',
    updatedAt: post.updatedAt || post.scheduledAt || '2025-07-18',
    mediaPreview: post.media ? 'Media asset placeholder' : 'No media attached',
  })

  return [
    ...clientPosts.drafts.map(post => createItem(post, 'draft', 'pending')),
    ...clientPosts.scheduled.map(post => createItem(post, 'scheduled', 'pending')),
    ...clientPosts.published.map(post => createItem(post, 'published', 'approved')),
  ]
}

export default function CampaignManagement() {
  const navigate = useNavigate()
  const { activeClient } = useClient()
  const assignedTeam = MOCK_MARKETING_TEAMS.find(team => team.isAssigned) ?? MOCK_MARKETING_TEAMS[0]

  const [campaigns, setCampaigns] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [showCampaignForm, setShowCampaignForm] = useState(false)
  const [editCampaign, setEditCampaign] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [toast, setToast] = useState(null)
  const [contentItems, setContentItems] = useState([])
  const [showContentForm, setShowContentForm] = useState(false)
  const [contentEditorItem, setContentEditorItem] = useState(null)
  const [showContentView, setShowContentView] = useState(false)
  const [viewContentItem, setViewContentItem] = useState(null)
  const [showScheduleConfirm, setShowScheduleConfirm] = useState(false)
  const [scheduleTarget, setScheduleTarget] = useState(null)
  const [contentViewMode, setContentViewMode] = useState('table')

  if (!activeClient) {
    return (
      <div className="p-6"><div className="card">
        <EmptyState icon={Users} title="No client selected" message="Select a client first."
          action={{ label:'View Clients', onClick:() => navigate('/dashboard/mkt/clients') }} />
      </div></div>
    )
  }

  const showToastMsg = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    if (!activeClient) {
      setCampaigns([])
      setContentItems([])
      return
    }
    setCampaigns(MOCK_CLIENT_CAMPAIGNS[activeClient.id] ?? [])
    setContentItems(createInitialContentItems(MOCK_CLIENT_POSTS[activeClient.id] ?? { drafts:[], scheduled:[], published:[] }))
  }, [activeClient])

  const openCampaignDetails = campaign => {
    setSelectedCampaign(campaign)
  }

  const closeCampaignDetails = () => {
    setSelectedCampaign(null)
    setViewContentItem(null)
    setShowContentView(false)
    setContentEditorItem(null)
    setShowContentForm(false)
  }

  const handleOpenCampaignForm = campaign => {
    setEditCampaign(campaign)
    setShowCampaignForm(true)
  }

  const handleSaveCampaign = async updated => {
    if (!updated.name || !updated.budget || !updated.start || !updated.end) {
      showToastMsg('Fill in all required campaign fields.', 'error')
      return
    }
    const campaignData = {
      ...updated,
      clientName: activeClient?.name,
      budget: Number(updated.budget),
      spent: Number(updated.spent) || 0,
      progress: Number(updated.progress) || 0,
      posts: Number(updated.posts) || 0,
      reach: Number(updated.reach) || 0,
      notes: updated.notes || updated.notes === '' ? updated.notes : updated.notes,
      createdAt: updated.createdAt || updated.start,
      updatedAt: updated.updatedAt || updated.end,
    }
    // future integration: await api.post('/campaigns', campaignData)

    if (editCampaign) {
      setCampaigns(prev => prev.map(c => c.id === editCampaign.id ? { ...c, ...campaignData, id: editCampaign.id } : c))
      showToastMsg('Campaign updated!')
    } else {
      const newCampaign = { ...campaignData, id: Date.now() }
      setCampaigns(prev => [newCampaign, ...prev])
      showToastMsg('Campaign created!')
    }
    setShowCampaignForm(false)
  }

  const handleDeleteCampaign = campaignId => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId))
    if (selectedCampaign?.id === campaignId) closeCampaignDetails()
    setConfirmDelete(null)
    showToastMsg('Campaign deleted.')
  }

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const campaignContent = useMemo(() => {
    if (!selectedCampaign) return []
    return contentItems.filter(item => item.campaign === selectedCampaign.name)
  }, [contentItems, selectedCampaign])

  const contentSummary = useMemo(() => {
    const total = campaignContent.length
    const counts = {
      draft: campaignContent.filter(item => item.status === 'draft').length,
      scheduled: campaignContent.filter(item => item.status === 'scheduled').length,
      published: campaignContent.filter(item => item.status === 'published').length,
      rejected: campaignContent.filter(item => item.status === 'rejected').length,
    }
    return { total, ...counts }
  }, [campaignContent])

  const timelineEntries = useMemo(() => {
    return [...campaignContent]
      .sort((a, b) => new Date(a.scheduledAt || a.createdAt) - new Date(b.scheduledAt || b.createdAt))
      .map(item => ({
        date: item.scheduledAt ? item.scheduledAt.split('T')[0] : item.createdAt,
        title: item.title,
        status: item.status,
        platform: item.platform,
      }))
  }, [campaignContent])

  const analyticsSummary = useMemo(() => ({
    total: contentSummary.total,
    published: contentSummary.published,
    scheduled: contentSummary.scheduled,
    draft: contentSummary.draft,
    reach: selectedCampaign?.reach ?? 0,
    engagement: Math.round((selectedCampaign?.reach ?? 0) * 0.15),
    progress: selectedCampaign?.progress ?? 0,
  }), [contentSummary, selectedCampaign])

  const connectedPlatforms = PLATFORM_META.filter(platform => activeClient.connectedPlatforms.includes(platform.id))

  const openAddContent = () => {
    setContentEditorItem(null)
    setShowContentForm(true)
  }

  const openEditContent = content => {
    setContentEditorItem(content)
    setShowContentForm(true)
  }

  const openViewContent = content => {
    setViewContentItem(content)
    setShowContentView(true)
  }

  const handleSaveContent = payload => {
    const copies = Number(payload.copies) || 1

    const baseItem = {
      title: payload.title || 'Untitled content',
      campaign: selectedCampaign.name,
      objective: selectedCampaign.objective,
      platforms: payload.platforms.length ? payload.platforms : connectedPlatforms.map(p => p.id),
      platform: payload.platforms[0] || connectedPlatforms[0]?.id || 'instagram',
      caption: payload.caption,
      hashtags: payload.hashtags.split(/\s+/).filter(Boolean),
      cta: payload.cta,
      assignedTo: payload.assignedTo,
      priority: payload.priority,
      status: payload.action === 'draft' ? 'draft' : payload.action === 'schedule' ? 'scheduled' : 'draft',
      approval: 'pending',
      scheduledAt: payload.action === 'schedule' ? `${payload.scheduleDate}T${payload.scheduleTime}` : '',
      mediaPreview: payload.mediaPreview || 'Media asset placeholder',
    }

    if (contentEditorItem) {
      const item = {
        ...baseItem,
        id: contentEditorItem.id,
        createdAt: contentEditorItem.createdAt || new Date().toISOString().slice(0, 16),
        updatedAt: new Date().toISOString().slice(0, 16),
      }
      setContentItems(prev => prev.map(itemRow => itemRow.id === contentEditorItem.id ? { ...itemRow, ...item } : itemRow))
      showToastMsg('Content updated.')
    } else {
      if (copies <= 1) {
        const item = { ...baseItem, id: Date.now(), createdAt: new Date().toISOString().slice(0, 16), updatedAt: new Date().toISOString().slice(0, 16) }
        setContentItems(prev => [item, ...prev])
        showToastMsg('Content created.')
      } else {
        const ts = Date.now()
        const items = Array.from({ length: copies }).map((_, i) => ({
          ...baseItem,
          id: ts + i,
          title: `${baseItem.title} ${i + 1}`,
          createdAt: new Date(Date.now() + i).toISOString().slice(0, 16),
          updatedAt: new Date(Date.now() + i).toISOString().slice(0, 16),
        }))
        setContentItems(prev => [...items, ...prev])
        showToastMsg(`${copies} content items created.`)
      }
    }
    setShowContentForm(false)
  }

  const handleDuplicateContent = content => {
    const duplicated = { ...content, id: Date.now(), title: `${content.title} (Copy)`, status:'draft', approval:'pending', createdAt:new Date().toISOString().slice(0,16), updatedAt:new Date().toISOString().slice(0,16) }
    setContentItems(prev => [duplicated, ...prev])
    showToastMsg('Content duplicated as draft.')
  }

  const handleDeleteContent = content => {
    setContentItems(prev => prev.filter(item => item.id !== content.id))
    showToastMsg('Content deleted.')
  }

  const handleScheduleContent = content => {
    setScheduleTarget(content)
    setShowScheduleConfirm(true)
  }

  const confirmScheduleContent = () => {
    if (!scheduleTarget) return
    setContentItems(prev => prev.map(item => item.id === scheduleTarget.id ? {
      ...item,
      status: 'scheduled',
      scheduledAt: item.scheduledAt || `${new Date().toISOString().slice(0, 10)}T09:00`,
      updatedAt: new Date().toISOString().slice(0, 16),
    } : item))
    setShowScheduleConfirm(false)
    setScheduleTarget(null)
    showToastMsg('Content scheduled.')
  }

  const campaignStats = useMemo(() => {
    if (!selectedCampaign) return {}
    const total = campaignContent.length || 1
    const published = campaignContent.filter(item => item.status === 'published').length
    const progress = Math.round((published / total) * 100)
    return { ...selectedCampaign, progress }
  }, [campaignContent, selectedCampaign])

  

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      {toast && (
        <AnimatePresence><motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-[var(--r-md)] text-sm font-semibold shadow-[var(--shadow-lg)]"
          style={{ background: toast.type === 'error' ? 'rgba(239,68,68,.95)' : 'rgba(34,197,94,.95)', color:'#fff' }}>
          {toast.message}
        </motion.div></AnimatePresence>
      )}

      <button onClick={() => navigate('/dashboard/mkt/workspace')}
        className="flex items-center gap-1.5 text-sm font-semibold mb-4 hover:underline" style={{ color:'var(--primary)' }}>
        <ArrowLeft size={15} /> Back to Workspace
      </button>

      <PageHeader
        title="Campaign Management"
        subtitle={`Campaigns for: ${activeClient.name}`}
        actions={(
          <button onClick={() => { setEditCampaign(null); setShowCampaignForm(true) }}
            className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105"
            style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
            <Plus size={15} /> New Campaign
          </button>
        )}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label:'Total campaigns', value: campaigns.length },
          { label:'Active', value: campaigns.filter(c => c.status === 'active').length },
          { label:'Scheduled content', value: contentItems.filter(item => item.status === 'scheduled').length },
          { label:'Published content', value: contentItems.filter(item => item.status === 'published').length },
        ].map(metric => (
          <div key={metric.label} className="card p-4 text-center">
            <p className="text-2xl font-extrabold" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'var(--text)' }}>{metric.value}</p>
            <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-subtle)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns"
            className="w-full h-10 pl-9 pr-4 text-sm rounded-[var(--r-md)] border outline-none"
            style={SHARED_INPUT_STYLE} />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all','active','paused','completed','draft'].map(filter => {
            const active = statusFilter === filter
            const style = CAMPAIGN_STATUSES[filter] || { color:'var(--text-muted)', bg:'var(--card)' }
            return (
              <button key={filter} onClick={() => setStatusFilter(filter)}
                className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                style={{
                  background: active ? style.bg : 'var(--card)',
                  borderColor: active ? style.color : 'var(--border)',
                  color: active ? style.color : 'var(--text-muted)',
                }}>
                {filter === 'all' ? 'All' : style.label}
              </button>
            )
          })}
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>No campaigns found</p>
          <p className="text-xs mt-2" style={{ color:'var(--text-muted)' }}>Create a campaign to begin planning your workflow.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background:'var(--bg-alt)', borderBottom:'1px solid var(--border)' }}>
                  {['Campaign', 'Objective', 'Budget', 'Dates', 'Progress', 'Status', 'Actions'].map(header => (
                    <th key={header} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color:'var(--text-muted)' }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign, index) => {
                  const statusMeta = CAMPAIGN_STATUSES[campaign.status] || CAMPAIGN_STATUSES.active
                  return (
                    <motion.tr key={campaign.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:index * 0.02 }}
                      className="hover:bg-[var(--bg-alt)] transition-colors" style={{ borderBottom:'1px solid var(--border)' }}>
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="font-semibold truncate" style={{ color:'var(--text)' }}>{campaign.name}</p>
                        <p className="text-[11px] mt-1" style={{ color:'var(--text-muted)' }}>{campaign.notes || 'No notes yet.'}</p>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color:'var(--text-muted)' }}>{campaign.objective}</td>
                      <td className="px-4 py-3 text-xs">
                        <p className="font-semibold" style={{ color:'var(--text)' }}>${campaign.budget.toLocaleString()}</p>
                        <p className="text-[11px]" style={{ color:'var(--text-muted)' }}>${campaign.spent?.toLocaleString() ?? 0} spent</p>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color:'var(--text-muted)' }}>{campaign.start} - {campaign.end}</td>
                      <td className="px-4 py-3 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full" style={{ background:'var(--bg-alt)' }}>
                            <div className="h-1.5 rounded-full" style={{ width:`${campaign.progress}%`, background:'var(--primary)' }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color:'var(--text)' }}>{campaign.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={statusMeta.label} color={statusMeta.color} bg={statusMeta.bg} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openCampaignDetails(campaign)} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" title="Details" style={{ color:'var(--primary)' }}><Eye size={13} /></button>
                          <button onClick={() => handleOpenCampaignForm(campaign)} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" title="Edit" style={{ color:'var(--text-muted)' }}><Edit3 size={13} /></button>
                          <button onClick={() => setConfirmDelete(campaign)} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" title="Delete" style={{ color:'#EF4444' }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCampaign && (
        <CampaignDrawer
          campaign={{ ...campaignStats, notes: selectedCampaign.notes || '' }}
          items={campaignContent}
          businessUser={activeClient}
          assignedTeam={assignedTeam}
          platforms={connectedPlatforms}
          viewMode={contentViewMode}
          onChangeViewMode={setContentViewMode}
          onAddContent={openAddContent}
          onViewContent={openViewContent}
          onEditContent={openEditContent}
          onDeleteContent={handleDeleteContent}
          onDuplicateContent={handleDuplicateContent}
          onScheduleContent={handleScheduleContent}
          onOpenAnalytics={() => showToastMsg('Analytics panel is available in the campaign workspace.')}
          onGenerateReport={() => showToastMsg('Report generation is pending backend integration.')}
          onClose={closeCampaignDetails}
        />
      )}

      <ContentFormDrawer
        open={showContentForm}
        onClose={() => setShowContentForm(false)}
        businessUser={activeClient}
        campaign={selectedCampaign}
        platforms={connectedPlatforms}
        assignedTeam={assignedTeam}
        contentItem={contentEditorItem}
        onSave={handleSaveContent}
        onSchedule={handleSaveContent}
      />

      <ContentViewDrawer
        open={showContentView}
        onClose={() => setShowContentView(false)}
        content={viewContentItem}
        businessUser={activeClient}
        campaign={selectedCampaign}
      />

      <ScheduleConfirmationModal
        open={showScheduleConfirm}
        onCancel={() => setShowScheduleConfirm(false)}
        onConfirm={confirmScheduleContent}
        content={scheduleTarget}
      />

      <AnimatePresence>{showCampaignForm && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div initial={{ scale:0.96, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.96 }}
            className="w-full max-w-md rounded-[var(--r-xl)] p-6" style={{ background:'var(--card)', border:'1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>
            <CampaignForm
              campaign={editCampaign}
              onCancel={() => setShowCampaignForm(false)}
              onSave={handleSaveCampaign}
              businessUser={activeClient}
            />
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      {confirmDelete && (
        <ConfirmModal
          title="Delete campaign?"
          message={`Are you sure you want to permanently delete ${confirmDelete.name}?`}
          onConfirm={() => handleDeleteCampaign(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}

function CampaignDrawer({ campaign, items, businessUser, assignedTeam, platforms, viewMode, onChangeViewMode, onAddContent, onViewContent, onEditContent, onDeleteContent, onDuplicateContent, onScheduleContent, onOpenAnalytics, onGenerateReport, onClose }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <motion.aside initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }} transition={{ duration:0.25, ease:'easeInOut' }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-3xl overflow-y-auto" style={{ background:'var(--card)', borderLeft:'1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:'var(--border)' }}>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Campaign workspace</p>
            <h2 className="text-lg font-bold" style={{ color:'var(--text)' }}>{campaign.name}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color:'var(--text-muted)' }}><X size={16} /></button>
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold" style={{ color:'var(--text)' }}>Campaign overview</h3>
                <Badge label={CAMPAIGN_STATUSES[campaign.status]?.label || campaign.status} color={CAMPAIGN_STATUSES[campaign.status]?.color || '#1E3A8A'} bg={CAMPAIGN_STATUSES[campaign.status]?.bg} />
              </div>
              <div className="space-y-2 text-sm" style={{ color:'var(--text-muted)' }}>
                <ContentPreviewRow label="Objective" value={campaign.objective} />
                <ContentPreviewRow label="Business user" value={businessUser.name} />
                <ContentPreviewRow label="Marketing team" value={assignedTeam.name} />
                <ContentPreviewRow label="Budget" value={`$${campaign.budget?.toLocaleString()}`} />
                <ContentPreviewRow label="Start date" value={campaign.start} />
                <ContentPreviewRow label="End date" value={campaign.end} />
                <ContentPreviewRow label="Duration" value={`${Math.max(0, Math.round((new Date(campaign.end) - new Date(campaign.start)) / (1000*60*60*24)))} days`} />
                <ContentPreviewRow label="Priority" value={campaign.priority || 'Medium'} />
                <ContentPreviewRow label="Platforms" value={platforms.map(p => p.label).join(', ')} />
                <ContentPreviewRow label="Created date" value={campaign.createdAt || campaign.start} />
                <ContentPreviewRow label="Last updated" value={campaign.updatedAt || campaign.end} />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color:'var(--text-muted)' }}>Notes</p>
                  <p className="text-sm" style={{ color:'var(--text)' }}>{campaign.notes || 'No campaign notes yet.'}</p>
                </div>
              </div>
            </div>
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-bold" style={{ color:'var(--text)' }}>Quick actions</h3>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={onAddContent} className="flex items-center gap-2 px-4 h-11 rounded-[var(--r-md)] text-sm font-semibold text-white"
                  style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}><Plus size={15} /> Add Content</button>
                <button onClick={onOpenAnalytics} className="flex items-center gap-2 px-4 h-11 rounded-[var(--r-md)] border text-sm font-semibold"
                  style={{ borderColor:'var(--border)', color:'var(--text)' }}><Edit3 size={15} /> Edit Campaign</button>
                <button onClick={onGenerateReport} className="flex items-center gap-2 px-4 h-11 rounded-[var(--r-md)] border text-sm font-semibold"
                  style={{ borderColor:'var(--border)', color:'#EF4444' }}><Trash2 size={15} /> Delete Campaign</button>
                <button onClick={onOpenAnalytics} className="flex items-center gap-2 px-4 h-11 rounded-[var(--r-md)] border text-sm font-semibold"
                  style={{ borderColor:'var(--border)', color:'var(--text)' }}><TrendingUp size={15} /> View Analytics</button>
                <button onClick={onGenerateReport} className="flex items-center gap-2 px-4 h-11 rounded-[var(--r-md)] border text-sm font-semibold"
                  style={{ borderColor:'var(--border)', color:'var(--text)' }}><Share2 size={15} /> Generate Report</button>
              </div>
            </div>
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-bold" style={{ color:'var(--text)' }}>Content summary</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Total content', value: campaignContent.length },
                  { label:'Draft', value: campaignContent.filter(i => i.status === 'draft').length },
                  { label:'Scheduled', value: campaignContent.filter(i => i.status === 'scheduled').length },
                  { label:'Published', value: campaignContent.filter(i => i.status === 'published').length },
                  { label:'Rejected', value: campaignContent.filter(i => i.status === 'rejected').length },
                ].map(card => (
                  <div key={card.label} className="rounded-[var(--r-md)] p-4" style={{ background:'var(--bg-alt)' }}>
                    <p className="text-xs text-[var(--text-muted)]">{card.label}</p>
                    <p className="text-2xl font-bold" style={{ color:'var(--text)' }}>{card.value}</p>
                  </div>
                ))}
              </div>
              <button onClick={onAddContent}
                className="w-full h-11 rounded-[var(--r-md)] text-sm font-semibold text-white"
                style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>Add Content</button>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold" style={{ color:'var(--text)' }}>Campaign content</h3>
                <p className="text-xs" style={{ color:'var(--text-muted)' }}>Manage every item belonging to this campaign.</p>
              </div>
              <div className="flex items-center gap-2">
                {VIEW_MODES.map(mode => (
                  <button key={mode} onClick={() => onChangeViewMode(mode)}
                    className="px-3 py-1.5 rounded-full border text-xs font-semibold"
                    style={{ background: viewMode === mode ? 'var(--primary)' : 'var(--card)', borderColor: viewMode === mode ? 'var(--primary)' : 'var(--border)', color: viewMode === mode ? '#fff' : 'var(--text-muted)' }}>
                    {mode === 'table' ? 'Table' : 'Cards'}
                  </button>
                ))}
              </div>
            </div>

            {viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background:'var(--bg-alt)', borderBottom:'1px solid var(--border)' }}>
                      {['Title','Platform','Assigned','Schedule','Status','Approval','Actions'].map(header => (
                        <th key={header} className="text-left px-4 py-3 text-xs font-semibold" style={{ color:'var(--text-muted)' }}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-[var(--bg-alt)] transition-colors" style={{ borderBottom:'1px solid var(--border)' }}>
                        <td className="px-4 py-3 max-w-[220px]"><p className="font-semibold truncate" style={{ color:'var(--text)' }}>{item.title}</p></td>
                        <td className="px-4 py-3 text-xs" style={{ color:'var(--text-muted)' }}>{item.platforms.join(', ')}</td>
                        <td className="px-4 py-3 text-xs" style={{ color:'var(--text-muted)' }}>{item.assignedTo}</td>
                        <td className="px-4 py-3 text-xs" style={{ color:'var(--text-muted)' }}>{item.scheduledAt ? item.scheduledAt.replace('T', ' ') : 'Not scheduled'}</td>
                        <td className="px-4 py-3"><Badge label={item.status} color='var(--text)' bg='rgba(148,163,184,.12)' /></td>
                        <td className="px-4 py-3"><Badge label={item.approval} color='var(--text)' bg='rgba(148,163,184,.12)' /></td>
                        <td className="px-4 py-3 flex flex-wrap gap-2">
                          <button onClick={() => onViewContent(item)} className="px-2 py-1 rounded-[var(--r-md)] border text-xs" style={{ borderColor:'var(--border)', color:'var(--text)' }}>View</button>
                          <button onClick={() => onEditContent(item)} className="px-2 py-1 rounded-[var(--r-md)] border text-xs" style={{ borderColor:'var(--border)', color:'var(--text)' }}>Edit</button>
                          <button onClick={() => handleDuplicateContent(item)} className="px-2 py-1 rounded-[var(--r-md)] border text-xs" style={{ borderColor:'var(--border)', color:'var(--text)' }}>Duplicate</button>
                          <button onClick={() => onDeleteContent(item)} className="px-2 py-1 rounded-[var(--r-md)] border text-xs" style={{ borderColor:'#EF4444', color:'#EF4444' }}>Delete</button>
                          <button onClick={() => onScheduleContent(item)} className="px-2 py-1 rounded-[var(--r-md)] border text-xs" style={{ borderColor:'var(--primary)', color:'var(--primary)' }}>Schedule</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {items.map(item => (
                  <div key={item.id} className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>{item.title}</p>
                        <p className="text-[11px] mt-1" style={{ color:'var(--text-muted)' }}>{item.platforms.join(', ')}</p>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">{item.scheduledAt ? item.scheduledAt.split('T')[0] : 'Draft'}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge label={item.status} color='var(--text)' bg='rgba(148,163,184,.12)' />
                        <Badge label={item.approval} color='var(--text)' bg='rgba(148,163,184,.12)' />
                      </div>
                      <p className="text-xs" style={{ color:'var(--text-muted)' }}>{item.caption}</p>
                      <div className="flex flex-wrap gap-2 pt-3">
                        <button onClick={() => onViewContent(item)} className="px-2 py-1 rounded-[var(--r-md)] border text-xs" style={{ borderColor:'var(--border)', color:'var(--text)' }}>View</button>
                        <button onClick={() => onEditContent(item)} className="px-2 py-1 rounded-[var(--r-md)] border text-xs" style={{ borderColor:'var(--border)', color:'var(--text)' }}>Edit</button>
                        <button onClick={() => handleDuplicateContent(item)} className="px-2 py-1 rounded-[var(--r-md)] border text-xs" style={{ borderColor:'var(--border)', color:'var(--text)' }}>Duplicate</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-sm font-bold mb-4" style={{ color:'var(--text)' }}>Campaign timeline</h3>
              <div className="space-y-3">
                {timelineEntries.map((event, index) => (
                  <div key={`${event.title}-${index}`} className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full mt-2" style={{ background: event.status === 'published' ? '#22C55E' : event.status === 'scheduled' ? '#1E3A8A' : '#64748B' }} />
                    <div className="flex-1 text-xs" style={{ color:'var(--text-muted)' }}>
                      <p className="font-semibold" style={{ color:'var(--text)' }}>{event.title}</p>
                      <p>{event.platform} · {event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-bold" style={{ color:'var(--text)' }}>Campaign analytics</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Total content', value: analyticsSummary.total },
                  { label:'Published', value: analyticsSummary.published },
                  { label:'Scheduled', value: analyticsSummary.scheduled },
                  { label:'Draft', value: analyticsSummary.draft },
                ].map(metric => (
                  <div key={metric.label} className="rounded-[var(--r-md)] p-4" style={{ background:'var(--bg-alt)' }}>
                    <p className="text-[11px] text-[var(--text-muted)]">{metric.label}</p>
                    <p className="text-xl font-bold" style={{ color:'var(--text)' }}>{metric.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm" style={{ color:'var(--text-muted)' }}>
                <div className="rounded-[var(--r-md)] p-4" style={{ background:'var(--bg-alt)' }}>
                  <p className="text-[11px]">Reach</p>
                  <p className="font-semibold" style={{ color:'var(--text)' }}>{analyticsSummary.reach.toLocaleString()}</p>
                </div>
                <div className="rounded-[var(--r-md)] p-4" style={{ background:'var(--bg-alt)' }}>
                  <p className="text-[11px]">Engagement</p>
                  <p className="font-semibold" style={{ color:'var(--text)' }}>{analyticsSummary.engagement.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--text)' }}>Campaign progress</p>
                <div className="w-full h-3 rounded-full" style={{ background:'var(--bg-alt)' }}>
                  <div className="h-3 rounded-full" style={{ width:`${analyticsSummary.progress}%`, background:'linear-gradient(90deg,#1E3A8A,#4F46E5)' }} />
                </div>
                <p className="text-[11px] mt-2" style={{ color:'var(--text-muted)' }}>{analyticsSummary.progress}% complete</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}

function CampaignForm({ campaign, onCancel, onSave, businessUser }) {
  const [form, setForm] = useState(() => ({
    name: campaign?.name || '',
    objective: campaign?.objective || OBJECTIVES[0],
    status: campaign?.status || 'active',
    budget: campaign?.budget?.toString() || '',
    start: campaign?.start || '',
    end: campaign?.end || '',
    notes: campaign?.notes || '',
    spent: campaign?.spent?.toString() || '0',
    progress: campaign?.progress?.toString() || '0',
    reach: campaign?.reach?.toString() || '0',
  }))

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const inputCls = 'w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold" style={{ color:'var(--text)' }}>{campaign ? 'Edit Campaign' : 'New Campaign'}</h2>
          <p className="text-xs" style={{ color:'var(--text-muted)' }}>Create a campaign and keep the business user selected.</p>
        </div>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color:'var(--text-muted)' }}><X size={16} /></button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Business</label>
          <input value={businessUser?.name || '—'} disabled className={inputCls} style={SHARED_INPUT_STYLE} />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Campaign Name *</label>
          <input value={form.name} onChange={e => update('name', e.target.value)} className={inputCls} style={SHARED_INPUT_STYLE} placeholder="Summer Sale 2025" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Objective</label>
            <select value={form.objective} onChange={e => update('objective', e.target.value)} className={inputCls} style={SHARED_INPUT_STYLE}>
              {OBJECTIVES.map(option => <option key={option}>{option}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Status</label>
            <select value={form.status} onChange={e => update('status', e.target.value)} className={inputCls} style={SHARED_INPUT_STYLE}>
              {Object.keys(CAMPAIGN_STATUSES).map(status => <option key={status} value={status}>{CAMPAIGN_STATUSES[status].label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Budget (USD) *</label>
            <input type="number" value={form.budget} onChange={e => update('budget', e.target.value)} className={inputCls} style={SHARED_INPUT_STYLE} placeholder="2400" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Notes</label>
            <input value={form.notes} onChange={e => update('notes', e.target.value)} className={inputCls} style={SHARED_INPUT_STYLE} placeholder="Optional campaign notes" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Start date *</label>
            <input type="date" value={form.start} onChange={e => update('start', e.target.value)} className={inputCls} style={SHARED_INPUT_STYLE} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>End date *</label>
            <input type="date" value={form.end} onChange={e => update('end', e.target.value)} className={inputCls} style={SHARED_INPUT_STYLE} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Progress</label>
            <input type="number" min="0" max="100" value={form.progress} onChange={e => update('progress', e.target.value)} className={inputCls} style={SHARED_INPUT_STYLE} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Reach</label>
            <input type="number" value={form.reach} onChange={e => update('reach', e.target.value)} className={inputCls} style={SHARED_INPUT_STYLE} />
          </div>
        </div>
        <div className="flex gap-3 pt-2 border-t" style={{ borderColor:'var(--border)' }}>
          <button onClick={onCancel} className="flex-1 h-10 rounded-[var(--r-md)] border text-sm font-semibold"
            style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white"
            style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>{campaign ? 'Save changes' : 'Create campaign'}</button>
        </div>
      </div>
    </div>
  )
}
