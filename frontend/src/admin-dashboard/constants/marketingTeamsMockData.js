/**
 * Admin Marketing Teams Management Mock Dataset
 */

export const marketingTeamsMockData = [
  {
    id: 'team-1',
    name: 'Orbit Growth Team',
    description: 'Core performance marketing, user acquisition, and organic social growth strategies.',
    type: 'Internal',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    lead: {
      id: 'lead-1',
      name: 'Alex Morgan',
      email: 'alex.m@orbitsocial.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    createdDate: '2025-02-01',
    activeCampaignsCount: 7,
    totalReach: '1.4M',
    engagementRate: '8.8%',
    members: [
      { id: 'm1', name: 'Alex Morgan', role: 'Team Lead', email: 'alex.m@orbitsocial.com', status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { id: 'm2', name: 'Sarah Chen', role: 'Growth Strategist', email: 'sarah.c@orbitsocial.com', status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
      { id: 'm3', name: 'Michael Brown', role: 'Paid Social Specialist', email: 'michael.b@orbitsocial.com', status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { id: 'm4', name: 'Emma Wilson', role: 'Content Producer', email: 'emma.w@orbitsocial.com', status: 'Active', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
      { id: 'm5', name: 'David Kim', role: 'SEO Manager', email: 'david.k@orbitsocial.com', status: 'Active', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
      { id: 'm6', name: 'Sophia Martinez', role: 'Analytics Lead', email: 'sophia.m@orbitsocial.com', status: 'Active', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80' },
      { id: 'm7', name: 'James Taylor', role: 'Copywriter', email: 'james.t@orbitsocial.com', status: 'Active', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
      { id: 'm8', name: 'Olivia Chen', role: 'Community Lead', email: 'olivia.c@orbitsocial.com', status: 'Active', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' }
    ],
    businessAccounts: [
      { id: 'b1', name: 'Orbit Media Agency', type: 'Agency', status: 'Active' },
      { id: 'b2', name: 'NovaTech Solutions', type: 'Brand', status: 'Active' },
      { id: 'b3', name: 'Vertex Digital Agency', type: 'Agency', status: 'Active' },
      { id: 'b4', name: 'Apex Global Enterprise', type: 'Enterprise', status: 'Active' },
      { id: 'b5', name: 'Horizon Labs', type: 'Startup', status: 'Active' }
    ],
    campaigns: [
      { id: 'c1', name: 'Product Launch 2026', status: 'Active', platform: 'Instagram & YouTube', progress: '92%' },
      { id: 'c2', name: 'Dev Education Wave', status: 'Active', platform: 'LinkedIn', progress: '85%' },
      { id: 'c3', name: 'Thought Leadership Q1', status: 'Completed', platform: 'X (Twitter)', progress: '100%' }
    ]
  },
  {
    id: 'team-2',
    name: 'Creative Strategy Team',
    description: 'Brand storytelling, video reels, graphic asset production, and creative campaign design.',
    type: 'Agency',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150&auto=format&fit=crop&q=80',
    lead: {
      id: 'lead-2',
      name: 'Sarah Johnson',
      email: 'sarah.j@creativestrategy.io',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    createdDate: '2025-04-10',
    activeCampaignsCount: 11,
    totalReach: '2.8M',
    engagementRate: '9.4%',
    members: [
      { id: 'm21', name: 'Sarah Johnson', role: 'Creative Director', email: 'sarah.j@creativestrategy.io', status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
      { id: 'm22', name: 'Daniel Anderson', role: 'Art Director', email: 'd.anderson@creativestrategy.io', status: 'Active', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
      { id: 'm23', name: 'Chloe Bennett', role: 'Video Editor', email: 'chloe.b@creativestrategy.io', status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { id: 'm24', name: 'Liam Noah', role: 'Motion Graphic Designer', email: 'liam.n@creativestrategy.io', status: 'Active', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' }
    ],
    businessAccounts: [
      { id: 'b21', name: 'NovaTech Solutions', type: 'Brand', status: 'Active' },
      { id: 'b22', name: 'Vertex Digital Agency', type: 'Agency', status: 'Active' },
      { id: 'b23', name: 'Apex Global Enterprise', type: 'Enterprise', status: 'Active' }
    ],
    campaigns: [
      { id: 'c21', name: 'Spring Video Reels Series', status: 'Active', platform: 'YouTube Shorts', progress: '78%' },
      { id: 'c22', name: 'Brand Identity Showcase', status: 'Active', platform: 'Instagram', progress: '88%' }
    ]
  },
  {
    id: 'team-3',
    name: 'Social Performance Team',
    description: 'Data analytics, paid social ROI optimization, audience retargeting, and performance reporting.',
    type: 'Hybrid',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150&auto=format&fit=crop&q=80',
    lead: {
      id: 'lead-3',
      name: 'Michael Brown',
      email: 'michael.b@performance.org',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    createdDate: '2025-06-15',
    activeCampaignsCount: 5,
    totalReach: '950K',
    engagementRate: '7.6%',
    members: [
      { id: 'm31', name: 'Michael Brown', role: 'Performance Lead', email: 'michael.b@performance.org', status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { id: 'm32', name: 'Isabella Rossi', role: 'Analytics Specialist', email: 'isabella.r@performance.org', status: 'Active', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&auto=format&fit=crop&q=80' }
    ],
    businessAccounts: [
      { id: 'b31', name: 'BluePeak Studios', type: 'Startup', status: 'Pending' },
      { id: 'b32', name: 'Horizon Labs', type: 'Startup', status: 'Active' }
    ],
    campaigns: [
      { id: 'c31', name: 'Q1 Performance Retargeting', status: 'Active', platform: 'Facebook & X', progress: '65%' }
    ]
  },
  {
    id: 'team-4',
    name: 'Brand Campaign Team',
    description: 'Sponsorship management, influencer partnerships, and co-branded enterprise campaigns.',
    type: 'Brand',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&auto=format&fit=crop&q=80',
    lead: {
      id: 'lead-4',
      name: 'Emma Wilson',
      email: 'emma.w@brandcampaigns.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
    },
    createdDate: '2025-08-20',
    activeCampaignsCount: 8,
    totalReach: '1.9M',
    engagementRate: '8.9%',
    members: [
      { id: 'm41', name: 'Emma Wilson', role: 'Brand Partnerships Lead', email: 'emma.w@brandcampaigns.com', status: 'Active', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
      { id: 'm42', name: 'Alex Rivera', role: 'Influencer Manager', email: 'alex.r@brandcampaigns.com', status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
    ],
    businessAccounts: [
      { id: 'b41', name: 'Orbit Media Agency', type: 'Agency', status: 'Active' },
      { id: 'b42', name: 'Apex Global Enterprise', type: 'Enterprise', status: 'Active' }
    ],
    campaigns: [
      { id: 'c41', name: 'Enterprise Sponsorship Tour', status: 'Active', platform: 'LinkedIn & YouTube', progress: '94%' }
    ]
  },
  {
    id: 'team-5',
    name: 'Alpha Creator Squad',
    description: 'Specialized content creation squad handling daily educational carousel posts and short videos.',
    type: 'Internal',
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=150&auto=format&fit=crop&q=80',
    lead: {
      id: 'lead-5',
      name: 'David Kim',
      email: 'david.k@alphasquad.org',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    createdDate: '2025-10-05',
    activeCampaignsCount: 0,
    totalReach: '420K',
    engagementRate: '5.4%',
    members: [
      { id: 'm51', name: 'David Kim', role: 'Squad Leader', email: 'david.k@alphasquad.org', status: 'Active', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' }
    ],
    businessAccounts: [
      { id: 'b51', name: 'Echo Wave Media', type: 'Agency', status: 'Inactive' }
    ],
    campaigns: []
  }
]
