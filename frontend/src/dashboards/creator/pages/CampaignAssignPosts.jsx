import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import { CardSkeleton, TableSkeleton } from '../../../shared/components/ui/Skeleton'
import { loadMappedPosts } from '../../../services/postAdapter'
import { getCampaignById, assignPostToCampaign } from '../../../services/campaignService'
import { ArrowLeft, Link2, Search, CheckCircle2, Target } from 'lucide-react'

const ASSIGNABLE_STATUSES = ['Draft', 'Scheduled', 'Queued', 'Pending Review']

export default function CampaignAssignPosts() {
  const navigate = useNavigate()
  const { id } = useParams()
  const campaignId = Number(id)

  const [campaign, setCampaign] = useState(null)
  const [available, setAvailable] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(new Set())
  const [search, setSearch] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [assigning, setAssigning] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const camp = await getCampaignById(campaignId).catch(() => null)
        if (!mounted) return
        if (!camp) {
          showToast('Campaign not found.')
          setTimeout(() => navigate('/dashboard/creator/campaigns'), 1000)
          return
        }
        setCampaign(camp)
        const mapped = await loadMappedPosts().catch(() => [])
        if (!mounted) return
        setAvailable(mapped.filter((p) => p.raw?.campaign_id == null && ASSIGNABLE_STATUSES.includes(p.status)))
      } catch {
        if (mounted) showToast('Failed to load posts.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [campaignId, navigate])

  const filtered = useMemo(() => {
    if (!search.trim()) return available
    const q = search.trim().toLowerCase()
    return available.filter((p) =>
      [p.title, p.platform, p.status].filter(Boolean).some((v) => v.toLowerCase().includes(q))
    )
  }, [available, search])

  const toggleSelect = (postId) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      const allSelected = filtered.every((p) => prev.has(p.id))
      if (allSelected) filtered.forEach((p) => next.delete(p.id))
      else filtered.forEach((p) => next.add(p.id))
      return next
    })
  }

  const handleAssign = async () => {
    if (assigning || selected.size === 0) return
    setAssigning(true)
    try {
      for (const postId of selected) {
        await assignPostToCampaign(campaignId, postId)
      }
      showToast(`${selected.size} post${selected.size > 1 ? 's' : ''} assigned to "${campaign.name}".`)
      setAvailable((prev) => prev.filter((p) => !selected.has(p.id)))
      setSelected(new Set())
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to assign posts.')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-slide-up">
          <Target size={16} className="text-indigo-400 dark:text-indigo-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <section aria-label="Page header" className="card p-5 sm:p-6 relative overflow-hidden bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-950/40 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/creator/campaigns/${campaignId}`)} className="px-0 text-slate-500 mb-2">
              <ArrowLeft size={14} />
              Back to Campaign
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Assign Posts to Campaign</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">
              {campaign ? `Select unassigned posts to add to "${campaign.name}".` : 'Loading campaign...'}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            disabled={selected.size === 0}
            loading={assigning}
            onClick={handleAssign}
          >
            <Link2 size={16} />
            <span>Assign {selected.size > 0 ? `(${selected.size})` : ''}</span>
          </Button>
        </div>
      </section>

      {/* Toolbar */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search unassigned posts..."
            className="input-base !pl-10"
            aria-label="Search posts"
          />
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filtered.length > 0 && filtered.every((p) => selected.has(p.id))} onChange={toggleAll} className="w-4 h-4 rounded accent-indigo-600" />
            Select all
          </label>
          <span className="text-slate-400">{available.length} unassigned · {selected.size} selected</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
          <TableSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">No unassigned posts available</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {available.length === 0
                ? 'All of your scheduled and draft posts are already assigned to a campaign. Create a new post to assign it here.'
                : 'No posts match your search.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="md" onClick={() => navigate('/dashboard/creator/content-scheduling')}>
              Create Post
            </Button>
            <Button variant="primary" size="md" onClick={() => navigate(`/dashboard/creator/campaigns/${campaignId}`)}>
              View Campaign
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-head">
                <tr>
                  <th className="table-th w-10"></th>
                  <th className="table-th">Post</th>
                  <th className="table-th">Platform</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Scheduled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filtered.map((post) => (
                  <tr
                    key={post.id}
                    onClick={() => toggleSelect(post.id)}
                    className={`cursor-pointer transition-colors ${selected.has(post.id) ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'}`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={selected.has(post.id)}
                        onChange={() => toggleSelect(post.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded accent-indigo-600"
                        aria-label={`Select ${post.title}`}
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{post.thumb}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[260px]">{post.title}</p>
                          <p className="text-xs text-slate-400">{post.raw?.content_type || 'text'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">{post.platform}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={post.status} dot /></td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{post.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
