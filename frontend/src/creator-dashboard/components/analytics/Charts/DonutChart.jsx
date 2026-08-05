import React from 'react'

export default function DonutChart({ data = [], title }) {
  if (!data || data.length === 0) return null

  const total = data.reduce((acc, d) => acc + (d.percentage || d.value || 0), 0)
  let cumulative = 0

  const slices = data.map((d) => {
    const val = d.percentage || d.value || 0
    const startAngle = (cumulative / total) * 360
    cumulative += val
    const endAngle = (cumulative / total) * 360
    return { ...d, startAngle, endAngle, val }
  })

  return (
    <div className="card space-y-4">
      {title && (
        <div className="border-b border-default pb-3">
          <h3 className="text-base font-bold text-primary">{title}</h3>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
        {/* SVG Donut Visual */}
        <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {slices.map((slice, i) => {
              const strokeDasharray = `${(slice.val / total) * 283} 283`
              const strokeDashoffset = -((slice.startAngle / 360) * 283)
              const colors = [
                '#6366f1', '#a855f7', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'
              ]
              const strokeColor = slice.colorHex || colors[i % colors.length]

              return (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="10"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-semibold text-secondary">Total</span>
            <span className="text-lg font-bold text-primary">100%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5 w-full">
          {data.map((item, i) => {
            const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-cyan-500', 'bg-amber-500', 'bg-pink-500', 'bg-emerald-500']
            const bgClass = item.color || colors[i % colors.length]

            return (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${bgClass}`} />
                  <span className="font-semibold text-primary">{item.label || item.language || item.group}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary">{item.percentage || item.value}%</span>
                  {item.count && <span className="text-secondary font-medium">({item.count})</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
