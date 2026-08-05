import React, { useState } from 'react'

export default function BarChart({ data = [], dataKey = 'value', xKey = 'label', title, barColor = 'bg-indigo-600 dark:bg-indigo-500', height = 220 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  if (!data || data.length === 0) return null

  const maxVal = Math.max(...data.map((d) => d[dataKey] || 0), 1)

  return (
    <div className="card space-y-4">
      {title && (
        <div className="flex items-center justify-between border-b border-default pb-3">
          <h3 className="text-base font-bold text-primary">{title}</h3>
        </div>
      )}

      <div className="flex items-end justify-between gap-2 px-2" style={{ height: `${height}px` }}>
        {data.map((item, idx) => {
          const val = item[dataKey] || 0
          const pct = Math.max((val / maxVal) * 100, 4)

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer relative"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {hoveredIdx === idx && (
                <div className="absolute -top-10 px-2 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-bold rounded shadow z-20 whitespace-nowrap">
                  {val.toLocaleString()}
                </div>
              )}

              {/* Bar */}
              <div className="w-full max-w-[40px] rounded-t-lg bg-surface relative overflow-hidden flex items-end h-full">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 group-hover:brightness-110 ${barColor}`}
                  style={{ height: `${pct}%` }}
                />
              </div>

              {/* Label */}
              <span className="text-[11px] font-semibold text-secondary truncate max-w-full">
                {item[xKey]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
