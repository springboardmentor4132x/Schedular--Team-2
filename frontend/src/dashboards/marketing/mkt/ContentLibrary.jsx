import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Eye, Edit3, Trash2, ArrowLeft, Users, X } from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import FilePreview from '../../../components/dashboard/FilePreview'
import { contentApi, CONTENT_TYPE_LABELS, CONTENT_FILTER_OPTIONS } from '../../../services/contentApi'

const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C', label: 'Instagram' },
  facebook:  { icon: FaFacebook,  color: '#1877F2', label: 'Facebook'  },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2', label: 'LinkedIn'  },
  x:         { icon: FaXTwitter,  color: '#374151', label: 'X'         },
  youtube:   { icon: FaYoutube,   color: '#FF0000', label: 'YouTube'   },
  pinterest: { icon: FaPinterest, color: '#E60023', label: 'Pinterest' },
}

const LIBRARY_CATEGORIES = ['All', 'Drafts', 'Review', 'Scheduled', 'Published']

export function LibraryPanel() {
  const navigate = useNavigate()
  const { activeClient } = useClient()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All Content')
  const [libraryItems, setLibraryItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!activeClient) return
    let mounted = true
    setLoading(true)
    contentApi.getLibraryByClient(activeClient.id)
      .then(items => { if (mounted) setLibraryItems(items) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [activeClient])

  const filtered = libraryItems.filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) || item.caption?.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter.toLowerCase()
    const matchesType = typeFilter === 'All Content' || CONTENT_TYPE_LABELS[item.file.fileType] === typeFilter
    return matchesQuery && matchesStatus && matchesType
  })

  const draftCount = libraryItems.filter(item => item.status === 'draft').length
  const scheduledCount = libraryItems.filter(item => item.status === 'scheduled').length
  const publishedCount = libraryItems.filter(item => item.status === 'published').length

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-5">
        <div className="card p-5 xl:col-span-1">
          <h2 className="text-sm font-bold mb-4" style={{ color:'var(--text)' }}>Library overview</h2>
          <div className="space-y-3 text-sm" style={{ color:'var(--text-muted)' }}>
            <p>{draftCount} drafts</p>
            <p>{scheduledCount} scheduled posts</p>
            <p>{publishedCount} published posts</p>
            <p>{activeClient.connectedPlatforms.length} connected platforms</p>
          </div>
        </div>
        <div className="card p-5 xl:col-span-3">
          <div className="flex flex-col gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-subtle)' }} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search content…"
                className="w-full h-10 pl-10 pr-4 text-sm rounded-[var(--r-md)] border outline-none"
                style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }} />
            </div>
            <div className="flex flex-wrap gap-2">
              {LIBRARY_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setStatusFilter(cat)}
                  className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                  style={{
                    background: statusFilter === cat ? 'var(--primary)' : 'var(--card)',
                    borderColor: statusFilter === cat ? 'var(--primary)' : 'var(--border)',
                    color: statusFilter === cat ? '#fff' : 'var(--text-muted)',
                  }}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {CONTENT_FILTER_OPTIONS.map(type => (
                <button key={type} onClick={() => setTypeFilter(type)}
                  className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                  style={{
                    background: typeFilter === type ? 'var(--primary)' : 'var(--card)',
                    borderColor: typeFilter === type ? 'var(--primary)' : 'var(--border)',
                    color: typeFilter === type ? '#fff' : 'var(--text-muted)',
                  }}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="card p-6 text-center">
              <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>Loading library…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>No content found.</p>
              <p className="text-xs mt-2" style={{ color:'var(--text-muted)' }}>Try a different search term or filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background:'var(--bg-alt)', borderBottom:'1px solid var(--border)' }}>
                    {['Title','Platform','Campaign','Type','Status','Actions'].map(header => (
                      <th key={header} className="text-left px-4 py-3 text-xs font-semibold" style={{ color:'var(--text-muted)' }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, idx) => {
                    const meta = PLATFORM_META[item.platform] || {}
                    const Icon = meta.icon
                    return (
                      <tr key={`${item.id}-${idx}`} style={{ borderBottom:'1px solid var(--border)' }}>
                        <td className="px-4 py-3 max-w-[220px]">
                          <p className="font-semibold truncate" style={{ color:'var(--text)' }}>{item.title}</p>
                          <p className="text-[11px] mt-1" style={{ color:'var(--text-muted)' }}>{item.caption}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {Icon && <Icon size={14} style={{ color:meta.color }} />}
                            <span className="text-xs capitalize" style={{ color:'var(--text-muted)' }}>{meta.label || item.platform}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color:'var(--text-muted)' }}>{item.campaign || 'N/A'}</td>
                        <td className="px-4 py-3 text-xs" style={{ color:'var(--text-muted)' }}>{CONTENT_TYPE_LABELS[item.file.fileType] || item.file.fileType}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background:'rgba(79,70,229,.08)', color:'#4F46E5' }}>
                            {item.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <button onClick={() => setSelected(item)} className="text-xs font-semibold" style={{ color:'var(--primary)' }}>
                            <Eye size={12} /> View
                          </button>
                          <button onClick={() => navigate('/dashboard/mkt/content')} className="text-xs font-semibold" style={{ color:'var(--text-muted)' }}>
                            <Edit3 size={12} /> Edit
                          </button>
                          <button onClick={async () => {
                            await contentApi.deleteContent(activeClient.id, item.id)
                            setLibraryItems(prev => prev.filter(current => current.id !== item.id))
                            setSelected(prev => (prev?.id === item.id ? null : prev))
                          }} className="text-xs font-semibold" style={{ color:'var(--error)' }}>
                            <Trash2 size={12} /> Remove
                          </button>
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

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.95,y:16 }} animate={{ scale:1,y:0 }} exit={{ scale:0.95 }}
              className="w-full max-w-lg rounded-[var(--r-xl)] p-6 shadow-[var(--shadow-lg)]"
              style={{ background:'var(--card)', border:'1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase" style={{ color:'var(--text-muted)' }}>Library preview</p>
                  <h2 className="text-lg font-bold" style={{ color:'var(--text)' }}>{selected.title}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color:'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  {PLATFORM_META[selected.platform] && (() => {
                    const Icon = PLATFORM_META[selected.platform].icon
                    return <Icon size={14} style={{ color:PLATFORM_META[selected.platform].color }} />
                  })()}
                  <span>{PLATFORM_META[selected.platform]?.label || selected.platform}</span>
                  <span>•</span>
                  <span>{selected.status || 'Unknown'}</span>
                </div>
                <p className="text-sm" style={{ color:'var(--text)' }}>{selected.caption}</p>
                <FilePreview file={selected.file} />
                <div className="flex flex-wrap gap-2">
                  {(selected.tags || []).map(tag => (
                    <span key={tag} className="text-[11px] px-2 py-1 rounded-full" style={{ background:'var(--bg-alt)', color:'var(--text-muted)' }}>#{tag}</span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm" style={{ color:'var(--text-muted)' }}>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] mb-1">Campaign</p>
                    <p>{selected.campaign || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] mb-1">Status</p>
                    <p>{selected.status || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function ContentLibrary() {
  const navigate = useNavigate()
  const { activeClient } = useClient()

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
      <button onClick={() => navigate('/dashboard/mkt/content')}
        className="flex items-center gap-1.5 text-sm font-semibold mb-4 hover:underline" style={{ color:'var(--primary)' }}>
        <ArrowLeft size={15} /> Back to Content Management
      </button>

      <PageHeader
        title="Content Library"
        subtitle={`Library for: ${activeClient.name}`}
        actions={(
          <button onClick={() => navigate('/dashboard/mkt/content')}
            className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105"
            style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
            <Plus size={15} /> Manage Content
          </button>
        )}
      />

      <LibraryPanel />
    </div>
  )
}
