import { getCampaigns } from './campaignService'
import { getPosts } from './postService'
import API from '../shared/api/api'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaPinterest, FaYoutube } from 'react-icons/fa6'

export const PLATFORM_ICONS = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  linkedin: FaLinkedin,
  twitter: FaXTwitter,
  x: FaXTwitter,
  pinterest: FaPinterest,
  youtube: FaYoutube,
}

export const PLATFORM_LABELS = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  twitter: 'X / Twitter',
  x: 'X / Twitter',
  pinterest: 'Pinterest',
  youtube: 'YouTube',
}

export const PLATFORM_BRANDS = {
  instagram: {
    color: '#E4405F',
    bg: 'bg-pink-50 dark:bg-pink-950/30',
  },
  facebook: {
    color: '#1877F2',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  linkedin: {
    color: '#0A66C2',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
  },
  twitter: {
    className: 'text-slate-900 dark:text-white',
    bg: 'bg-slate-100 dark:bg-slate-800',
  },
  x: {
    className: 'text-slate-900 dark:text-white',
    bg: 'bg-slate-100 dark:bg-slate-800',
  },
  pinterest: {
    color: '#E60023',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
  },
  youtube: {
    color: '#FF0000',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
}

export function getPlatformBrand(platform = '') {
  return PLATFORM_BRANDS[platform.toLowerCase()] || {
    color: '#6366F1',
    bg: 'bg-slate-100 dark:bg-slate-700',
  }
}

export function getPlatformIcon(platform = '') {
  const key = platform.toLowerCase()
  return PLATFORM_ICONS[key] || FaInstagram
}

export function getPlatformLabel(platform = '') {
  return PLATFORM_LABELS[platform.toLowerCase()] || platform
}

const CONTENT_THUMBS = {
  image: '🖼️',
  video: '🎬',
  carousel: '🎠',
  story: '📖',
  reel: '🎥',
  text: '📝',
}

export function getContentThumb(contentType = 'text') {
  return CONTENT_THUMBS[contentType?.toLowerCase()] || '📌'
}

function formatScheduleTime(scheduledFor) {
  if (!scheduledFor) return 'Pending'
  try {
    const date = new Date(scheduledFor)
    return date.toLocaleString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return scheduledFor
  }
}

function formatScheduleDate(scheduledFor) {
  if (!scheduledFor) return ''
  try {
    const date = new Date(scheduledFor)
    return date.toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

function formatScheduleClock(scheduledFor) {
  if (!scheduledFor) return ''
  try {
    const date = new Date(scheduledFor)
    return date.toTimeString().slice(0, 5)
  } catch {
    return ''
  }
}

export async function loadContentMaps() {
  let campaigns
  try {
    campaigns = await getCampaigns()
  } catch {
    campaigns = []
  }
  const campaignMap = {}
  campaigns.forEach((c) => {
    campaignMap[c.id] = c.name
  })
  return campaignMap
}

export async function fetchSocialAccounts() {
  try {
    const response = await API.get('/social-accounts/')
    return response.data
  } catch {
    return []
  }
}

export async function loadAccountMap() {
  const accounts = await fetchSocialAccounts()
  const map = {}
  accounts.forEach((acc) => {
    map[acc.id] = acc.platform
  })
  return map
}

export function mapApiPost(post, accountMap = {}, campaignMap = {}) {
  const accountIds = post.social_account_ids || []
  const platforms = accountIds.map((id) => getPlatformLabel(accountMap[id])).filter(Boolean)
  const primaryPlatform = platforms[0] || ''

  return {
    id: post.id,
    title: post.title || `Post ${post.id}`,
    caption: post.caption || '',
    platform: platforms.length ? platforms.join(', ') : 'Unassigned',
    platformIcon: primaryPlatform ? getPlatformIcon(primaryPlatform) : getPlatformIcon('instagram'),
    campaign: post.campaign_id ? campaignMap[post.campaign_id] || 'Campaign' : 'None',
    status: post.status || 'Draft',
    time: formatScheduleTime(post.scheduled_for),
    date: formatScheduleDate(post.scheduled_for),
    clock: formatScheduleClock(post.scheduled_for),
    thumb: getContentThumb(post.content_type),
    raw: post,
  }
}

export async function loadMappedPosts() {
  const [posts, accountMap, campaignMap] = await Promise.all([
    getPosts().catch(() => []),
    loadAccountMap(),
    loadContentMaps(),
  ])
  return posts.map((post) => mapApiPost(post, accountMap, campaignMap))
}
