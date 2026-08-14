import { contentCreatorsMockData } from '../constants/contentCreatorsMockData'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

let creatorsState = [...contentCreatorsMockData]

/**
 * Backend-Ready Content Creators Service Layer
 */

export async function getContentCreators() {
  await delay()
  return [...creatorsState]
}

export async function getContentCreatorById(id) {
  await delay()
  return creatorsState.find((c) => c.id === id) || null
}

export async function createContentCreator(data) {
  await delay()
  const usernameFormatted = data.username
    ? data.username.startsWith('@') ? data.username : `@${data.username}`
    : `@${(data.name || 'creator').toLowerCase().replace(/\s+/g, '')}`

  const newCreator = {
    id: `creator-${Date.now()}`,
    name: data.name || 'New Creator',
    username: usernameFormatted,
    email: data.email || 'creator@orbitsocial.com',
    avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    type: data.type || 'Individual',
    status: data.status || 'Active',
    performanceTier: 'Average',
    connectedPlatforms: data.connectedPlatforms || ['Instagram', 'YouTube'],
    platformFollowers: {
      Instagram: '12K',
      YouTube: '8.5K'
    },
    totalFollowers: '20.5K',
    campaignsCount: 0,
    publishedPosts: 0,
    engagementRate: '0.0%',
    totalReach: '0',
    totalImpressions: '0',
    joinedDate: new Date().toISOString().split('T')[0],
    lastActive: 'Just now',
    recentActivity: [
      { id: `act-${Date.now()}`, text: 'Account created on OrbitSocial Platform', time: 'Just now' }
    ]
  }

  creatorsState = [newCreator, ...creatorsState]
  return newCreator
}

export async function updateContentCreator(id, updatedFields) {
  await delay()
  creatorsState = creatorsState.map((c) => {
    if (c.id === id) {
      const usernameFormatted = updatedFields.username
        ? updatedFields.username.startsWith('@')
          ? updatedFields.username
          : `@${updatedFields.username}`
        : c.username

      return {
        ...c,
        ...updatedFields,
        username: usernameFormatted
      }
    }
    return c
  })
  return creatorsState.find((c) => c.id === id)
}

export async function updateContentCreatorStatus(id, newStatus) {
  await delay()
  creatorsState = creatorsState.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
  return creatorsState.find((c) => c.id === id)
}

export async function updateCreatorPlatforms(id, platforms = []) {
  await delay()
  creatorsState = creatorsState.map((c) => (c.id === id ? { ...c, connectedPlatforms: platforms } : c))
  return creatorsState.find((c) => c.id === id)
}

export async function deleteContentCreator(id) {
  await delay()
  creatorsState = creatorsState.filter((c) => c.id !== id)
  return true
}

export function exportContentCreatorsCsv(creators = []) {
  if (!creators || creators.length === 0) return false

  let csvContent = '\uFEFF' // UTF-8 BOM
  csvContent += `OrbitSocial Admin Content Creators Export\n`
  csvContent += `Exported At,${new Date().toLocaleString()}\n\n`
  csvContent += `"ID","FULL NAME","USERNAME","EMAIL","TYPE","STATUS","PERFORMANCE","FOLLOWERS","PUBLISHED POSTS","ENGAGEMENT RATE","CAMPAIGNS","JOINED DATE","LAST ACTIVE"\n`

  creators.forEach((c) => {
    csvContent += `"${c.id}","${c.name}","${c.username}","${c.email}","${c.type}","${c.status}","${c.performanceTier || 'Average'}","${c.totalFollowers || '0'}","${c.publishedPosts || 0}","${c.engagementRate || '0%'}","${c.campaignsCount || 0}","${c.joinedDate}","${c.lastActive}"\n`
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `OrbitSocial_ContentCreators_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return true
}
