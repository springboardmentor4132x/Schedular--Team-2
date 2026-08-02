import API from '../shared/api/api'

export const marketingService = {
  dashboard: async () => (await API.get('/marketing/dashboard')).data,
  clients: async () => (await API.get('/marketing/clients')).data,
  workspace: async (clientId) => (await API.get(`/marketing/clients/${clientId}/workspace`)).data,
  createPost: async (clientId, payload) => (await API.post(`/marketing/clients/${clientId}/posts`, payload)).data,
  updatePost: async (clientId, postId, payload) => (await API.put(`/marketing/clients/${clientId}/posts/${postId}`, payload)).data,
  createCampaign: async (clientId, payload) => (await API.post(`/marketing/clients/${clientId}/campaigns`, payload)).data,
  workRequests: async () => (await API.get('/marketing/work-requests')).data,
  decideWorkRequest: async (id, status, decisionNote = '') => (await API.post(`/marketing/work-requests/${id}/decision`, { status, decision_note: decisionNote })).data,
  connectionRequests: async () => (await API.get('/marketing/connection-requests')).data,
  decideConnectionRequest: async (id, status, decisionNote = '') => (await API.post(`/marketing/connection-requests/${id}/decision`, { status, decision_note: decisionNote })).data,
  analytics: async (clientId, params = {}) => (await API.get('/marketing/analytics', { params: { ...params, ...(clientId ? { client_id: clientId } : {}) } })).data,
  reports: async () => (await API.get('/marketing/reports')).data,
}
