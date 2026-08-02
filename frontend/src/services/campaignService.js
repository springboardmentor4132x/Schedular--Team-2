import API from '../shared/api/api'

export const getCampaigns = async () => {
  const response = await API.get('/campaigns/')
  return response.data
}

export const getCampaignById = async (id) => {
  const response = await API.get(`/campaigns/${id}`)
  return response.data
}

export const createCampaign = async (payload) => {
  const response = await API.post('/campaigns/', payload)
  return response.data
}

export const updateCampaign = async (id, payload) => {
  const response = await API.put(`/campaigns/${id}`, payload)
  return response.data
}

export const deleteCampaign = async (id) => {
  const response = await API.delete(`/campaigns/${id}`)
  return response.data
}

export const assignPostToCampaign = async (campaignId, postId) => {
  const response = await API.post(`/campaigns/${campaignId}/assign-post/${postId}`)
  return response.data
}

export const removePostFromCampaign = async (campaignId, postId) => {
  const response = await API.delete(`/campaigns/${campaignId}/remove-post/${postId}`)
  return response.data
}

export const getCampaignTimeline = async (id) => {
  const response = await API.get(`/campaigns/${id}/timeline`)
  return response.data
}

export const getCampaignProgress = async (id) => {
  const response = await API.get(`/campaigns/${id}/progress`)
  return response.data
}

export const getCampaignSummary = async (id) => {
  const response = await API.get(`/campaigns/${id}/summary`)
  return response.data
}
