import { marketingService } from './marketingService'
import { uploadMedia } from './postService'

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

function getFileCategory(file) {
  if (!file) return 'document'
  const type = file.type.toLowerCase()
  return FILE_TYPE_MAP[type] || (type.startsWith('image/') ? 'image' : type.startsWith('video/') ? 'video' : type.startsWith('audio/') ? 'audio' : 'document')
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

export const normalizeContentStatus = (status) => {
  const s = String(status ?? '').toLowerCase().replace(/\s+/g, '_')
  if (s === 'pending_review' || s === 'in_review') return 'review'
  if (s === 'queued') return 'scheduled'
  return s
}

export const contentApi = {
  getLibraryByClient: async (clientId) => {
    const data = await marketingService.workspace(clientId)
    return data.posts.map(post => ({
      ...post,
      status: normalizeContentStatus(post.status),
      file: { fileName: post.title, fileType: post.contentType, fileUrl: post.mediaUrl, uploadDate: post.createdAt },
      uploadedAt: post.createdAt,
    }))
  },

  uploadContent: async (clientId, payload, file, onUploadProgress) => {
    if (!file) throw new Error('Please choose a supported file to upload.')
    if (!isSupportedFile(file)) throw new Error('This file type is not supported.')
    if (file.size > MAX_FILE_SIZE_BYTES) throw new Error('The file size exceeds 100 MB.')

    const upload = await uploadMedia(file, onUploadProgress)
    const post = await marketingService.createPost(clientId, {
      title: payload.title || file.name, caption: payload.caption || '', content_type: getFileCategory(file),
      media_url: upload.media_url, status: ({ draft:'Draft', review:'Pending Review', scheduled:'Scheduled' })[payload.status] || 'Draft',
      scheduled_for: payload.scheduledAt || null, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: payload.platform,
    })
    return { id:post.id, title:post.title, caption:post.caption, platform:payload.platform || 'instagram', status:normalizeContentStatus(post.status), scheduledAt:post.scheduled_for, uploadedAt:post.created_at, file:{ fileName:file.name, fileType:getFileCategory(file), fileUrl:post.media_file_path } }
  },

  updateContent: async (clientId, id, updates) => {
    const payload = { title:updates.title, caption:updates.caption, status:updates.status && ({ draft:'Draft', review:'Pending Review', scheduled:'Scheduled', published:'Published' })[updates.status], scheduled_for:updates.scheduledAt }
    return marketingService.updatePost(clientId, id, payload)
  },

  replaceContentFile: async (clientId, id, file, onUploadProgress) => {
    if (!file) throw new Error('Please choose a supported replacement file.')
    if (!isSupportedFile(file)) throw new Error('This file type is not supported.')
    if (file.size > MAX_FILE_SIZE_BYTES) throw new Error('The file size exceeds 100 MB.')

    const upload = await uploadMedia(file, onUploadProgress)
    return marketingService.updatePost(clientId, id, { media_url: upload.media_url, content_type:getFileCategory(file) })
  },

  deleteContent: async (clientId, id) => {
    return marketingService.updatePost(clientId, id, { status:'Cancelled' })
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
