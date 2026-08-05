import {
  adminKpisMock,
  adminTimeSeriesMock,
  adminPlatformGrowthMock,
  adminCreatorsMock,
  adminCampaignsMock,
  adminAudienceDemographicsMock,
  adminTimeframeTrendsMock
} from '../constants/adminAnalyticsMockData'

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Async API service for Admin Analytics
 */
export async function getAdminAnalyticsSummary() {
  await delay()
  return {
    kpis: adminKpisMock,
    timeSeries: adminTimeSeriesMock,
    platformGrowth: adminPlatformGrowthMock,
  }
}

export async function getAdminCreatorPerformance({ search = '', status = 'All' } = {}) {
  await delay()
  let filtered = [...adminCreatorsMock]
  if (search.trim()) {
    const q = search.toLowerCase()
    filtered = filtered.filter((c) => c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q))
  }
  if (status !== 'All') {
    filtered = filtered.filter((c) => c.status.toLowerCase() === status.toLowerCase())
  }
  return filtered
}

export async function getAdminCampaignAnalytics() {
  await delay()
  return adminCampaignsMock
}

export async function getAdminPlatformAnalytics() {
  await delay()
  return adminPlatformGrowthMock
}

export async function getAdminAudienceAnalytics() {
  await delay()
  return adminAudienceDemographicsMock
}

export async function getAdminPerformanceTrends(timeframe = 'daily') {
  await delay()
  return adminTimeframeTrendsMock[timeframe] || adminTimeframeTrendsMock.daily
}
