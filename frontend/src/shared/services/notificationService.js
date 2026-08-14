import {
  creatorNotificationsMock,
  adminNotificationsMock,
  defaultNotificationPreferencesMock
} from '../constants/notificationMockData'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

let creatorNotifsState = [...creatorNotificationsMock]
let adminNotifsState = [...adminNotificationsMock]
let preferencesState = JSON.parse(JSON.stringify(defaultNotificationPreferencesMock))

/**
 * Backend-Ready Notification Service API
 */
export async function getNotifications(role = 'creator') {
  await delay()
  return role === 'admin' ? [...adminNotifsState] : [...creatorNotifsState]
}

export async function getUnreadCount(role = 'creator') {
  await delay()
  const list = role === 'admin' ? adminNotifsState : creatorNotifsState
  return list.filter((n) => !n.read).length
}

export async function getSummaryStats(role = 'admin') {
  await delay()
  const list = role === 'admin' ? adminNotifsState : creatorNotifsState
  const total = list.length
  const unread = list.filter((n) => !n.read).length
  const critical = list.filter((n) => n.priority === 'CRITICAL' || n.priority === 'high').length
  const today = list.filter(
    (n) =>
      n.timestamp.includes('mins') ||
      n.timestamp.includes('hour') ||
      n.timestamp.includes('Just now')
  ).length

  return { total, unread, critical, today }
}

export async function markNotificationAsRead(id, role = 'creator') {
  await delay()
  if (role === 'admin') {
    adminNotifsState = adminNotifsState.map((n) => (n.id === id ? { ...n, read: true } : n))
    return [...adminNotifsState]
  } else {
    creatorNotifsState = creatorNotifsState.map((n) => (n.id === id ? { ...n, read: true } : n))
    return [...creatorNotifsState]
  }
}

export async function markAllNotificationsAsRead(role = 'creator') {
  await delay()
  if (role === 'admin') {
    adminNotifsState = adminNotifsState.map((n) => ({ ...n, read: true }))
    return [...adminNotifsState]
  } else {
    creatorNotifsState = creatorNotifsState.map((n) => ({ ...n, read: true }))
    return [...creatorNotifsState]
  }
}

export async function getNotificationPreferences(role = 'creator') {
  await delay()
  return { ...preferencesState[role] }
}

export async function updateNotificationPreferences(role = 'creator', updatedPrefs = {}) {
  await delay()
  preferencesState[role] = { ...preferencesState[role], ...updatedPrefs }
  return { ...preferencesState[role] }
}
