import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, LayoutGrid, List, Search, Edit3,
  Trash2, Copy, Clock, Plus, Send, Info,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/dashboard/PageHeader'
import EmptyState from '../../components/dashboard/EmptyState'
import Toast from '../../components/Toast'
import axiosInstance from '../../api/axios'

/* ── Platform meta ─────────────────────────────────────────────── */
const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C' },
  facebook:  { icon: FaFacebook,  color: '#1877F2' },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2' },
  x:         { icon: FaXTwitter,  color: '#000000' },
}

/* ── Mock drafts ────────────────────────────────────────────────── */
const INIT_DRAFTS = [
  { id:1, title:'Summer Sale Announcement',  caption:'Our biggest summer sale starts next week! Get ready for up to 50% off on all products.', platform:'instagram', updatedAt:'2 hours ago',  tags:['sale','summer'],   status:'draft' },
  { id:2, title:'Product Feature Spotlight', caption:'Introducing our latest feature that will transform how you schedule social media content.', platform:'linkedin',  updatedAt:'5 hours ago',  tags:['product','launch'], status:'draft' },
  { id:3, title:'Customer Success Story',    caption:'See how @company achieved 300% growth using our platform. Real results, real impact.',       platform:'facebook',  updatedAt:'Yesterday',    tags:['testimonial'],      status:'draft' },
  { id:4, title:'Weekly Industry Tips',      caption:'5 social media trends you need to know this week. Thread below 🧵',                          platform:'x',         updatedAt:'2 days ago',   tags:['tips','trends'],    status:'draft' },
  { id:5, title:'Behind the Scenes Post',    caption:'A sneak peek into how we build features at OrbitSocial. The process behind the product.',   platform:'instagram', updatedAt:'3 days ago',   tags:['culture','bts'],    status:'draft' },
  { id:6, title:'Q3 Campaign Brief',         caption:'Our Q3 marketing campaign overview — targets, budget and timeline inside.',                  platform:'linkedin',  updatedAt:'4 days ago',   tags:['campaign','strategy'], status:'draft' },
]

// Marketing adds a "submitted" status for drafts awaiting review
const INIT_MARKETING_DRAFTS = [
  { id:1, title:'Summer Sale Announcement',  caption:'Our biggest summer sale starts next week! Get ready for up to 50% off on all products.', platform:'instagram', updatedAt:'2 hours ago',  tags:['sale','summer'],   status:'draft'     },
  { id:2, title:'Product Feature Spotlight', caption:'Introducing our latest feature that will transform how you schedule social media content.', platform:'linkedin',  updatedAt:'5 hours ago',  tags:['product','launch'], status:'submitted' },
  { id:3, title:'Customer Success Story',    caption:'See how @company achieved 300% growth using our platform. Real results, real impact.',       platform:'facebook',  updatedAt:'Yesterday',    tags:['testimonial'],      status:'draft'     },
  { id:4, title:'Weekly Industry Tips',      caption:'5 social media trends you need to know this week. Thread below 🧵',                          platform:'x',         updatedAt:'2 days ago',   tags:['tips','trends'],    status:'draft'     },
  { id:5, title:'Behind the Scenes Post',    caption:'A sneak peek into how we build features at OrbitSocial. The process behind the product.',   platform:'instagram', updatedAt:'3 days ago',   tags:['culture','bts'],    status:'submitted' },
  { id:6, title:'Q3 Campaign Brief',         caption:'Our Q3 marketing campaign overview — targets, budget and timeline inside.',                  platform:'linkedin',  updatedAt:'4 days ago',   tags:['campaign','strategy'], status:'draft' },
]

const STATUS_STYLE = {
  draft:     { label: 'Draft',     color: '#64748B', bg: 'rgba(100,116,139,.12)' },
  submitted: { label: 'In Review', color: '#F59E0B', bg: 'rgba(245,158,11,.12)'  },
}

export default function Drafts() {
  const navigate        = useNavigate()
  const { role }        = useAuth()
  const isMarketing     = role === 'marketing'

  const [drafts,   setDrafts]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [view,     setView]     = useState('grid')
  const [search,   setSearch]   = useState('')
  const [platform, setPlatform] = useState('all')
  const [toast,    setToast]    = useState(null)

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    setIsLoading(true)
    try {
      const res = await axiosInstance.get('/api/v1/posts/')
      // Filter only drafts. Use lowercased comparison since backend might return "Draft"
      const allDrafts = res.data.filter(p => p.status && p.status.toLowerCase() === 'draft')
      
      // Parse backend schema to frontend format
      const parsedDrafts = allDrafts.map(d => ({
        id: d.id,
        title: d.title || 'Untitled Post',
        caption: d.caption || '',
        platform: 'x', // Mock platform since social_accounts is empty right now
        updatedAt: 'Recently',
        tags: [],
        status: d.status.toLowerCase()
      }))
      
      setDrafts(parsedDrafts)
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load drafts' })
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = drafts.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
                        d.caption.toLowerCase().includes(search.toLowerCase())
    const matchPlat   = platform === 'all' || d.platform === platform
    return matchSearch && matchPlat
  })

  const deleteDraft = async (id) => {
    if (!confirm('Are you sure you want to delete this draft?')) return
    try {
      await axiosInstance.delete(`/api/v1/posts/${id}`)
      setToast({ type: 'success', message: 'Draft deleted' })
      setDrafts(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete draft' })
    }
  }

  const duplicateDraft = async (id) => {
    const src = drafts.find(d => d.id === id)
    if (!src) return
    try {
      const payload = {
        title: `${src.title} (Copy)`,
        caption: src.caption,
        status: 'Draft',
        social_account_ids: []
      }
      const res = await axiosInstance.post('/api/v1/posts/', payload)
      
      const newDraft = {
        id: res.data.id,
        title: res.data.title || 'Untitled Post',
        caption: res.data.caption || '',
        platform: 'x',
        updatedAt: 'Just now',
        tags: [],
        status: 'draft'
      }
      setDrafts(prev => [newDraft, ...prev])
      setToast({ type: 'success', message: 'Draft duplicated' })
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to duplicate draft' })
    }
  }
  
  const submitForReview = async (id) => {
    try {
      await axiosInstance.put(`/api/v1/posts/${id}`, { status: 'Pending Approval' })
      setDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'submitted', updatedAt: 'Just now' } : d))
      setToast({ type: 'success', message: 'Draft submitted for review' })
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to submit draft' })
    }
  }

  const recallDraft = async (id) => {
    try {
      await axiosInstance.put(`/api/v1/posts/${id}`, { status: 'Draft' })
      setDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'draft', updatedAt: 'Just now' } : d))
      setToast({ type: 'success', message: 'Draft recalled' })
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to recall draft' })
    }
  }

  const submittedCount = drafts.filter(d => d.status === 'submitted').length

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto relative">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <PageHeader
        title="Drafts"
        subtitle={isMarketing
          ? `${drafts.length} drafts · ${submittedCount} in review`
          : `${drafts.length} saved drafts`}
        actions={
          <button
            onClick={() => navigate('/dashboard/create-post')}
            className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105 transition-all"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
          >
            <Plus size={15} />
            {isMarketing ? 'New Draft' : 'New Draft'}
          </button>
        }
      />

      {/* Marketing workflow banner */}
      {isMarketing && (
        <motion.div
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 px-4 py-3 rounded-[var(--r-md)] mb-5 text-xs font-medium"
          style={{ background: 'rgba(79,70,229,.08)', border: '1px solid rgba(79,70,229,.20)', color: '#4F46E5' }}
        >
          <Info size={15} className="flex-shrink-0 mt-0.5" />
          <span>
            Use <strong>Submit for Review</strong> to send drafts to your manager for approval.
            Submitted drafts are locked from editing until recalled.
          </span>
        </motion.div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search drafts…"
            className="w-full h-10 pl-9 pr-4 text-sm rounded-[var(--r-md)] border outline-none"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        {/* Platform filter */}
        <div className="flex gap-1.5">
          {['all','instagram','facebook','linkedin','x'].map(p => {
            const meta = PLATFORM_META[p]; const Icon = meta?.icon; const active = platform === p
            return (
              <button key={p} onClick={() => setPlatform(p)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all"
                style={{
                  background:  active ? (meta ? `${meta.color}15` : 'var(--primary-light)') : 'var(--card)',
                  borderColor: active ? (meta?.color ?? 'var(--primary)') : 'var(--border)',
                  color:       active ? (meta?.color ?? 'var(--primary)') : 'var(--text-muted)',
                }}>
                {Icon ? <Icon size={11} /> : null}
                {p === 'all' ? 'All' : null}
              </button>
            )
          })}
        </div>

        {/* View toggle */}
        <div className="flex gap-1 ml-auto">
          {[['grid', LayoutGrid], ['list', List]].map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)}
              className="p-2 rounded-lg transition-colors"
              style={{
                background:  view === v ? 'var(--primary-light)' : 'var(--card)',
                color:       view === v ? 'var(--primary)'       : 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <p style={{ color: 'var(--text-muted)' }}>Loading drafts...</p>
        </div>
      ) : (
        <>
          {/* Empty */}
          {filtered.length === 0 && (
            <div className="card">
              <EmptyState icon={FileText} title="No drafts found" message="Create a new post or adjust your search filters." />
            </div>
          )}

          {/* ── Grid view ── */}
          {filtered.length > 0 && view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((draft, i) => {
              const meta = PLATFORM_META[draft.platform]; const Icon = meta?.icon
              const st   = STATUS_STYLE[draft.status] ?? STATUS_STYLE.draft
              const isSubmitted = draft.status === 'submitted'
              return (
                <motion.div key={draft.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  className="card p-5 flex flex-col gap-3 hover:shadow-[var(--shadow-md)] transition-shadow"
                  style={{ opacity: isSubmitted ? 0.85 : 1 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {Icon && <Icon size={14} style={{ color: meta.color }} />}
                      <span className="text-xs font-semibold capitalize" style={{ color: meta?.color }}>
                        {draft.platform}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isMarketing && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      )}
                      <span className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>{draft.updatedAt}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{draft.title}</h3>
                  <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-muted)' }}>{draft.caption}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {draft.tags.map(t => (
                      <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--bg-alt)', color: 'var(--text-muted)' }}>#{t}</span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 border-t flex-wrap" style={{ borderColor: 'var(--border)' }}>
                    {!isSubmitted && (
                      <button
                        onClick={() => navigate('/dashboard/create-post')}
                        className="flex items-center gap-1 text-xs font-semibold hover:underline"
                        style={{ color: 'var(--primary)' }}>
                        <Edit3 size={11} /> Edit
                      </button>
                    )}

                    {/* Business: Schedule button */}
                    {!isMarketing && (
                      <button
                        onClick={() => navigate('/dashboard/create-post')}
                        className="flex items-center gap-1 text-xs font-semibold hover:underline"
                        style={{ color: '#22C55E' }}>
                        <Clock size={11} /> Schedule
                      </button>
                    )}

                    {/* Marketing: Submit for Review / Recall */}
                    {isMarketing && !isSubmitted && (
                      <button
                        onClick={() => submitForReview(draft.id)}
                        className="flex items-center gap-1 text-xs font-semibold hover:underline"
                        style={{ color: '#4F46E5' }}>
                        <Send size={11} /> Submit for Review
                      </button>
                    )}
                    {isMarketing && isSubmitted && (
                      <button
                        onClick={() => recallDraft(draft.id)}
                        className="flex items-center gap-1 text-xs font-semibold hover:underline"
                        style={{ color: '#F59E0B' }}>
                        <Clock size={11} /> Recall Draft
                      </button>
                    )}

                    {!isSubmitted && (
                      <button
                        onClick={() => duplicateDraft(draft.id)}
                        className="flex items-center gap-1 text-xs font-semibold hover:underline"
                        style={{ color: 'var(--text-muted)' }}>
                        <Copy size={11} /> Duplicate
                      </button>
                    )}

                    <button
                      onClick={() => deleteDraft(draft.id)}
                      className="flex items-center gap-1 text-xs font-semibold hover:underline ml-auto"
                      style={{ color: 'var(--error)' }}>
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── List view ── */}
      {filtered.length > 0 && view === 'list' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-alt)' }}>
                {['Title', 'Platform', isMarketing ? 'Status' : null, 'Updated', 'Actions']
                  .filter(Boolean)
                  .map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((draft, i) => {
                const meta = PLATFORM_META[draft.platform]; const Icon = meta?.icon
                const st   = STATUS_STYLE[draft.status] ?? STATUS_STYLE.draft
                const isSubmitted = draft.status === 'submitted'
                return (
                  <motion.tr key={draft.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-[var(--bg-alt)] transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-3">
                      <p className="font-semibold" style={{ color: 'var(--text)' }}>{draft.title}</p>
                      <p className="text-xs mt-0.5 truncate max-w-xs" style={{ color: 'var(--text-muted)' }}>{draft.caption}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {Icon && <Icon size={13} style={{ color: meta.color }} />}
                        <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{draft.platform}</span>
                      </div>
                    </td>
                    {isMarketing && (
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-subtle)' }}>{draft.updatedAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {!isSubmitted && (
                          <button onClick={() => navigate('/dashboard/create-post')}
                            className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                            Edit
                          </button>
                        )}
                        {isMarketing && !isSubmitted && (
                          <button onClick={() => submitForReview(draft.id)}
                            className="text-xs font-semibold hover:underline" style={{ color: '#4F46E5' }}>
                            Submit
                          </button>
                        )}
                        {isMarketing && isSubmitted && (
                          <button onClick={() => recallDraft(draft.id)}
                            className="text-xs font-semibold hover:underline" style={{ color: '#F59E0B' }}>
                            Recall
                          </button>
                        )}
                        {!isMarketing && (
                          <button onClick={() => navigate('/dashboard/create-post')}
                            className="text-xs font-semibold hover:underline" style={{ color: '#22C55E' }}>
                            Schedule
                          </button>
                        )}
                        {!isSubmitted && (
                          <button onClick={() => duplicateDraft(draft.id)}
                            className="text-xs font-semibold hover:underline" style={{ color: 'var(--text-muted)' }}>
                            Duplicate
                          </button>
                        )}
                        <button onClick={() => deleteDraft(draft.id)}
                          className="text-xs font-semibold hover:underline" style={{ color: 'var(--error)' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      </>
      )}
    </div>
  )
}
