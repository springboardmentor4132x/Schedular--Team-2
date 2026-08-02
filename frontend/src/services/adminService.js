import API from '../shared/api/api'

export const getAdminUsers = async (params) => {
  const response = await API.get('/users/', { params })
  return response.data
}

export const getAdminUser = async (id) => {
  const response = await API.get(`/users/${id}`)
  return response.data
}

export const updateAdminUser = async (id, payload) => {
  const response = await API.put(`/users/${id}`, payload)
  return response.data
}

export const deleteAdminUser = async (id) => {
  const response = await API.delete(`/users/${id}`)
  return response.data
}

export const registerAdminUser = async (payload) => {
  const response = await API.post('/auth/register', payload)
  return response.data
}

export const getAdminStats = async () => {
  const response = await API.get('/admin/stats')
  return response.data
}

export const getAdminActivity = async () => {
  const response = await API.get('/admin/activity')
  return response.data
}
