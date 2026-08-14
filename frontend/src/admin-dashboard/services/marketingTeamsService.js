import { marketingTeamsMockData } from '../constants/marketingTeamsMockData'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

let teamsState = [...marketingTeamsMockData]

/**
 * Backend-Ready Marketing Teams Service Layer
 */

export async function getMarketingTeams() {
  await delay()
  return [...teamsState]
}

export async function getMarketingTeamById(id) {
  await delay()
  return teamsState.find((t) => t.id === id) || null
}

export async function createMarketingTeam(data) {
  await delay()
  const newTeam = {
    id: `team-${Date.now()}`,
    name: data.name || 'New Marketing Team',
    description: data.description || 'Marketing team managing platform campaigns and social strategy.',
    type: data.type || 'Internal',
    status: data.status || 'Active',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    lead: {
      id: `lead-${Date.now()}`,
      name: data.leadName || 'Team Lead',
      email: data.leadEmail || 'lead@orbitsocial.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    createdDate: new Date().toISOString().split('T')[0],
    activeCampaignsCount: 0,
    totalReach: '0',
    engagementRate: '0.0%',
    members: [
      {
        id: `m-${Date.now()}`,
        name: data.leadName || 'Team Lead',
        role: 'Team Lead',
        email: data.leadEmail || 'lead@orbitsocial.com',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      }
    ],
    businessAccounts: [],
    campaigns: []
  }

  teamsState = [newTeam, ...teamsState]
  return newTeam
}

export async function updateMarketingTeam(id, updatedFields) {
  await delay()
  teamsState = teamsState.map((t) => {
    if (t.id === id) {
      const leadObj = updatedFields.leadName
        ? {
            ...t.lead,
            name: updatedFields.leadName,
            email: updatedFields.leadEmail || t.lead.email
          }
        : t.lead

      return {
        ...t,
        ...updatedFields,
        lead: leadObj
      }
    }
    return t
  })
  return teamsState.find((t) => t.id === id)
}

export async function updateMarketingTeamStatus(id, newStatus) {
  await delay()
  teamsState = teamsState.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
  return teamsState.find((t) => t.id === id)
}

export async function addTeamMember(teamId, memberData) {
  await delay()
  teamsState = teamsState.map((t) => {
    if (t.id === teamId) {
      const newMember = {
        id: `m-${Date.now()}`,
        name: memberData.name || 'New Member',
        role: memberData.role || 'Member',
        email: memberData.email || 'member@orbitsocial.com',
        status: 'Active',
        avatar: memberData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      }
      return {
        ...t,
        members: [...t.members, newMember]
      }
    }
    return t
  })
  return teamsState.find((t) => t.id === teamId)
}

export async function removeTeamMember(teamId, memberId) {
  await delay()
  teamsState = teamsState.map((t) => {
    if (t.id === teamId) {
      return {
        ...t,
        members: t.members.filter((m) => m.id !== memberId)
      }
    }
    return t
  })
  return teamsState.find((t) => t.id === teamId)
}

export async function assignBusinessAccount(teamId, accountData) {
  await delay()
  teamsState = teamsState.map((t) => {
    if (t.id === teamId) {
      const isAlreadyAssigned = t.businessAccounts.some((b) => b.id === accountData.id)
      if (isAlreadyAssigned) return t
      return {
        ...t,
        businessAccounts: [...t.businessAccounts, accountData]
      }
    }
    return t
  })
  return teamsState.find((t) => t.id === teamId)
}

export async function removeBusinessAccount(teamId, accountId) {
  await delay()
  teamsState = teamsState.map((t) => {
    if (t.id === teamId) {
      return {
        ...t,
        businessAccounts: t.businessAccounts.filter((b) => b.id !== accountId)
      }
    }
    return t
  })
  return teamsState.find((t) => t.id === teamId)
}

export async function deleteMarketingTeam(id) {
  await delay()
  teamsState = teamsState.filter((t) => t.id !== id)
  return true
}

export function exportMarketingTeamsCsv(teams = []) {
  if (!teams || teams.length === 0) return false

  let csvContent = '\uFEFF' // UTF-8 BOM
  csvContent += `OrbitSocial Admin Marketing Teams Export\n`
  csvContent += `Exported At,${new Date().toLocaleString()}\n\n`
  csvContent += `"ID","TEAM NAME","TYPE","STATUS","LEAD","MEMBERS COUNT","BUSINESS ACCOUNTS","ACTIVE CAMPAIGNS","CREATED DATE"\n`

  teams.forEach((t) => {
    const leadName = t.lead ? t.lead.name : 'Unassigned'
    const memberCount = t.members ? t.members.length : 0
    const accountsCount = t.businessAccounts ? t.businessAccounts.length : 0

    csvContent += `"${t.id}","${t.name}","${t.type}","${t.status}","${leadName}","${memberCount}","${accountsCount}","${t.activeCampaignsCount || 0}","${t.createdDate}"\n`
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `OrbitSocial_MarketingTeams_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return true
}
