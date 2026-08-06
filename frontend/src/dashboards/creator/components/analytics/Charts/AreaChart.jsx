import React, { useState } from 'react'

export default function AreaChart({ data = [], dataKey = 'value', xKey = 'date', title, strokeColor = '#6366f1', height = 240 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  if (!data || data.length === 0) return null

  const values = data.map((d) => d[dataKey] || 0)
  const maxVal = Math.max(...values, 1) * 1.15
  const minVal = 0

  const width = 600
  const chartHeight = height - 40
  const paddingX = 20
  const paddingY = 20

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * (width - 2 * paddingX)
    const y = chartHeight - paddingY - ((d[dataKey] - minVal) / (maxVal - minVal)) * (chartHeight - 2 * paddingY)
    return { x, y, value: d[dataKey], label: d[xKey] }
  })

  // SVG Area path
  const dPath = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`), '')
  const areaPath = `${dPath} L ${points[points.length - 1].x},${chartHeight - paddingY} L ${points[0].x},${chartHeight - paddingY} Z`

  return (
    <div className="card space-y-3">
      {title && (
        <div className="flex items-center justify-between border-b border-default pb-3">
          <h3 className="text-base font-bold text-primary">{title}</h3>
          <span className="text-xs font-semibold text-secondary">
            Latest: {data[data.length - 1]?.[dataKey]?.toLocaleString()}
          </span>
        </div>
      )}
      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`gradient-${title?.replace(/\s+/g, '-') || 'area'}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio, idx) => (
            <line
              key={idx}
              x1={paddingX}
              y1={chartHeight - paddingY - ratio * (chartHeight - 2 * paddingY)}
              x2={width - paddingX}
              y2={chartHeight - paddingY - ratio * (chartHeight - 2 * paddingY)}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#gradient-${title?.replace(/\s+/g, '-') || 'area'})`} />

          {/* Smooth Line */}
          <path d={dPath} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive points */}
          {points.map((p, i) => (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? 6 : 4}
                fill={hoveredIndex === i ? strokeColor : '#ffffff'}
                stroke={strokeColor}
                strokeWidth="2.5"
                className="transition-all duration-150"
              />
            </g>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-10 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-lg pointer-events-none -translate-x-1/2 -translate-y-12 transition-all"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / chartHeight) * 100}%`
            }}
          >
            <div>{points[hoveredIndex].label}</div>
            <div className="text-indigo-300 dark:text-indigo-600">{points[hoveredIndex].value.toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* X Labels */}
      <div className="flex justify-between items-center px-2 pt-1 border-t border-default text-[11px] font-semibold text-secondary">
        {data.map((d, i) => (
          <span key={i} className="truncate text-center">
            {d[xKey]}
          </span>
        ))}
      </div>
    </div>
  )
}
