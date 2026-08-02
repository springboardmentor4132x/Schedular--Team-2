import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import Card from '../../../shared/components/ui/Card'
import Input from '../../../shared/components/Input'
import Select from '../../../shared/components/ui/Select'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import Modal from '../../../shared/components/ui/Modal'
import ProgressBar from '../../../shared/components/ui/ProgressBar'
import { CardSkeleton, TableSkeleton } from '../../../shared/components/ui/Skeleton'
import { loadMappedPosts } from '../../../services/postAdapter'
import {
  getCampaignById,
  getCampaignProgress,
  getCampaignSummary,
  getCampaignTimeline,
  updateCampaign,
  deleteCampaign,
  removePostFromCampaign,
} from '../../../services/campaignService'
import {
  CAMPAIGN_STATUSES,
  PRIORITY_OPTIONS,
  CATEGORY_OPTIONS,
  OBJECTIVE_OPTIONS,
  PLATFORM_OPTIONS,
  campaignStatusBadge,
  priorityBadge,
  formatBudget,
  formatCampaignDate,
  durationLabel,
  getPlatformLabel,
} from '../constants/campaigns'
import {
  Edit3,
  Trash2,
  Link2,
  Clock,
  ArrowLeft,
  Wallet,
  Target,
  PlusCircle,
  TrendingUp,
  CalendarDays,
  CheckCircle2,
  FileText,
  X,
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="stat-card">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 truncate">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight tabular-nums">{value}</p>
      </div>
    </div>
  )
}

export default function CampaignDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const campaignId = Number(id)

  const [campaign, setCampaign] = useState(null)
  const [progress, setProgress] = useState(null)
  const [summary, setSummary] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState('')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [removingId, setRemovingId] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const [camp, prog, summ, tl, mapped] = await Promise.all([
          getCampaignById(campaignId).catch(() => null),
          getCampaignProgress(campaignId).catch(() => null),
          getCampaignSummary(campaignId).catch(() => null),
          getCampaignTimeline(campaignId).catch(() => null),
          loadMappedPosts().catch(() => []),
        ])
        if (!mounted) return
        if (!camp) {
          showToast('Campaign not found.')
          setTimeout(() => navigate('/dashboard/creator/campaigns'), 1000)
          return
        }
        setCampaign(camp)
        setProgress(prog?.progress || null)
        setSummary(summ?.summary || null)
        setTimeline(tl?.timeline || [])
        setPosts(mapped.filter((p) => p.raw?.campaign_id === campaignId))
      } catch {
        if (mounted) showToast('Failed to load campaign.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [campaignId, navigate])

  const assignedPosts = useMemo(() => posts, [posts])

  const openEdit = () => {
    setEditForm({
      name: campaign?.name || '',
      description: campaign?.description || '',
      objective: campaign?.objective || '',
      budget: campaign?.budget ?? '',
      priority: campaign?.priority || 'Medium',
      category: campaign?.category || '',
      status: campaign?.status || 'Planned',
      start_date: campaign?.start_date || '',
      end_date: campaign?.end_date || '',
      target_platforms: campaign?.target_platforms || [],
    })
    setIsEditOpen(true)
  }

  const handleEditField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleEditPlatform = (pid) => {
    setEditForm((prev) => ({
      ...prev,
      target_platforms: prev.target_platforms.includes(pid)
        ? prev.target_platforms.filter((p) => p !== pid)
        : [...prev.target_platforms, pid],
    }))
  }

  const handleSaveEdit = async () => {
    if (!editForm || saving) return
    if (!editForm.name.trim()) {
      showToast('Campaign name is required.')
      return
    }
    if (editForm.start_date && editForm.end_date && editForm.end_date < editForm.start_date) {
      showToast('End date cannot be earlier than start date.')
      return
    }
    setSaving(true)
    try {
      const updated = await updateCampaign(campaignId, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        objective: editForm.objective.trim() || null,
        budget: editForm.budget === '' ? 0 : Number(editForm.budget),
        priority: editForm.priority,
        category: editForm.category || null,
        status: editForm.status,
        target_platforms: editForm.target_platforms,
        start_date: editForm.start_date || null,
        end_date: editForm.end_date || null,
      })
      setCampaign(updated)
      setIsEditOpen(false)
      showToast('Campaign updated successfully.')
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to update campaign.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (saving) return
    setSaving(true)
    try {
      await deleteCampaign(campaignId)
      setIsDeleteOpen(false)
      showToast('Campaign deleted.')
      setTimeout(() => navigate('/dashboard/creator/campaigns'), 800)
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to delete campaign.')
      setSaving(false)
    }
  }

  const handleRemovePost = async (postId) => {
    if (removingId) return
    setRemovingId(postId)
    try {
      await removePostFromCampaign(campaignId, postId)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      const prog = await getCampaignProgress(campaignId).catch(() => null)
      if (prog) setProgress(prog.progress)
      showToast('Post removed from campaign.')
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to remove post.')
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
        <div className="card p-5 sm:p-6 h-28 animate-pulse bg-slate-100/60 dark:bg-slate-800/40"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <TableSkeleton />
      </div>
    )
  }

  if (!campaign) return null

  const platforms = campaign.target_platforms || []

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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/creator/campaigns')} className="px-0 text-slate-500">
              <ArrowLeft size={14} />
              Back to Campaigns
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{campaign.name}</h1>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${campaignStatusBadge(campaign.status)}`}>{campaign.status}</span>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${priorityBadge(campaign.priority)}`}>{campaign.priority} priority</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-slate-400" />{durationLabel(campaign.start_date, campaign.end_date)}</span>
              <span className="flex items-center gap-1.5"><Wallet size={14} className="text-slate-400" />{formatBudget(campaign.budget)}</span>
              {campaign.category && <span>Category: <span className="text-slate-700 dark:text-slate-300 font-semibold">{campaign.category}</span></span>}
            </div>
            {platforms.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {platforms.map((p) => (
                  <span key={p} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {getPlatformLabel(p)}
                  </span>
                ))}
              </div>
            )}
            {campaign.objective && (
              <p className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                <Target size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                <span>{campaign.objective}</span>
              </p>
            )}
            {campaign.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">{campaign.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="primary" size="md" onClick={() => navigate(`/dashboard/creator/campaigns/${campaignId}/assign-posts`)}>
              <Link2 size={16} />
              <span>Assign Posts</span>
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate(`/dashboard/creator/campaigns/${campaignId}/timeline`)}>
              <Clock size={16} />
              <span>Timeline</span>
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate(`/dashboard/creator/campaigns/${campaignId}/analytics`)}>
              <TrendingUp size={16} />
              <span>Analytics</span>
            </Button>
            <Button variant="ghost" size="md" onClick={openEdit} className="border border-slate-200 dark:border-slate-700">
              <Edit3 size={16} />
              <span>Edit</span>
            </Button>
            <Button variant="ghost" size="md" onClick={() => setIsDeleteOpen(true)} className="border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400">
              <Trash2 size={16} />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={TrendingUp} label="Total Posts" value={progress?.total_posts ?? 0} accent="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" />
        <StatCard icon={CheckCircle2} label="Published" value={progress?.published ?? 0} accent="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={Clock} label="Scheduled" value={progress?.scheduled ?? 0} accent="bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400" />
        <StatCard icon={FileText} label="Drafts" value={progress?.drafts ?? 0} accent="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" />
        <StatCard icon={Target} label="Completion" value={`${progress?.completion_percentage ?? 0}%`} accent="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned posts */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">Assigned Posts</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Every post under this campaign contributes to its progress.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/creator/campaigns/${campaignId}/assign-posts`)}>
                <PlusCircle size={14} />
                Add Posts
              </Button>
            </div>

            {assignedPosts.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center">
                  <Link2 size={24} />
                </div>
                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No posts assigned yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Assign scheduled or draft posts to this campaign to start tracking progress.
                </p>
                <Button variant="primary" size="sm" onClick={() => navigate(`/dashboard/creator/campaigns/${campaignId}/assign-posts`)}>
                  Assign Posts
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="table-head">
                    <tr>
                      <th className="table-th">Post</th>
                      <th className="table-th">Platform</th>
                      <th className="table-th">Status</th>
                      <th className="table-th">Scheduled</th>
                      <th className="table-th text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {assignedPosts.map((post) => (
                      <tr key={post.id}>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{post.thumb}</span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">{post.title}</p>
                              <p className="text-xs text-slate-400">{post.content_type || post.raw?.content_type || 'text'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">{post.platform}</td>
                        <td className="py-3.5 px-4"><StatusBadge status={post.status} dot /></td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{post.time}</td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={removingId === post.id}
                            onClick={() => handleRemovePost(post.id)}
                            className="text-rose-600 dark:text-rose-400"
                          >
                            <X size={14} />
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right column: progress + timeline preview */}
        <div className="space-y-6">
          <Card className="p-5 sm:p-6 space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">Campaign Progress</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Completion</span>
                <span className="text-indigo-600 dark:text-indigo-400">{progress?.completion_percentage ?? 0}%</span>
              </div>
              <ProgressBar value={progress?.completion_percentage ?? 0} max={100} />
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { label: 'Published', value: progress?.published ?? 0, color: 'bg-emerald-500' },
                { label: 'Scheduled', value: progress?.scheduled ?? 0, color: 'bg-sky-500' },
                { label: 'Drafts', value: progress?.drafts ?? 0, color: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-3 text-center">
                  <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">{item.value}</p>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.color}`}></span>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
            {summary && (
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Summary: <span className="font-semibold text-slate-700 dark:text-slate-300">{summary.published_posts} published</span> ·{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{summary.scheduled_posts} scheduled</span> ·{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{summary.draft_posts} drafts</span>
              </p>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">Recent Timeline</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/creator/campaigns/${campaignId}/timeline`)}>
                View all
              </Button>
            </div>
            {timeline.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No timeline events yet.</p>
            ) : (
              <ol className="space-y-3">
                {timeline.slice(0, 5).map((event, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${i === 0 ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{event.event}</p>
                      <p className="text-xs text-slate-400">{formatCampaignDate(event.date)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Campaign" size="lg">
        {editForm && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Campaign Name" id="edit-name" value={editForm.name} onChange={(e) => handleEditField('name', e.target.value)} required />
              <Select label="Objective" id="edit-objective" value={editForm.objective} onChange={(e) => handleEditField('objective', e.target.value)}>
                <option value="">Select an objective</option>
                {OBJECTIVE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </Select>
            </div>
            <div>
              <label htmlFor="edit-description" className="label-base">Description</label>
              <textarea
                id="edit-description"
                rows={3}
                value={editForm.description}
                onChange={(e) => handleEditField('description', e.target.value)}
                className="input-base resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input label="Budget (USD)" id="edit-budget" type="number" min="0" value={editForm.budget} onChange={(e) => handleEditField('budget', e.target.value)} />
              <Select label="Category" id="edit-category" value={editForm.category} onChange={(e) => handleEditField('category', e.target.value)}>
                <option value="">Select a category</option>
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select label="Priority" id="edit-priority" value={editForm.priority} onChange={(e) => handleEditField('priority', e.target.value)}>
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
              <Select label="Status" id="edit-status" value={editForm.status} onChange={(e) => handleEditField('status', e.target.value)}>
                {CAMPAIGN_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Start Date" id="edit-start" type="date" value={editForm.start_date} onChange={(e) => handleEditField('start_date', e.target.value)} />
              <Input label="End Date" id="edit-end" type="date" value={editForm.end_date} onChange={(e) => handleEditField('end_date', e.target.value)} />
            </div>
            <div>
              <span className="label-base">Target Platforms</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {PLATFORM_OPTIONS.map((p) => {
                  const selected = editForm.target_platforms.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleEditPlatform(p.id)}
                      aria-pressed={selected}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <Button variant="outline" size="md" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button variant="primary" size="md" onClick={handleSaveEdit} loading={saving}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Campaign" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-slate-100">"{campaign.name}"</span>?
            Assigned posts will be kept but removed from this campaign.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" size="md" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" size="md" onClick={handleDelete} loading={saving}>
              <Trash2 size={16} />
              Delete Campaign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
