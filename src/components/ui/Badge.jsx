/**
 * Badge — OrbitSocial Design System
 * Unified badge/tag component.
 * Variants: default | primary | secondary | success | warning | danger | info
 *           + status-specific: draft | scheduled | published | pending | review | cancelled | failed | live | queued
 */

// ── Dot indicator ─────────────────────────────────────────────────────────────
const Dot = ({ className }) => (
  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${className}`} aria-hidden="true" />
)

const dotColorMap = {
  default:   'bg-slate-500',
  primary:   'bg-primary-500',
  secondary: 'bg-secondary-500',
  success:   'bg-success-500',
  warning:   'bg-warning-500',
  danger:    'bg-danger-500',
  info:      'bg-info-500',
  // status
  draft:     'bg-slate-400',
  scheduled: 'bg-primary-500',
  published: 'bg-success-500',
  pending:   'bg-warning-500',
  review:    'bg-secondary-500',
  cancelled: 'bg-danger-500',
  failed:    'bg-danger-600',
  live:      'bg-success-400 animate-pulse-dot',
  queued:    'bg-info-500',
}

// ── Component ─────────────────────────────────────────────────────────────────
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
