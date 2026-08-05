import React from 'react'

/**
 * Reusable ChartCard wrapper component
 */
export default function ChartCard({
  title,
  subtitle,
  children,
  action,
  className = ''
}) {
  return (
    <div className={`card space-y-4 ${className}`}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-default pb-3">
          <div>
            {title && <h3 className="text-base font-bold text-primary">{title}</h3>}
            {subtitle && <p className="text-xs text-secondary mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}
