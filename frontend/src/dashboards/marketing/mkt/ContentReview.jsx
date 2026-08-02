import { useState } from 'react'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Search, Eye, X, Users, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { contentApi } from '../../../services/contentApi'

const STATUS_STYLES = {
  draft: { label: 'Draft', color: '#64748B', bg: 'rgba(100,116,139,.12)' },
  review: { label: 'In Review', color: '#4F46E5', bg: 'rgba(79,70,229,.12)' },
  scheduled: { label: 'Scheduled', color: '#1E3A8A', bg: 'rgba(30,58,138,.12)' },
  published: { label: 'Published', color: '#22C55E', bg: 'rgba(34,197,94,.12)' },
}

const TABS = ['Drafts', 'Scheduled', 'Published']

function PreviewDrawer({ post, onClose }) {
  if (!post) return null
  const status = STATUS_STYLES[post.status] ?? STATUS_STYLES.draft

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm overflow-y-auto"
        style={{ background: 'var(--card)', borderLeft: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Content preview</p>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{post.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-[var(--r-md)] p-4" style={{ background: 'var(--bg-alt)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Status</p>
            <span className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold rounded-full" style={{ background: status.bg, color: status.color }}>
              {status.label}
            </span>
          </div>
          <div className="rounded-[var(--r-md)] p-4" style={{ background: 'var(--bg-alt)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Platform</p>
            <p className="text-sm" style={{ color: 'var(--text)' }}>{post.platform}</p>
          </div>
          <div className="rounded-[var(--r-md)] p-4" style={{ background: 'var(--bg-alt)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Caption</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{post.caption || 'No caption provided.'}</p>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}

export function ReviewPanel() {
  const [tab, setTab] = useState('Drafts')
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('all')
  const [preview, setPreview] = useState(null)
  const { activeClient } = useClient()
  const [allPosts, setAllPosts] = useState([])

  useEffect(() => {
    if (!activeClient) return
    let cancelled = false
    contentApi.getLibraryByClient(activeClient.id)
      .then(data => { if (cancelled) return; setAllPosts(data) })
      .catch(() => { if (!cancelled) setAllPosts([]) })
    return () => { cancelled = true }
  }, [activeClient])

  const posts = {
    drafts: allPosts.filter(post => ['draft', 'review'].includes(post.status)),
    scheduled: allPosts.filter(post => post.status === 'scheduled'),
    published: allPosts.filter(post => post.status === 'published'),
  }
  const items = tab === 'Drafts' ? posts.drafts : tab === 'Scheduled' ? posts.scheduled : posts.published

  const filtered = items.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase())
    const matchPlatform = platform === 'all' || item.platform === platform
    return matchSearch && matchPlatform
  })

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2 p-1 rounded-[var(--r-md)]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {TABS.map(tabLabel => (
            <button
              key={tabLabel}
              onClick={() => setTab(tabLabel)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: tab === tabLabel ? 'var(--primary)' : 'transparent',
                color: tab === tabLabel ? '#fff' : 'var(--text-muted)',
              }}
            >
              {tabLabel}
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: tab === tabLabel ? 'rgba(255,255,255,0.18)' : 'var(--bg-alt)',
                  color: tab === tabLabel ? '#fff' : 'var(--text-subtle)',
                }}
              >
                {tabLabel === 'Drafts' ? posts.drafts.length : tabLabel === 'Scheduled' ? posts.scheduled.length : posts.published.length}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${tab.toLowerCase()}…`}
              className="w-full min-w-[220px] h-10 pl-10 pr-4 text-sm rounded-[var(--r-md)] border outline-none"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'instagram', 'facebook', 'linkedin', 'x', 'youtube', 'pinterest'].map(platformId => {
              const active = platform === platformId
              return (
                <button
                  key={platformId}
                  onClick={() => setPlatform(platformId)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                  style={{
                    background: active ? 'var(--bg-alt)' : 'var(--card)',
                    borderColor: active ? 'var(--primary)' : 'var(--border)',
                    color: active ? 'var(--text)' : 'var(--text-muted)',
                  }}
                >
                  {platformId === 'all' ? 'All' : platformId}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-6">
          <EmptyState icon={FileText} title={`No ${tab.toLowerCase()} posts`} message="Try changing your filters." />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
                  {['Post', 'Platform', 'Date', 'Status', ''].map(header => (
                    <th
                      key={header}
                      className="text-left px-4 py-3 text-xs font-semibold"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => {
                  const status = STATUS_STYLES[item.status] ?? STATUS_STYLES.draft
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: index * 0.02 }}
                      className="hover:bg-[var(--bg-alt)] transition-colors"
                    >
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{item.title}</p>
                        <p className="text-xs truncate mt-1 max-w-[200px]" style={{ color: 'var(--text-muted)' }}>{item.caption}</p>
                      </td>
                      <td className="px-4 py-3 text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{item.platform}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setPreview(item)}
                          className="text-xs font-semibold text-[var(--primary)] hover:underline"
                        >
                          <Eye size={12} /> Preview
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {preview && <PreviewDrawer post={preview} onClose={() => setPreview(null)} />}
    </div>
  )
}

export default function ContentReview() {
  const navigate = useNavigate()
  const { activeClient } = useClient()

  if (!activeClient) {
    return (
      <div className="p-6">
        <div className="card">
          <EmptyState
            icon={Users}
            title="No client selected"
            message="Select a client first."
            action={{ label: 'View Clients', onClick: () => navigate('/dashboard/mkt/clients') }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <button
        onClick={() => navigate('/dashboard/mkt/workspace')}
        className="flex items-center gap-1.5 text-sm font-semibold mb-4 hover:underline"
        style={{ color: 'var(--primary)' }}
      >
        <ArrowLeft size={15} /> Back to Workspace
      </button>

      <PageHeader title="Content Review" subtitle={`Reviewing content for: ${activeClient.name}`} />
      <ReviewPanel />
    </div>
  )
}
