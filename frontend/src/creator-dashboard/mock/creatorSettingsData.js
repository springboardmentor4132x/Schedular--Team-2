export const initialAccountSettings = {
  fullName: 'Alex Rivers',
  username: 'alex_creator',
  email: 'alex.rivers@orbitsocial.com',
  phone: '+1 (555) 234-5678',
  country: 'United States',
  language: 'English (US)',
  timezone: 'Pacific Time (US & Canada)',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12-hour (AM/PM)',
}

export const initialProfileSettings = {
  bio: 'Tech content creator & frontend reviewer. Sharing tutorials, hardware insights, and Vite/React tips with 120k+ engaged followers.',
  website: 'https://alexrivers.dev',
  location: 'San Francisco, CA',
  category: 'Tech & Digital Culture',
  creatorTags: ['Technology', 'Education', 'Lifestyle', 'Frontend', 'Gadgets'],
  portfolioLink: 'https://orbitsocial.app/creator/alex_creator',
  profileVisibility: true,
}

export const initialNotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  contentReviewAlerts: true,
  publishingAlerts: true,
  weeklySummary: false,
  newFollowers: true,
  // campaignInvitations: false, /* Keep hidden/commented for future use as per rules */
}

export const initialPrivacySettings = {
  publicProfile: true,
  showAnalytics: true,
  showFollowers: true,
  showContactInfo: false,
}

export const initialSecuritySettings = {
  twoFactorEnabled: true,
  activeSessions: [
    { id: 1, device: 'Chrome on macOS', location: 'San Francisco, CA', ip: '192.168.1.1', activeNow: true },
    { id: 2, device: 'OrbitSocial Mobile (iOS)', location: 'San Francisco, CA', ip: '172.56.21.4', activeNow: false, lastActive: '2 hours ago' },
  ],
  loginActivity: [
    { id: 1, date: '2026-07-24 14:32', location: 'San Francisco, CA', device: 'Chrome on macOS', status: 'Success' },
    { id: 2, date: '2026-07-22 09:15', location: 'San Francisco, CA', device: 'iOS App v2.4', status: 'Success' },
    { id: 3, date: '2026-07-19 18:40', location: 'San Jose, CA', device: 'Safari on macOS', status: 'Success' },
  ],
  connectedDevices: [
    { name: 'MacBook Pro 16"', type: 'Laptop', os: 'macOS Sequoia', icon: '💻' },
    { name: 'iPhone 15 Pro', type: 'Mobile', os: 'iOS 18.2', icon: '📱' },
    { name: 'iPad Air 5th Gen', type: 'Tablet', os: 'iPadOS 18.1', icon: '📲' },
  ],
}

export const initialAppearanceSettings = {
  theme: 'dark', // Syncs with ThemeContext
  sidebarDefault: 'Expanded',
  compactMode: false,
  animationToggle: true,
}

export const initialConnectedAccounts = [
  { id: 'instagram', platform: 'Instagram', handle: '@alex_rivers_official', connected: true, status: 'Connected', icon: '📸' },
  { id: 'facebook', platform: 'Facebook', handle: '@AlexRiversTech', connected: true, status: 'Connected', icon: '📘' },
  { id: 'linkedin', platform: 'LinkedIn', handle: 'alex-rivers-creator', connected: true, status: 'Connected', icon: '💼' },
  { id: 'youtube', platform: 'YouTube', handle: '@AlexRiversTech', connected: true, status: 'Connected', icon: '▶️' },
  { id: 'pinterest', platform: 'Pinterest', handle: '@alexrivers_pins', connected: false, status: 'Disconnected', icon: '📌' },
  { id: 'twitter', platform: 'X (Twitter)', handle: '@alex_rivers_x', connected: true, status: 'Connected', icon: '𝕏' },
]

export const initialWorkspacePreferences = {
  defaultPlatform: 'Instagram',
  defaultUploadQuality: '1080p Full HD (Recommended)',
  captionTemplate: '🚀 Created with OrbitSocial — Streamline your social media workflow!\n\n👇 Follow for more updates!',
  defaultSchedulingTime: '09:00',
  preferredLanguage: 'English (US)',
}

export const supportInfo = {
  helpCenterUrl: 'https://help.orbitsocial.app',
  documentationUrl: 'https://docs.orbitsocial.app',
  contactEmail: 'support@orbitsocial.app',
  appVersion: 'v2.4.0 (Build 2026.07)',
}
