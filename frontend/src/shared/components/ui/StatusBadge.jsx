const STATUS_CONFIG = {
  draft:     { label: 'Draft',     classes: 'badge-draft',     dot: 'bg-slate-400' },
  scheduled: { label: 'Scheduled', classes: 'badge-scheduled', dot: 'bg-indigo-500' },
  published: { label: 'Published', classes: 'badge-published', dot: 'bg-emerald-500' },
  pending:   { label: 'Pending',   classes: 'badge-pending',   dot: 'bg-amber-500' },
  review:    { label: 'In Review', classes: 'badge-review',    dot: 'bg-purple-500' },
  cancelled: { label: 'Cancelled', classes: 'badge-cancelled', dot: 'bg-rose-400' },
  failed:    { label: 'Failed',    classes: 'badge-failed',    dot: 'bg-rose-600' },
  live:      { label: 'Live',      classes: 'badge-live',      dot: 'bg-emerald-400 animate-pulse-dot' },
  queued:    { label: 'Queued',    classes: 'badge-queued',    dot: 'bg-sky-500' },
  active:    { label: 'Active',    classes: 'badge-success',   dot: 'bg-emerald-500' },
  inactive:  { label: 'Inactive',  classes: 'badge-default',   dot: 'bg-slate-400' },
  rejected:  { label: 'Rejected',  classes: 'badge-danger',    dot: 'bg-rose-500' },
  approved:  { label: 'Approved',  classes: 'badge-success',   dot: 'bg-emerald-500' },
  completed: { label: 'Completed', classes: 'badge-success',   dot: 'bg-emerald-600' },
  paused:    { label: 'Paused',    classes: 'badge-warning',   dot: 'bg-amber-500' },
}

export default function StatusBadge({ status = 'draft', dot = false, className = '' }) {
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
