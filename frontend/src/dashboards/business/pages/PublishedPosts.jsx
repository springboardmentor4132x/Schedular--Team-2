import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Search, X, Eye, FileText, Megaphone,
  Heart, Share2, MessageSquare, TrendingUp,
  ChevronLeft, ChevronRight, ChevronDown, Filter, Clock,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatCard from '../../../components/dashboard/StatCard'
import EmptyState from '../../../components/dashboard/EmptyState'
import { fetchCampaigns, fetchPublishedPosts, fetchSocialAccounts } from '../services/businessService'

const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C', label: 'Instagram' },
  facebook: { icon: FaFacebook, color: '#1877F2', label: 'Facebook' },
  linkedin: { icon: FaLinkedin, color: '#0A66C2', label: 'LinkedIn' },
  x: { icon: FaXTwitter, color: '#374151', label: 'X' },
  youtube: { icon: FaYoutube, color: '#FF0000', label: 'YouTube' },
  pinterest: { icon: FaPinterest, color: '#E60023', label: 'Pinterest' },
}

const CONTENT_TYPE_COLORS = {
  text: { label: 'Text', color: '#64748B', bg: 'rgba(100,116,139,.10)' },
  image: { label: 'Image', color: '#0A66C2', bg: 'rgba(10,102,194,.10)' },
  video: { label: 'Video', color: '#E1306C', bg: 'rgba(225,48,108,.10)' },
  carousel: { label: 'Carousel', color: '#4F46E5', bg: 'rgba(79,70,229,.10)' },
  story: { label: 'Story', color: '#F59E0B', bg: 'rgba(245,158,11,.10)' },
  reel: { label: 'Reel', color: '#22C55E', bg: 'rgba(34,197,94,.10)' },
}

const ITEMS_PER_PAGE = 8
const normalizeStatus = (value) => String(value ?? '').toLowerCase()

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function PostDetailModal({ post, onClose }) {
  if (!post) return null
  const meta = PLATFORM_META[post.platform] ?? PLATFORM_META.instagram
  const Icon = meta?.icon
  const ct = CONTENT_TYPE_COLORS[String(post.content_type ?? 'text').toLowerCase()] ?? CONTENT_TYPE_COLORS.text
  const publishedAt = post.publishedAt ? new Date(post.publishedAt) : null
  const engagementTiles = [
    { label: 'Reach', value: post.reach, icon: TrendingUp, color: '#1E3A8A' },
    { label: 'Impressions', value: post.impressions, icon: Eye, color: '#4F46E5' },
    { label: 'Engagement', value: post.engagement, icon: TrendingUp, color: '#22C55E' },
    { label: 'Likes', value: post.likes, icon: Heart, color: '#EF4444' },
    { label: 'Comments', value: post.comments, icon: MessageSquare, color: '#F59E0B' },
    { label: 'Shares', value: post.shares, icon: Share2, color: '#0A66C2' },
  ].filter(item => typeof item.value === 'number')
  const engRate = typeof post.reach === 'number' && post.reach > 0 && typeof post.engagement === 'number'
    ? ((post.engagement / post.reach) * 100).toFixed(1)
    : null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-lg rounded-[var(--r-xl)] shadow-[var(--shadow-lg)] overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Eye size={16} style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>
              Published Post Details
            </h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,.10)', color: '#22C55E' }}>Published</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
          <div>
            <h3 className="text-base font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>
              {post.title ?? `Post ${post.id}`}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: ct.bg, color: ct.color }}>{ct.label}</span>
              {Icon && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${meta.color}15`, color: meta.color }}>
                  <Icon size={9} /> {meta.label}
                </span>
              )}
            </div>
            {post.caption && (
              <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{post.caption}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Platform', value: meta?.label ?? post.platform },
              { label: 'Campaign', value: post.campaign ?? '—' },
              { label: 'Published Date', value: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : '—' },
              { label: 'Published Time', value: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—' },
              { label: 'Content Type', value: ct.label },
              { label: 'Status', value: 'Published' },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.value}</p>
              </div>
            ))}
          </div>

          {engagementTiles.length > 0 ? (
            <div>
              <p className="text-xs font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>Engagement Summary</p>
              <div className="grid grid-cols-3 gap-3">
                {engagementTiles.map(m => {
                  const MIcon = m.icon
                  return (
                    <div key={m.label} className="p-3 rounded-[var(--r-md)] flex flex-col gap-1" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                      <MIcon size={12} style={{ color: m.color }} />
                      <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{m.value.toLocaleString()}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
                    </div>
                  )
                })}
                {engRate && (
                  <div key="Eng. Rate" className="p-3 rounded-[var(--r-md)] flex flex-col gap-1" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                    <TrendingUp size={12} style={{ color: '#22C55E' }} />
                    <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{engRate}%</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Eng. Rate</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
              Platform reach and engagement metrics are not available for this post yet — they populate once the platform APIs report back.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function PublishedPosts() {
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('all')
  const [campaign, setCampaign] = useState('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
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
        platform: post.platform ?? account?.platform ?? null,
        platforms:post.platforms ?? [],
        campaign: campaignItem?.name ?? null,
        publishedAt,
      }
    }), [posts, accountLookup, campaignLookup])

  const filtered = useMemo(() => published
    .filter(post => {
      const searchText = [post.title, post.caption, post.campaign, post.platform].filter(Boolean).join(' ').toLowerCase()
      const publishedDate = post.publishedAt ? new Date(post.publishedAt) : null
      const matchSearch = searchText.includes(search.toLowerCase())
      const matchPlatform = platform === 'all' || post.platform === platform
      const matchCampaign = campaign === 'All' || post.campaign === campaign
      const matchFrom = !dateFrom || !publishedDate || Number.isNaN(publishedDate.getTime()) || publishedDate >= new Date(dateFrom)
      const matchTo = !dateTo || !publishedDate || Number.isNaN(publishedDate.getTime()) || publishedDate <= new Date(dateTo + 'T23:59:59')
      return matchSearch && matchPlatform && matchCampaign && matchFrom && matchTo
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0)
      if (sortBy === 'title') return String(a.title ?? '').localeCompare(String(b.title ?? ''))
      return 0
    }), [published, search, platform, campaign, dateFrom, dateTo, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const resetPage = () => setPage(1)

  const totalPosts = published.length
  const draftCount = posts.filter(post => normalizeStatus(post.status) === 'draft').length
  const scheduledCount = posts.filter(post => ['scheduled', 'queued'].includes(normalizeStatus(post.status))).length
  const campaignCount = campaigns.length

  const platformChips = ['all', 'instagram', 'facebook', 'linkedin', 'x', 'youtube', 'pinterest']

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Published Posts" subtitle={`${totalPosts} posts published · live content records from the database.`} />

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
            <input value={search} onChange={e => { setSearch(e.target.value); resetPage() }} placeholder="Search published posts…" className="w-full h-10 pl-9 pr-4 text-sm rounded-[var(--r-md)] border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
          </div>

          <div className="relative">
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); resetPage() }} className="h-10 pl-3 pr-8 text-xs font-semibold rounded-[var(--r-md)] border outline-none appearance-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
              <option value="date">Sort: Latest First</option>
              <option value="title">Sort: Title</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-3.5 pointer-events-none" style={{ color: 'var(--text-subtle)' }} />
          </div>

          <button onClick={() => setShowFilters(v => !v)} className="flex items-center gap-1.5 px-3 h-10 rounded-[var(--r-md)] border text-xs font-semibold transition-all ml-auto" style={{ background: showFilters ? 'var(--primary-light)' : 'var(--card)', borderColor: showFilters ? 'var(--primary)' : 'var(--border)', color: showFilters ? 'var(--primary)' : 'var(--text-muted)' }}>
            <Filter size={13} /> Filters {showFilters ? <X size={11} /> : null}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-3">
              <div className="flex flex-wrap gap-1.5">
                {platformChips.map(item => {
                  const meta = PLATFORM_META[item]
                  const Icon = meta?.icon
                  const activeChip = platform === item
                  return (
                    <button key={item} onClick={() => { setPlatform(item); resetPage() }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all" style={{ background: activeChip ? (meta ? `${meta.color}15` : 'var(--primary-light)') : 'var(--card)', borderColor: activeChip ? (meta?.color ?? 'var(--primary)') : 'var(--border)', color: activeChip ? (meta?.color ?? 'var(--primary)') : 'var(--text-muted)' }}>
                      {Icon && <Icon size={11} />}
                      {item === 'all' ? 'All Platforms' : meta?.label}
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['All', ...Array.from(new Set(published.map(post => post.campaign).filter(Boolean)))].map(item => (
                  <button key={item} onClick={() => { setCampaign(item); resetPage() }} className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all" style={{ background: campaign === item ? 'rgba(79,70,229,.12)' : 'var(--card)', borderColor: campaign === item ? '#4F46E5' : 'var(--border)', color: campaign === item ? '#4F46E5' : 'var(--text-muted)' }}>{item}</button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); resetPage() }} className="h-9 px-3 text-xs rounded-[var(--r-md)] border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>to</span>
                <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); resetPage() }} className="h-9 px-3 text-xs rounded-[var(--r-md)] border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
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
                  {['Post', 'Platform', 'Published', 'Campaign', 'Content Type', 'Status', ''].map(head => (
                    <th key={head} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {paginated.map((post, index) => {
                    const meta = PLATFORM_META[post.platform] ?? PLATFORM_META.instagram
                    const Icon = meta?.icon
                    const ct = CONTENT_TYPE_COLORS[String(post.content_type ?? 'text').toLowerCase()] ?? CONTENT_TYPE_COLORS.text
                    return (
                      <motion.tr key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: index * 0.02 }} className="hover:bg-[var(--bg-alt)] transition-colors cursor-pointer" style={{ borderBottom: '1px solid var(--border)' }} onClick={() => setSelected(post)}>
                        <td className="px-4 py-3 max-w-[220px]"><p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{post.title ?? `Post ${post.id}`}</p><p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-subtle)' }}>{post.caption ?? 'No caption'}</p></td>
                        <td className="px-4 py-3"><div className="flex items-center gap-1.5">{Icon && <Icon size={13} style={{ color: meta.color }} />}<span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{meta?.label ?? post.platform}</span></div></td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{formatDate(post.publishedAt)}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{post.campaign ? <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(79,70,229,.10)', color: '#4F46E5' }}>{post.campaign}</span> : '—'}</td>
                        <td className="px-4 py-3"><span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: ct.bg, color: ct.color }}>{ct.label}</span></td>
                        <td className="px-4 py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: 'rgba(34,197,94,.12)', color: '#22C55E' }}>Published</span></td>
                        <td className="px-4 py-3">
                          <button onClick={e => { e.stopPropagation(); setSelected(post) }} className="flex items-center gap-1 text-xs font-semibold hover:underline whitespace-nowrap" style={{ color: 'var(--primary)' }}><Eye size={11} /> View</button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t flex items-center justify-between flex-wrap gap-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
            <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>
              Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} posts
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-[var(--card)] transition-colors disabled:opacity-40" style={{ color: 'var(--text-muted)' }}><ChevronLeft size={15} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                <button key={pg} onClick={() => setPage(pg)} className="w-7 h-7 rounded-lg text-xs font-semibold transition-all" style={{ background: pg === page ? 'var(--primary)' : 'transparent', color: pg === page ? '#fff' : 'var(--text-muted)' }}>{pg}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-[var(--card)] transition-colors disabled:opacity-40" style={{ color: 'var(--text-muted)' }}><ChevronRight size={15} /></button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && <PostDetailModal post={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  )
}
