/**
 * Module 8: Centralized Reports & Export Mock Data for Creator & Admin roles
 */

export const creatorReportDataMock = {
  engagement: {
    title: 'Creator Engagement Report',
    summary: {
      totalEngagement: '148.4K',
      likes: '92.1K',
      comments: '24.6K',
      shares: '18.2K',
      saves: '13.5K',
      clicks: '38.2K',
      engagementRate: '8.4%',
      change: '+14.8%'
    },
    tableData: [
      { id: '1', name: 'Q1 Tech Trends & AI Breakthroughs', platform: 'Instagram', date: '2026-02-10', likes: '14,200', comments: '3,800', shares: '2,100', saves: '1,900', clicks: '4,500', rate: '9.2%' },
      { id: '2', name: 'React 19 Complete Migration Guide', platform: 'YouTube', date: '2026-02-08', likes: '28,500', comments: '6,400', shares: '4,800', saves: '3,200', clicks: '9,800', rate: '8.8%' },
      { id: '3', name: 'Building Scalable Agentic Workflows', platform: 'LinkedIn', date: '2026-02-05', likes: '19,800', comments: '4,100', shares: '3,900', saves: '2,800', clicks: '7,200', rate: '8.1%' },
      { id: '4', name: 'Tailwind CSS v4 & CSS Variables', platform: 'X', date: '2026-02-02', likes: '16,400', comments: '5,200', shares: '4,100', saves: '3,100', clicks: '8,900', rate: '7.9%' },
      { id: '5', name: 'Modern Web UI Aesthetic Patterns', platform: 'Pinterest', date: '2026-01-28', likes: '13,200', comments: '5,100', shares: '3,300', saves: '2,500', clicks: '7,800', rate: '8.0%' }
    ],
    chartData: [
      { name: 'Week 1', value: 24200 },
      { name: 'Week 2', value: 32800 },
      { name: 'Week 3', value: 41500 },
      { name: 'Week 4', value: 49900 }
    ]
  },
  campaign: {
    title: 'Creator Campaign Performance Report',
    summary: {
      activeCampaigns: '6',
      totalPosts: '38',
      totalReach: '850K',
      totalImpressions: '1.9M',
      avgEngagementRate: '8.9%',
      estimatedRoi: '340%'
    },
    tableData: [
      { id: 'c1', name: 'Product Launch 2026', status: 'Active', duration: 'Jan 15 - Feb 28', posts: 14, reach: '450K', impressions: '980K', engagement: '82K', clicks: '21K', rate: '9.4%', completion: '92%', roi: '380%' },
      { id: 'c2', name: 'Dev Education Wave', status: 'Active', duration: 'Feb 01 - Mar 15', posts: 9, reach: '240K', impressions: '510K', engagement: '41K', clicks: '11K', rate: '8.6%', completion: '85%', roi: '290%' },
      { id: 'c3', name: 'Thought Leadership Q1', status: 'Completed', duration: 'Jan 01 - Jan 31', posts: 12, reach: '160K', impressions: '410K', engagement: '25K', clicks: '6.2K', rate: '7.8%', completion: '100%', roi: '210%' }
    ],
    chartData: [
      { name: 'Product Launch 2026', value: 82000 },
      { name: 'Dev Education', value: 41000 },
      { name: 'Thought Leadership', value: 25000 }
    ]
  },
  audience: {
    title: 'Creator Audience Growth Report',
    summary: {
      totalFollowers: '315.4K',
      newFollowers: '+18.2K',
      lostFollowers: '-1.4K',
      netGrowth: '+16.8K',
      growthRate: '+5.6%'
    },
    tableData: [
      { id: 'a1', platform: 'Instagram', followers: '145.2K', newFollowers: '+8,400', lostFollowers: '-620', netGrowth: '+7,780', growthRate: '+5.7%' },
      { id: 'a2', platform: 'YouTube', followers: '82.6K', newFollowers: '+4,900', lostFollowers: '-310', netGrowth: '+4,590', growthRate: '+5.9%' },
      { id: 'a3', platform: 'LinkedIn', followers: '54.1K', newFollowers: '+3,100', lostFollowers: '-240', netGrowth: '+2,860', growthRate: '+5.6%' },
      { id: 'a4', platform: 'X (Twitter)', followers: '33.5K', newFollowers: '+1,800', lostFollowers: '-230', netGrowth: '+1,570', growthRate: '+4.9%' }
    ],
    chartData: [
      { name: 'Instagram', value: 145200 },
      { name: 'YouTube', value: 82600 },
      { name: 'LinkedIn', value: 54100 },
      { name: 'X', value: 33500 }
    ]
  },
  publishing: {
    title: 'Creator Publishing Report',
    summary: {
      publishedPosts: '142',
      scheduledPosts: '28',
      failedPosts: '2',
      successRate: '98.6%',
      avgPostsPerWeek: '12'
    },
    tableData: [
      { id: 'p1', platform: 'Instagram', published: 48, scheduled: 10, failed: 1, successRate: '98.0%', topFormat: 'Carousel' },
      { id: 'p2', platform: 'YouTube', published: 26, scheduled: 6, failed: 0, successRate: '100%', topFormat: 'Video' },
      { id: 'p3', platform: 'LinkedIn', published: 38, scheduled: 8, failed: 0, successRate: '100%', topFormat: 'Article' },
      { id: 'p4', platform: 'X', published: 30, scheduled: 4, failed: 1, successRate: '96.8%', topFormat: 'Thread' }
    ],
    chartData: [
      { name: 'Instagram', value: 48 },
      { name: 'LinkedIn', value: 38 },
      { name: 'X', value: 30 },
      { name: 'YouTube', value: 26 }
    ]
  },
  platform: {
    title: 'Creator Platform Comparison Report',
    summary: {
      topPlatform: 'Instagram',
      totalReach: '850K',
      totalImpressions: '1.9M',
      avgEngagementRate: '8.4%'
    },
    tableData: [
      { id: 'pl1', platform: 'Instagram', followers: '145.2K', reach: '380K', impressions: '840K', engagement: '58K', likes: '38K', comments: '12K', shares: '8K', clicks: '14K' },
      { id: 'pl2', platform: 'YouTube', followers: '82.6K', reach: '240K', impressions: '520K', engagement: '42K', likes: '29K', comments: '8K', shares: '5K', clicks: '11K' },
      { id: 'pl3', platform: 'LinkedIn', followers: '54.1K', reach: '140K', impressions: '310K', engagement: '28K', likes: '18K', comments: '6K', shares: '4K', clicks: '9K' },
      { id: 'pl4', platform: 'X', followers: '33.5K', reach: '90K', impressions: '230K', engagement: '20K', likes: '13K', comments: '4K', shares: '3K', clicks: '7K' }
    ],
    chartData: [
      { name: 'Instagram', value: 380000 },
      { name: 'YouTube', value: 240000 },
      { name: 'LinkedIn', value: 140000 },
      { name: 'X', value: 90000 }
    ]
  }
}

export const adminReportDataMock = {
  engagement: {
    title: 'Admin System Engagement Report',
    summary: {
      totalEngagement: '412K',
      likes: '264K',
      comments: '78K',
      shares: '42K',
      saves: '28K',
      clicks: '104K',
      engagementRate: '7.1%',
      change: '+15.3%'
    },
    tableData: [
      { id: 'a1', name: 'System Core Network', platform: 'All Platforms', date: '2026-02-10', likes: '264,000', comments: '78,000', shares: '42,000', saves: '28,000', clicks: '104,000', rate: '7.1%' },
      { id: 'a2', name: 'Instagram Creator Batch', platform: 'Instagram', date: '2026-02-09', likes: '112,000', comments: '34,000', shares: '18,000', saves: '12,000', clicks: '44,000', rate: '8.2%' },
      { id: 'a3', name: 'YouTube Channel Network', platform: 'YouTube', date: '2026-02-08', likes: '78,000', comments: '22,000', shares: '11,000', saves: '8,000', clicks: '31,000', rate: '6.9%' }
    ],
    chartData: [
      { name: 'Week 1', value: 84000 },
      { name: 'Week 2', value: 98000 },
      { name: 'Week 3', value: 112000 },
      { name: 'Week 4', value: 118000 }
    ]
  },
  campaign: {
    title: 'Admin System Campaign Report',
    summary: {
      activeCampaigns: '38',
      totalPosts: '1,840',
      totalReach: '2.4M',
      totalImpressions: '5.8M',
      avgEngagementRate: '7.4%',
      estimatedRoi: '290%'
    },
    tableData: [
      { id: 'ac1', name: 'Product Launch 2026', status: 'Active', duration: 'Jan 15 - Feb 28', posts: 140, reach: '850K', impressions: '1.9M', engagement: '142K', clicks: '38K', rate: '7.5%', completion: '92%', roi: '340%' },
      { id: 'ac2', name: 'Dev Education Wave', status: 'Active', duration: 'Feb 01 - Mar 15', posts: 90, reach: '620K', impressions: '1.4M', engagement: '98K', clicks: '24K', rate: '7.0%', completion: '85%', roi: '280%' }
    ],
    chartData: [
      { name: 'Product Launch', value: 850000 },
      { name: 'Dev Education', value: 620000 },
      { name: 'Thought Leadership', value: 480000 }
    ]
  },
  audience: {
    title: 'Admin Audience Growth Report',
    summary: {
      totalFollowers: '1.1M',
      newFollowers: '+58K',
      lostFollowers: '-4.2K',
      netGrowth: '+53.8K',
      growthRate: '+14.2%'
    },
    tableData: [
      { id: 'aa1', platform: 'Instagram', followers: '450K', newFollowers: '+24K', lostFollowers: '-1.8K', netGrowth: '+22.2K', growthRate: '+16%' },
      { id: 'aa2', platform: 'YouTube', followers: '280K', newFollowers: '+16K', lostFollowers: '-1.1K', netGrowth: '+14.9K', growthRate: '+22%' }
    ],
    chartData: [
      { name: 'Instagram', value: 450000 },
      { name: 'YouTube', value: 280000 },
      { name: 'LinkedIn', value: 180000 },
      { name: 'X', value: 140000 }
    ]
  },
  publishing: {
    title: 'Admin System Publishing Report',
    summary: {
      publishedPosts: '1,840',
      scheduledPosts: '320',
      failedPosts: '14',
      successRate: '99.2%',
      avgPostsPerWeek: '420'
    },
    tableData: [
      { id: 'ap1', platform: 'Instagram', published: 620, scheduled: 110, failed: 5, successRate: '99.2%', topFormat: 'Carousel' },
      { id: 'ap2', platform: 'YouTube', published: 340, scheduled: 55, failed: 2, successRate: '99.4%', topFormat: 'Video' }
    ],
    chartData: [
      { name: 'Instagram', value: 620 },
      { name: 'YouTube', value: 340 },
      { name: 'LinkedIn', value: 410 },
      { name: 'X', value: 290 }
    ]
  },
  platform: {
    title: 'Admin Platform Comparison Report',
    summary: {
      topPlatform: 'Instagram',
      totalReach: '2.4M',
      totalImpressions: '5.8M',
      avgEngagementRate: '7.1%'
    },
    tableData: [
      { id: 'apl1', platform: 'Instagram', followers: '450K', reach: '980K', impressions: '2.1M', engagement: '164K', likes: '105K', comments: '34K', shares: '25K', clicks: '38K' },
      { id: 'apl2', platform: 'YouTube', followers: '280K', reach: '620K', impressions: '1.4M', engagement: '110K', likes: '72K', comments: '22K', shares: '16K', clicks: '28K' }
    ],
    chartData: [
      { name: 'Instagram', value: 980000 },
      { name: 'YouTube', value: 620000 },
      { name: 'LinkedIn', value: 410000 },
      { name: 'X', value: 290000 }
    ]
  }
}
