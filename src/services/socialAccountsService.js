/**
 * socialAccountsService.js
 * Mock data and state management actions for the Social Account Management module.
 * Preserves localStorage persistence for connect/disconnect and connection statuses.
 * Upgraded to use realistic placeholder data and branding metadata.
 */

const DEFAULT_ACCOUNTS = [
  {
    id: 'instagram',
    platform: 'Instagram',
    username: '@johndoe_creations',
    status: 'Connected', // Connected, Not Connected, Syncing, Expired Token, Requires Login
    followers: '42.5K',
    connectedSince: '15 Jan 2026',
    lastSync: '10 minutes ago',
    health: 'Healthy',
    iconColor: 'bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500',
  },
  {
    id: 'facebook',
    platform: 'Facebook',
    username: 'John Doe Page',
    status: 'Requires Login',
    followers: '12.8K',
    connectedSince: '10 Feb 2026',
    lastSync: '2 days ago',
    health: 'Action Required',
    iconColor: 'bg-[#1877F2]',
  },
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    username: 'John Doe',
    status: 'Connected',
    followers: '8.4K',
    connectedSince: '05 Dec 2025',
    lastSync: '1 hour ago',
    health: 'Healthy',
  },
  {
    id: 'twitter',
    platform: 'X (Twitter)',
    username: '@johndoe_tweets',
    status: 'Syncing',
    followers: '19.2K',
    connectedSince: '20 Mar 2026',
    lastSync: '2 minutes ago',
    health: 'Fair',
  },
  {
    id: 'youtube',
    platform: 'YouTube',
    username: 'John Doe Media',
    status: 'Expired Token',
    followers: '105K',
    connectedSince: '12 Nov 2025',
    lastSync: '1 week ago',
    health: 'Critical',
  },
  {
    id: 'pinterest',
    platform: 'Pinterest',
    username: '@johndoe_pins',
    status: 'Not Connected',
    followers: '--',
    connectedSince: '--',
    lastSync: '--',
    health: '--',
  },
]

const DEFAULT_ACTIVITIES = [
  { id: 1, text: 'Instagram connection health verified as Healthy', time: '2 minutes ago', type: 'success' },
  { id: 2, text: 'LinkedIn synchronized completed successfully', time: '10 minutes ago', type: 'info' },
  { id: 3, text: 'YouTube credentials authentication expired', time: '1 day ago', type: 'warning' },
  { id: 4, text: 'Facebook requested login authentication update', time: '2 days ago', type: 'error' },
  { id: 5, text: 'Pinterest account configuration was initialized', time: 'Yesterday', type: 'default' },
]

const STORAGE_ACCOUNTS_KEY = 'orbit-social-accounts'
const STORAGE_ACTIVITIES_KEY = 'orbit-social-activities'

export const socialAccountsService = {
  getAccounts: () => {
    try {
      const stored = localStorage.getItem(STORAGE_ACCOUNTS_KEY)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
    return DEFAULT_ACCOUNTS
  },

  saveAccounts: (accounts) => {
    try {
      localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts))
    } catch (e) {
      console.error(e)
    }
  },

  getActivities: () => {
    try {
      const stored = localStorage.getItem(STORAGE_ACTIVITIES_KEY)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
    return DEFAULT_ACTIVITIES
  },

  saveActivities: (activities) => {
    try {
      localStorage.setItem(STORAGE_ACTIVITIES_KEY, JSON.stringify(activities))
    } catch (e) {
      console.error(e)
    }
  }
}
