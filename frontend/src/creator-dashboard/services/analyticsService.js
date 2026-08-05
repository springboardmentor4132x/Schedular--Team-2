// ═══════════════════════════════════════════════════════════════════
// Module 6: Creator Analytics — Service Layer (Backend-Ready)
// ═══════════════════════════════════════════════════════════════════

import {
  summaryKpiData,
  recentActivityData,
  insightsData,
  timeSeriesData,
  contentPostsData,
  audienceData,
  campaignsData,
  platformComparisonData
} from '../constants/analyticsMockData'

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Get overall dashboard summary (11 KPIs, insights, time series preview)
 */
export async function getDashboardSummary(filters = {}) {
  await delay()
  return {
    kpis: summaryKpiData,
    insights: insightsData,
    timeSeries: timeSeriesData.daily,
    recentActivity: recentActivityData
  }
}

/**
 * Get content analytics post-level data with search, filtering & sorting
 */
export async function getContentAnalytics(filters = {}) {
  await delay()
  let posts = [...contentPostsData]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    posts = posts.filter(
      (p) => p.caption.toLowerCase().includes(q) || p.campaign.toLowerCase().includes(q)
    )
  }

  if (filters.platform && filters.platform !== 'All') {
    posts = posts.filter((p) => p.platform === filters.platform)
  }

  if (filters.campaign && filters.campaign !== 'All') {
    posts = posts.filter((p) => p.campaign === filters.campaign)
  }

  if (filters.sortBy === 'reach') {
    posts.sort((a, b) => b.reach - a.reach)
  } else if (filters.sortBy === 'engagementRate') {
    posts.sort((a, b) => parseFloat(b.engagementRate) - parseFloat(a.engagementRate))
  } else if (filters.sortBy === 'likes') {
    posts.sort((a, b) => b.likes - a.likes)
  }

  return posts
}

/**
 * Get creator audience demographics, growth trends, and active hours/days
 */
export async function getAudienceAnalytics() {
  await delay()
  return audienceData
}

/**
 * Get campaign performance data & top/lowest list summaries
 */
export async function getCampaignAnalytics() {
  await delay()
  return campaignsData
}

/**
 * Get platform-wise comparative analytics for all connected creator platforms
 */
export async function getPlatformAnalytics() {
  await delay()
  return platformComparisonData
}

/**
 * Get performance trends across specified timeframe (daily, weekly, monthly, quarterly, yearly)
 */
export async function getPerformanceTrends(timeframe = 'daily') {
  await delay()
  const key = timeframe.toLowerCase()
  return timeSeriesData[key] || timeSeriesData.daily
}

/**
 * Get top performing posts highlight
 */
export async function getTopPosts(limit = 3) {
  await delay()
  return [...contentPostsData]
    .sort((a, b) => parseFloat(b.engagementRate) - parseFloat(a.engagementRate))
    .slice(0, limit)
}

/**
 * Get top campaigns highlight
 */
export async function getTopCampaigns() {
  await delay()
  return campaignsData.topCampaigns
}

/**
 * Get recent creator publishing activity feed
 */
export async function getRecentActivity() {
  await delay()
  return recentActivityData
}
