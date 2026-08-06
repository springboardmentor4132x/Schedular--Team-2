import React from 'react'

/**
 * Reusable AnalyticsTable wrapper for data tables across Creator & Admin Analytics
 */
export default function AnalyticsTable({
  title,
  subtitle,
  headers = [],
  children,
  loading = false,
  emptyMessage = 'No analytical records found.',
  className = ''
}) {
  return (
    <div className={`table-container ${className}`}>
      {(title || subtitle) && (
        <div className="p-4 border-b border-default">
          {title && <h3 className="text-base font-bold text-primary">{title}</h3>}
          {subtitle && <p className="text-xs text-secondary mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="table-inner">
          {headers.length > 0 && (
            <thead className="table-head">
              <tr>
                {headers.map((h, idx) => (
                  <th
                    key={idx}
                    className={`table-th ${h.align ? `text-${h.align}` : ''} ${h.width ? h.width : ''}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="table-row">
                  {headers.map((_, j) => (
                    <td key={j} className="table-td">
                      <div className="h-4 w-16 bg-surface rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : !children || (Array.isArray(children) && children.length === 0) ? (
              <tr>
                <td colSpan={headers.length || 1} className="table-td text-center py-12">
                  <p className="text-sm font-semibold text-secondary">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
