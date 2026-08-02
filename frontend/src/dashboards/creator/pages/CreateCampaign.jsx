import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import Card from '../../../shared/components/ui/Card'
import Input from '../../../shared/components/Input'
import Select from '../../../shared/components/ui/Select'
import { createCampaign } from '../../../services/campaignService'
import {
  CAMPAIGN_STATUSES,
  PRIORITY_OPTIONS,
  CATEGORY_OPTIONS,
  OBJECTIVE_OPTIONS,
  PLATFORM_OPTIONS,
} from '../constants/campaigns'
import { Target, ArrowLeft, Sparkles } from 'lucide-react'

const initialForm = {
  name: '',
  description: '',
  objective: '',
  budget: '',
  priority: 'Medium',
  category: '',
  status: 'Planned',
  start_date: '',
  end_date: '',
}

export default function CreateCampaign() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [targetPlatforms, setTargetPlatforms] = useState([])
  const [errors, setErrors] = useState({})
  const [toastMessage, setToastMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const togglePlatform = (id) => {
    setTargetPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Campaign name is required.'
    if (form.budget !== '' && (Number(form.budget) < 0 || Number.isNaN(Number(form.budget)))) {
      next.budget = 'Budget must be a non-negative number.'
    }
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      next.end_date = 'End date cannot be earlier than start date.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (submitting) return
    if (!validate()) return
    setSubmitting(true)
    try {
      const created = await createCampaign({
        name: form.name.trim(),
        description: form.description.trim() || null,
        objective: form.objective.trim() || null,
        budget: form.budget === '' ? 0 : Number(form.budget),
        priority: form.priority,
        category: form.category || null,
        status: form.status,
        target_platforms: targetPlatforms,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      })
      showToast(`Campaign "${created.name}" created!`)
      setTimeout(() => navigate(`/dashboard/creator/campaigns/${created.id}`), 800)
    } catch (err) {
      const detail = err?.response?.data?.detail
      if (Array.isArray(detail)) {
        setErrors({ name: detail[0]?.msg || 'Invalid campaign details.' })
      } else {
        showToast(detail || 'Failed to create campaign.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-[900px] mx-auto animate-fade-in pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-slide-up">
          <Sparkles size={16} className="text-indigo-400 dark:text-indigo-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <section aria-label="Page header" className="card p-5 sm:p-6 relative overflow-hidden bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-950/40 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create Campaign</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">Define an objective, budget and timeline for your campaign.</p>
          </div>
          <Button variant="outline" size="md" onClick={() => navigate('/dashboard/creator/campaigns')}>
            <ArrowLeft size={16} />
            <span>Back to Campaigns</span>
          </Button>
        </div>
      </section>

      <Card className="p-5 sm:p-6 space-y-6">
        {/* Name + Objective */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Campaign Name"
            id="campaign-name"
            placeholder="e.g. Nike Air Max Launch"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
          />
          <Select
            label="Objective"
            id="campaign-objective"
            value={form.objective}
            onChange={(e) => handleChange('objective', e.target.value)}
          >
            <option value="">Select an objective</option>
            {OBJECTIVE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </Select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="campaign-description" className="label-base">Description</label>
          <textarea
            id="campaign-description"
            rows={3}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="What is this campaign about?"
            className="input-base resize-none"
          />
        </div>

        {/* Budget + Category + Priority + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Budget (USD)"
            id="campaign-budget"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 5000"
            value={form.budget}
            onChange={(e) => handleChange('budget', e.target.value)}
            error={errors.budget}
          />
          <Select
            label="Category"
            id="campaign-category"
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select
            label="Priority"
            id="campaign-priority"
            value={form.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
          >
            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Select
            label="Status"
            id="campaign-status"
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            {CAMPAIGN_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            id="campaign-start-date"
            type="date"
            value={form.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
          />
          <Input
            label="End Date"
            id="campaign-end-date"
            type="date"
            value={form.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
            error={errors.end_date}
          />
        </div>

        {/* Target Platforms */}
        <div>
          <span className="label-base">Target Platforms</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {PLATFORM_OPTIONS.map((p) => {
              const selected = targetPlatforms.includes(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  aria-pressed={selected}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    selected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Select the social platforms this campaign will target.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <Button variant="outline" size="md" onClick={() => navigate('/dashboard/creator/campaigns')}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSubmit} loading={submitting}>
            <Target size={16} />
            <span>Create Campaign</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
