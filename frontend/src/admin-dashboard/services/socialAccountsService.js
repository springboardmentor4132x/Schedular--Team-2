/**
 * socialAccountsService.js
 * Mock data and state management actions for the Social Account Management module.
 * Preserves localStorage persistence for connect/disconnect and connection statuses.
 */

import { DEFAULT_ACCOUNTS, DEFAULT_ACTIVITIES } from '../mock/socialAccountsMock'

export { DEFAULT_ACCOUNTS, DEFAULT_ACTIVITIES }

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
