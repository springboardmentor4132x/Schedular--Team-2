import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import { deletePost, createPost } from '../../../services/postService'
import { loadMappedPosts } from '../../../services/postAdapter'
import { timeAgo } from '../../../shared/utils'
import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  ArrowUpRight, 
  Database, 
  Activity
} from 'lucide-react'

const VALID_TABS = ['All', 'Drafts', 'Scheduled', 'Published', 'Failed', 'Cancelled']
const SCHEDULED_STATUSES = ['Scheduled', 'Queued']

const ACTIVITY_ICONS = {
  Draft: { icon: FileText, color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
  Scheduled: { icon: Calendar, color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
  Queued: { icon: Calendar, color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
  Published: { icon: CheckCircle, color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
  Failed: { icon: XCircle, color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
  Cancelled: { icon: XCircle, color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
}

export default function MyPosts() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('All')
  const [campaignFilter, setCampaignFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('Newest')

  // Load posts from the backend API
  useEffect(() => {
    let mounted = true
    loadMappedPosts()
      .then((mapped) => {
        if (mounted) setPosts(mapped)
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  // Derive active tab from URL search params (e.g. ?tab=drafts)
  const activeTab = useMemo(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      const formatted = tabParam.charAt(0).toUpperCase() + tabParam.slice(1).toLowerCase()
      if (VALID_TABS.includes(formatted)) return formatted
    }
    return 'All'
  }, [searchParams])

  const handleSelectTab = (tabName) => {
    if (tabName === 'All') {
      setSearchParams({})
    } else {
      setSearchParams({ tab: tabName.toLowerCase() })
    }
  }

  const stats = useMemo(() => {
    const total = posts.length
    const drafts = posts.filter(p => p.status === 'Draft').length
    const ready = posts.filter(p => SCHEDULED_STATUSES.includes(p.status)).length
    const published = posts.filter(p => p.status === 'Published').length
    const failed = posts.filter(p => p.status === 'Failed').length
    const cancelled = posts.filter(p => p.status === 'Cancelled').length
    return {
      total,
      drafts,
      ready,
      published,
      failed,
      cancelled,
      attention: failed + cancelled,
      publishedPct: total ? Math.round((published / total) * 100) : 0,
      readyPct: total ? Math.round((ready / total) * 100) : 0,
    }
  }, [posts])

  const campaignOptions = useMemo(() => {
    const values = new Set(posts.map((p) => p.campaign).filter(Boolean))
    return ['All', ...values]
  }, [posts])

  const recentActivity = useMemo(() => {
    return [...posts]
      .sort((a, b) => new Date(b.raw.updated_at || b.raw.created_at || 0) - new Date(a.raw.updated_at || a.raw.created_at || 0))
      .slice(0, 5)
  }, [posts])

  const filteredPosts = useMemo(() => {
    let result = posts.filter(post => {
      if (activeTab === 'Drafts' && post.status !== 'Draft') return false
      if (activeTab === 'Scheduled' && !SCHEDULED_STATUSES.includes(post.status)) return false
      if (activeTab === 'Published' && post.status !== 'Published') return false
      if (activeTab === 'Failed' && post.status !== 'Failed') return false
      if (activeTab === 'Cancelled' && post.status !== 'Cancelled') return false

      const query = search.toLowerCase()
      const matchesSearch = 
        post.title.toLowerCase().includes(query) ||
        post.campaign.toLowerCase().includes(query) ||
        post.platform.toLowerCase().includes(query)

      const matchesPlatform = platformFilter === 'All' || post.platform.includes(platformFilter)
      const matchesCampaign = campaignFilter === 'All' || post.campaign === campaignFilter

      return matchesSearch && matchesPlatform && matchesCampaign
    })

    if (sortOrder === 'Newest') {
      return result
    } else if (sortOrder === 'Oldest') {
      return [...result].reverse()
    } else if (sortOrder === 'Alphabetical') {
      return [...result].sort((a, b) => a.title.localeCompare(b.title))
    }

    return result
  }, [posts, activeTab, search, platformFilter, campaignFilter, sortOrder])

  const handleDelete = async (id) => {
    try {
      await deletePost(id)
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch {
      // deletion failure is surfaced silently to avoid page breakage
    }
  }

  const handleDuplicate = async (post) => {
    try {
      const created = await createPost({
        title: `${post.title} (Copy)`,
        caption: post.caption,
        content_type: 'text',
        status: 'Draft',
      })
      const duplicated = {
        ...post,
        id: created.id,
        title: `${post.title} (Copy)`,
        edited: 'Just now',
      }
      setPosts(prev => [duplicated, ...prev])
    } catch {
      // duplication failure is surfaced silently to avoid page breakage
    }
  }

  const handleCreatePost = () => {
    navigate('/dashboard/creator/content-scheduling')
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      <section aria-label="Page header" className="card p-5 sm:p-6 bg-gradient-to-r from-indigo-50/50 to-slate-50 dark:from-indigo-950/10 dark:to-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Posts</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">Manage all your content from one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCreatePost}
              className="btn btn-primary btn-md min-w-[185px] justify-center shadow-sm"
            >
              <Plus size={16} />
              <span>Create Post</span>
            </button>
          </div>
        </div>
      </section>

      <section aria-label="My posts metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => handleSelectTab('Drafts')} className="stat-card cursor-pointer hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 group">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Draft Posts</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.drafts}</p>
            <p className="text-[10px] text-slate-400 mt-1">In editing vault</p>
          </div>
        </div>

        <div onClick={() => handleSelectTab('Scheduled')} className="stat-card cursor-pointer hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 group">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Posts</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.ready}</p>
            <p className="text-[10px] text-slate-400 mt-1">Ready to publish</p>
          </div>
        </div>

        <div onClick={() => handleSelectTab('Published')} className="stat-card cursor-pointer hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 group">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Published Posts</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.published}</p>
            <p className="text-[10px] text-slate-400 mt-1">Live on platforms</p>
          </div>
        </div>

        <div onClick={() => handleSelectTab('Failed')} className="stat-card cursor-pointer hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 group">
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Failed / Cancelled</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.attention}</p>
            <p className="text-[10px] text-slate-400 mt-1">Needs attention</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
          <div className="card p-5 space-y-4 shadow-card">
            <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-700/60 pb-1 overflow-x-auto scrollbar-none">
              {VALID_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleSelectTab(tab)}
                  className={`
                    px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap
                    ${activeTab === tab 
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' 
                      : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }
                  `}
                >
                  {tab} Posts
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, platform or campaign..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-base pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select 
                  value={platformFilter} 
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="select-base !w-auto text-xs"
                >
                  <option value="All">All Platforms</option>
                  <option value="Instagram">Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Facebook">Facebook</option>
                  <option value="YouTube">YouTube</option>
                  <option value="X / Twitter">Twitter/X</option>
                  <option value="Pinterest">Pinterest</option>
                </select>

                <select 
                  value={campaignFilter} 
                  onChange={(e) => setCampaignFilter(e.target.value)}
                  className="select-base !w-auto text-xs"
                >
                  {campaignOptions.map((option) => (
                    <option key={option} value={option}>{option === 'All' ? 'All Campaigns' : option}</option>
                  ))}
                </select>

                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="select-base !w-auto text-xs"
                >
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
                  <option value="Alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="card flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50/20 dark:bg-slate-800/10">
              {loading ? (
                <>
                  <span className="text-4xl mb-3">⏳</span>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Loading your posts...</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Fetching your latest content from the server.
                  </p>
                </>
              ) : (
                <>
                  <span className="text-4xl mb-3">📝</span>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    No {activeTab === 'All' ? '' : `${activeTab} `}Posts Yet
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    {activeTab === 'All' || activeTab === 'Drafts'
                      ? 'Get started by creating your first post or importing one.'
                      : 'Adjust your filters or check back later.'}
                  </p>
                  <button
                    onClick={handleCreatePost}
                    className="btn btn-primary btn-md mt-4"
                  >
                    <Plus size={16} />
                    <span>Create Post</span>
                  </button>
                </>
              )}
            </div>
          ) : activeTab === 'Drafts' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map((post) => {
                const PlatformIcon = post.platformIcon
                return (
                  <div key={post.id} className="card p-5 hover:border-indigo-400/50 hover:shadow-card-lg transition-all duration-300 flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{post.thumb}</span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">{post.title}</h4>
                          <span className="text-[10px] text-slate-400 font-medium">{post.edited || timeAgo(post.raw?.updated_at || post.raw?.created_at)}</span>
                        </div>
                      </div>
                      <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 rounded text-indigo-600 dark:text-indigo-400">
                        <PlatformIcon size={14} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-default text-[10px]">Campaign: {post.campaign}</span>
                      <StatusBadge status="draft" />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 pt-3 mt-auto">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400" title="Edit draft">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDuplicate(post)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400" title="Duplicate">
                          <Copy size={14} />
                        </button>
                        <button onClick={() => handleDelete(post.id)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 rounded" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <button onClick={handleCreatePost} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                        <span>Continue Editing</span>
                        <ArrowUpRight size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card p-0 overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="table-head">
                    <tr>
                      <th className="table-th">Post</th>
                      <th className="table-th">Platform</th>
                      <th className="table-th">Campaign</th>
                      <th className="table-th">Status</th>
                      <th className="table-th">Scheduled / Date</th>
                      <th className="table-th text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {filteredPosts.map((post) => {
                      const PlatformIcon = post.platformIcon
                      return (
                        <tr key={post.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg">{post.thumb}</span>
                              <span className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{post.title}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                              <PlatformIcon size={14} className="text-indigo-500" />
                              {post.platform}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">{post.campaign}</td>
                          <td className="table-td">
                            <StatusBadge status={post.status} dot />
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">{post.time}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400" title="Preview">
                                <Eye size={14} />
                              </button>
                              <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400" title="Edit">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDuplicate(post)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400" title="Duplicate">
                                <Copy size={14} />
                              </button>
                              <button onClick={() => handleDelete(post.id)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 rounded" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5 space-y-4 shadow-card">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700/60 pb-3 flex items-center gap-2">
              <Database size={16} className="text-indigo-500" />
              Content Summary
            </h2>
            
            <div className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>Published Content</span>
                  <span>{stats.publishedPct}%</span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${stats.publishedPct}%` }}></div>
                </div>
              </div>

              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
                <span>Posts Ready</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{stats.ready} ready</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>Scheduled</span>
                  <span>{stats.readyPct}%</span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600" style={{ width: `${stats.readyPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4 shadow-card">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700/60 pb-3 flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" />
              Recent Activity
            </h2>

            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400">No recent activity yet.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((post) => {
                  const config = ACTIVITY_ICONS[post.status] || ACTIVITY_ICONS.Draft
                  const Icon = config.icon
                  return (
                    <div key={post.id} className="flex gap-2.5 items-start">
                      <span className={`p-1 rounded mt-0.5 ${config.color}`}>
                        <Icon size={12} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold line-clamp-1">{post.title}</p>
                        <p className="text-[10px] text-slate-400">{post.status} · {timeAgo(post.raw?.updated_at || post.raw?.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
