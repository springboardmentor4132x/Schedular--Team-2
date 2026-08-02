import API from '../../../shared/api/api'

const normalizeAnalytics = (analytics = {}) => ({
  ...analytics,
  weekly: (analytics.weekly ?? []).map(item => ({ day: item.label, posts: item.posts ?? 0 })),
  platformSplit: analytics.platformSplit ?? analytics.platform_split ?? [],
})

const todayIso = () => new Date().toISOString().split('T')[0]

export const fetchBusinessDashboard = async () => {
  const response = await API.get('/business/dashboard')
  return {
    ...response.data,
    analytics: normalizeAnalytics(response.data?.analytics),
  }
}

export const fetchBusinessAnalytics = async (params = {}) => {
  const response = await API.get('/business/analytics', { params })
  return response.data
}

export const fetchCampaigns = async (params = {}) => {
  const response = await API.get('/business/campaigns', { params })
  return response.data
}

export const fetchCampaignProgress = async (campaignId) => {
  const response = await API.get(`/business/campaigns/${campaignId}/progress`)
  return response.data
}

export const fetchCampaignSummary = async (campaignId) => {
  const response = await API.get(`/business/campaigns/${campaignId}/progress`)
  return response.data
}

export const fetchScheduledPosts = async (params = {}) => {
  const response = await API.get('/business/posts/scheduled', { params })
  return response.data
}

export const fetchPublishedPosts = async (params = {}) => {
  const response = await API.get('/business/posts', { params })
  return response.data
}

export const fetchReports = async (params = {}) => {
  const [campaignsResponse, postsResponse, dashboardResponse] = await Promise.all([
    API.get('/business/campaigns', { params }),
    API.get('/business/posts', { params }),
    API.get('/business/dashboard'),
  ])

  const campaigns = campaignsResponse.data ?? []
  const posts = postsResponse.data ?? []
  const dashboard = dashboardResponse.data ?? {}

  const published = posts.filter(post => String(post.status ?? '').toLowerCase() === 'published')
  const scheduled = posts.filter(post => ['scheduled', 'queued'].includes(String(post.status ?? '').toLowerCase()))
  const drafts = posts.filter(post => String(post.status ?? '').toLowerCase() === 'draft')
  const activeCampaigns = campaigns.filter(campaign => String(campaign.status ?? '').toLowerCase() === 'active')

  return [
    {
      id: 'monthly-summary',
      title: `${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })} Content Summary`,
      type: 'monthly',
      period: 'Current month',
      generatedAt: todayIso(),
      posts: posts.length,
      publishedPosts: published.length,
      scheduledPosts: scheduled.length,
      draftPosts: drafts.length,
      campaigns: campaigns.length,
      activeCampaigns: activeCampaigns.length,
      status: 'ready',
      analytics: dashboard.analytics ?? {},
    },
    ...activeCampaigns.slice(0, 3).map(campaign => ({
      id: campaign.id,
      title: `${campaign.name} Campaign Summary`,
      type: 'campaign',
      period: `${campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Start'} – ${campaign.end_date ? new Date(campaign.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'End'}`,
      generatedAt: todayIso(),
      posts: posts.filter(post => post.campaign_id === campaign.id).length,
      publishedPosts: posts.filter(post => post.campaign_id === campaign.id && String(post.status ?? '').toLowerCase() === 'published').length,
      scheduledPosts: posts.filter(post => post.campaign_id === campaign.id && ['scheduled', 'queued'].includes(String(post.status ?? '').toLowerCase())).length,
      draftPosts: posts.filter(post => post.campaign_id === campaign.id && String(post.status ?? '').toLowerCase() === 'draft').length,
      campaigns: 1,
      activeCampaigns: 1,
      status: 'ready',
    })),
  ]
}

export const fetchMarketingActivity = async () => {
  const response = await API.get('/business/marketing-activity')
  return response.data
}

export const fetchAssignedTeam = async () => {
  const response = await API.get('/business/assigned-team')
  return response.data
}

export const fetchMarketingTeams = async () => {
  const response = await API.get('/business/marketing-teams')
  return response.data?.teams ?? []
}

export const fetchWorkRequests = async () => (await API.get('/business/work-requests')).data
export const submitWorkRequest = async (details) => (await API.post('/business/work-requests', { details })).data

export const requestMarketingTeam = async (teamId) => {
  const response = await API.post('/business/request-marketing-team', { team_id: teamId })
  return response.data
}

export const fetchTeamRequests = async () => {
  const response = await API.get('/business/team-requests')
  return response.data
}

export const cancelTeamRequest = async (requestId) => {
  const response = await API.post(`/business/team-requests/${requestId}/cancel`)
  return response.data
}

export const removeMarketingTeam = async () => {
  const response = await API.post('/business/remove-marketing-team')
  return response.data
}

export const fetchClientRequirements = async () => {
  const response = await API.get('/business/client-requirements')
  return response.data
}

export const submitClientRequirements = async (data) => {
  const response = await API.post('/business/client-requirements', data)
  return response.data
}

export const fetchBrandGuidelines = async () => {
  const response = await API.get('/business/brand-guidelines')
  return response.data
}

export const saveBrandGuidelines = async (details) => {
  const response = await API.put('/business/brand-guidelines', { details })
  return response.data
}

export const fetchSocialAccounts = async () => {
  const response = await API.get('/social-accounts/')
  return response.data
}
