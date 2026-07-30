import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Search, Eye, Heart, Share2,
  MousePointer, MessageSquare, TrendingUp,
  Filter, X, ChevronDown,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatCard from '../../../components/dashboard/StatCard'
import EmptyState from '../../../components/dashboard/EmptyState'
import { MOCK_PUBLISHED_POSTS } from '../../../services/mockData'

/**
 * PublishedPosts — Business User (view-only)
 * Published history with engagement data, search, platform filter,
 * date sort and campaign filter.
 */

const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C', label: 'Instagram' },
  facebook:  { icon: FaFacebook,  color: '#1877F2', label: 'Facebook'  },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2', label: 'LinkedIn'  },
  x:         { icon: FaXTwitter,  color: '#374151', label: 'X'         },
}

const CAMPAIGNS = ['All', ...Array.from(new Set(MOCK_PUBLISHED_POSTS.map(p => p.campaign).filter(Boolean)))]

function EngagementBar({ value, max, color }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--bg-alt)' }}>
        <div className="h-1.5 rounded-full transition-all"
          style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold w-10 text-right" style={{ color: 'var(--text)' }}>
        {value >= 1000 ? `${(value/1000).toFixed(1)}K` : value}
      </span>
    </div>
  )
}

export default function PublishedPosts() {
  const [search,   setSearch]   = useState('')
  const [platform, setPlatform] = useState('all')
  const [campaign, setCampaign] = useState('All')
  const [sortBy,   setSortBy]   = useState('date')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = MOCK_PUBLISHED_POSTS
    .filter(p => {
      const matchSearch   = p.title.toLowerCase().includes(search.toLowerCase())
      const matchPlatform = platform === 'all' || p.platform === platform
      const matchCampaign = campaign === 'All' || p.campaign === campaign
      return matchSearch && matchPlatform && matchCampaign
    })
    .sort((a, b) => {
      if (sortBy === 'date')       return new Date(b.publishedAt) - new Date(a.publishedAt)
      if (sortBy === 'reach')      return b.reach - a.reach
      if (sortBy === 'engagement') return b.engagement - a.engagement
      return 0
    })

  const maxReach = Math.max(...MOCK_PUBLISHED_POSTS.map(p => p.reach))

  const totalReach      = MOCK_PUBLISHED_POSTS.reduce((s, p) => s + p.reach, 0)
  const totalEngagement = MOCK_PUBLISHED_POSTS.reduce((s, p) => s + p.engagement, 0)
  const totalLikes      = MOCK_PUBLISHED_POSTS.reduce((s, p) => s + p.likes, 0)
  const totalClicks     = MOCK_PUBLISHED_POSTS.reduce((s, p) => s + p.clicks, 0)

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Published Posts"
        subtitle={`${MOCK_PUBLISHED_POSTS.length} posts published`}
      />

      {/* KPI summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Reach"      value={`${(totalReach/1000).toFixed(0)}K`}      icon={Eye}          iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)"  trend={18} index={0} />
        <StatCard title="Engagement"       value={`${(totalEngagement/1000).toFixed(1)}K`} icon={TrendingUp}   iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)"  trend={12} index={1} />
        <StatCard title="Total Likes"      value={`${(totalLikes/1000).toFixed(1)}K`}      icon={Heart}        iconColor="#EF4444" iconBg="rgba(239,68,68,.10)"  trend={8}  index={2} />
        <StatCard title="Total Clicks"     value={totalClicks}                              icon={MousePointer} iconColor="#F59E0B" iconBg="rgba(245,158,11,.12)" trend={6}  index={3} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search published posts…"
              className="w-full h-10 pl-9 pr-4 text-sm rounded-[var(--r-md)] border outline-none"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="h-10 pl-3 pr-8 text-xs font-semibold rounded-[var(--r-md)] border outline-none appearance-none"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
              <option value="date">Sort: Latest First</option>
              <option value="reach">Sort: Most Reach</option>
              <option value="engagement">Sort: Most Engagement</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-3.5 pointer-events-none" style={{ color: 'var(--text-subtle)' }} />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-1.5 px-3 h-10 rounded-[var(--r-md)] border text-xs font-semibold transition-all"
            style={{
              background:  showFilters ? 'var(--primary-light)' : 'var(--card)',
              borderColor: showFilters ? 'var(--primary)'       : 'var(--border)',
              color:       showFilters ? 'var(--primary)'       : 'var(--text-muted)',
            }}
          >
            <Filter size={13} /> Filters {showFilters ? <X size={11} /> : null}
          </button>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-3"
            >
              {/* Platform filter */}
              <div className="flex flex-wrap gap-1.5">
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
                      {Icon && <Icon size={11} />}
                      {p === 'all' ? 'All Platforms' : null}
                    </button>
                  )
                })}
              </div>

              {/* Campaign filter */}
              <div className="flex flex-wrap gap-1.5">
                {CAMPAIGNS.map(c => (
                  <button key={c} onClick={() => setCampaign(c)}
                    className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                    style={{
                      background:  campaign === c ? 'rgba(79,70,229,.12)' : 'var(--card)',
                      borderColor: campaign === c ? '#4F46E5' : 'var(--border)',
                      color:       campaign === c ? '#4F46E5' : 'var(--text-muted)',
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="card"><EmptyState icon={Send} title="No published posts found" message="Try adjusting your filters." /></div>
      )}

      {/* Posts table */}
      {filtered.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
                  {['Post','Platform','Published','Campaign','Reach','Engagement','Likes','Shares','Clicks'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const meta  = PLATFORM_META[p.platform]; const Icon = meta?.icon
                  const rate  = ((p.engagement / p.reach) * 100).toFixed(1)
                  const dt    = new Date(p.publishedAt)
                  return (
                    <motion.tr key={p.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-[var(--bg-alt)] transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{p.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {Icon && <Icon size={13} style={{ color: meta.color }} />}
                          <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{p.platform}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        {dt.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {p.campaign
                          ? <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(79,70,229,.10)', color: '#4F46E5' }}>{p.campaign}</span>
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <EngagementBar value={p.reach} max={maxReach} color="#1E3A8A" />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(34,197,94,.12)', color: '#22C55E' }}>{rate}%</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>
                        {p.likes.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>
                        {p.shares.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>
                        {p.clicks > 0 ? p.clicks.toLocaleString() : '—'}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t flex items-center justify-between"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
            <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>
              Showing {filtered.length} of {MOCK_PUBLISHED_POSTS.length} posts
            </span>
            <div className="flex gap-4 text-xs">
              <span style={{ color: 'var(--text-muted)' }}>
                Total reach: <span className="font-bold" style={{ color: 'var(--text)' }}>
                  {filtered.reduce((s,p) => s+p.reach,0).toLocaleString()}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
