// ═══════════════════════════════════════════════════════════════════
// Module 6: Creator Analytics — Mock Data System
// ═══════════════════════════════════════════════════════════════════

export const summaryKpiData = {
  totalPublished: { value: '1,428', change: '+14.2%', positive: true, label: 'Total Published Posts' },
  totalScheduled: { value: '42', change: '+8.5%', positive: true, label: 'Total Scheduled Posts' },
  totalImpressions: { value: '2.84M', change: '+22.4%', positive: true, label: 'Total Impressions' },
  totalReach: { value: '1.18M', change: '+18.7%', positive: true, label: 'Total Reach' },
  totalEngagement: { value: '184.5K', change: '+15.3%', positive: true, label: 'Total Engagement' },
  totalLikes: { value: '112.4K', change: '+12.8%', positive: true, label: 'Total Likes' },
  totalComments: { value: '28.9K', change: '+24.1%', positive: true, label: 'Total Comments' },
  totalShares: { value: '18.2K', change: '+19.6%', positive: true, label: 'Total Shares' },
  totalClicks: { value: '25.0K', change: '+9.4%', positive: true, label: 'Total Clicks' },
  totalFollowers: { value: '84.2K', change: '+5.8%', positive: true, label: 'Total Followers' },
  overallEngagementRate: { value: '6.48%', change: '+1.2%', positive: true, label: 'Overall Engagement Rate' },
}

export const recentActivityData = [
  { id: 'act-1', action: 'Published Carousel', platform: 'Instagram', title: '10 UX Micro-interactions That Boost Conversion', time: '15 mins ago', metrics: '4.2K Reach · 380 Likes' },
  { id: 'act-2', action: 'Published Video', platform: 'YouTube', title: 'Complete React 19 Frontend Masterclass', time: '2 hours ago', metrics: '12.8K Views · 1.2K Likes' },
  { id: 'act-3', action: 'Published Article', platform: 'LinkedIn', title: 'Why Design Systems are Essential for SaaS Scale-ups', time: '5 hours ago', metrics: '8.4K Impressions · 420 Engagements' },
  { id: 'act-4', action: 'Published Thread', platform: 'X', title: '5 AI Tools Every Designer Should Master in 2026', time: '1 day ago', metrics: '18.5K Impressions · 610 Retweets' },
  { id: 'act-5', action: 'Published Pin', platform: 'Pinterest', title: 'Minimalist Studio Desk Setup Inspiration', time: '2 days ago', metrics: '3.1K Saves · 9.4K Impressions' }
]

export const insightsData = {
  topPost: {
    title: 'Complete React 19 Masterclass & Best Practices',
    platform: 'YouTube',
    reach: '48.5K',
    engagementRate: '12.4%',
    publishDate: '2026-08-01',
    type: 'Video',
    likes: 3840,
    comments: 612,
    shares: 420
  },
  lowestPost: {
    title: 'Quick Update: Tuesday Dev Sync Notes',
    platform: 'Facebook',
    reach: '820',
    engagementRate: '1.2%',
    publishDate: '2026-07-28',
    type: 'Text',
    likes: 18,
    comments: 2,
    shares: 0
  },
  bestPlatform: {
    name: 'Instagram',
    growth: '+28.4%',
    engagementRate: '8.2%',
    totalFollowers: '34.5K'
  },
  bestPostingTime: {
    timeSlot: '02:00 PM - 04:00 PM',
    bestDays: 'Tuesday & Thursday',
    avgEngagementBoost: '+34%'
  }
}

export const timeSeriesData = {
  daily: [
    { date: 'Jul 28', impressions: 65000, reach: 32000, engagement: 4200, clicks: 820, followers: 82100, posts: 4 },
    { date: 'Jul 29', impressions: 72000, reach: 38000, engagement: 5100, clicks: 940, followers: 82450, posts: 3 },
    { date: 'Jul 30', impressions: 58000, reach: 29000, engagement: 3800, clicks: 710, followers: 82700, posts: 2 },
    { date: 'Jul 31', impressions: 89000, reach: 45000, engagement: 6800, clicks: 1250, followers: 83100, posts: 5 },
    { date: 'Aug 01', impressions: 110000, reach: 58000, engagement: 8900, clicks: 1680, followers: 83650, posts: 4 },
    { date: 'Aug 02', impressions: 94000, reach: 49000, engagement: 7400, clicks: 1390, followers: 83950, posts: 3 },
    { date: 'Aug 03', impressions: 102000, reach: 52000, engagement: 8100, clicks: 1510, followers: 84200, posts: 4 }
  ],
  weekly: [
    { date: 'Week 27', impressions: 420000, reach: 210000, engagement: 31000, clicks: 5800, followers: 80200, posts: 22 },
    { date: 'Week 28', impressions: 480000, reach: 245000, engagement: 36500, clicks: 6400, followers: 81400, posts: 24 },
    { date: 'Week 29', impressions: 530000, reach: 270000, engagement: 41200, clicks: 7100, followers: 82500, posts: 26 },
    { date: 'Week 30', impressions: 610000, reach: 315000, engagement: 48900, clicks: 8300, followers: 84200, posts: 28 }
  ],
  monthly: [
    { date: 'Mar 2026', impressions: 1800000, reach: 920000, engagement: 135000, clicks: 22000, followers: 72000, posts: 95 },
    { date: 'Apr 2026', impressions: 2100000, reach: 1040000, engagement: 152000, clicks: 24500, followers: 75400, posts: 102 },
    { date: 'May 2026', impressions: 2350000, reach: 1120000, engagement: 168000, clicks: 26800, followers: 78900, posts: 110 },
    { date: 'Jun 2026', impressions: 2580000, reach: 1190000, engagement: 179000, clicks: 28400, followers: 81800, posts: 115 },
    { date: 'Jul 2026', impressions: 2840000, reach: 1280000, engagement: 194000, clicks: 31200, followers: 84200, posts: 122 }
  ],
  quarterly: [
    { date: 'Q3 2025', impressions: 4500000, reach: 2200000, engagement: 320000, clicks: 54000, followers: 64000, posts: 280 },
    { date: 'Q4 2025', impressions: 5400000, reach: 2700000, engagement: 390000, clicks: 65000, followers: 71000, posts: 310 },
    { date: 'Q1 2026', impressions: 6200000, reach: 3100000, engagement: 455000, clicks: 73000, followers: 75400, posts: 330 },
    { date: 'Q2 2026', impressions: 7030000, reach: 3450000, engagement: 499000, clicks: 79700, followers: 81800, posts: 345 }
  ],
  yearly: [
    { date: '2023', impressions: 12400000, reach: 6100000, engagement: 840000, clicks: 140000, followers: 38000, posts: 820 },
    { date: '2024', impressions: 18900000, reach: 9400000, engagement: 1320000, clicks: 215000, followers: 56000, posts: 1150 },
    { date: '2025', impressions: 23100000, reach: 11600000, engagement: 1650000, clicks: 274000, followers: 71000, posts: 1320 },
    { date: '2026 (YTD)', impressions: 16130000, reach: 8100000, engagement: 1188000, clicks: 188000, followers: 84200, posts: 840 }
  ]
}

export const contentPostsData = [
  {
    id: 'post-101',
    thumbnail: '🚀',
    caption: '10 UX Micro-interactions That Boost Conversion Rates in SaaS Apps',
    platform: 'Instagram',
    campaign: 'Product Launch 2026',
    publishDate: '2026-08-04 14:30',
    contentType: 'Carousel',
    likes: 2840,
    comments: 312,
    shares: 420,
    saves: 890,
    reach: 34500,
    impressions: 48200,
    clicks: 1240,
    engagementRate: '9.8%'
  },
  {
    id: 'post-102',
    thumbnail: '💻',
    caption: 'Complete React 19 Frontend Masterclass: Hooks, Server Components & Performance',
    platform: 'YouTube',
    campaign: 'Dev Education',
    publishDate: '2026-08-03 16:00',
    contentType: 'Video',
    likes: 3840,
    comments: 612,
    shares: 510,
    saves: 1420,
    reach: 58200,
    impressions: 89000,
    clicks: 3420,
    engagementRate: '12.4%'
  },
  {
    id: 'post-103',
    thumbnail: '📊',
    caption: 'Why Design Systems Are Essential for Scaling High-Growth Tech Companies',
    platform: 'LinkedIn',
    campaign: 'Thought Leadership',
    publishDate: '2026-08-02 09:15',
    contentType: 'Article',
    likes: 1240,
    comments: 184,
    shares: 96,
    saves: 340,
    reach: 18400,
    impressions: 26500,
    clicks: 890,
    engagementRate: '7.2%'
  },
  {
    id: 'post-104',
    thumbnail: '🤖',
    caption: 'Top 5 AI Tools Every Designer & Developer Should Master This Year',
    platform: 'X',
    campaign: 'Daily AI Tips',
    publishDate: '2026-08-01 11:00',
    contentType: 'Thread',
    likes: 1950,
    comments: 240,
    shares: 610,
    saves: 780,
    reach: 29800,
    impressions: 42100,
    clicks: 1450,
    engagementRate: '8.5%'
  },
  {
    id: 'post-105',
    thumbnail: '🎨',
    caption: 'Minimalist Workspace Setup for Software Engineers and Creative Designers',
    platform: 'Pinterest',
    campaign: 'Brand Awareness',
    publishDate: '2026-07-30 18:45',
    contentType: 'Image',
    likes: 890,
    comments: 42,
    shares: 180,
    saves: 3100,
    reach: 14200,
    impressions: 21800,
    clicks: 620,
    engagementRate: '6.1%'
  },
  {
    id: 'post-106',
    thumbnail: '🔥',
    caption: 'Summer Product Update Announcement: Live Analytics, Custom Reports & More',
    platform: 'Facebook',
    campaign: 'Product Launch 2026',
    publishDate: '2026-07-29 15:20',
    contentType: 'Image',
    likes: 640,
    comments: 58,
    shares: 34,
    saves: 110,
    reach: 9400,
    impressions: 13800,
    clicks: 390,
    engagementRate: '4.8%'
  },
  {
    id: 'post-107',
    thumbnail: '⚡',
    caption: 'Quick Productivity Hack: 3 Keyboard Shortcuts That Save 1 Hour Daily',
    platform: 'Instagram',
    campaign: 'Dev Education',
    publishDate: '2026-07-27 10:00',
    contentType: 'Reel',
    likes: 3120,
    comments: 290,
    shares: 740,
    saves: 1850,
    reach: 41200,
    impressions: 62400,
    clicks: 980,
    engagementRate: '10.2%'
  },
  {
    id: 'post-108',
    thumbnail: '📈',
    caption: 'How We Scaled Frontend Infrastructure to Handle 10M Monthly Active Users',
    platform: 'LinkedIn',
    campaign: 'Thought Leadership',
    publishDate: '2026-07-25 14:00',
    contentType: 'Article',
    likes: 1890,
    comments: 215,
    shares: 142,
    saves: 540,
    reach: 22600,
    impressions: 34100,
    clicks: 1120,
    engagementRate: '8.1%'
  }
]

export const audienceData = {
  kpis: {
    totalFollowers: '84,200',
    newFollowers: '+4,820',
    lostFollowers: '-610',
    netGrowth: '+4,210 (+5.8%)'
  },
  followersTrend: [
    { date: 'Jul 01', followers: 79990, net: +120 },
    { date: 'Jul 06', followers: 80600, net: +140 },
    { date: 'Jul 11', followers: 81250, net: +180 },
    { date: 'Jul 16', followers: 82000, net: +210 },
    { date: 'Jul 21', followers: 82800, net: +190 },
    { date: 'Jul 26', followers: 83500, net: +220 },
    { date: 'Aug 01', followers: 84200, net: +250 }
  ],
  genderDistribution: [
    { label: 'Male', percentage: 58, count: '48,836', color: 'bg-indigo-500' },
    { label: 'Female', percentage: 36, count: '30,312', color: 'bg-purple-500' },
    { label: 'Non-Binary / Other', percentage: 6, count: '5,052', color: 'bg-emerald-500' }
  ],
  ageDistribution: [
    { group: '18-24', percentage: 22, color: 'bg-sky-500' },
    { group: '25-34', percentage: 48, color: 'bg-indigo-600' },
    { group: '35-44', percentage: 20, color: 'bg-purple-500' },
    { group: '45-54', percentage: 7, color: 'bg-amber-500' },
    { group: '55+', percentage: 3, color: 'bg-slate-400' }
  ],
  countryDistribution: [
    { country: 'United States', percentage: 38, count: '31,996', flag: '🇺🇸' },
    { country: 'United Kingdom', percentage: 14, count: '11,788', flag: '🇬🇧' },
    { country: 'India', percentage: 12, count: '10,104', flag: '🇮🇳' },
    { country: 'Germany', percentage: 9, count: '7,578', flag: '🇩🇪' },
    { country: 'Canada', percentage: 7, count: '5,894', flag: '🇨🇦' },
    { country: 'Australia', percentage: 5, count: '4,210', flag: '🇦🇺' },
    { country: 'Others', percentage: 15, count: '12,630', flag: '🌐' }
  ],
  cityDistribution: [
    { city: 'San Francisco, USA', percentage: 12, count: '10,104' },
    { city: 'London, UK', percentage: 9, count: '7,578' },
    { city: 'New York, USA', percentage: 8, count: '6,736' },
    { city: 'Bengaluru, India', percentage: 7, count: '5,894' },
    { city: 'Berlin, Germany', percentage: 6, count: '5,052' },
    { city: 'Toronto, Canada', percentage: 5, count: '4,210' }
  ],
  languageDistribution: [
    { language: 'English', percentage: 72 },
    { language: 'German', percentage: 8 },
    { language: 'Spanish', percentage: 7 },
    { language: 'Hindi', percentage: 6 },
    { language: 'French', percentage: 4 },
    { language: 'Others', percentage: 3 }
  ],
  mostActiveHours: [
    { hour: '12 AM', activity: 15 },
    { hour: '03 AM', activity: 8 },
    { hour: '06 AM', activity: 25 },
    { hour: '09 AM', activity: 72 },
    { hour: '12 PM', activity: 88 },
    { hour: '03 PM', activity: 96 },
    { hour: '06 PM', activity: 82 },
    { hour: '09 PM', activity: 54 }
  ],
  mostActiveDays: [
    { day: 'Mon', score: 78 },
    { day: 'Tue', score: 94 },
    { day: 'Wed', score: 86 },
    { day: 'Thu', score: 98 },
    { day: 'Fri', score: 82 },
    { day: 'Sat', score: 62 },
    { day: 'Sun', score: 55 }
  ]
}

export const campaignsData = {
  campaigns: [
    {
      id: 'camp-1',
      name: 'Product Launch 2026',
      status: 'Active',
      duration: 'Jul 15 - Aug 15',
      postsCount: 14,
      reach: '245.8K',
      impressions: '412.0K',
      engagement: '38.4K',
      clicks: 5420,
      likes: 24800,
      engagementRate: '9.3%'
    },
    {
      id: 'camp-2',
      name: 'Dev Education Masterclass',
      status: 'Active',
      duration: 'Jul 01 - Aug 30',
      postsCount: 22,
      reach: '382.4K',
      impressions: '610.5K',
      engagement: '52.1K',
      clicks: 8940,
      likes: 34200,
      engagementRate: '8.5%'
    },
    {
      id: 'camp-3',
      name: 'Thought Leadership SaaS',
      status: 'Completed',
      duration: 'Jun 01 - Jun 30',
      postsCount: 18,
      reach: '198.2K',
      impressions: '315.4K',
      engagement: '24.6K',
      clicks: 3820,
      likes: 16400,
      engagementRate: '7.8%'
    },
    {
      id: 'camp-4',
      name: 'Daily AI Tips & Tricks',
      status: 'Active',
      duration: 'Ongoing',
      postsCount: 35,
      reach: '512.0K',
      impressions: '840.2K',
      engagement: '68.9K',
      clicks: 12400,
      likes: 45200,
      engagementRate: '8.2%'
    },
    {
      id: 'camp-5',
      name: 'Summer Brand Promotion',
      status: 'Completed',
      duration: 'May 01 - May 31',
      postsCount: 10,
      reach: '84.5K',
      impressions: '124.0K',
      engagement: '5.8K',
      clicks: 890,
      likes: 3900,
      engagementRate: '4.6%'
    }
  ],
  topCampaigns: [
    { name: 'Daily AI Tips & Tricks', metric: '68.9K Engagements', rate: '8.2% ER' },
    { name: 'Dev Education Masterclass', metric: '52.1K Engagements', rate: '8.5% ER' },
    { name: 'Product Launch 2026', metric: '38.4K Engagements', rate: '9.3% ER' }
  ],
  lowestCampaigns: [
    { name: 'Summer Brand Promotion', metric: '5.8K Engagements', rate: '4.6% ER' },
    { name: 'Weekly Community Polls', metric: '2.4K Engagements', rate: '3.8% ER' }
  ]
}

export const platformComparisonData = {
  platforms: [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📸',
      color: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400',
      accentColor: '#E1306C',
      followers: '34.5K',
      reach: '482.0K',
      impressions: '840.0K',
      engagement: '68.4K',
      likes: '45.2K',
      comments: '12.4K',
      shares: '6.8K',
      clicks: '8.2K',
      engagementRate: '8.1%'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '🎬',
      color: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400',
      accentColor: '#FF0000',
      followers: '24.2K',
      reach: '390.0K',
      impressions: '710.0K',
      engagement: '54.2K',
      likes: '38.5K',
      comments: '8.9K',
      shares: '4.2K',
      clicks: '9.8K',
      engagementRate: '7.6%'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
      accentColor: '#0A66C2',
      followers: '12.8K',
      reach: '184.0K',
      impressions: '310.0K',
      engagement: '24.5K',
      likes: '14.8K',
      comments: '4.2K',
      shares: '2.1K',
      clicks: '5.4K',
      engagementRate: '7.9%'
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      icon: '𝕏',
      color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
      accentColor: '#1DA1F2',
      followers: '8.4K',
      reach: '112.0K',
      impressions: '195.0K',
      engagement: '18.2K',
      likes: '10.4K',
      comments: '2.8K',
      shares: '3.6K',
      clicks: '3.1K',
      engagementRate: '9.3%'
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: '📌',
      color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
      accentColor: '#E60023',
      followers: '3.1K',
      reach: '45.0K',
      impressions: '82.0K',
      engagement: '6.8K',
      likes: '2.4K',
      comments: '380',
      shares: '1.2K',
      clicks: '1.4K',
      engagementRate: '8.3%'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '👤',
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      accentColor: '#1877F2',
      followers: '1.2K',
      reach: '18.0K',
      impressions: '28.0K',
      engagement: '1.8K',
      likes: '920',
      comments: '190',
      shares: '120',
      clicks: '420',
      engagementRate: '6.4%'
    }
  ]
}
