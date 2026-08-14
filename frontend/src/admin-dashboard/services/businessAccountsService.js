import { businessAccountsMockData } from '../constants/businessAccountsMockData'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

let accountsState = [...businessAccountsMockData]

/**
 * Backend-Ready Business Accounts Service Layer
 */

export async function getBusinessAccounts() {
  await delay()
  return [...accountsState]
}

export async function getBusinessAccountById(id) {
  await delay()
  return accountsState.find((a) => a.id === id) || null
}

export async function createBusinessAccount(data) {
  await delay()
  const newAccount = {
    id: `biz-${Date.now()}`,
    name: data.name || 'New Business Account',
    domain: data.domain || `${(data.name || 'business').toLowerCase().replace(/\s+/g, '')}.com`,
    logo: data.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
    ownerName: data.ownerName || 'Account Owner',
    email: data.email || 'owner@business.com',
    type: data.type || 'Brand',
    status: data.status || 'Active',
    website: data.website || `https://${(data.name || 'business').toLowerCase().replace(/\s+/g, '')}.com`,
    createdDate: new Date().toISOString().split('T')[0],
    lastActive: 'Just now',
    connectedPlatforms: data.connectedPlatforms || ['Instagram', 'LinkedIn'],
    platformFollowers: {
      Instagram: '25K',
      LinkedIn: '12K'
    },
    totalCampaigns: 0,
    publishedPosts: 0,
    totalReach: '0',
    engagementRate: '0.0%'
  }

  accountsState = [newAccount, ...accountsState]
  return newAccount
}

export async function updateBusinessAccount(id, updatedFields) {
  await delay()
  accountsState = accountsState.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
  return accountsState.find((a) => a.id === id)
}

export async function updateBusinessAccountStatus(id, newStatus) {
  await delay()
  accountsState = accountsState.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
  return accountsState.find((a) => a.id === id)
}

export async function updateConnectedPlatforms(id, platforms = []) {
  await delay()
  accountsState = accountsState.map((a) => (a.id === id ? { ...a, connectedPlatforms: platforms } : a))
  return accountsState.find((a) => a.id === id)
}

export async function deleteBusinessAccount(id) {
  await delay()
  accountsState = accountsState.filter((a) => a.id !== id)
  return true
}

export function exportBusinessAccountsCsv(accounts = []) {
  if (!accounts || accounts.length === 0) return false

  let csvContent = '\uFEFF' // UTF-8 BOM
  csvContent += `OrbitSocial Admin Business Accounts Export\n`
  csvContent += `Exported At,${new Date().toLocaleString()}\n\n`
  csvContent += `"ID","BUSINESS NAME","OWNER","EMAIL","TYPE","STATUS","CAMPAIGNS","PLATFORMS","CREATED DATE","LAST ACTIVE"\n`

  accounts.forEach((a) => {
    const platformsStr = (a.connectedPlatforms || []).join('; ')
    csvContent += `"${a.id}","${a.name}","${a.ownerName}","${a.email}","${a.type}","${a.status}","${a.totalCampaigns}","${platformsStr}","${a.createdDate}","${a.lastActive}"\n`
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `OrbitSocial_BusinessAccounts_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return true
}
