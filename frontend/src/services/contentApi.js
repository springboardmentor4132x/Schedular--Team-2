import { api } from './mockData'

const STORAGE_KEY = 'orbit-content-library'
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024

const SUPPORTED_MIME_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/quicktime', 'video/avi', 'video/webm'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav'],
  pdf: ['application/pdf'],
  document: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
}

const CATEGORY_LABELS = {
  image: 'Images',
  video: 'Videos',
  audio: 'Audio',
  pdf: 'PDFs',
  document: 'Documents',
}

const ACCEPTED_FILE_TYPES = [
  ...SUPPORTED_MIME_TYPES.image,
  ...SUPPORTED_MIME_TYPES.video,
  ...SUPPORTED_MIME_TYPES.audio,
  ...SUPPORTED_MIME_TYPES.pdf,
  ...SUPPORTED_MIME_TYPES.document,
]

const FILE_TYPE_MAP = Object.entries(SUPPORTED_MIME_TYPES).reduce((acc, [key, list]) => {
  list.forEach(type => { acc[type] = key })
  return acc
}, {})

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

function getLibraryStore() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch (error) {
    return {}
  }
}

function saveLibraryStore(store) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function getFileCategory(file) {
  if (!file) return 'document'
  const type = file.type.toLowerCase()
  return FILE_TYPE_MAP[type] || (type.startsWith('image/') ? 'image' : type.startsWith('video/') ? 'video' : type.startsWith('audio/') ? 'audio' : 'document')
}

function buildFileMetadata(file, uploadedBy = 'Current user') {
  const category = getFileCategory(file)
  const fileUrl = URL.createObjectURL(file)

  return {
    fileName: file.name,
    fileType: category,
    mimeType: file.type,
    fileSize: file.size,
    uploadDate: new Date().toISOString(),
    uploadedBy,
    fileUrl,
  }
}

function isSupportedFile(file) {
  if (!file) return false
  if (ACCEPTED_FILE_TYPES.includes(file.type)) return true
  const extension = file.name.split('.').pop()?.toLowerCase()
  return ['doc', 'docx', 'ppt', 'pptx'].includes(extension)
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let index = 0
  let value = bytes / 1024
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value.toFixed(1)} ${units[index]}`
}

async function simulateUploadProgress(onUploadProgress) {
  if (!onUploadProgress) return
  let progress = 0
  while (progress < 100) {
    await delay(120)
    progress = Math.min(100, progress + Math.floor(Math.random() * 18) + 8)
    onUploadProgress(progress)
  }
}

export const contentApi = {
  getLibraryByClient: async (clientId) => {
    await delay(250)
    const store = getLibraryStore()
    const items = store[clientId] ?? []
    return [...items].sort((a, b) => new Date(b.uploadedAt || b.file.uploadDate) - new Date(a.uploadedAt || a.file.uploadDate))
  },

  uploadContent: async (clientId, payload, file, onUploadProgress) => {
    await delay(150)
    if (!file) throw new Error('Please choose a supported file to upload.')
    if (!isSupportedFile(file)) throw new Error('This file type is not supported.')
    if (file.size > MAX_FILE_SIZE_BYTES) throw new Error('The file size exceeds 100 MB.')

    const fileMetadata = buildFileMetadata(file, payload.uploadedBy)
    const item = {
      id: `content-${Date.now()}`,
      title: payload.title || file.name,
      caption: payload.caption || '',
      platform: payload.platform || 'instagram',
      campaign: payload.campaign || null,
      status: payload.status || 'draft',
      tags: payload.tags || [],
      scheduledAt: payload.scheduledAt || null,
      file: fileMetadata,
      uploadedAt: new Date().toISOString(),
      uploadedBy: payload.uploadedBy || 'Current user',
    }

    if (onUploadProgress) {
      await simulateUploadProgress(onUploadProgress)
    }

    const store = getLibraryStore()
    store[clientId] = [item, ...(store[clientId] || [])]
    saveLibraryStore(store)
    return item
  },

  updateContent: async (clientId, id, updates) => {
    await delay(200)
    const store = getLibraryStore()
    const items = store[clientId] ?? []
    store[clientId] = items.map(item => item.id === id ? { ...item, ...updates } : item)
    saveLibraryStore(store)
    return store[clientId].find(item => item.id === id)
  },

  replaceContentFile: async (clientId, id, file, onUploadProgress) => {
    await delay(150)
    if (!file) throw new Error('Please choose a supported replacement file.')
    if (!isSupportedFile(file)) throw new Error('This file type is not supported.')
    if (file.size > MAX_FILE_SIZE_BYTES) throw new Error('The file size exceeds 100 MB.')

    if (onUploadProgress) {
      await simulateUploadProgress(onUploadProgress)
    }

    const store = getLibraryStore()
    const items = store[clientId] ?? []
    let updated = null
    store[clientId] = items.map(item => {
      if (item.id === id) {
        updated = {
          ...item,
          file: buildFileMetadata(file, item.uploadedBy),
          title: item.title || file.name,
          uploadedAt: new Date().toISOString(),
        }
        return updated
      }
      return item
    })
    saveLibraryStore(store)
    return updated
  },

  deleteContent: async (clientId, id) => {
    await delay(150)
    const store = getLibraryStore()
    store[clientId] = (store[clientId] || []).filter(item => item.id !== id)
    saveLibraryStore(store)
    return { id }
  },

  downloadContent: async (item) => {
    if (!item?.file?.fileUrl) throw new Error('No downloadable file available.')
    return item.file.fileUrl
    // Real: return api.get(`/content/${item.id}/download`, { responseType: 'blob' })
  },
}

export const CONTENT_ACCEPTED_TYPES = ACCEPTED_FILE_TYPES
export const CONTENT_MAX_FILE_SIZE = MAX_FILE_SIZE_BYTES
export const CONTENT_TYPE_LABELS = CATEGORY_LABELS
export const CONTENT_STATUS_OPTIONS = ['draft', 'review', 'scheduled', 'published']
export const CONTENT_FILTER_OPTIONS = ['All Content', 'Images', 'Videos', 'Documents', 'PDFs', 'Audio']
export { ACCEPTED_FILE_TYPES, getFileCategory, formatBytes }
