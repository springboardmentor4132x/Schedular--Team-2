import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Search, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  ArrowUpRight, 
  Database, 
  Activity
} from 'lucide-react'

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
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState(initialPosts)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('All')
  const [campaignFilter, setCampaignFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('Newest')

  // Sync activeTab with URL search params (e.g. ?tab=drafts)
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      const formatted = tabParam.charAt(0).toUpperCase() + tabParam.slice(1).toLowerCase()
      if (['All', 'Drafts', 'Scheduled', 'Published', 'Rejected'].includes(formatted)) {
        setActiveTab(formatted)
      }
    }
  }, [searchParams])

  const handleSelectTab = (tabName) => {
    setActiveTab(tabName)
    if (tabName === 'All') {
      setSearchParams({})
    } else {
      setSearchParams({ tab: tabName.toLowerCase() })
    }
  }

  const handleImportDraft = () => {
    handleSelectTab('Drafts')
  }

  const stats = useMemo(() => {
    return {
      drafts: posts.filter(p => p.status === 'Draft').length,
      scheduled: posts.filter(p => p.status === 'Scheduled').length,
      published: posts.filter(p => p.status === 'Published').length,
      rejected: posts.filter(p => p.status === 'Rejected').length,
    }
  }, [posts])

  const filteredPosts = useMemo(() => {
    let result = posts.filter(post => {
      if (activeTab === 'Drafts' && post.status !== 'Draft') return false
      if (activeTab === 'Scheduled' && post.status !== 'Scheduled') return false
      if (activeTab === 'Published' && post.status !== 'Published') return false
      if (activeTab === 'Rejected' && post.status !== 'Rejected') return false

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

  const handleDelete = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const handleDuplicate = (post) => {
    const duplicated = {
      ...post,
      id: post.id + 100,
      title: `${post.title} (Copy)`,
      edited: 'Just now'
    }
    setPosts(prev => [duplicated, ...prev])
  }

  const handleCreatePostSimulated = () => {
    navigate('/creator/create-post')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <section aria-label="Page header" className="card bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">My Posts</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs md:text-sm font-medium">Manage all your content from one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCreatePostSimulated}
              className="btn btn-primary btn-md min-w-[185px] justify-center shadow-xs"
            >
              <Plus size={16} strokeWidth={2} />
              <span>Create Post</span>
            </button>
          </div>
        </div>
      </section>

      <section aria-label="My posts metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => handleSelectTab('Drafts')} className="stat-card cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <FileText size={18} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Draft Posts</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1 tracking-tight">{stats.drafts}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">In editing vault</p>
          </div>
        </div>

        <div onClick={() => handleSelectTab('Scheduled')} className="stat-card cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Calendar size={18} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scheduled Posts</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1 tracking-tight">{stats.scheduled}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">▲ +2 active</p>
          </div>
        </div>

        <div onClick={() => handleSelectTab('Published')} className="stat-card cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle size={18} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Published Posts</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1 tracking-tight">{stats.published}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">▲ +12% this week</p>
          </div>
        </div>

        <div onClick={() => handleSelectTab('Rejected')} className="stat-card cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <XCircle size={18} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rejected Posts</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1 tracking-tight">{stats.rejected}</p>
            <p className="text-[10px] text-rose-500 font-semibold mt-0.5">Needs review</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
          <div className="card space-y-4 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-1 overflow-x-auto scrollbar-none">
              {['All', 'Drafts', 'Scheduled', 'Published', 'Rejected'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleSelectTab(tab)}
                  className={`
                    px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer
                    ${activeTab === tab 
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40' 
                      : 'text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
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
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select 
                  value={platformFilter} 
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
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
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
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
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
                  <option value="Alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="card flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-4xl mb-3">📝</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Drafts Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Get started by creating your first creative update post draft or importing one.
              </p>
              <button 
                onClick={handleCreatePostSimulated}
                className="btn btn-primary btn-md mt-4"
              >
                <Plus size={16} strokeWidth={2} />
                <span>Create Post</span>
              </button>
            </div>
          ) : activeTab === 'Drafts' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map((post) => {
                const PlatformIcon = post.platformIcon
                return (
                  <div key={post.id} className="card p-5 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 transition-all duration-200 flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{post.thumb}</span>
                        <div>
                          <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{post.title}</h4>
                          <span className="text-[10px] text-slate-400 font-medium">{post.edited}</span>
                        </div>
                      </div>
                      <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <PlatformIcon size={14} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-default text-[10px]">Campaign: {post.campaign}</span>
                      <StatusBadge status="draft" />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-auto">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors" title="Edit draft">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDuplicate(post)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors" title="Duplicate">
                          <Copy size={14} />
                        </button>
                        <button onClick={() => handleDelete(post.id)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 rounded-lg transition-colors" title="Delete">
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
            <div className="card p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-left">Post</th>
                      <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-left">Platform</th>
                      <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-left">Campaign</th>
                      <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-left">Status</th>
                      <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-left">Scheduled / Date</th>
                      <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredPosts.map((post) => {
                      const PlatformIcon = post.platformIcon
                      return (
                        <tr key={post.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">{post.thumb}</span>
                              <span className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{post.title}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                              <PlatformIcon size={14} className="text-indigo-500" />
                              {post.platform}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">{post.campaign}</td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={post.status === 'Needs Review' ? 'review' : post.status} dot />
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">{post.time}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors" title="Preview">
                                <Eye size={14} />
                              </button>
                              <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors" title="Edit">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDuplicate(post)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors" title="Duplicate">
                                <Copy size={14} />
                              </button>
                              <button onClick={() => handleDelete(post.id)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 rounded-lg transition-colors" title="Delete">
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
          <div className="card space-y-4 border border-slate-200/80 dark:border-slate-800">
            <h2 className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Database size={16} className="text-indigo-500" strokeWidth={2} />
              Content Summary
            </h2>
            
            <div className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>Draft Completion</span>
                  <span>78%</span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: '78%' }}></div>
                </div>
              </div>

              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span>Posts Ready</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{stats.scheduled} ready</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>Cloud Storage Used</span>
                  <span>4.2 GB / 10 GB</span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card space-y-4 border border-slate-200/80 dark:border-slate-800">
            <h2 className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" strokeWidth={2} />
              Recent Activity
            </h2>

            <div className="space-y-3">
              <div className="flex gap-2.5 items-start">
                <span className="p-1 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg mt-0.5 border border-amber-200/60 dark:border-amber-800/40">
                  <FileText size={12} />
                </span>
                <div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">Draft post edited</p>
                  <p className="text-[10px] text-slate-400">Adidas Ultraboost · 10m ago</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="p-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg mt-0.5 border border-indigo-200/60 dark:border-indigo-800/40">
                  <Calendar size={12} />
                </span>
                <div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">Post scheduled</p>
                  <p className="text-[10px] text-slate-400">Nike Zoom Infinity Review · 2h ago</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="p-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg mt-0.5 border border-emerald-200/60 dark:border-emerald-800/40">
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
