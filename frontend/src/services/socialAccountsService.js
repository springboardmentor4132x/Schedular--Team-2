import API from '../shared/api/api'
import { fetchSocialAccounts } from './postAdapter'

export { fetchSocialAccounts }

export const getSocialAccountConnectUrl = (platform) => {
  const user = JSON.parse(localStorage.getItem('orbit-user') || '{}')
  const userId = user.id
  return `${API.defaults.baseURL}/social-accounts/${platform}/connect?user_id=${userId}`
}

export const connectSocialAccount = async (platform) => {
  const url = getSocialAccountConnectUrl(platform)
  window.location.href = url
}

export const disconnectSocialAccount = async (id) => {
  const response = await API.delete(`/social-accounts/${id}`)
  return response.data
}

export const syncSocialAccount = async (id) => {
  const response = await API.post(`/social-accounts/${id}/sync`)
  return response.data
}
