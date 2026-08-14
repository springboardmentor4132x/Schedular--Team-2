/**
 * Module 7: Centralized Notification Mock Data for Creator & Admin roles
 * Categories: 
 *   Creator: scheduled, publishing, campaigns, account, email, push, team
 *   Admin: system, security, users, creators, business, teams, publishing, campaigns, analytics, reports, social
 */

export const creatorNotificationsMock = [
  {
    id: 'notif-c1',
    role: 'creator',
    category: 'scheduled',
    title: 'Scheduled Post Reminder',
    message: 'Your post "Q1 Tech Trends & AI Breakthroughs" is scheduled to publish on Instagram in 15 minutes.',
    timestamp: '10 mins ago',
    read: false,
    priority: 'high',
    relatedEntity: 'Instagram Carousel Post',
    actionLabel: 'View Schedule',
    actionUrl: '/creator/publishing-calendar'
  },
  {
    id: 'notif-c2',
    role: 'creator',
    category: 'publishing',
    title: 'Post Published Successfully',
    message: 'Your video reel "Top 5 React 19 Features You Need to Know" is live on YouTube & Instagram.',
    timestamp: '1 hour ago',
    read: false,
    priority: 'medium',
    relatedEntity: 'YouTube Reel',
    actionLabel: 'View Analytics',
    actionUrl: '/creator/analytics'
  },
  {
    id: 'notif-c3',
    role: 'creator',
    category: 'team',
    title: 'Team Collaboration Alert',
    message: 'Sarah Chen added reviewer feedback on your draft "Dev Education Infographic".',
    timestamp: '2 hours ago',
    read: false,
    priority: 'high',
    relatedEntity: 'Draft #1042',
    actionLabel: 'Review Feedback',
    actionUrl: '/creator/my-posts'
  },
  {
    id: 'notif-c4',
    role: 'creator',
    category: 'campaigns',
    title: 'Campaign Deadline Approaching',
    message: 'Brand brief "Product Launch 2026" deliverables are due in 48 hours.',
    timestamp: '5 hours ago',
    read: true,
    priority: 'high',
    relatedEntity: 'Product Launch 2026',
    actionLabel: 'View Campaign',
    actionUrl: '/creator/campaigns'
  },
  {
    id: 'notif-c5',
    role: 'creator',
    category: 'account',
    title: 'Social Account Update',
    message: 'LinkedIn access token refreshed successfully. Connected account status: Active.',
    timestamp: '1 day ago',
    read: true,
    priority: 'low',
    relatedEntity: 'LinkedIn Connection',
    actionLabel: 'Manage Accounts',
    actionUrl: '/creator/settings'
  },
  {
    id: 'notif-c6',
    role: 'creator',
    category: 'publishing',
    title: 'Publishing Alert: Action Needed',
    message: 'Publishing failed for post #1089 on X (Twitter): API rate limit exceeded. Auto-retry in 10 mins.',
    timestamp: '1 day ago',
    read: true,
    priority: 'high',
    relatedEntity: 'X Post #1089',
    actionLabel: 'View Logs',
    actionUrl: '/creator/my-posts'
  },
  {
    id: 'notif-c7',
    role: 'creator',
    category: 'team',
    title: 'Team Member Assigned Content',
    message: 'Alex Rivera assigned you as co-author on "Spring Developer Showcase Carousel".',
    timestamp: '2 days ago',
    read: true,
    priority: 'medium',
    relatedEntity: 'Carousel Draft',
    actionLabel: 'Open Draft',
    actionUrl: '/creator/my-posts'
  }
]

export const adminNotificationsMock = [
  {
    id: 'notif-a1',
    role: 'admin',
    category: 'security',
    title: 'New Account Security Alert',
    message: 'Administrator login detected from Chrome on Windows (IP: 192.168.1.104).',
    timestamp: '5 mins ago',
    read: false,
    priority: 'CRITICAL',
    relatedEntity: 'Admin Security',
    actionLabel: 'View Users',
    actionUrl: '/admin/users'
  },
  {
    id: 'notif-a2',
    role: 'admin',
    category: 'publishing',
    title: 'System Publishing Batch Completed',
    message: 'System-wide daily publishing batch completed: 320 scheduled posts processed successfully across all channels.',
    timestamp: '30 mins ago',
    read: false,
    priority: 'SUCCESS',
    relatedEntity: 'Publishing Queue',
    actionLabel: 'View Analytics',
    actionUrl: '/admin/analytics'
  },
  {
    id: 'notif-a3',
    role: 'admin',
    category: 'creators',
    title: 'New Content Creator Registered',
    message: 'Content Creator Sarah Johnson (@sarahcreates) has registered and completed profile setup.',
    timestamp: '1 hour ago',
    read: false,
    priority: 'INFO',
    relatedEntity: 'Sarah Johnson',
    actionLabel: 'View Creator',
    actionUrl: '/admin/content-creators'
  },
  {
    id: 'notif-a4',
    role: 'admin',
    category: 'business',
    title: 'New Business Account Onboarded',
    message: 'Business account "Apex Global Enterprise" was created and assigned to Enterprise tier.',
    timestamp: '2 hours ago',
    read: false,
    priority: 'SUCCESS',
    relatedEntity: 'Apex Global Enterprise',
    actionLabel: 'View Account',
    actionUrl: '/admin/business-accounts'
  },
  {
    id: 'notif-a5',
    role: 'admin',
    category: 'campaigns',
    title: 'Campaign Performance Milestone',
    message: 'Campaign "Product Launch 2026" achieved 1.9M impressions, surpassing target ROI by +24%.',
    timestamp: '3 hours ago',
    read: false,
    priority: 'SUCCESS',
    relatedEntity: 'Product Launch 2026',
    actionLabel: 'View Analytics',
    actionUrl: '/admin/analytics/campaigns'
  },
  {
    id: 'notif-a6',
    role: 'admin',
    category: 'teams',
    title: 'Marketing Team Created',
    message: 'Marketing Team "Orbit Growth Team" created with 8 members and assigned to 5 business accounts.',
    timestamp: '5 hours ago',
    read: true,
    priority: 'INFO',
    relatedEntity: 'Orbit Growth Team',
    actionLabel: 'View Team',
    actionUrl: '/admin/marketing-teams'
  },
  {
    id: 'notif-a7',
    role: 'admin',
    category: 'social',
    title: 'Social Account OAuth Warning',
    message: 'Creator @davidkimtech Pinterest OAuth token expires in 3 days. Warning email dispatched.',
    timestamp: '6 hours ago',
    read: true,
    priority: 'WARNING',
    relatedEntity: 'Pinterest OAuth',
    actionLabel: 'Manage Creators',
    actionUrl: '/admin/content-creators'
  },
  {
    id: 'notif-a8',
    role: 'admin',
    category: 'publishing',
    title: 'Publishing Retry Required',
    message: 'Post #1089 publishing failed for 1 post on X due to temporary API rate limit. Auto-retry queued.',
    timestamp: '8 hours ago',
    read: true,
    priority: 'WARNING',
    relatedEntity: 'Post #1089',
    actionLabel: 'View Analytics',
    actionUrl: '/admin/analytics/platforms'
  },
  {
    id: 'notif-a9',
    role: 'admin',
    category: 'analytics',
    title: 'Analytics Data Sync Completed',
    message: 'System-wide analytics sync across Instagram, Facebook, LinkedIn, X, and YouTube completed successfully.',
    timestamp: '12 hours ago',
    read: true,
    priority: 'INFO',
    relatedEntity: 'Analytics Engine',
    actionLabel: 'View Trends',
    actionUrl: '/admin/analytics/performance'
  },
  {
    id: 'notif-a10',
    role: 'admin',
    category: 'reports',
    title: 'System Export Generated',
    message: 'System-wide Audience Demographics PDF & Excel export generated by Administrator.',
    timestamp: '1 day ago',
    read: true,
    priority: 'INFO',
    relatedEntity: 'Reports Engine',
    actionLabel: 'View Reports',
    actionUrl: '/admin/reports'
  },
  {
    id: 'notif-a11',
    role: 'admin',
    category: 'users',
    title: 'New Platform User Joined',
    message: 'User Lucas Scott registered with Manager role under Orbit Media Agency.',
    timestamp: '1 day ago',
    read: true,
    priority: 'INFO',
    relatedEntity: 'Lucas Scott',
    actionLabel: 'View Users',
    actionUrl: '/admin/users'
  },
  {
    id: 'notif-a12',
    role: 'admin',
    category: 'security',
    title: 'System Rate Limit Anomaly',
    message: 'Spike detected in API webhooks traffic (1,240 req/min). System auto-scaled rate limiters.',
    timestamp: '2 days ago',
    read: true,
    priority: 'CRITICAL',
    relatedEntity: 'API Gateway',
    actionLabel: 'View Analytics',
    actionUrl: '/admin/analytics'
  }
]

export const defaultNotificationPreferencesMock = {
  creator: {
    emailNotifications: true,
    pushNotifications: true,
    publishingAlerts: true,
    scheduledReminders: true,
    campaignAlerts: true,
    accountActivity: true,
    teamCollaboration: true,
  },
  admin: {
    emailNotifications: true,
    pushNotifications: true,
    systemAlerts: true,
    userActivity: true,
    businessAccountAlerts: true,
    teamAlerts: true,
    publishingAlerts: true,
    campaignAlerts: true,
    analyticsAlerts: true,
    reportAlerts: true,
    securityAlerts: true
  }
}
