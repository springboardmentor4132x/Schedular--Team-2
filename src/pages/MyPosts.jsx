import React, { useState, useMemo } from 'react'
import StatusBadge from '../components/ui/StatusBadge'
import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  Clock, 
  ArrowUpRight, 
  Database, 
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react'

// ── Social Icons (Universal inline SVGs) ──
const InstagramIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const LinkedinIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)

const FacebookIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

const YoutubeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
)

const TwitterIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
  </svg>
)

// ── Initial Mock Data ──
const initialPosts = [
  { id: 1, title: 'Nike Zoom Infinity Review', platform: 'Instagram Reel', platformIcon: InstagramIcon, campaign: 'Nike Summer Launch', status: 'Scheduled', edited: '2 hours ago', time: 'July 28, 2026 4:30 PM', thumb: '👟' },
  { id: 2, title: 'The Rise of Agentic AI in Frontend Engineering', platform: 'LinkedIn Article', platformIcon: LinkedinIcon, campaign: 'None', status: 'Published', edited: '1 day ago', time: 'July 21, 2026 10:00 AM', thumb: '🤖' },
  { id: 3, title: 'Summer Footwear Highlights', platform: 'Facebook Carousel', platformIcon: FacebookIcon, campaign: 'Nike Summer Launch', status: 'Needs Review', edited: '3 hours ago', time: 'Pending', thumb: '🌴' },
  { id: 4, title: 'Vite 6 Configuration Hack', platform: 'YouTube Short', platformIcon: YoutubeIcon, campaign: 'None', status: 'Draft', edited: '5 mins ago', time: 'Draft', thumb: '⚡' },
  { id: 5, title: '10 Tips for High-Performance CSS Transitions', platform: 'Twitter Thread', platformIcon: TwitterIcon, campaign: 'None', status: 'Rejected', edited: '2 days ago', time: 'Rejected', thumb: '✨' },
  { id: 6, title: 'Adidas Ultraboost 26 Review', platform: 'Instagram Reel', platformIcon: InstagramIcon, campaign: 'Adidas Sports Week', status: 'Draft', edited: '10 mins ago', time: 'Draft', thumb: '🏃‍♂️' },
  { id: 7, title: 'Apple Event Live Stream Reaction', platform: 'YouTube Short', platformIcon: YoutubeIcon, campaign: 'Apple Event Promotion', status: 'Scheduled', edited: '4 hours ago', time: 'Sept 10, 2026 9:00 AM', thumb: '🍎' },
]

export default function MyPosts() {
  const [posts, setPosts] = useState(initialPosts)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('All')
  const [campaignFilter, setCampaignFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('Newest')

  // Stats derivation
  const stats = useMemo(() => {
    return {
      drafts: posts.filter(p => p.status === 'Draft').length,
      scheduled: posts.filter(p => p.status === 'Scheduled').length,
      published: posts.filter(p => p.status === 'Published').length,
      rejected: posts.filter(p => p.status === 'Rejected').length,
    }
  }, [posts])

  // Filter & Search Logic
  const filteredPosts = useMemo(() => {
    let result = posts.filter(post => {
      // Tab check
      if (activeTab === 'Drafts' && post.status !== 'Draft') return false
      if (activeTab === 'Scheduled' && post.status !== 'Scheduled') return false
      if (activeTab === 'Published' && post.status !== 'Published') return false
      if (activeTab === 'Rejected' && post.status !== 'Rejected') return false

      // Search check
      const query = search.toLowerCase()
      const matchesSearch = 
        post.title.toLowerCase().includes(query) ||
        post.campaign.toLowerCase().includes(query) ||
        post.platform.toLowerCase().includes(query)

      // Dropdown filters
      const matchesPlatform = platformFilter === 'All' || post.platform.includes(platformFilter)
      const matchesCampaign = campaignFilter === 'All' || post.campaign === campaignFilter

      return matchesSearch && matchesPlatform && matchesCampaign
    })

    // Sort order check
    if (sortOrder === 'Newest') {
      // keeping original layout ordering or custom logic
      return result
    } else if (sortOrder === 'Oldest') {
      return [...result].reverse()
    } else if (sortOrder === 'Alphabetical') {
      return [...result].sort((a, b) => a.title.localeCompare(b.title))
    }

    return result
  }, [posts, activeTab, search, platformFilter, campaignFilter, sortOrder])

  // Actions handlers
  const handleDelete = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const handleDuplicate = (post) => {
    const duplicated = {
      ...post,
      id: Date.now(),
      title: `${post.title} (Copy)`,
      edited: 'Just now'
    }
    setPosts(prev => [duplicated, ...prev])
  }

  const handleCreatePostSimulated = () => {
    const newPost = {
      id: Date.now(),
      title: 'New Social Update Workspace',
      platform: 'Instagram Reel',
      platformIcon: InstagramIcon,
      campaign: 'None',
      status: 'Draft',
      edited: 'Just now',
      time: 'Draft',
      thumb: '✍️'
    }
    setPosts(prev => [newPost, ...prev])
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* ── Page Header ── */}
      <section aria-label="Page header" className="card bg-gradient-to-r from-indigo-50/50 to-slate-50 dark:from-indigo-950/10 dark:to-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Posts</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">Manage all your content from one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCreatePostSimulated}
              className="btn-primary shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus size={16} />
              <span>Create Post</span>
            </button>
            <button className="btn-ghost border border-slate-200 dark:border-slate-700 shadow-sm">
              <Download size={16} />
              <span>Import Draft</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Statistics Cards ── */}
      <section aria-label="My posts metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card cursor-pointer hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 group">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Draft Posts</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.drafts}</p>
            <p className="text-[10px] text-slate-400 mt-1">In editing vault</p>
          </div>
        </div>

        <div className="stat-card cursor-pointer hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 group">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Posts</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.scheduled}</p>
            <p className="text-[10px] text-emerald-500 font-semibold mt-1">▲ +2 active</p>
          </div>
        </div>

        <div className="stat-card cursor-pointer hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 group">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Published Posts</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.published}</p>
            <p className="text-[10px] text-emerald-500 font-semibold mt-1">▲ +12% this week</p>
          </div>
        </div>

        <div className="stat-card cursor-pointer hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 group">
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejected Posts</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.rejected}</p>
            <p className="text-[10px] text-rose-500 font-semibold mt-1">Needs review</p>
          </div>
        </div>
      </section>

      {/* ── Main Layout: 2 Columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left main: Filters + Tabs + Content Table/Grid */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Tab System & Search Filters Bar */}
          <div className="card space-y-4 shadow-card">
            
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-700/60 pb-1 overflow-x-auto scrollbar-none">
              {['All', 'Drafts', 'Scheduled', 'Published', 'Rejected'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap
                    ${activeTab === tab 
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' 
                      : 'text-slate-450 hover:text-slate-900 dark:hover:text-slate-200'
                    }
                  `}
                >
                  {tab} Posts
                </button>
              ))}
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
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

              {/* Dropdowns */}
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
                  <option value="Twitter">Twitter/X</option>
                </select>

                <select 
                  value={campaignFilter} 
                  onChange={(e) => setCampaignFilter(e.target.value)}
                  className="select-base !w-auto text-xs"
                >
                  <option value="All">All Campaigns</option>
                  <option value="Nike Summer Launch">Nike Summer Launch</option>
                  <option value="Adidas Sports Week">Adidas Sports Week</option>
                  <option value="Apple Event Promotion">Apple Event Promotion</option>
                  <option value="None">No Campaign</option>
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

          {/* Tab Render: Skeletons/Table/Empty States */}
          {filteredPosts.length === 0 ? (
            <div className="card flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50/20 dark:bg-slate-800/10">
              <span className="text-4xl mb-3">📝</span>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Drafts Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Get started by creating your first creative update post draft or importing one.
              </p>
              <button 
                onClick={handleCreatePostSimulated}
                className="btn-primary mt-4 py-2 px-4 shadow-md font-bold"
              >
                <Plus size={16} />
                <span>Create Post</span>
              </button>
            </div>
          ) : activeTab === 'Drafts' ? (
            // Draft Cards Grid View
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
                          <span className="text-[10px] text-slate-400 font-medium">{post.edited}</span>
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
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-550 dark:text-slate-350" title="Edit draft">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDuplicate(post)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-550 dark:text-slate-350" title="Duplicate">
                          <Copy size={14} />
                        </button>
                        <button onClick={() => handleDelete(post.id)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 rounded" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                        <span>Continue Editing</span>
                        <ArrowUpRight size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // SaaS Table View for all other tabs
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
                              <span className="font-bold text-slate-850 dark:text-slate-100 line-clamp-1">{post.title}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                              <PlatformIcon size={14} className="text-indigo-500" />
                              {post.platform}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-550 dark:text-slate-400 font-medium">{post.campaign}</td>
                          <td className="table-td">
                            <StatusBadge status={post.status === 'Needs Review' ? 'review' : post.status} dot />
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

        {/* Right side: Summary & Recent Activity widgets */}
        <div className="space-y-6">
          
          {/* Content Summary widget */}
          <div className="card space-y-4 shadow-card">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700/60 pb-3 flex items-center gap-2">
              <Database size={16} className="text-indigo-500" />
              Content Summary
            </h2>
            
            <div className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {/* Draft Completion */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>Draft Completion</span>
                  <span>78%</span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: '78%' }}></div>
                </div>
              </div>

              {/* Posts Ready */}
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
                <span>Posts Ready</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{stats.scheduled} ready</span>
              </div>

              {/* Storage Used */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>Cloud Storage Used</span>
                  <span>4.2 GB / 10 GB</span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity widget */}
          <div className="card space-y-4 shadow-card">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700/60 pb-3 flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" />
              Recent Activity
            </h2>

            <div className="space-y-3">
              <div className="flex gap-2.5 items-start">
                <span className="p-1 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded mt-0.5">
                  <FileText size={12} />
                </span>
                <div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">Draft post edited</p>
                  <p className="text-[10px] text-slate-400">Adidas Ultraboost · 10m ago</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="p-1 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded mt-0.5">
                  <Calendar size={12} />
                </span>
                <div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">Post scheduled</p>
                  <p className="text-[10px] text-slate-400">Nike Zoom Infinity Review · 2h ago</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="p-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded mt-0.5">
                  <CheckCircle size={12} />
                </span>
                <div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">Post published</p>
                  <p className="text-[10px] text-slate-400">Agentic AI in Frontend · 1d ago</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
