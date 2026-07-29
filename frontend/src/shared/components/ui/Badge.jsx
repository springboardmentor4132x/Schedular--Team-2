/**
 * Badge — Standardized OrbitSocial Design System Badge
 */

const Dot = ({ className }) => (
  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${className}`} aria-hidden="true" />
)

const dotColorMap = {
  default:   'bg-slate-400',
  primary:   'bg-indigo-500',
  secondary: 'bg-purple-500',
  success:   'bg-emerald-500',
  warning:   'bg-amber-500',
  danger:    'bg-rose-500',
  info:      'bg-sky-500',
  draft:     'bg-slate-400',
  scheduled: 'bg-indigo-500',
  published: 'bg-emerald-500',
  pending:   'bg-amber-500',
  review:    'bg-purple-500',
  cancelled: 'bg-rose-500',
  failed:    'bg-rose-600',
  live:      'bg-emerald-400 animate-pulse-dot',
  queued:    'bg-sky-500',
}

export default function Badge({
  children,
  variant   = 'default',
  dot       = false,
  onRemove,
  className = '',
}) {
  return (
    <span
      className={`badge badge-${variant} ${className}`}
    >
      {dot && <Dot className={dotColorMap[variant] ?? dotColorMap.default} />}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 -mr-1 w-4 h-4 flex items-center justify-center rounded-full
                     hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
          aria-label={`Remove ${children}`}
        >
          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </span>
  )
}
