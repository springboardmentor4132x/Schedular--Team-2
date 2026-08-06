import React from 'react'

export default function AnalyticsKpiCard({ label, value, change, positive = true, icon: Icon, accentClass = '' }) {
  return (
    <div className="stat-card cursor-pointer group hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-200 h-full flex flex-col justify-between p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-xs">
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
            {label}
          </p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1 tracking-tight truncate leading-none">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform duration-200 ${accentClass}`}>
            <Icon size={18} strokeWidth={2} className="shrink-0" />
          </div>
        )}
      </div>

      {change && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold w-full">
          <span
            className={`flex items-center gap-1 shrink-0 ${
              positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
            }`}
          >
            <span>{positive ? '▲' : '▼'} {change}</span>
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate">vs prev period</span>
        </div>
      )}
    </div>
  )
}
