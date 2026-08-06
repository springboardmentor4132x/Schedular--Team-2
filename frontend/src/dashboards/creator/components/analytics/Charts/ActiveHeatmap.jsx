import React from 'react'

export default function ActiveHeatmap({ hoursData = [], daysData = [] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Active Hours Matrix */}
      <div className="card space-y-4">
        <div className="border-b border-default pb-3">
          <h3 className="text-base font-bold text-primary">Most Active Hours</h3>
          <p className="text-xs text-secondary mt-0.5">Peak engagement times for your followers (Local Time)</p>
        </div>
        <div className="space-y-3">
          {hoursData.map((item, idx) => {
            const intensity = item.activity
            let bgClass = 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
            if (intensity > 80) bgClass = 'bg-indigo-600 text-white font-bold'
            else if (intensity > 50) bgClass = 'bg-indigo-400 dark:bg-indigo-600 text-white'
            else if (intensity > 25) bgClass = 'bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-200'

            return (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-secondary w-14 flex-shrink-0">{item.hour}</span>
                <div className="flex-1 h-6 rounded-lg bg-surface border border-default overflow-hidden relative flex items-center">
                  <div className={`h-full transition-all duration-500 rounded-lg ${bgClass}`} style={{ width: `${item.activity}%` }} />
                </div>
                <span className="text-xs font-bold text-primary w-10 text-right">{item.activity}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Days Matrix */}
      <div className="card space-y-4">
        <div className="border-b border-default pb-3">
          <h3 className="text-base font-bold text-primary">Most Active Days</h3>
          <p className="text-xs text-secondary mt-0.5">Audience presence throughout the week</p>
        </div>
        <div className="grid grid-cols-7 gap-2 h-44 items-end pt-4">
          {daysData.map((day, i) => {
            const score = day.score
            let color = 'bg-indigo-500'
            if (score >= 90) color = 'bg-emerald-500'
            else if (score < 65) color = 'bg-amber-500'

            return (
              <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  {score}%
                </span>
                <div className="w-full bg-surface rounded-lg h-full flex items-end overflow-hidden border border-default">
                  <div className={`w-full ${color} rounded-t-md transition-all duration-500`} style={{ height: `${score}%` }} />
                </div>
                <span className="text-xs font-bold text-secondary">{day.day}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
