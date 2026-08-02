import API from '../shared/api/api'

export const getPosts = async () => {
  const response = await API.get('/posts/')
  return response.data
}

export const getPostById = async (id) => {
  const response = await API.get(`/posts/${id}`)
  return response.data
}

export const createPost = async (payload) => {
  const response = await API.post('/posts/', payload)
  return response.data
}

export const schedulePost = async (payload) => {
  const response = await API.post('/posts/schedule', payload)
  return response.data
}

export const saveDraft = async (payload) => {
  const response = await API.post('/posts/save-draft', payload)
  return response.data
}

export const uploadMedia = async (file, onUploadProgress) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await API.post('/posts/upload-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
  return response.data
}

export const getScheduledPosts = async () => {
  const response = await API.get('/posts/scheduled')
  return response.data
}

export const getPublishingCalendar = async () => {
  const response = await API.get('/posts/calendar')
  return response.data
}

export const getPublishingQueue = async () => {
  const response = await API.get('/posts/queue')
  return response.data
}

export const updatePost = async (id, payload) => {
  const response = await API.put(`/posts/${id}`, payload)
  return response.data
}

export const deletePost = async (id) => {
  const response = await API.delete(`/posts/${id}`)
  return response.data
}
