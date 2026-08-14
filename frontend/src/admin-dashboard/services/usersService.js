import { usersMockData } from '../constants/usersMockData'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

let usersState = [...usersMockData]

/**
 * Backend-Ready Users Service Layer
 */

export async function getUsers() {
  await delay()
  return [...usersState]
}

export async function getUserById(id) {
  await delay()
  return usersState.find((u) => u.id === id) || null
}

export async function createUser(userData) {
  await delay()
  const newUser = {
    id: `usr-${Date.now()}`,
    name: userData.name || 'New User',
    username: userData.username || `@${(userData.name || 'user').toLowerCase().replace(/\s+/g, '')}`,
    email: userData.email || 'user@orbitsocial.com',
    role: userData.role || 'User',
    status: userData.status || 'Active',
    avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    joinedDate: new Date().toISOString().split('T')[0],
    lastActive: 'Just now',
    connectedPlatforms: ['Instagram'],
    totalPosts: 0,
    totalCampaigns: 0,
    engagementRate: '0.0%'
  }

  usersState = [newUser, ...usersState]
  return newUser
}

export async function updateUser(id, updatedFields) {
  await delay()
  usersState = usersState.map((u) => (u.id === id ? { ...u, ...updatedFields } : u))
  return usersState.find((u) => u.id === id)
}

export async function updateUserStatus(id, newStatus) {
  await delay()
  usersState = usersState.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
  return usersState.find((u) => u.id === id)
}

export async function deleteUser(id) {
  await delay()
  usersState = usersState.filter((u) => u.id !== id)
  return true
}

export function exportUsersCsv(users = []) {
  if (!users || users.length === 0) return false

  let csvContent = '\uFEFF' // UTF-8 BOM
  csvContent += `OrbitSocial Admin Users Export\n`
  csvContent += `Exported At,${new Date().toLocaleString()}\n\n`
  csvContent += `"ID","NAME","USERNAME","EMAIL","ROLE","STATUS","JOINED DATE","LAST ACTIVE"\n`

  users.forEach((u) => {
    csvContent += `"${u.id}","${u.name}","${u.username}","${u.email}","${u.role}","${u.status}","${u.joinedDate}","${u.lastActive}"\n`
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `OrbitSocial_Users_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return true
}
