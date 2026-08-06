import React from 'react'

export default function KpiGrid({ children, columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' }) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {children}
    </div>
  )
}
