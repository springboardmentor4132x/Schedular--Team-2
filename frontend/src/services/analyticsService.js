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

const CONTENT_ICONS = {
  image: '🖼️',
  video: '🎬',
  carousel: '🔄',
  article: '📄',
  thread: '🧵',
  reel: '🎞️',
}

function platformLabel(value) {
  if (!value) return '—'
  return PLATFORM_LABELS[value.toLowerCase()] || value
}

function formatCompact(value) {
  const n = Number(value) || 0
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

function kpiValue(value) {
  return { label: '', value: formatCompact(value), change: '', positive: true }
}

function dateLabel(value) {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export async function getAnalyticsTotals(workspaceId) {
  const response = await API.get('/analytics/dashboard', { params: workspaceId ? { workspace_id: workspaceId } : {} })
  return response.data.summary || {}
}

export async function getDashboardSummary() {
  const [dash, compare, audience] = await Promise.all([
    API.get('/analytics/dashboard'),
    API.get('/analytics/platforms/compare').catch(() => ({ data: [] })),
    API.get('/analytics/audience').catch(() => ({ data: [] })),
  ])
  const { summary, engagement_trend, reach_trend, impressions_trend, followers_trend, recent_posts, top_posts, lowest_posts } = dash.data

  const kpis = {
    totalPublished: { ...kpiValue(summary.total_published_posts), label: 'Total Published Posts' },
    totalScheduled: { ...kpiValue(summary.total_scheduled_posts), label: 'Total Scheduled Posts' },
    totalImpressions: { ...kpiValue(summary.total_impressions), label: 'Total Impressions' },
    totalReach: { ...kpiValue(summary.total_reach), label: 'Total Reach' },
    totalEngagement: { ...kpiValue(summary.total_engagement), label: 'Total Engagement' },
    totalLikes: { ...kpiValue(summary.total_likes), label: 'Total Likes' },
    totalComments: { ...kpiValue(summary.total_comments), label: 'Total Comments' },
    totalShares: { ...kpiValue(summary.total_shares), label: 'Total Shares' },
    totalClicks: { ...kpiValue(summary.total_clicks), label: 'Total Clicks' },
    totalFollowers: { ...kpiValue(summary.total_followers), label: 'Total Followers' },
    overallEngagementRate: { ...kpiValue(summary.overall_engagement_rate), value: `${Number(summary.overall_engagement_rate).toFixed(2)}%`, label: 'Overall Engagement Rate' },
  }

  const dateSet = new Set([
    ...engagement_trend.map((t) => t.date),
    ...reach_trend.map((t) => t.date),
    ...impressions_trend.map((t) => t.date),
    ...followers_trend.map((t) => t.date),
  ])
  const engMap = Object.fromEntries(engagement_trend.map((t) => [t.date, t.value]))
  const reachMap = Object.fromEntries(reach_trend.map((t) => [t.date, t.value]))
  const impMap = Object.fromEntries(impressions_trend.map((t) => [t.date, t.value]))
  const folMap = Object.fromEntries(followers_trend.map((t) => [t.date, t.value]))

  const timeSeries = [...dateSet]
    .sort()
    .map((date) => ({
      date: dateLabel(date),
      engagement: engMap[date] || 0,
      reach: reachMap[date] || 0,
      impressions: impMap[date] || 0,
      followers: folMap[date] || 0,
      posts: 0,
    }))

  const top = top_posts[0]
  const lowest = lowest_posts[0]
  const bestPlatformItem = [...compare.data].sort((a, b) => b.engagement - a.engagement)[0]

  const insights = {
    topPost: top
      ? {
          title: top.caption || 'Top post',
          platform: platformLabel(top.platform),
          reach: formatCompact(top.reach),
          engagementRate: `${Number(top.engagement_rate).toFixed(1)}%`,
          publishDate: dateLabel(top.published_at),
          type: top.content_type || 'Post',
          likes: top.likes,
          comments: top.comments,
          shares: top.shares,
        }
      : null,
    lowestPost: lowest
      ? {
          title: lowest.caption || 'Lowest post',
          platform: platformLabel(lowest.platform),
          reach: formatCompact(lowest.reach),
          engagementRate: `${Number(lowest.engagement_rate).toFixed(1)}%`,
          publishDate: dateLabel(lowest.published_at),
          type: lowest.content_type || 'Post',
          likes: lowest.likes,
          comments: lowest.comments,
          shares: lowest.shares,
        }
      : null,
    bestPlatform: bestPlatformItem
      ? {
          name: platformLabel(bestPlatformItem.platform),
          growth: '',
          totalFollowers: formatCompact(bestPlatformItem.followers),
          engagementRate: `${((bestPlatformItem.engagement / (bestPlatformItem.impressions || 1)) * 100).toFixed(1)}%`,
        }
      : null,
    bestPostingTime: audienceBestTime(audience.data),
  }

  const recentActivity = recent_posts.map((p) => ({
    id: p.post_id,
    action: 'Published',
    platform: platformLabel(p.platform),
    title: p.caption || 'Post',
    time: dateLabel(p.published_at),
    metrics: `${formatCompact(p.reach)} Reach · ${formatCompact(p.likes)} Likes`,
  }))

  return { kpis, insights, timeSeries, recentActivity }
}

function audienceBestTime(rows) {
  let best = null
  for (const row of rows) {
    let hours = []
    try { hours = row.most_active_hours ? JSON.parse(row.most_active_hours) : [] } catch { /* ignore */ }
    for (const h of hours) {
      if (!best || h.activity > best.activity) best = h
    }
  }
  return {
    timeSlot: best?.hour || '—',
    bestDays: '—',
    avgEngagementBoost: best ? `Top ${best.activity}% activity` : '—',
  }
}

export async function getContentAnalytics(filters = {}) {
  const params = {}
  if (filters.platform && filters.platform !== 'All') params.platform = filters.platform.toLowerCase()
  if (filters.campaign && filters.campaign !== 'All') params.campaign_id = Number(filters.campaign)
  if (filters.sortBy === 'reach') params.sort_by = 'reach'
  if (filters.sortBy === 'engagementRate') params.sort_by = 'engagement'
  if (filters.startDate) params.start_date = filters.startDate
  if (filters.endDate) params.end_date = filters.endDate
  const response = await API.get('/analytics/posts', { params })
  let posts = response.data.map((p) => ({
    id: p.post_id,
    thumbnail: CONTENT_ICONS[(p.content_type || '').toLowerCase()] || '📌',
    caption: p.caption || 'Post',
    platform: platformLabel(p.platform),
    campaign: p.campaign_name || '—',
    publishDate: dateLabel(p.published_at),
    contentType: p.content_type || 'Post',
    likes: p.likes,
    comments: p.comments,
    shares: p.shares,
    saves: p.saves,
    reach: p.reach,
    impressions: p.impressions,
    clicks: p.clicks,
    engagementRate: `${Number(p.engagement_rate).toFixed(1)}%`,
  }))
  if (filters.search) {
    const q = filters.search.toLowerCase()
    posts = posts.filter((p) => p.caption.toLowerCase().includes(q) || p.campaign.toLowerCase().includes(q))
  }
  if (filters.sortBy === 'likes') {
    posts = [...posts].sort((a, b) => b.likes - a.likes)
  }
  return posts
}

function parseDistributions(row) {
  const parse = (field) => {
    if (!row) return []
    try {
      const val = row[field]
      return val ? JSON.parse(val) : []
    } catch {
      return []
    }
  }
  return {
    genderDistribution: parse('gender_distribution'),
    ageDistribution: parse('age_distribution'),
    countryDistribution: parse('country_distribution'),
    cityDistribution: parse('city_distribution'),
    languageDistribution: parse('language_distribution'),
    mostActiveHours: parse('most_active_hours'),
    mostActiveDays: parse('most_active_days'),
  }
}

function mergeByKey(groups, key) {
  const map = {}
  for (const group of groups) {
    for (const item of group) {
      const k = item[key]
      if (k == null) continue
      map[k] = map[k] || { ...item, [key]: k, count: 0, percentage: 0 }
      map[k].count += item.count || item.percentage || 0
    }
  }
  return Object.values(map)
}

export async function getAudienceAnalytics() {
  const response = await API.get('/analytics/audience')
  const rows = response.data
  const parsed = rows.map(parseDistributions)

  const genderDistribution = mergeByKey(parsed.map((p) => p.genderDistribution), 'label')
  const ageDistribution = mergeByKey(parsed.map((p) => p.ageDistribution), 'group')
  const countryDistribution = mergeByKey(parsed.map((p) => p.countryDistribution), 'country')
  const cityDistribution = mergeByKey(parsed.map((p) => p.cityDistribution), 'city')
  const languageDistribution = mergeByKey(parsed.map((p) => p.languageDistribution), 'language')
  const mostActiveHours = mergeByKey(parsed.map((p) => p.mostActiveHours), 'hour')
  const mostActiveDays = mergeByKey(parsed.map((p) => p.mostActiveDays), 'day')

  const totalFollowers = rows.reduce((sum, r) => sum + (r.followers || 0), 0)
  const newFollowers = rows.reduce((sum, r) => sum + (r.new_followers || 0), 0)
  const lostFollowers = rows.reduce((sum, r) => sum + (r.lost_followers || 0), 0)
  const netGrowth = newFollowers - lostFollowers

  return {
    kpis: {
      totalFollowers: formatCompact(totalFollowers),
      newFollowers: `+${formatCompact(newFollowers)}`,
      lostFollowers: `-${formatCompact(lostFollowers)}`,
      netGrowth: `${netGrowth >= 0 ? '+' : ''}${formatCompact(netGrowth)}`,
    },
    followersTrend: rows.slice(0, 30).map((r, i) => ({
      date: `Day ${i + 1}`,
      followers: r.followers,
      net: r.new_followers - r.lost_followers,
    })),
    genderDistribution,
    ageDistribution,
    countryDistribution,
    cityDistribution,
    languageDistribution,
    mostActiveHours,
    mostActiveDays,
  }
}

export async function getCampaignAnalytics() {
  const response = await API.get('/analytics/campaigns')
  const campaigns = response.data.map((c) => ({
    id: c.campaign_id,
    name: c.campaign_name,
    status: c.status === 'Completed' ? 'Completed' : 'Active',
    duration: '—',
    postsCount: c.total_posts,
    reach: formatCompact(c.reach),
    impressions: formatCompact(c.impressions),
    engagement: formatCompact(c.engagement),
    clicks: c.clicks,
    likes: 0,
    engagementRate: `${Number(c.engagement_rate).toFixed(1)}%`,
  }))
  const sorted = [...campaigns].sort((a, b) => Number(b.engagement.replace(/,/g, '')) - Number(a.engagement.replace(/,/g, '')))
  const topCampaigns = sorted.slice(0, 2).map((c) => ({ name: c.name, metric: `${c.engagement} Engagements`, rate: c.engagementRate }))
  const lowestCampaigns = [...sorted].reverse().slice(0, 2).map((c) => ({ name: c.name, metric: `${c.engagement} Engagements`, rate: c.engagementRate }))
  return { campaigns, topCampaigns, lowestCampaigns }
}

function toK(value) {
  const n = Number(value) || 0
  if (n >= 1000) return Number((n / 1000).toFixed(1))
  return Number(n.toFixed(1))
}

export async function getPlatformAnalytics() {
  const response = await API.get('/analytics/platforms/compare')
  const platforms = response.data.map((p) => ({
    id: p.platform,
    name: platformLabel(p.platform),
    icon: platformIcon(p.platform),
    color: platformColor(p.platform),
    accentColor: platformHex(p.platform),
    followers: toK(p.followers),
    reach: toK(p.reach),
    impressions: toK(p.impressions),
    engagement: toK(p.engagement),
    likes: toK(p.likes),
    comments: toK(p.comments),
    shares: toK(p.shares),
    clicks: toK(p.clicks),
    engagementRate: `${((p.engagement / (p.impressions || 1)) * 100).toFixed(1)}%`,
  }))
  return { platforms }
}

export async function getPerformanceTrends(timeframe = 'daily') {
  const response = await API.get('/analytics/trends', { params: { granularity: timeframe } })
  const { engagement_trend, reach_trend, impressions_trend, clicks_trend, followers_trend } = response.data
  const engMap = Object.fromEntries(engagement_trend.map((t) => [t.date, t.value]))
  const reachMap = Object.fromEntries(reach_trend.map((t) => [t.date, t.value]))
  const impMap = Object.fromEntries(impressions_trend.map((t) => [t.date, t.value]))
  const clickMap = Object.fromEntries(clicks_trend.map((t) => [t.date, t.value]))
  const folMap = Object.fromEntries(followers_trend.map((t) => [t.date, t.value]))
  const dates = [...new Set([...Object.keys(engMap), ...Object.keys(reachMap), ...Object.keys(impMap)])].sort()
  return dates.map((date) => ({
    date,
    engagement: engMap[date] || 0,
    reach: reachMap[date] || 0,
    impressions: impMap[date] || 0,
    clicks: clickMap[date] || 0,
    followers: folMap[date] || 0,
    posts: 0,
  }))
}

function platformIcon(platform) {
  const map = {
    instagram: '📸',
    facebook: '📘',
    linkedin: '💼',
    x: '🐦',
    youtube: '▶️',
    pinterest: '📌',
  }
  return map[platform] || '🌐'
}

function platformColor(platform) {
  const map = {
    instagram: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400',
    facebook: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    linkedin: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
    x: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    youtube: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400',
    pinterest: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
  }
  return map[platform] || 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
}

function platformHex(platform) {
  const map = {
    instagram: '#E1306C',
    facebook: '#1877F2',
    linkedin: '#0A66C2',
    x: '#0F1419',
    youtube: '#FF0000',
    pinterest: '#BD081C',
  }
  return map[platform] || '#6366f1'
}
