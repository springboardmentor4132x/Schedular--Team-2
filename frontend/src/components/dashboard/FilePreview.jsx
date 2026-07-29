import { useMemo } from 'react'
import { FileText, Image, Video, Music, FileText as FileDoc } from 'lucide-react'
import { getFileCategory } from '../../services/contentApi'

const ICON_MAP = {
  image: Image,
  video: Video,
  audio: Music,
  pdf: FileDoc,
  document: FileText,
}

export default function FilePreview({ file }) {
  const category = getFileCategory(file)
  const Icon = ICON_MAP[category] || FileText

  return (
    <div className="rounded-[var(--r-md)] overflow-hidden border" style={{ borderColor:'var(--border)', minHeight: 96 }}>
      {category === 'image' ? (
        <img src={file.fileUrl} alt={file.fileName} className="w-full h-full object-cover" />
      ) : category === 'video' ? (
        <video controls className="w-full h-full bg-black"><source src={file.fileUrl} type={file.mimeType} /></video>
      ) : category === 'audio' ? (
        <div className="p-4 flex items-center gap-3">
          <Icon size={24} style={{ color:'var(--text-muted)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>{file.fileName}</p>
            <audio controls className="w-full mt-2"><source src={file.fileUrl} type={file.mimeType} /></audio>
          </div>
        </div>
      ) : (
        <div className="p-5 flex items-center gap-3 bg-[var(--bg-alt)] h-full">
          <Icon size={24} style={{ color:'var(--text-muted)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>{file.fileName}</p>
            <p className="text-xs" style={{ color:'var(--text-muted)' }}>{file.mimeType}</p>
          </div>
        </div>
      )}
    </div>
  )
}
