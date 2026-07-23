/**
 * StatusBadge — OrbitSocial Design System
 * Single source of truth for all post/content status indicators.
 *
 * Supported statuses:
 *   Draft | Scheduled | Published | Pending | Review | Cancelled | Failed | Live | Queued | Active | Inactive
 *
 * Usage:
 *   <StatusBadge status="Published" />
 *   <StatusBadge status="Draft" dot />
 */

// ── Status config map ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft:     { label: 'Draft',     classes: 'badge-draft',     dot: 'bg-slate-400' },
  scheduled: { label: 'Scheduled', classes: 'badge-scheduled', dot: 'bg-primary-500' },
  published: { label: 'Published', classes: 'badge-published', dot: 'bg-success-500' },
  pending:   { label: 'Pending',   classes: 'badge-pending',   dot: 'bg-warning-500' },
  review:    { label: 'In Review', classes: 'badge-review',    dot: 'bg-secondary-500' },
  cancelled: { label: 'Cancelled', classes: 'badge-cancelled', dot: 'bg-danger-400' },
  failed:    { label: 'Failed',    classes: 'badge-failed',    dot: 'bg-danger-600' },
  live:      { label: 'Live',      classes: 'badge-live',      dot: 'bg-success-400 animate-pulse-dot' },
  queued:    { label: 'Queued',    classes: 'badge-queued',    dot: 'bg-info-500' },
  active:    { label: 'Active',    classes: 'badge-success',   dot: 'bg-success-500' },
  inactive:  { label: 'Inactive',  classes: 'badge-default',   dot: 'bg-slate-400' },
  rejected:  { label: 'Rejected',  classes: 'badge-danger',    dot: 'bg-danger-500' },
  approved:  { label: 'Approved',  classes: 'badge-success',   dot: 'bg-success-500' },
  completed: { label: 'Completed', classes: 'badge-success',   dot: 'bg-success-600' },
  paused:    { label: 'Paused',    classes: 'badge-warning',   dot: 'bg-warning-500' },
}

export default function StatusBadge({ status = 'draft', dot = false, className = '' }) {
  // Normalise: trim + lowercase key lookup
  const key = String(status).trim().toLowerCase()
  const config = STATUS_CONFIG[key] ?? { label: status, classes: 'badge-default', dot: 'bg-slate-400' }

  return (
    <span className={`badge ${config.classes} ${className}`}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`}
          aria-hidden="true"
        />
      )}
      {config.label}
    </span>
  )
}
