export const CAMPAIGN_STATUSES = ['Planned', 'Active', 'Paused', 'Completed']

export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']

export const CATEGORY_OPTIONS = [
  'Product Launch',
  'Brand Awareness',
  'Seasonal Campaign',
  'Promotion / Sale',
  'Content Series',
  'Influencer / Collaboration',
  'Event Promotion',
  'Community Building',
  'Other',
]

export const OBJECTIVE_OPTIONS = [
  'Brand Awareness',
  'Lead Generation',
  'Product Launch',
  'Engagement',
  'Sales / Conversions',
  'Content Distribution',
  'Audience Growth',
  'Other',
]

export const PLATFORM_OPTIONS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'x', label: 'X / Twitter' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'pinterest', label: 'Pinterest' },
]

export function getPlatformLabel(platformId = '') {
  const found = PLATFORM_OPTIONS.find((p) => p.id === platformId.toLowerCase())
  return found ? found.label : platformId
}

export function campaignStatusColor(status = '') {
  const s = String(status).toLowerCase()
  if (s === 'active') return 'bg-indigo-600'
  if (s === 'paused') return 'bg-amber-500'
  if (s === 'reviewing' || s === 'in review') return 'bg-amber-500'
  if (s === 'completed') return 'bg-emerald-500'
  if (s === 'planned' || s === 'planning') return 'bg-sky-500'
  return 'bg-slate-400'
}

export function campaignStatusBadge(status = '') {
  const s = String(status).toLowerCase()
  if (s === 'active') return 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
  if (s === 'paused') return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
  if (s === 'reviewing' || s === 'in review') return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
  if (s === 'completed') return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
  if (s === 'planned' || s === 'planning') return 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
  return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
}

export function priorityBadge(priority = '') {
  const p = String(priority).toLowerCase()
  if (p === 'high') return 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
  if (p === 'medium') return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
  if (p === 'low') return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
  return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
}

export function formatBudget(value) {
  const num = Number(value) || 0
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function formatCampaignDate(iso) {
  if (!iso) return '—'
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function durationLabel(start, end) {
  if (!start && !end) return 'No timeline set'
  if (!end) return `From ${formatCampaignDate(start)}`
  if (!start) return `Until ${formatCampaignDate(end)}`
  const startDate = new Date(`${start}T00:00:00`)
  const endDate = new Date(`${end}T00:00:00`)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return '—'
  const days = Math.max(1, Math.round((endDate - startDate) / 86400000) + 1)
  return `${formatCampaignDate(start)} → ${formatCampaignDate(end)} · ${days}d`
}
