import axios from 'axios'

const PROFILE_IMAGE_STORAGE_KEY = 'orbit-profile-image'

export function getStoredProfileImage() {
  try {
    return localStorage.getItem(PROFILE_IMAGE_STORAGE_KEY) || null
  } catch {
    return null
  }
}

export function saveStoredProfileImage(imageUrl) {
  try {
    if (imageUrl) localStorage.setItem(PROFILE_IMAGE_STORAGE_KEY, imageUrl)
    else localStorage.removeItem(PROFILE_IMAGE_STORAGE_KEY)
    return imageUrl
  } catch {
    return imageUrl
  }
}

export function clearStoredProfileImage() {
  try {
    localStorage.removeItem(PROFILE_IMAGE_STORAGE_KEY)
  } catch {
    // ignore storage access errors
  }
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to read file'))
    reader.readAsDataURL(file)
  })
}

export async function uploadProfileImage(fileOrDataUrl) {
  const isDataUrl = typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')
  const dataUrl = isDataUrl ? fileOrDataUrl : await toDataUrl(fileOrDataUrl)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const endpoint = apiBaseUrl ? `${apiBaseUrl.replace(/\/$/, '')}/profile/upload-image` : null

  if (endpoint) {
    try {
      const formData = new FormData()
      if (!isDataUrl) {
        const file = fileOrDataUrl
        formData.append('file', file, file.name)
      } else {
        const blob = await fetch(dataUrl).then(res => res.blob())
        formData.append('file', blob, 'profile-image.png')
      }

      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const imageUrl = response?.data?.imageUrl || dataUrl
      saveStoredProfileImage(imageUrl)
      return imageUrl
    } catch {
      // Fall back to local storage persistence when the API is unavailable.
    }
  }

  saveStoredProfileImage(dataUrl)
  return dataUrl
}

export async function removeProfileImage() {
  clearStoredProfileImage()
  return null
}

export function getProfileInitials(name = 'User') {
  return (name || 'User')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || 'U'
}
