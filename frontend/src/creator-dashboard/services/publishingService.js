// ═══════════════════════════════════════════════════════════════════
// Publishing Module — Service Layer (Backend-Ready)
// ═══════════════════════════════════════════════════════════════════

import {
  publishingDashboardData,
  publishingQueueData,
  publishingLogsData,
  failedPostsData,
  platformHistoryData,
} from '../constants/publishingMockData'

// Simulates async API call
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Fetches dashboard summary data including stats, activity, schedules, and status.
 * @returns {Promise<Object>}
 */
export async function getPublishingDashboard() {
  await delay()
  return { ...publishingDashboardData }
}

/**
 * Fetches all queued posts.
 * @returns {Promise<Array>}
 */
export async function getPublishingQueue() {
  await delay()
  return [...publishingQueueData]
}

/**
 * Fetches publishing log entries with optional filters.
 * @param {{ platform?: string, status?: string, page?: number, perPage?: number }} filters
 * @returns {Promise<{ data: Array, total: number, page: number, perPage: number }>}
 */
export async function getPublishingLogs(filters = {}) {
  await delay()
  let data = [...publishingLogsData]

  if (filters.platform) {
    data = data.filter((l) => l.platform === filters.platform)
  }
  if (filters.status) {
    data = data.filter((l) => l.status === filters.status)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
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
  const paged = data.slice(start, start + perPage)

  return { data: paged, total, page, perPage }
}

/**
 * Fetches all failed publishing attempts.
 * @returns {Promise<Array>}
 */
export async function getFailedPosts() {
  await delay()
  return [...failedPostsData]
}

/**
 * Fetches platform-specific publishing history.
 * @returns {Promise<Array>}
 */
export async function getPlatformHistory() {
  await delay()
  return [...platformHistoryData]
}

/**
 * Pauses a queued post by ID.
 * @param {string} id
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function pausePublishing(id) {
  await delay(200)
  return { success: true, message: `Post ${id} has been paused.` }
}

/**
 * Resumes a paused post by ID.
 * @param {string} id
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function resumePublishing(id) {
  await delay(200)
  return { success: true, message: `Post ${id} has been resumed.` }
}

/**
 * Cancels a queued post by ID.
 * @param {string} id
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function cancelPublishing(id) {
  await delay(200)
  return { success: true, message: `Post ${id} has been cancelled.` }
}

/**
 * Retries a failed post by ID.
 * @param {string} id
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function retryPublishing(id) {
  await delay(500)
  return { success: true, message: `Post ${id} has been requeued for retry.` }
}
