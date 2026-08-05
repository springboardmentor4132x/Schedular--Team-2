import React from 'react'

/**
 * Reusable TrendCard component for rendering trend comparisons and delta indicators
 */
export default function TrendCard({
  title,
  currentValue,
  previousValue,
  changePercentage,
  positive = true,
  icon: Icon,
  className = ''
}) {
  return (
    <div className={`card p-4 space-y-2 border border-default ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-secondary uppercase tracking-wider">{title}</span>
        {Icon && <Icon size={16} className="text-indigo-500 shrink-0" />}
      </div>
      <div className="flex items-baseline justify-between pt-1">
        <span className="text-2xl font-extrabold text-primary tracking-tight">{currentValue}</span>
        {changePercentage && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              positive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
            }`}
          >
            {positive ? '▲' : '▼'} {changePercentage}
          </span>
        )}
      </div>
      {previousValue && (
        <p className="text-[11px] text-secondary font-medium">
          Prev period: <strong className="text-primary">{previousValue}</strong>
        </p>
      )}
    </div>
  )
}
