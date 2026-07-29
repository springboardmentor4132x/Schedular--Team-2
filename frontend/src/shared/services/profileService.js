/**
 * profileService.js
 * Profile management service — prepared for future backend API integration.
 */
import { mockProfile, completionChecklist } from '../mock/profileMock'

export { mockProfile, completionChecklist }

export function getCompletionPct(list) {
  const done = list.filter(i => i.done).length
  return Math.round((done / list.length) * 100)
}

export const profileService = {
  getProfile: async () => {
    // Future API call: return await fetch('/api/profile').then(res => res.json())
    return mockProfile
  },
  updateProfile: async (updatedData) => {
    // Future API call: return await fetch('/api/profile', { method: 'PUT', body: JSON.stringify(updatedData) })
    return { ...mockProfile, ...updatedData }
  }
}
