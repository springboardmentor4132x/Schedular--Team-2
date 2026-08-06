import React from 'react'

/**
 * Reusable StatsGrid responsive container for KPI cards with equal height items
 */
export default function StatsGrid({
  children,
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6',
  className = ''
}) {
  return (
    <div className={`grid gap-4 items-stretch ${columns} ${className}`}>
      {children}
    </div>
  )
}
