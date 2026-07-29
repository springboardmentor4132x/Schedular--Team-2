/**
 * settingsService.js
 * Service for managing Account Settings preferences.
 * Supports localStorage persistence and API integration preparation.
 */
import { defaultSettings } from '../mock/settingsMock'

export { defaultSettings }

const STORAGE_KEY = 'orbit-settings'

export const settingsService = {
  getSettings: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to read settings from localStorage', e)
    }
    return defaultSettings
  },

  saveSettings: (settings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      return true
    } catch (e) {
      console.error('Failed to save settings to localStorage', e)
      return false
    }
  }
}
