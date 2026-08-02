import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Search, Clock, FileText, Megaphone,
  Filter, X, ChevronDown,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatCard from '../../../components/dashboard/StatCard'
import EmptyState from '../../../components/dashboard/EmptyState'
import { fetchCampaigns, fetchPublishedPosts, fetchSocialAccounts } from '../services/businessService'

const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C', label: 'Instagram' },
  facebook: { icon: FaFacebook, color: '#1877F2', label: 'Facebook' },
  linkedin: { icon: FaLinkedin, color: '#0A66C2', label: 'LinkedIn' },
  x: { icon: FaXTwitter, color: '#374151', label: 'X' },
}

const normalizeStatus = (value) => String(value ?? '').toLowerCase()

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PublishedPosts() {
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('all')
  const [campaign, setCampaign] = useState('All')
  const [sortBy, setSortBy] = useState('date')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [postsData, campaignsData, accountsData] = await Promise.all([
          fetchPublishedPosts(),
          fetchCampaigns(),
          fetchSocialAccounts(),
        ])
        if (active) {
          setPosts(postsData ?? [])
          setCampaigns(campaignsData ?? [])
          setAccounts(accountsData ?? [])
          setLoading(false)
        }
      } catch {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const campaignLookup = useMemo(() => new Map(campaigns.map(item => [item.id, item])), [campaigns])
  const accountLookup = useMemo(() => new Map(accounts.map(item => [item.id, item])), [accounts])

  const published = useMemo(() => posts
    .filter(post => normalizeStatus(post.status) === 'published')
    .map(post => {
      const account = accountLookup.get(post.social_account_ids?.[0])
      const campaignItem = campaignLookup.get(post.campaign_id)
      const publishedAt = post.scheduled_for ?? post.created_at
      return {
        ...post,
        platform: account?.platform ?? 'instagram',
        campaign: campaignItem?.name ?? null,
        publishedAt,
      }
    }), [posts, accountLookup, campaignLookup])

  const filtered = useMemo(() => published
    .filter(post => {
      const searchText = [post.title, post.caption, post.campaign, post.platform].filter(Boolean).join(' ').toLowerCase()
      return searchText.includes(search.toLowerCase()) && (platform === 'all' || post.platform === platform) && (campaign === 'All' || post.campaign === campaign)
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0)
      if (sortBy === 'title') return String(a.title ?? '').localeCompare(String(b.title ?? ''))
      return 0
    }), [published, search, platform, campaign, sortBy])

  const totalPosts = published.length
  const draftCount = posts.filter(post => normalizeStatus(post.status) === 'draft').length
  const scheduledCount = posts.filter(post => ['scheduled', 'queued'].includes(normalizeStatus(post.status))).length
  const campaignCount = campaigns.length

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Published Posts" subtitle="Live published content records from the database." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Published" value={totalPosts} icon={Send} iconColor="#22C55E" iconBg="rgba(34,197,94,.12)" index={0} />
        <StatCard title="Scheduled" value={scheduledCount} icon={Clock} iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)" index={1} />
        <StatCard title="Drafts" value={draftCount} icon={FileText} iconColor="#64748B" iconBg="rgba(100,116,139,.12)" index={2} />
        <StatCard title="Campaigns" value={campaignCount} icon={Megaphone} iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)" index={3} />
      </div>

      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search published posts…" className="w-full h-10 pl-9 pr-4 text-sm rounded-[var(--r-md)] border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
          </div>

          <div className="relative">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="h-10 pl-3 pr-8 text-xs font-semibold rounded-[var(--r-md)] border outline-none appearance-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
              <option value="date">Sort: Latest First</option>
              <option value="title">Sort: Title</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-3.5 pointer-events-none" style={{ color: 'var(--text-subtle)' }} />
          </div>

          <button onClick={() => setShowFilters(v => !v)} className="flex items-center gap-1.5 px-3 h-10 rounded-[var(--r-md)] border text-xs font-semibold transition-all" style={{ background: showFilters ? 'var(--primary-light)' : 'var(--card)', borderColor: showFilters ? 'var(--primary)' : 'var(--border)', color: showFilters ? 'var(--primary)' : 'var(--text-muted)' }}>
            <Filter size={13} /> Filters {showFilters ? <X size={11} /> : null}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-3">
              <div className="flex flex-wrap gap-1.5">
                {['all', 'instagram', 'facebook', 'linkedin', 'x'].map(item => {
                  const meta = PLATFORM_META[item]
                  const Icon = meta?.icon
                  const activeChip = platform === item
                  return (
                    <button key={item} onClick={() => setPlatform(item)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all" style={{ background: activeChip ? (meta ? `${meta.color}15` : 'var(--primary-light)') : 'var(--card)', borderColor: activeChip ? (meta?.color ?? 'var(--primary)') : 'var(--border)', color: activeChip ? (meta?.color ?? 'var(--primary)') : 'var(--text-muted)' }}>
                      {Icon && <Icon size={11} />}
                      {item === 'all' ? 'All Platforms' : meta?.label}
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['All', ...Array.from(new Set(published.map(post => post.campaign).filter(Boolean)))].map(item => (
                  <button key={item} onClick={() => setCampaign(item)} className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all" style={{ background: campaign === item ? 'rgba(79,70,229,.12)' : 'var(--card)', borderColor: campaign === item ? '#4F46E5' : 'var(--border)', color: campaign === item ? '#4F46E5' : 'var(--text-muted)' }}>{item}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={Send} title="No published posts found" message="Try adjusting your filters." /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
                  {['Post', 'Platform', 'Published', 'Campaign', 'Content Type', 'Status'].map(head => (
                    <th key={head} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filtered.map((post, index) => {
                    const meta = PLATFORM_META[post.platform]
                    const Icon = meta?.icon
                    return (
                      <motion.tr key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: index * 0.02 }} className="hover:bg-[var(--bg-alt)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="px-4 py-3 max-w-[220px]"><p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{post.title ?? `Post ${post.id}`}</p><p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-subtle)' }}>{post.caption ?? 'No caption'}</p></td>
                        <td className="px-4 py-3"><div className="flex items-center gap-1.5">{Icon && <Icon size={13} style={{ color: meta.color }} />}<span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{meta?.label ?? post.platform}</span></div></td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{formatDate(post.publishedAt)}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{post.campaign ? <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(79,70,229,.10)', color: '#4F46E5' }}>{post.campaign}</span> : '—'}</td>
                        <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>{post.content_type ?? 'text'}</td>
                        <td className="px-4 py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: 'rgba(34,197,94,.12)', color: '#22C55E' }}>Published</span></td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
            <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>Showing {filtered.length} of {published.length} published posts</span>
            <div className="flex gap-4 text-xs">
              <span style={{ color: 'var(--text-muted)' }}>Instagram: <span className="font-bold" style={{ color: 'var(--text)' }}>{published.filter(post => post.platform === 'instagram').length}</span></span>
              <span style={{ color: 'var(--text-muted)' }}>Facebook: <span className="font-bold" style={{ color: 'var(--text)' }}>{published.filter(post => post.platform === 'facebook').length}</span></span>
              <span style={{ color: 'var(--text-muted)' }}>LinkedIn: <span className="font-bold" style={{ color: 'var(--text)' }}>{published.filter(post => post.platform === 'linkedin').length}</span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
