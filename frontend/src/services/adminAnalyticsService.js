import API from '../shared/api/api'

const PLATFORM_LABELS = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  x: 'X',
  twitter: 'X',
  youtube: 'YouTube',
  pinterest: 'Pinterest',
}

function platformLabel(value) {
  if (!value) return value
  return PLATFORM_LABELS[value.toLowerCase()] || value
}

function formatCompact(value) {
  const n = Number(value) || 0
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export async function getAdminAnalyticsSummary() {
  const response = await API.get('/admin/analytics/summary')
  const { kpis, timeSeries, platformGrowth } = response.data
  const formatted = {}
  for (const [key, kpi] of Object.entries(kpis || {})) {
    formatted[key] = {
      label: kpi.label,
      value: key === 'overallEngagementRate' ? `${Number(kpi.value).toFixed(2)}%` : formatCompact(kpi.value),
      change: kpi.change,
      positive: kpi.positive,
    }
  }
  return {
    kpis: formatted,
    timeSeries: timeSeries || [],
    platformGrowth: (platformGrowth || []).map((p) => ({
      platform: platformLabel(p.platform),
      followers: p.followers,
      reach: p.reach,
      engagement: p.engagement,
      growth: p.growth,
    })),
  }
}

export async function getAdminTopPosts() {
  const response = await API.get('/admin/analytics/top-posts')
  return (response.data || []).map((p) => ({
    id: p.id,
    text: p.text,
    platform: platformLabel(p.platform),
    reach: formatCompact(p.reach),
    engagement: `${Number(p.engagement_rate).toFixed(1)}%`,
  }))
}

export async function getAdminCreatorPerformance({ search = '', status = 'All' } = {}) {
  const params = {}
  if (search) params.search = search
  if (status && status !== 'All') params.status = status
  const response = await API.get('/admin/analytics/creators', { params })
  return response.data.map((c) => ({
    id: c.id,
    name: c.name,
    handle: c.handle,
    avatar: c.avatar || c.handle?.charAt(0)?.toUpperCase() || '?',
    followers: formatCompact(c.followers),
    posts: c.posts,
    reach: formatCompact(c.reach),
    engagement: formatCompact(c.engagement),
    campaigns: c.campaigns,
    status: c.status === 'All' ? 'Active' : c.status,
  }))
}

export async function getAdminCampaignAnalytics() {
  const response = await API.get('/admin/analytics/campaigns')
  return response.data.map((c) => ({
    id: c.id,
    name: c.name,
    creatorCount: c.creatorCount,
    status: c.status,
    completion: c.completion,
    reach: formatCompact(c.reach),
    impressions: formatCompact(c.impressions),
    engagement: formatCompact(c.engagement),
    clicks: c.clicks,
    roi: Number(c.roi).toFixed(2),
  }))
}

export async function getAdminPlatformAnalytics() {
  const response = await API.get('/admin/analytics/platforms')
  return response.data.map((p) => ({
    platform: platformLabel(p.platform),
    followers: p.followers,
    reach: p.reach,
    engagement: p.engagement,
    growth: p.growth ? `${p.growth}%` : '0%',
  }))
}

export async function getAdminAudienceAnalytics() {
  const response = await API.get('/admin/analytics/audience')
  return response.data
}

export async function getAdminPerformanceTrends(timeframe = 'monthly') {
  const response = await API.get('/admin/analytics/trends', { params: { timeframe } })
  return response.data
}
