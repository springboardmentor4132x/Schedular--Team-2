import { useRef, useState } from 'react'
import { Upload, FileText, Image, Video, Music, FileText as FileDoc } from 'lucide-react'
import { ACCEPTED_FILE_TYPES, getFileCategory, formatBytes } from '../../services/contentApi'

const ICON_MAP = {
  image: Image,
  video: Video,
  audio: Music,
  pdf: FileDoc,
  document: FileText,
}

export default function FileUploadField({ files, onFilesChange, error, onFileRemove }) {
  const ref = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = event => {
    event.preventDefault()
    setDragging(false)
    const dropped = Array.from(event.dataTransfer.files)
    const accepted = dropped.filter(file => ACCEPTED_FILE_TYPES.includes(file.type) || /\.(doc|docx|ppt|pptx)$/i.test(file.name))
    onFilesChange(accepted)
  }

  const handleChange = event => {
    const selected = Array.from(event.target.files)
    const accepted = selected.filter(file => ACCEPTED_FILE_TYPES.includes(file.type) || /\.(doc|docx|ppt|pptx)$/i.test(file.name))
    onFilesChange(accepted)
  }

  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Upload content</label>
      <div
        ref={ref}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => ref.current?.querySelector('input')?.click()}
        className="rounded-[var(--r-md)] border border-dashed p-5 text-center cursor-pointer transition-all"
        style={{
          borderColor: dragging ? 'var(--primary)' : 'var(--border)',
          background: dragging ? 'rgba(59,130,246,.06)' : 'var(--bg-alt)',
        }}
      >
        <Upload size={20} style={{ color:'var(--text-muted)' }} />
        <p className="text-sm font-semibold mt-3" style={{ color:'var(--text)' }}>Drag & drop files here or click to browse</p>
        <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>
          Supported: JPG, PNG, WEBP, GIF, MP4, MOV, AVI, WEBM, PDF, DOC, DOCX, PPT, PPTX, MP3, WAV. Max 100 MB.
        </p>
        <input type="file" hidden multiple accept={ACCEPTED_FILE_TYPES.join(',')} onChange={handleChange} />
      </div>

      {error && <p className="text-xs mt-2 text-[#ef4444]">{error}</p>}

      {files.length > 0 && (
        <div className="mt-3 grid gap-3">
          {files.map((file, index) => {
            const category = getFileCategory(file)
            const Icon = ICON_MAP[category] || FileText
            return (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-[var(--r-md)] border px-3 py-2"
                style={{ borderColor:'var(--border)', background:'var(--card)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <Icon size={18} style={{ color:'var(--text-muted)' }} />
                  <div className="min-w-0">
                    <p className="text-sm truncate" style={{ color:'var(--text)' }}>{file.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button type="button" onClick={() => onFileRemove(index)} className="text-xs font-semibold text-[#ef4444]">Remove</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
