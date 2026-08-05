import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getContentAnalytics } from '../../services/analyticsService'
import PostCompareModal from '../../components/analytics/Shared/PostCompareModal'
import { Search, Filter, ArrowUpDown, Layers, Eye } from 'lucide-react'

export default function ContentAnalytics() {
  const context = useOutletContext() || {}
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState(context.selectedPlatform || 'All')
  const [campaign, setCampaign] = useState(context.selectedCampaign || 'All')
  const [sortBy, setSortBy] = useState('reach') // reach, engagementRate, likes

  const [selectedPostIds, setSelectedPostIds] = useState([])
  const [showCompareModal, setShowCompareModal] = useState(false)

  useEffect(() => {
    getContentAnalytics({ search, platform, campaign, sortBy }).then((res) => {
      setPosts(res)
      setLoading(false)
    })
  }, [search, platform, campaign, sortBy])

  const toggleSelectPost = (id) => {
    setSelectedPostIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const selectedPosts = posts.filter((p) => selectedPostIds.includes(p.id))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Controls & Toolbar */}
      <div className="card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-primary">Content Performance Analytics</h2>
            <p className="text-xs text-secondary mt-0.5">
              Granular metrics for individual published posts across platforms.
            </p>
          </div>

          {/* Compare Button */}
          {selectedPostIds.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="btn btn-primary btn-md flex items-center gap-2 animate-scale-in"
            >
              <Layers size={16} />
              <span>Compare Selected ({selectedPostIds.length})</span>
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2 border-t border-default">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              placeholder="Search captions or campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9 text-xs"
            />
          </div>

          {/* Platform Filter */}
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="select-base text-xs w-auto min-w-[130px]"
          >
            <option value="All">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="YouTube">YouTube</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="X">X</option>
            <option value="Pinterest">Pinterest</option>
            <option value="Facebook">Facebook</option>
          </select>

          {/* Campaign Filter */}
          <select
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            className="select-base text-xs w-auto min-w-[140px]"
          >
            <option value="All">All Campaigns</option>
            <option value="Product Launch 2026">Product Launch 2026</option>
            <option value="Dev Education">Dev Education</option>
            <option value="Thought Leadership">Thought Leadership</option>
            <option value="Daily AI Tips">Daily AI Tips</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-secondary whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select-base text-xs w-auto min-w-[140px]"
            >
              <option value="reach">Reach (High to Low)</option>
              <option value="engagementRate">Engagement Rate</option>
              <option value="likes">Likes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Analytics Data Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="table-inner">
            <thead className="table-head">
              <tr>
                <th className="table-th w-10 text-center">Select</th>
                <th className="table-th">Post & Caption</th>
                <th className="table-th">Platform</th>
                <th className="table-th">Campaign</th>
                <th className="table-th">Publish Date</th>
                <th className="table-th">Type</th>
                <th className="table-th text-right">Reach</th>
                <th className="table-th text-right">Impressions</th>
                <th className="table-th text-right">Likes</th>
                <th className="table-th text-right">Comments</th>
                <th className="table-th text-right">Shares</th>
                <th className="table-th text-right">Saves</th>
                <th className="table-th text-right">Clicks</th>
                <th className="table-th text-right">Eng. Rate</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="table-row">
                    {Array.from({ length: 14 }).map((__, j) => (
                      <td key={j} className="table-td">
                        <div className="h-4 w-16 bg-surface rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={14} className="table-td text-center py-12">
                    <p className="text-sm font-semibold text-secondary">No matching posts found.</p>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="table-row">
                    {/* Checkbox */}
                    <td className="table-td text-center">
                      <input
                        type="checkbox"
                        checked={selectedPostIds.includes(post.id)}
                        onChange={() => toggleSelectPost(post.id)}
                        className="rounded border-default text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>

                    {/* Thumbnail & Caption */}
                    <td className="table-td">
                      <div className="flex items-center gap-3 min-w-[240px]">
                        <div className="w-9 h-9 rounded-xl bg-surface border border-default flex items-center justify-center text-lg flex-shrink-0">
                          {post.thumbnail}
                        </div>
                        <span className="text-sm font-bold text-primary line-clamp-2">{post.caption}</span>
                      </div>
                    </td>

                    {/* Platform */}
                    <td className="table-td whitespace-nowrap">
                      <span className="badge badge-primary">{post.platform}</span>
                    </td>

                    {/* Campaign */}
                    <td className="table-td whitespace-nowrap text-xs font-medium text-secondary">
                      {post.campaign}
                    </td>

                    {/* Date */}
                    <td className="table-td whitespace-nowrap text-xs text-secondary">
                      {post.publishDate}
                    </td>

                    {/* Content Type */}
                    <td className="table-td whitespace-nowrap">
                      <span className="badge badge-default">{post.contentType}</span>
                    </td>

                    {/* Metrics */}
                    <td className="table-td text-right font-bold text-primary">
                      {post.reach.toLocaleString()}
                    </td>
                    <td className="table-td text-right text-secondary">
                      {post.impressions.toLocaleString()}
                    </td>
                    <td className="table-td text-right text-primary">{post.likes.toLocaleString()}</td>
                    <td className="table-td text-right text-secondary">{post.comments.toLocaleString()}</td>
                    <td className="table-td text-right text-secondary">{post.shares.toLocaleString()}</td>
                    <td className="table-td text-right text-secondary">{post.saves.toLocaleString()}</td>
                    <td className="table-td text-right text-secondary">{post.clicks.toLocaleString()}</td>
                    <td className="table-td text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {post.engagementRate}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Comparison Modal */}
      {showCompareModal && (
        <PostCompareModal posts={selectedPosts} onClose={() => setShowCompareModal(false)} />
      )}
    </div>
  )
}
