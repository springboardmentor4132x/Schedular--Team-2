export default function ProgressBar({ value = 0, max = 100, showLabel = false, label = '', className = '' }) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  const fillClass =
    pct >= 80 ? 'from-emerald-500 to-emerald-400'
    : pct >= 50 ? 'from-indigo-500 to-indigo-400'
    :              'from-amber-500  to-amber-400'

  const textClass =
    pct >= 80 ? 'text-emerald-600'
    : pct >= 50 ? 'text-indigo-600'
    :              'text-amber-600'

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {label || 'Progress'}
          </span>
          <span className={`text-sm font-bold tabular-nums ${textClass}`}>{pct}%</span>
        </div>
      )}
      <div
        className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={`h-full bg-gradient-to-r ${fillClass} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
