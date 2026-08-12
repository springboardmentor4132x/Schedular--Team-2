import API from '../shared/api/api'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'

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
  if (!value) return '—'
  return PLATFORM_LABELS[value.toLowerCase()] || value
}

// Explicit date/month/year (DD/MM/YYYY) with a 12-hour clock,
// e.g. 12/08/2026, 06:13 pm — independent of browser locale.
function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  let hours = date.getHours()
  const ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12 || 12
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`
}

// Pretty-printed publishing-log response payload for display.
// React escapes the output when rendered in <pre>, so this is XSS-safe.
export function prettyLogResponse(raw) {
  if (!raw) return '—'
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return JSON.stringify(parsed, null, 2)
  } catch {
    return String(raw)
  }
}

function statusAction(status) {
  switch (status) {
    case 'Published': return 'Post published'
    case 'Scheduled': return 'Post scheduled'
    case 'Failed': return 'Post failed'
    case 'Queued': return 'Post queued'
    case 'Cancelled': return 'Post cancelled'
    default: return 'Post updated'
  }
}

function statusKey(status) {
  switch (status) {
    case 'Published': return 'published'
    case 'Scheduled': return 'scheduled'
    case 'Failed': return 'failed'
    case 'Queued': return 'queued'
    case 'Cancelled': return 'cancelled'
    default: return 'queued'
  }
}

function queueStatusKey(processingStatus) {
  switch (processingStatus) {
    case 'Paused': return 'paused'
    case 'Cancelled': return 'cancelled'
    case 'Processing': return 'processing'
    case 'Completed': return 'completed'
    case 'Failed': return 'failed'
    default: return 'queued'
  }
}

function priorityLabel(executionPriority) {
  if (executionPriority >= 2) return 'High'
  if (executionPriority >= 1) return 'Medium'
  return 'Low'
}

const paramsFor = (workspaceId) => (workspaceId ? { workspace_id: workspaceId } : {})

export async function getPublishingDashboard(workspaceId) {
  const response = await API.get('/publishing/dashboard', { params: paramsFor(workspaceId) })
  const { summary, posts } = response.data
  const platformsSet = new Set()
  posts.forEach((p) => (p.platforms || []).forEach((pl) => platformsSet.add(pl)))

  const stats = [
    { label: 'Total Published', value: String(summary.total_published), change: '', positive: true, icon: '📤', accent: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Scheduled Posts', value: String(summary.total_scheduled), change: '', positive: true, icon: '📅', accent: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { label: 'Queue Size', value: String(summary.total_queued), change: '', positive: true, icon: '📋', accent: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Failed Posts', value: String(summary.total_failed), change: '', positive: summary.total_failed === 0, icon: '⚠️', accent: 'bg-rose-50 dark:bg-rose-950/40' },
    { label: 'Platforms Connected', value: String(platformsSet.size || 0), change: '—', positive: true, icon: '🔗', accent: 'bg-purple-50 dark:bg-purple-950/40' },
  ]

  const recentActivity = [...posts]
    .sort((a, b) => new Date(b.published_at || b.updated_at || 0) - new Date(a.published_at || a.updated_at || 0))
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      action: statusAction(p.status),
      platform: (p.platforms?.[0] && platformLabel(p.platforms[0])) || '—',
      campaign: p.title || '—',
      time: formatDateTime(p.published_at || p.scheduled_for || p.updated_at),
      status: statusKey(p.status),
    }))

  const todaySchedule = posts
    .filter((p) => p.status === 'Published' || p.status === 'Scheduled')
    .slice(0, 5)
    .map((p, i) => ({
      id: i + 1,
      time: formatDateTime(p.published_at || p.scheduled_for),
      platform: (p.platforms?.[0] && platformLabel(p.platforms[0])) || '—',
      content: p.title || p.caption || '—',
      status: statusKey(p.status),
    }))

  const upcomingSchedule = posts
    .filter((p) => p.status === 'Scheduled')
    .map((p, i) => ({
      id: i + 1,
      date: new Date(p.scheduled_for).toLocaleDateString(),
      time: new Date(p.scheduled_for).toLocaleTimeString(),
      platform: (p.platforms?.[0] && platformLabel(p.platforms[0])) || '—',
      content: p.title || p.caption || '—',
    }))

  const publishingStatus = {
    healthy: platformsSet.size,
    warning: 0,
    error: 0,
    platforms: [...platformsSet].map((pl) => ({
      name: platformLabel(pl),
      status: 'healthy',
      lastSync: '—',
    })),
  }

  return { stats, recentActivity, todaySchedule, upcomingSchedule, publishingStatus }
}

const QUEUE_STATUS_RANK = {
  Pending: 0,
  Processing: 1,
  Paused: 2,
  Failed: 3,
  Completed: 4,
  Cancelled: 5,
}

export async function getPublishingQueue(workspaceId) {
  const response = await API.get('/publishing/queue', { params: paramsFor(workspaceId) })
  // Time-proper order: active entries (soonest scheduled first), then history.
  const sorted = [...(response.data || [])].sort((a, b) => {
    const rank = (QUEUE_STATUS_RANK[a.processing_status] ?? 5) - (QUEUE_STATUS_RANK[b.processing_status] ?? 5)
    if (rank !== 0) return rank
    return new Date(a.scheduled_time || 0) - new Date(b.scheduled_time || 0)
  })
  return sorted.map((entry, index) => ({
    id: entry.id,
    post_id: entry.post_id,
    position: index + 1,
    platform: (entry.platforms?.[0] && platformLabel(entry.platforms[0])) || '—',
    campaign: entry.campaign_name || entry.title || '—',
    scheduledTime: formatDateTime(entry.scheduled_time),
    priority: priorityLabel(entry.execution_priority),
    status: queueStatusKey(entry.processing_status),
    content: entry.caption || entry.title || '',
  }))
}

export async function pausePublishing(id) {
  const response = await API.patch(`/publishing/queue/${id}/pause`)
  return { success: true, message: response.data.message || `Post ${id} has been paused.` }
}

export async function resumePublishing(id) {
  const response = await API.patch(`/publishing/queue/${id}/resume`)
  return { success: true, message: response.data.message || `Post ${id} has been resumed.` }
}

export async function cancelPublishing(id) {
  const response = await API.patch(`/publishing/queue/${id}/cancel`)
  return { success: true, message: response.data.message || `Post ${id} has been cancelled.` }
}

export async function getPublishingLogs(filters = {}, workspaceId) {
  const { platform, status, search } = filters
  const params = { ...paramsFor(workspaceId) }
  if (platform && platform !== 'All') params.platform = platform.toLowerCase()
  if (status && status !== 'All') {
    // Backend stores log statuses as 'Published' / 'Failed' (legacy 'Success' too).
    const LOG_STATUS_MAP = { published: 'Published', failed: 'Failed', cancelled: 'Cancelled' }
    params.status = LOG_STATUS_MAP[status] || status
  }
  const response = await API.get('/publishing/logs', { params })
  // Newest publishing attempt first, by time.
  const rows = [...(response.data || [])].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  )
  let data = rows.map((log) => {
    // failure_reason / platform_post_id are embedded in the JSON response payload.
    let parsed = null
    try { parsed = typeof log.response === 'string' ? JSON.parse(log.response) : (log.response || null) } catch { /* ignore */ }
    return {
      id: log.id,
      date: formatDateTime(log.created_at),
      platform: platformLabel(log.platform),
      campaign: log.campaign_name || log.title || '—',
      caption: log.caption || '',
      status: (log.status === 'Success' || log.status === 'Published') ? 'published' : (log.status || '').toLowerCase(),
      response: typeof log.response === 'string' ? log.response : JSON.stringify(log.response || ''),
      retryCount: log.retry_count || 0,
      publishedBy: log.published_by || 'System',
      platformPostId: log.platform_post_id || parsed?.platform_post_id || null,
      failureReason: log.failure_reason || parsed?.failure_reason || null,
    }
  })
  if (search) {
    const q = search.toLowerCase()
    data = data.filter(
      (l) =>
        l.campaign.toLowerCase().includes(q) ||
        l.platform.toLowerCase().includes(q) ||
        l.response.toLowerCase().includes(q)
    )
  }
  const page = filters.page || 1
  const perPage = filters.perPage || 10
  const total = data.length
  const start = (page - 1) * perPage
  return { data: data.slice(start, start + perPage), total, page, perPage }
}

export async function getFailedPosts(workspaceId) {
  const response = await API.get('/publishing/failed', { params: paramsFor(workspaceId) })
  return response.data.map((post) => ({
    id: post.id,
    platform: (post.platforms?.[0] && platformLabel(post.platforms[0])) || '—',
    campaign: post.title || '—',
    reason: post.failure_reason || 'Publishing Error',
    errorMessage: post.failure_reason || 'The post could not be published.',
    failedAt: formatDateTime(post.published_at || post.updated_at),
    retryCount: post.retry_count || 0,
    content: post.caption || post.title || '',
  }))
}

export async function retryPublishing(id) {
  const response = await API.post(`/publishing/failed/${id}/retry`)
  const status = response.data?.status
  const ok = !status || status !== 'Failed'
  return { success: ok, message: response.data?.message || `Post ${id} has been requeued for retry.` }
}

export async function getPlatformHistory(workspaceId) {
  const platforms = ['instagram', 'facebook', 'linkedin', 'x', 'youtube', 'pinterest']
  const results = []
  for (const platform of platforms) {
    const response = await API.get(`/publishing/history/${platform}`, { params: paramsFor(workspaceId) })
    const items = [...(response.data || [])].sort(
      (a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0)
    )
    if (!items.length) continue
    const successful = items.filter((i) => i.status === 'Published').length
    const totalPosts = items.length
    const failedPosts = items.filter((i) => i.status === 'Failed').length
    const recentActivity = items.slice(0, 5).map((i) => ({
      date: i.published_at ? new Date(i.published_at).toISOString().slice(0, 10) : '—',
      posts: 1,
      successful: i.status === 'Published' ? 1 : 0,
      failed: i.status === 'Failed' ? 1 : 0,
    }))
    results.push({
      id: platform,
      name: platformLabel(platform),
      icon: platformIcon(platform),
      color: platformColor(platform),
      totalPosts,
      lastPublished: items[0]?.published_at ? formatDateTime(items[0].published_at) : '—',
      successRate: totalPosts ? Number(((successful / totalPosts) * 100).toFixed(1)) : 0,
      failedPosts,
      recentActivity,
      items: items.map((i) => ({
        id: i.post_id,
        title: i.title || null,
        platform: platformLabel(platform),
        publishedAt: i.published_at,
        status: i.status,
        platformPostId: i.platform_post_id || null,
      })),
    })
  }
  return results
}

function platformIcon(platform) {
  const map = {
    instagram: FaInstagram,
    facebook: FaFacebook,
    linkedin: FaLinkedin,
    x: FaXTwitter,
    youtube: FaYoutube,
    pinterest: FaPinterest,
  }
  return map[platform] || FaInstagram
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
