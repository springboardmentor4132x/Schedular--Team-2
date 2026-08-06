import React from 'react'

/**
 * Reusable ComparisonCard component for side-by-side metric benchmarks
 */
export default function ComparisonCard({
  title,
  itemA = { name: '', value: '' },
  itemB = { name: '', value: '' },
  badgeText,
  className = ''
}) {
  return (
    <div className={`card p-4 space-y-3 border border-default ${className}`}>
      <div className="flex items-center justify-between border-b border-default pb-2">
        <h4 className="text-xs font-bold text-primary uppercase tracking-wider">{title}</h4>
        {badgeText && <span className="badge badge-primary text-[10px] py-0.5">{badgeText}</span>}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-2.5 rounded-xl bg-surface border border-default space-y-1">
          <span className="text-[11px] text-secondary font-medium block truncate">{itemA.name}</span>
          <span className="text-base font-extrabold text-primary block">{itemA.value}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-surface border border-default space-y-1">
          <span className="text-[11px] text-secondary font-medium block truncate">{itemB.name}</span>
          <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 block">{itemB.value}</span>
        </div>
      </div>
    </div>
  )
}
