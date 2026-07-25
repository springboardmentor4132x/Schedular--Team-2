/**
 * settingsMock.js
 * Default settings mock dataset.
 */

export const defaultSettings = {
  // Section 2: Notifications
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    productUpdates: true,
    weeklySummary: false,
    securityAlerts: true,
  },
  // Section 3: Security
  security: {
    twoFactorAuth: false,
    rememberDevice: true,
    loginAlerts: true,
    sessionTimeout: false,
    deviceVerification: true,
    trustedDevices: true,
  },
  // Section 4: Privacy
  privacy: {
    publicProfile: true,
    showEmail: false,
    showActivityStatus: true,
    allowSearchEngines: false,
    personalizedRecs: true,
  },
  // Section 5: Language & Region
  region: {
    language: 'en',
    timezone: 'UTC-8',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },
  // Section 6: Account Information (Read-only)
  accountInfo: {
    currentPlan: 'Professional',
    storageUsed: '4.2 GB / 50 GB',
    connectedDevices: 3,
    createdDate: 'January 12, 2023',
    lastLogin: 'July 9, 2026 at 17:42',
  }
}
