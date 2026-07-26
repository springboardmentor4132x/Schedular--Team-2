/**
 * mockData.js
 * Centralised mock data + Axios-ready API service layer.
 *
 * Every function mirrors the shape of the real FastAPI endpoint it
 * will eventually call.  Swap the `return Promise.resolve(...)` lines
 * with `return api.get('/...')` when the backend is ready.
 *
 * Usage:
 *   import { campaignsApi } from '../services/mockData'
 *   const campaigns = await campaignsApi.getAll()
 */

import axios from 'axios'

// ── Axios instance ────────────────────────────────────────────────
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use(cfg => {
  const user = JSON.parse(localStorage.getItem('orbit-user') ?? 'null')
  if (user?.token) cfg.headers.Authorization = `Bearer ${user.token}`
  return cfg
})

// ─────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────

export const MOCK_CONNECTED_ACCOUNTS = [
  { id: 1, platform: 'instagram', username: '@orbitsocial',     followers: '12.4K', status: 'connected', lastSync: '2 min ago' },
  { id: 2, platform: 'facebook',  username: 'OrbitSocial Page', followers: '8.2K',  status: 'connected', lastSync: '5 min ago' },
  { id: 3, platform: 'linkedin',  username: 'OrbitSocial Inc.', followers: '4.1K',  status: 'warning',   lastSync: '3 hours ago' },
  { id: 4, platform: 'x',         username: null,               followers: null,    status: 'disconnected', lastSync: null },
  { id: 5, platform: 'youtube',   username: null,               followers: null,    status: 'disconnected', lastSync: null },
  { id: 6, platform: 'pinterest', username: null,               followers: null,    status: 'disconnected', lastSync: null },
]

export const MOCK_CAMPAIGNS = [
  { id: 1, name: 'Summer Sale 2025',   objective: 'Brand Awareness', budget: 2400, spent: 1632, status: 'active',     start: '2025-07-01', end: '2025-07-31', progress: 68, posts: 24, reach: 48000 },
  { id: 2, name: 'Product Launch Q3',  objective: 'Lead Generation', budget: 5000, spent: 1700, status: 'active',     start: '2025-07-15', end: '2025-08-31', progress: 34, posts: 12, reach: 21000 },
  { id: 3, name: 'Brand Awareness',    objective: 'Reach',           budget: 1200, spent: 972,  status: 'paused',     start: '2025-06-01', end: '2025-07-30', progress: 81, posts: 36, reach: 72000 },
  { id: 4, name: 'Holiday Promo 2024', objective: 'Sales',           budget: 3500, spent: 3500, status: 'completed',  start: '2024-12-01', end: '2024-12-31', progress: 100, posts: 48, reach: 96000 },
]

export const MOCK_SCHEDULED_POSTS = [
  { id: 1, title: 'Summer Sale Kick-off',       platform: 'instagram', scheduledAt: '2025-07-24T10:00', status: 'scheduled', campaign: 'Summer Sale 2025',   caption: 'Our biggest sale starts NOW! 🔥 Up to 50% off all products.', media: true  },
  { id: 2, title: 'LinkedIn Thought Leadership', platform: 'linkedin',  scheduledAt: '2025-07-24T09:00', status: 'scheduled', campaign: null,                  caption: '5 lessons we learned scaling our social media strategy from 0 to 50K.', media: false },
  { id: 3, title: 'Product Teaser Video',        platform: 'instagram', scheduledAt: '2025-07-25T14:00', status: 'scheduled', campaign: 'Product Launch Q3',   caption: 'Something big is coming. Stay tuned. 👀',                     media: true  },
  { id: 4, title: 'Facebook Campaign Ad',        platform: 'facebook',  scheduledAt: '2025-07-25T11:30', status: 'scheduled', campaign: 'Brand Awareness',     caption: 'Connect with your audience using OrbitSocial.',               media: true  },
  { id: 5, title: 'X Thread Recap',              platform: 'x',         scheduledAt: '2025-07-26T16:00', status: 'scheduled', campaign: null,                  caption: 'Thread: How we grew our Instagram by 300% in 6 months 🧵',   media: false },
  { id: 6, title: 'Customer Spotlight',          platform: 'facebook',  scheduledAt: '2025-07-28T09:30', status: 'scheduled', campaign: null,                  caption: 'Meet @customerhandle — their results speak for themselves.',   media: true  },
  { id: 7, title: 'Weekly Tips Carousel',        platform: 'instagram', scheduledAt: '2025-07-28T12:00', status: 'scheduled', campaign: 'Summer Sale 2025',   caption: '5 social media tips that will transform your engagement.',     media: true  },
  { id: 8, title: 'Monday Motivation Post',      platform: 'x',         scheduledAt: '2025-07-28T08:00', status: 'pending',   campaign: null,                  caption: 'Start your week strong. You\'ve got this. 💪',                 media: false },
]

export const MOCK_PUBLISHED_POSTS = [
  { id: 1,  title: 'Summer Sale Announcement',  platform: 'instagram', publishedAt: '2025-07-20T10:02', campaign: 'Summer Sale 2025',  reach: 6700, engagement: 520, likes: 312, shares: 48, comments: 160, clicks: 89  },
  { id: 2,  title: 'LinkedIn Thought Post',     platform: 'linkedin',  publishedAt: '2025-07-20T09:05', campaign: null,                reach: 1800, engagement: 120, likes: 98,  shares: 22, comments: 0,   clicks: 45  },
  { id: 3,  title: 'X Thread Recap',            platform: 'x',         publishedAt: '2025-07-19T16:00', campaign: null,                reach: 3100, engagement: 290, likes: 201, shares: 89, comments: 0,   clicks: 0   },
  { id: 4,  title: 'Customer Spotlight',        platform: 'facebook',  publishedAt: '2025-07-17T09:30', campaign: 'Brand Awareness',  reach: 5600, engagement: 430, likes: 287, shares: 61, comments: 82,  clicks: 134 },
  { id: 5,  title: 'Weekly Tips Carousel',      platform: 'instagram', publishedAt: '2025-07-14T12:00', campaign: 'Summer Sale 2025',  reach: 6200, engagement: 480, likes: 398, shares: 42, comments: 40,  clicks: 72  },
  { id: 6,  title: 'Blog Post Promo',           platform: 'linkedin',  publishedAt: '2025-07-14T08:15', campaign: null,                reach: 1900, engagement: 145, likes: 103, shares: 42, comments: 0,   clicks: 67  },
  { id: 7,  title: 'Weekend Contest Post',      platform: 'x',         publishedAt: '2025-07-13T10:00', campaign: 'Brand Awareness',  reach: 8900, engagement: 670, likes: 512, shares: 158, comments: 0,  clicks: 0   },
  { id: 8,  title: 'Product Feature Post',      platform: 'linkedin',  publishedAt: '2025-07-18T08:00', campaign: 'Product Launch Q3', reach: 2400, engagement: 198, likes: 156, shares: 42, comments: 0,  clicks: 89  },
  { id: 9,  title: 'Facebook Campaign Ad',      platform: 'facebook',  publishedAt: '2025-07-12T11:00', campaign: 'Brand Awareness',  reach: 4200, engagement: 340, likes: 198, shares: 72, comments: 70,  clicks: 210 },
  { id: 10, title: 'Brand Story Reel',          platform: 'instagram', publishedAt: '2025-07-10T15:00', campaign: null,                reach: 9800, engagement: 820, likes: 641, shares: 103, comments: 76, clicks: 148 },
]

export const MOCK_MARKETING_TEAMS = [
  {
    id: 1,
    name: 'Digital Spark Agency',
    logo: 'DS',
    logoColor: '#1E3A8A',
    description: 'Full-service digital marketing agency specialising in social media growth and brand storytelling.',
    rating: 4.9,
    reviews: 128,
    expertise: ['Social Media', 'Content Strategy', 'Brand Identity', 'Video Production'],
    platforms: ['instagram', 'facebook', 'linkedin', 'x', 'youtube'],
    clients: 42,
    campaigns: 186,
    location: 'San Francisco, CA',
    responseTime: '< 2 hours',
    assignedSince: '2025-01-15',
    isAssigned: true,
  },
  {
    id: 2,
    name: 'Pixel & Prose',
    logo: 'PP',
    logoColor: '#4F46E5',
    description: 'Creative content studio focused on B2B brands looking to elevate their LinkedIn and thought leadership presence.',
    rating: 4.7,
    reviews: 89,
    expertise: ['LinkedIn', 'B2B Marketing', 'Copywriting', 'Lead Generation'],
    platforms: ['linkedin', 'x', 'facebook'],
    clients: 28,
    campaigns: 94,
    location: 'New York, NY',
    responseTime: '< 4 hours',
    assignedSince: null,
    isAssigned: false,
  },
  {
    id: 3,
    name: 'Social Orbit Studio',
    logo: 'SO',
    logoColor: '#E1306C',
    description: 'Instagram and TikTok-first creative studio producing scroll-stopping content for consumer brands.',
    rating: 4.8,
    reviews: 213,
    expertise: ['Instagram', 'Short-form Video', 'Influencer Marketing', 'E-Commerce'],
    platforms: ['instagram', 'facebook', 'youtube'],
    clients: 67,
    campaigns: 312,
    location: 'Los Angeles, CA',
    responseTime: '< 1 hour',
    assignedSince: null,
    isAssigned: false,
  },
  {
    id: 4,
    name: 'Brandwave Co.',
    logo: 'BW',
    logoColor: '#0A66C2',
    description: 'Data-driven marketing team specialising in cross-platform campaigns and performance analytics.',
    rating: 4.6,
    reviews: 74,
    expertise: ['Analytics', 'Paid Social', 'Retargeting', 'Reporting'],
    platforms: ['facebook', 'linkedin', 'instagram', 'x'],
    clients: 31,
    campaigns: 147,
    location: 'Austin, TX',
    responseTime: '< 6 hours',
    assignedSince: null,
    isAssigned: false,
  },
  {
    id: 5,
    name: 'Momentum Media',
    logo: 'MM',
    logoColor: '#22C55E',
    description: 'Growth-focused team with a track record of scaling engagement for SaaS and technology companies.',
    rating: 4.5,
    reviews: 56,
    expertise: ['SaaS Marketing', 'Twitter/X', 'Community Building', 'Product Launches'],
    platforms: ['x', 'linkedin', 'facebook'],
    clients: 19,
    campaigns: 83,
    location: 'Chicago, IL',
    responseTime: '< 3 hours',
    assignedSince: null,
    isAssigned: false,
  },
  {
    id: 6,
    name: 'Creativa Hub',
    logo: 'CH',
    logoColor: '#F59E0B',
    description: 'Boutique agency specialising in visual storytelling, Pinterest campaigns and e-commerce social strategies.',
    rating: 4.4,
    reviews: 41,
    expertise: ['Pinterest', 'Visual Design', 'E-Commerce', 'Lifestyle Brands'],
    platforms: ['pinterest', 'instagram', 'facebook'],
    clients: 14,
    campaigns: 58,
    location: 'Miami, FL',
    responseTime: '< 8 hours',
    assignedSince: null,
    isAssigned: false,
  },
]

export const MOCK_ANALYTICS = {
  overview: { reach: 61000, engagement: 9200, impressions: 89000, clicks: 4100, shares: 1800, followers: 12400 },
  weekly: [
    { day: 'Mon', reach: 1800, engagement: 340 },
    { day: 'Tue', reach: 2200, engagement: 520 },
    { day: 'Wed', reach: 1900, engagement: 410 },
    { day: 'Thu', reach: 2800, engagement: 670 },
    { day: 'Fri', reach: 2400, engagement: 590 },
    { day: 'Sat', reach: 2100, engagement: 480 },
    { day: 'Sun', reach: 3100, engagement: 760 },
  ],
  monthly: [
    { month: 'Jan', reach: 32000, engagement: 4800 },
    { month: 'Feb', reach: 28000, engagement: 4200 },
    { month: 'Mar', reach: 41000, engagement: 6100 },
    { month: 'Apr', reach: 38000, engagement: 5700 },
    { month: 'May', reach: 52000, engagement: 7800 },
    { month: 'Jun', reach: 47000, engagement: 7100 },
    { month: 'Jul', reach: 61000, engagement: 9200 },
  ],
  platformSplit: [
    { name: 'Instagram', value: 38, color: '#E1306C' },
    { name: 'Facebook',  value: 24, color: '#1877F2' },
    { name: 'LinkedIn',  value: 19, color: '#0A66C2' },
    { name: 'X',         value: 19, color: '#374151' },
  ],
}

export const MOCK_REPORTS = [
  {
    id: 1,
    title: 'July 2025 Performance Report',
    type: 'monthly',
    period: 'July 2025',
    generatedAt: '2025-07-20',
    reach: 61000, engagement: 9200, posts: 24, campaigns: 3,
    status: 'ready',
  },
  {
    id: 2,
    title: 'June 2025 Performance Report',
    type: 'monthly',
    period: 'June 2025',
    generatedAt: '2025-06-30',
    reach: 47000, engagement: 7100, posts: 18, campaigns: 2,
    status: 'ready',
  },
  {
    id: 3,
    title: 'Summer Sale 2025 — Campaign Report',
    type: 'campaign',
    period: 'Jul 1 – Jul 31 2025',
    generatedAt: '2025-07-20',
    reach: 48000, engagement: 6800, posts: 24, campaigns: 1,
    status: 'ready',
  },
  {
    id: 4,
    title: 'Product Launch Q3 — Campaign Report',
    type: 'campaign',
    period: 'Jul 15 – Aug 31 2025',
    generatedAt: '2025-07-20',
    reach: 21000, engagement: 2900, posts: 12, campaigns: 1,
    status: 'in_progress',
  },
  {
    id: 5,
    title: 'May 2025 Performance Report',
    type: 'monthly',
    period: 'May 2025',
    generatedAt: '2025-05-31',
    reach: 52000, engagement: 7800, posts: 22, campaigns: 2,
    status: 'ready',
  },
]

// ─────────────────────────────────────────────────────────────────
// API SERVICE FUNCTIONS
// Each wraps mock data now; replace body with real axios call later
// ─────────────────────────────────────────────────────────────────

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

export const connectedAccountsApi = {
  getAll:       async ()     => { await delay(); return [...MOCK_CONNECTED_ACCOUNTS] },
  connect:      async (id)   => { await delay(); return { id, status: 'connected' } },
  disconnect:   async (id)   => { await delay(); return { id, status: 'disconnected' } },
  sync:         async (id)   => { await delay(1800); return { id, lastSync: 'Just now', status: 'connected' } },
  // Real: return api.get('/social-accounts')
}

export const campaignsApi = {
  getAll:   async ()       => { await delay(); return [...MOCK_CAMPAIGNS] },
  getById:  async (id)     => { await delay(); return MOCK_CAMPAIGNS.find(c => c.id === id) ?? null },
  create:   async (data)   => { await delay(); return { ...data, id: Date.now(), progress: 0 } },
  update:   async (id, d)  => { await delay(); return { id, ...d } },
  archive:  async (id)     => { await delay(); return { id, status: 'completed' } },
  // Real: return api.get('/campaigns')
}

export const scheduledPostsApi = {
  getAll:   async ()   => { await delay(); return [...MOCK_SCHEDULED_POSTS] },
  getById:  async (id) => { await delay(); return MOCK_SCHEDULED_POSTS.find(p => p.id === id) ?? null },
  // Real: return api.get('/posts/scheduled')
}

export const publishedPostsApi = {
  getAll:   async ()   => { await delay(); return [...MOCK_PUBLISHED_POSTS] },
  getById:  async (id) => { await delay(); return MOCK_PUBLISHED_POSTS.find(p => p.id === id) ?? null },
  // Real: return api.get('/posts/published')
}

export const marketingTeamsApi = {
  getAll:   async ()     => { await delay(); return [...MOCK_MARKETING_TEAMS] },
  assign:   async (id)   => { await delay(); return { id, isAssigned: true } },
  unassign: async (id)   => { await delay(); return { id, isAssigned: false } },
  // Real: return api.get('/marketing-teams')
}

export const analyticsApi = {
  getOverview: async ()       => { await delay(); return { ...MOCK_ANALYTICS.overview } },
  getWeekly:   async ()       => { await delay(); return [...MOCK_ANALYTICS.weekly] },
  getMonthly:  async ()       => { await delay(); return [...MOCK_ANALYTICS.monthly] },
  getPlatform: async ()       => { await delay(); return [...MOCK_ANALYTICS.platformSplit] },
  // Real: return api.get('/analytics/overview')
}

export const reportsApi = {
  getAll:    async ()     => { await delay(); return [...MOCK_REPORTS] },
  getById:   async (id)   => { await delay(); return MOCK_REPORTS.find(r => r.id === id) ?? null },
  generate:  async (type) => { await delay(1200); return { id: Date.now(), type, status: 'ready' } },
  // Real: return api.post('/reports/generate', { type })
}

// ─────────────────────────────────────────────────────────────────
// MARKETING TEAM MOCK DATA
// ─────────────────────────────────────────────────────────────────

export const MOCK_CLIENTS = [
  {
    id: 1,
    name: 'OrbitSocial Inc.',
    logo: 'OS',
    logoColor: '#1E3A8A',
    industry: 'Technology',
    email: 'hello@orbitsocial.app',
    website: 'https://orbitsocial.app',
    location: 'San Francisco, CA',
    status: 'active',
    connectedPlatforms: ['instagram', 'facebook', 'linkedin', 'x'],
    activeCampaigns: 2,
    scheduledPosts: 8,
    publishedPosts: 187,
    draftPosts: 9,
    joinedAt: '2025-01-15',
    lastActivity: '2 min ago',
  },
  {
    id: 2,
    name: 'BlueWave Retail',
    logo: 'BW',
    logoColor: '#0A66C2',
    industry: 'E-Commerce',
    email: 'marketing@bluewave.com',
    website: 'https://bluewave.com',
    location: 'New York, NY',
    status: 'active',
    connectedPlatforms: ['instagram', 'facebook', 'pinterest'],
    activeCampaigns: 3,
    scheduledPosts: 14,
    publishedPosts: 243,
    draftPosts: 6,
    joinedAt: '2025-02-10',
    lastActivity: '1 hour ago',
  },
  {
    id: 3,
    name: 'GreenPath Finance',
    logo: 'GF',
    logoColor: '#22C55E',
    industry: 'Finance',
    email: 'digital@greenpath.io',
    website: 'https://greenpath.io',
    location: 'Chicago, IL',
    status: 'active',
    connectedPlatforms: ['linkedin', 'x', 'facebook'],
    activeCampaigns: 1,
    scheduledPosts: 5,
    publishedPosts: 98,
    draftPosts: 3,
    joinedAt: '2025-03-05',
    lastActivity: '3 hours ago',
  },
  {
    id: 4,
    name: 'Apex Fitness',
    logo: 'AF',
    logoColor: '#EF4444',
    industry: 'Health & Wellness',
    email: 'social@apexfitness.com',
    website: 'https://apexfitness.com',
    location: 'Los Angeles, CA',
    status: 'paused',
    connectedPlatforms: ['instagram', 'youtube', 'facebook'],
    activeCampaigns: 0,
    scheduledPosts: 0,
    publishedPosts: 56,
    draftPosts: 12,
    joinedAt: '2025-04-01',
    lastActivity: '2 days ago',
  },
  {
    id: 5,
    name: 'Stellar SaaS',
    logo: 'SS',
    logoColor: '#4F46E5',
    industry: 'Technology',
    email: 'growth@stellarsaas.com',
    website: 'https://stellarsaas.com',
    location: 'Austin, TX',
    status: 'active',
    connectedPlatforms: ['linkedin', 'x'],
    activeCampaigns: 1,
    scheduledPosts: 4,
    publishedPosts: 71,
    draftPosts: 2,
    joinedAt: '2025-05-12',
    lastActivity: '5 hours ago',
  },
]

export const MOCK_CLIENT_CAMPAIGNS = {
  1: [
    { id: 101, name: 'Summer Sale 2025',   objective: 'Brand Awareness', budget: 2400, spent: 1632, status: 'active',    start: '2025-07-01', end: '2025-07-31', progress: 68, posts: 24, reach: 48000 },
    { id: 102, name: 'Product Launch Q3',  objective: 'Lead Generation', budget: 5000, spent: 1700, status: 'active',    start: '2025-07-15', end: '2025-08-31', progress: 34, posts: 12, reach: 21000 },
    { id: 103, name: 'Brand Awareness',    objective: 'Reach',           budget: 1200, spent: 972,  status: 'paused',    start: '2025-06-01', end: '2025-07-30', progress: 81, posts: 36, reach: 72000 },
    { id: 104, name: 'Holiday Promo 2024', objective: 'Sales',           budget: 3500, spent: 3500, status: 'completed', start: '2024-12-01', end: '2024-12-31', progress: 100, posts: 48, reach: 96000 },
  ],
  2: [
    { id: 201, name: 'Summer Collection',  objective: 'Sales',           budget: 3000, spent: 1200, status: 'active',    start: '2025-07-01', end: '2025-08-15', progress: 40, posts: 18, reach: 35000 },
    { id: 202, name: 'Back to School',     objective: 'Engagement',      budget: 1800, spent: 600,  status: 'active',    start: '2025-08-01', end: '2025-09-01', progress: 22, posts: 8,  reach: 14000 },
    { id: 203, name: 'Flash Sale Event',   objective: 'Sales',           budget: 800,  spent: 800,  status: 'completed', start: '2025-06-15', end: '2025-06-20', progress: 100, posts: 12, reach: 28000 },
  ],
  3: [
    { id: 301, name: 'Q3 Investor Outreach', objective: 'Lead Generation', budget: 2000, spent: 800, status: 'active',  start: '2025-07-01', end: '2025-09-30', progress: 28, posts: 6,  reach: 9000 },
  ],
  4: [],
  5: [
    { id: 501, name: 'Product Hunt Launch', objective: 'Awareness',      budget: 1500, spent: 450,  status: 'active',   start: '2025-07-20', end: '2025-08-20', progress: 15, posts: 4,  reach: 6000 },
  ],
}

export const MOCK_CLIENT_POSTS = {
  1: {
    drafts: [
      { id: 'd1', title: 'Summer Sale Announcement', platform: 'instagram', caption: 'Our biggest sale starts NOW! 🔥', tags: ['sale','summer'], updatedAt: '2h ago', media: true,  status: 'draft'    },
      { id: 'd2', title: 'Product Feature Spotlight', platform: 'linkedin',  caption: 'Introducing our latest feature...', tags: ['product'], updatedAt: '5h ago', media: false, status: 'draft'    },
      { id: 'd3', title: 'Customer Success Story',   platform: 'facebook',  caption: 'See how @company achieved 300% growth...', tags: ['testimonial'], updatedAt: 'Yesterday', media: true, status: 'review' },
    ],
    scheduled: [
      { id: 's1', title: 'Summer Sale Kick-off',       platform: 'instagram', scheduledAt: '2025-07-24T10:00', status: 'scheduled', campaign: 'Summer Sale 2025', caption: 'Our biggest sale!',  media: true  },
      { id: 's2', title: 'LinkedIn Thought Leadership', platform: 'linkedin',  scheduledAt: '2025-07-24T09:00', status: 'scheduled', campaign: null,              caption: '5 lessons learned...', media: false },
      { id: 's3', title: 'Product Teaser Video',       platform: 'instagram', scheduledAt: '2025-07-25T14:00', status: 'pending',   campaign: 'Product Launch Q3', caption: 'Something big!',    media: true  },
      { id: 's4', title: 'Facebook Campaign Ad',       platform: 'facebook',  scheduledAt: '2025-07-25T11:30', status: 'scheduled', campaign: 'Brand Awareness', caption: 'Connect with us.',   media: true  },
    ],
    published: [
      { id: 'p1', title: 'Summer Sale Announcement', platform: 'instagram', publishedAt: '2025-07-20T10:02', reach: 6700, engagement: 520, likes: 312, shares: 48  },
      { id: 'p2', title: 'LinkedIn Thought Post',    platform: 'linkedin',  publishedAt: '2025-07-20T09:05', reach: 1800, engagement: 120, likes: 98,  shares: 22  },
      { id: 'p3', title: 'X Thread Recap',           platform: 'x',         publishedAt: '2025-07-19T16:00', reach: 3100, engagement: 290, likes: 201, shares: 89  },
      { id: 'p4', title: 'Customer Spotlight',       platform: 'facebook',  publishedAt: '2025-07-17T09:30', reach: 5600, engagement: 430, likes: 287, shares: 61  },
    ],
  },
  2: {
    drafts: [
      { id: 'd1', title: 'New Arrivals Post',     platform: 'instagram', caption: 'New summer arrivals just dropped! 🌊', tags: ['fashion'], updatedAt: '1h ago',  media: true,  status: 'draft' },
      { id: 'd2', title: 'Pinterest Board Promo', platform: 'pinterest', caption: 'Style your summer with BlueWave.',      tags: ['style'],   updatedAt: '3h ago',  media: true,  status: 'review' },
    ],
    scheduled: [
      { id: 's1', title: 'Summer Collection Drop', platform: 'instagram', scheduledAt: '2025-07-24T12:00', status: 'scheduled', campaign: 'Summer Collection', caption: 'New arrivals!', media: true },
      { id: 's2', title: 'Facebook Sale Ad',       platform: 'facebook',  scheduledAt: '2025-07-25T09:00', status: 'scheduled', campaign: 'Summer Collection', caption: 'Save 30%!',    media: true },
    ],
    published: [
      { id: 'p1', title: 'Spring Collection Wrap', platform: 'instagram', publishedAt: '2025-07-18T10:00', reach: 9200, engagement: 780, likes: 620, shares: 94 },
      { id: 'p2', title: 'Customer Review Pin',    platform: 'pinterest', publishedAt: '2025-07-16T14:00', reach: 4100, engagement: 320, likes: 210, shares: 48 },
    ],
  },
  3: {
    drafts: [
      { id: 'd1', title: 'Q3 Investment Tips', platform: 'linkedin', caption: '5 things every investor should know...', tags: ['finance','tips'], updatedAt: '2h ago', media: false, status: 'draft' },
    ],
    scheduled: [
      { id: 's1', title: 'Market Update Thread', platform: 'x',       scheduledAt: '2025-07-24T08:00', status: 'scheduled', campaign: 'Q3 Investor Outreach', caption: 'Market update!', media: false },
      { id: 's2', title: 'LinkedIn Article',     platform: 'linkedin', scheduledAt: '2025-07-26T10:00', status: 'scheduled', campaign: null,                  caption: 'Insights...',   media: false },
    ],
    published: [
      { id: 'p1', title: 'Q2 Market Recap',   platform: 'linkedin', publishedAt: '2025-07-15T09:00', reach: 2100, engagement: 180, likes: 140, shares: 40 },
    ],
  },
  4: { drafts: [], scheduled: [], published: [] },
  5: {
    drafts: [
      { id: 'd1', title: 'Feature Announcement', platform: 'linkedin', caption: 'Excited to share our latest...', tags: ['saas','product'], updatedAt: '4h ago', media: true, status: 'draft' },
    ],
    scheduled: [
      { id: 's1', title: 'Product Hunt Post', platform: 'x',       scheduledAt: '2025-07-24T15:00', status: 'scheduled', campaign: 'Product Hunt Launch', caption: 'We are live!', media: true },
    ],
    published: [
      { id: 'p1', title: 'Launch Announcement', platform: 'linkedin', publishedAt: '2025-07-20T08:00', reach: 3400, engagement: 290, likes: 230, shares: 60 },
    ],
  },
}

export const MOCK_CLIENT_ANALYTICS = {
  1: { reach: 61000, engagement: 9200, impressions: 89000, clicks: 4100, shares: 1800, followers: 12400 },
  2: { reach: 48000, engagement: 7400, impressions: 72000, clicks: 3200, shares: 1400, followers: 18200 },
  3: { reach: 12000, engagement: 1800, impressions: 19000, clicks: 800,  shares: 320,  followers: 4100  },
  4: { reach: 8400,  engagement: 920,  impressions: 11000, clicks: 400,  shares: 160,  followers: 6700  },
  5: { reach: 9800,  engagement: 1200, impressions: 14000, clicks: 680,  shares: 290,  followers: 3200  },
}

// API service functions for Marketing Team
export const clientsApi = {
  getAll:     async ()     => { await delay(); return [...MOCK_CLIENTS] },
  getById:    async (id)   => { await delay(); return MOCK_CLIENTS.find(c => c.id === id) ?? null },
  // Real: return api.get('/clients')
}

export const clientCampaignsApi = {
  getByClient:  async (clientId) => { await delay(); return [...(MOCK_CLIENT_CAMPAIGNS[clientId] ?? [])] },
  create:       async (clientId, data) => { await delay(); return { ...data, id: Date.now(), progress: 0, spent: 0 } },
  update:       async (id, data) => { await delay(); return { id, ...data } },
  delete:       async (id) => { await delay(); return { id, deleted: true } },
  // Real: return api.get(`/clients/${clientId}/campaigns`)
}

export const clientPostsApi = {
  getByClient:  async (clientId) => { await delay(); return { ...(MOCK_CLIENT_POSTS[clientId] ?? { drafts: [], scheduled: [], published: [] }) } },
  // Real: return api.get(`/clients/${clientId}/posts`)
}

export const clientAnalyticsApi = {
  getByClient:  async (clientId) => { await delay(); return { ...(MOCK_CLIENT_ANALYTICS[clientId] ?? {}) } },
  // Real: return api.get(`/clients/${clientId}/analytics`)
}
