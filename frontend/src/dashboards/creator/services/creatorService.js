import API from '../../../shared/api/api'
import {
  fetchSocialAccounts,
  getSocialAccountConnectUrl,
  connectSocialAccount,
  disconnectSocialAccount,
  syncSocialAccount,
} from '../../../services/socialAccountsService'

export {
  fetchSocialAccounts,
  getSocialAccountConnectUrl,
  connectSocialAccount,
  disconnectSocialAccount,
  syncSocialAccount,
}

export const getMe = async () => {
  const response = await API.get('/auth/me')
  return response.data
}

export const updateMe = async (payload) => {
  const response = await API.put('/auth/me', payload)
  return response.data
}

export const changePassword = async (payload) => {
  const response = await API.post('/auth/change-password', payload)
  return response.data
}

export const getSettings = async () => {
  const response = await API.get('/settings/')
  return response.data
}

export const updateSettings = async (payload) => {
  const response = await API.put('/settings/', payload)
  return response.data
}
