// Reusable Avatar component with image support + gradient initials fallback

const sizeMap = {
  xs:   'w-6  h-6  text-[10px]',
  sm:   'w-8  h-8  text-xs',
  md:   'w-10 h-10 text-sm',
  lg:   'w-14 h-14 text-lg',
  xl:   'w-20 h-20 text-2xl',
  '2xl':'w-28 h-28 text-4xl',
}

export default function Avatar({ initials = '?', src, size = 'md', className = '', alt = '' }) {
  const sz = sizeMap[size] ?? sizeMap.md

  return (
    <div
      className={`${sz} rounded-full bg-gradient-to-br from-primary-400 to-primary-600
                  flex items-center justify-center text-white font-bold flex-shrink-0
                  overflow-hidden ${className}`}
      aria-label={alt || initials}
      role="img"
    >
      {src
        ? <img src={src} alt={alt || initials} className="w-full h-full object-cover" />
        : <span className="select-none">{initials}</span>
      }
    </div>
  )
}
