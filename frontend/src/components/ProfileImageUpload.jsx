import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Check, Loader2, RotateCcw, RotateCw, Trash2, X, ZoomIn, ZoomOut } from 'lucide-react'
import { getProfileInitials } from '../services/profileImageService'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function ProfileImageUpload({ currentImage, onUpload, onRemove, loading = false }) {
  const [preview, setPreview] = useState(currentImage || null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)
  const [prevCurrentImage, setPrevCurrentImage] = useState(currentImage)

  if (prevCurrentImage !== currentImage) {
    setPrevCurrentImage(currentImage)
    if (!currentImage) {
      setPreview(null)
      setSelectedFile(null)
      setZoom(1)
      setRotation(0)
      setCropOffset({ x: 0, y: 0 })
      setIsEditing(false)
    } else {
      setPreview(currentImage)
    }
  }

  const primaryText = useMemo(() => getProfileInitials('User'), [])

  const validateFile = (file) => {
    if (!file) return 'Please choose an image.'
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Unsupported file type. Use JPG, JPEG, PNG, or WEBP.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File exceeds maximum size of 5 MB.'
    }
    return ''
  }

  const openPicker = () => inputRef.current?.click()

  const handleFileSelection = (file) => {
    const validationMessage = validateFile(file)
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setError('')
    const objectUrl = URL.createObjectURL(file)
    setSelectedFile(file)
    setPreview(objectUrl)
    setIsEditing(true)
    setZoom(1)
    setRotation(0)
    setCropOffset({ x: 0, y: 0 })
  }

  const onInputChange = (event) => {
    const file = event.target.files?.[0]
    if (file) handleFileSelection(file)
    event.target.value = ''
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) handleFileSelection(file)
  }

  const handleSave = async () => {
    if (!preview || !selectedFile) return
    setError('')
    const result = await onUpload(preview, selectedFile)
    if (result !== false) {
      setIsEditing(false)
      setSelectedFile(null)
    }
  }

  const handleCancel = () => {
    setPreview(currentImage || null)
    setSelectedFile(null)
    setError('')
    setIsEditing(false)
    setZoom(1)
    setRotation(0)
    setCropOffset({ x: 0, y: 0 })
  }

  const handleRemove = async () => {
    await onRemove()
  }

  return (
    <div className="space-y-4">
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={onInputChange} />

      <div
        className="relative overflow-hidden rounded-[28px] border border-blue-500/20 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4 sm:p-5 shadow-[0_20px_80px_rgba(14,81,166,0.22)] transition-all"
        style={{ borderColor: 'rgba(56,189,248,0.18)' }}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="pointer-events-none absolute right-[-40px] top-[-20px] h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute left-[-30px] bottom-[-20px] h-20 w-20 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-slate-400/20 to-transparent" />
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center relative">
          <div className="relative flex-shrink-0">
            <div
              className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 shadow-lg sm:h-32 sm:w-32"
              style={{ borderColor: 'var(--card)', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                  style={{ transform: `scale(${zoom}) rotate(${rotation}deg) translate(${cropOffset.x}px, ${cropOffset.y}px)` }}
                />
              ) : (
                <span className="text-4xl font-semibold text-white">{primaryText}</span>
              )}
            </div>

            <button
              type="button"
              onClick={openPicker}
              disabled={loading}
              className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 text-white shadow-lg transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            </button>
          </div>

          <div className="w-full text-center">
            {currentImage && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60"
                  style={{ borderColor: 'var(--border)', color: 'var(--error)' }}
                >
                  <Trash2 className="h-4 w-4" /> Remove Photo
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isEditing && preview && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="rounded-[24px] border p-4 sm:p-5"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="flex-1">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Image preview</p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setZoom(value => Math.max(0.8, value - 0.1))} className="rounded-full border p-2" style={{ borderColor: 'var(--border)' }}>
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setZoom(value => Math.min(2.5, value + 0.1))} className="rounded-full border p-2" style={{ borderColor: 'var(--border)' }}>
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center overflow-hidden rounded-[20px] border p-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
                  <div className="relative h-56 w-full max-w-[320px] overflow-hidden rounded-[16px] bg-slate-900/90">
                    <img
                      src={preview}
                      alt="Crop preview"
                      className="h-full w-full object-cover"
                      style={{ transform: `scale(${zoom}) rotate(${rotation}deg) translate(${cropOffset.x}px, ${cropOffset.y}px)` }}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full lg:max-w-[240px]">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Adjust image</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Crop to a square, zoom, rotate, and center it before saving.</p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Zoom</label>
                    <input type="range" min="0.8" max="2.5" step="0.1" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-indigo-600" />
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => setRotation(value => value - 90)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold" style={{ borderColor: 'var(--border)' }}>
                      <RotateCcw className="h-4 w-4" /> Rotate
                    </button>
                    <button type="button" onClick={() => setRotation(value => value + 90)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold" style={{ borderColor: 'var(--border)' }}>
                      <RotateCw className="h-4 w-4" /> Rotate
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => setCropOffset({ x: 0, y: 0 })} className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold" style={{ borderColor: 'var(--border)' }}>
                      <Check className="h-4 w-4" /> Center
                    </button>
                    <button type="button" onClick={() => setPreview(currentImage || null)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold" style={{ borderColor: 'var(--border)' }}>
                      <X className="h-4 w-4" /> Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={handleCancel} disabled={loading} className="rounded-xl border px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60" style={{ borderColor: 'var(--border)' }}>
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all disabled:opacity-60" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Save Profile Picture
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isDragging && (
        <div className="rounded-2xl border border-dashed border-indigo-400 bg-indigo-50/70 px-4 py-6 text-center text-sm font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200">
          Drop your image here to upload it.
        </div>
      )}
    </div>
  )
}
