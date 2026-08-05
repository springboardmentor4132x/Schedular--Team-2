/**
 * Comprehensive Admin Analytics Mock Data
 */

export const adminKpisMock = {
  totalCreators: { label: 'Total Creators', value: '142', change: '+12%', positive: true },
  totalCampaigns: { label: 'Total Campaigns', value: '38', change: '+8%', positive: true },
  totalPublished: { label: 'Total Published Posts', value: '1,840', change: '+18.4%', positive: true },
  totalScheduled: { label: 'Total Scheduled Posts', value: '320', change: '+5.2%', positive: true },
  totalReach: { label: 'Total System Reach', value: '2.4M', change: '+24.1%', positive: true },
  totalImpressions: { label: 'Total Impressions', value: '5.8M', change: '+29.6%', positive: true },
  totalEngagement: { label: 'Total Engagement', value: '412K', change: '+15.3%', positive: true },
  totalFollowers: { label: 'Combined Audience', value: '1.1M', change: '+14.2%', positive: true },
  overallEngagementRate: { label: 'System Avg Engagement Rate', value: '7.1%', change: '+0.9%', positive: true },
}

export const adminTimeSeriesMock = [
  { date: '2026-02-01', engagement: 12400, reach: 72000, creators: 120, posts: 42 },
  { date: '2026-02-02', engagement: 14200, reach: 81000, creators: 122, posts: 48 },
  { date: '2026-02-03', engagement: 16800, reach: 94000, creators: 125, posts: 55 },
  { date: '2026-02-04', engagement: 15100, reach: 88000, creators: 127, posts: 50 },
  { date: '2026-02-05', engagement: 18900, reach: 106000, creators: 130, posts: 62 },
  { date: '2026-02-06', engagement: 21400, reach: 119000, creators: 134, posts: 71 },
  { date: '2026-02-07', engagement: 24800, reach: 135000, creators: 138, posts: 84 },
  { date: '2026-02-08', engagement: 23100, reach: 128000, creators: 142, posts: 78 },
]

export const adminPlatformGrowthMock = [
  { platform: 'Instagram', followers: '450K', reach: '980K', engagement: '8.4%', growth: '+16%' },
  { platform: 'YouTube', followers: '280K', reach: '620K', engagement: '6.9%', growth: '+22%' },
  { platform: 'LinkedIn', followers: '180K', reach: '410K', engagement: '7.8%', growth: '+19%' },
  { platform: 'X (Twitter)', followers: '140K', reach: '290K', engagement: '5.2%', growth: '+9%' },
  { platform: 'Pinterest', followers: '65K', reach: '120K', engagement: '4.8%', growth: '+11%' },
  { platform: 'Facebook', followers: '95K', reach: '180K', engagement: '4.1%', growth: '+5%' },
]

export const adminCreatorsMock = [
  { id: '1', name: 'Alex Rivera', handle: '@alexrivera', avatar: 'AR', followers: '124.5K', posts: 142, reach: '450K', engagement: '8.6%', campaigns: 6, status: 'Active' },
  { id: '2', name: 'Sarah Chen', handle: '@sarahdesigns', avatar: 'SC', followers: '98.2K', posts: 118, reach: '380K', engagement: '9.1%', campaigns: 8, status: 'Active' },
  { id: '3', name: 'Marcus Vance', handle: '@marcusvance', avatar: 'MV', followers: '210.0K', posts: 205, reach: '890K', engagement: '7.4%', campaigns: 12, status: 'Active' },
  { id: '4', name: 'Elena Rostova', handle: '@elenarostova', avatar: 'ER', followers: '64.8K', posts: 89, reach: '210K', engagement: '6.8%', campaigns: 4, status: 'Active' },
  { id: '5', name: 'David Kim', handle: '@davidkimtech', avatar: 'DK', followers: '175.4K', posts: 164, reach: '620K', engagement: '8.2%', campaigns: 9, status: 'Active' },
  { id: '6', name: 'Priya Sharma', handle: '@priyasharma', avatar: 'PS', followers: '82.1K', posts: 96, reach: '290K', engagement: '7.9%', campaigns: 5, status: 'Active' },
  { id: '7', name: 'Jordan Taylor', handle: '@jtaylor', avatar: 'JT', followers: '45.0K', posts: 54, reach: '140K', engagement: '5.6%', campaigns: 2, status: 'Inactive' },
  { id: '8', name: 'Hannah Abbott', handle: '@hannahabbott', avatar: 'HA', followers: '112.0K', posts: 130, reach: '410K', engagement: '8.0%', campaigns: 7, status: 'Active' },
]

export const adminCampaignsMock = [
  { id: 'c1', name: 'Product Launch 2026', creatorCount: 14, reach: '850K', impressions: '1.9M', engagement: '142K', clicks: '38.5K', roi: '340%', completion: 92, status: 'Active' },
  { id: 'c2', name: 'Dev Education Wave', creatorCount: 9, reach: '620K', impressions: '1.4M', engagement: '98K', clicks: '24.2K', roi: '280%', completion: 85, status: 'Active' },
  { id: 'c3', name: 'Thought Leadership Q1', creatorCount: 12, reach: '480K', impressions: '1.1M', engagement: '74K', clicks: '19.8K', roi: '210%', completion: 100, status: 'Completed' },
  { id: 'c4', name: 'Daily AI Tips Series', creatorCount: 6, reach: '310K', impressions: '720K', engagement: '52K', clicks: '14.1K', roi: '195%', completion: 64, status: 'Active' },
  { id: 'c5', name: 'Spring Creator Showcase', creatorCount: 8, reach: '240K', impressions: '540K', engagement: '38K', clicks: '9.6K', roi: '160%', completion: 40, status: 'Active' },
]

export const adminAudienceDemographicsMock = {
  age: [
    { range: '18-24', percentage: 28 },
    { range: '25-34', percentage: 46 },
    { range: '35-44', percentage: 16 },
    { range: '45-54', percentage: 7 },
    { range: '55+', percentage: 3 }
  ],
  gender: [
    { label: 'Female', percentage: 52 },
    { label: 'Male', percentage: 44 },
    { label: 'Non-binary / Other', percentage: 4 }
  ],
  countries: [
    { country: 'United States', percentage: 38, count: '418K' },
    { country: 'United Kingdom', percentage: 14, count: '154K' },
    { country: 'Canada', percentage: 11, count: '121K' },
    { country: 'Germany', percentage: 9, count: '99K' },
    { country: 'India', percentage: 8, count: '88K' },
    { country: 'Australia', percentage: 7, count: '77K' },
    { country: 'Others', percentage: 13, count: '143K' }
  ],
  languages: [
    { language: 'English', percentage: 68 },
    { language: 'Spanish', percentage: 12 },
    { language: 'German', percentage: 8 },
    { language: 'French', percentage: 6 },
    { language: 'Other', percentage: 6 }
  ],
  activeHoursPeak: '6:00 PM - 9:00 PM EST',
  activeDaysPeak: 'Wednesday & Thursday'
}

export const adminTimeframeTrendsMock = {
  daily: [
    { label: 'Mon', engagement: 42000, reach: 240000, posts: 140 },
    { label: 'Tue', engagement: 48000, reach: 270000, posts: 156 },
    { label: 'Wed', engagement: 61000, reach: 340000, posts: 189 },
    { label: 'Thu', engagement: 68000, reach: 380000, posts: 210 },
    { label: 'Fri', engagement: 59000, reach: 320000, posts: 175 },
    { label: 'Sat', engagement: 44000, reach: 250000, posts: 130 },
    { label: 'Sun', engagement: 41000, reach: 230000, posts: 115 },
  ],
  weekly: [
    { label: 'Week 1', engagement: 280000, reach: 1500000, posts: 840 },
    { label: 'Week 2', engagement: 310000, reach: 1720000, posts: 920 },
    { label: 'Week 3', engagement: 340000, reach: 1910000, posts: 1040 },
    { label: 'Week 4', engagement: 370000, reach: 2100000, posts: 1120 },
  ],
  monthly: [
    { label: 'Oct', engagement: 1100000, reach: 5900000, posts: 3200 },
    { label: 'Nov', engagement: 1240000, reach: 6800000, posts: 3600 },
    { label: 'Dec', engagement: 1380000, reach: 7400000, posts: 3950 },
    { label: 'Jan', engagement: 1520000, reach: 8100000, posts: 4300 },
  ],
  quarterly: [
    { label: 'Q1', engagement: 3800000, reach: 21000000, posts: 11200 },
    { label: 'Q2', engagement: 4200000, reach: 23800000, posts: 12500 },
    { label: 'Q3', engagement: 4600000, reach: 26100000, posts: 13900 },
    { label: 'Q4', engagement: 5100000, reach: 29000000, posts: 15400 },
  ],
  yearly: [
    { label: '2024', engagement: 12400000, reach: 68000000, posts: 38000 },
    { label: '2025', engagement: 16800000, reach: 92000000, posts: 49000 },
    { label: '2026 (YTD)', engagement: 5100000, reach: 29000000, posts: 15400 },
  ]
}
