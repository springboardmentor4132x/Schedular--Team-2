import React from 'react'

export default function InsightCard({ title, badgeText, badgeColor = 'badge-primary', children, icon: Icon }) {
  return (
    <div className="card h-full flex flex-col justify-between p-5 space-y-4 transition-all duration-300">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 border-b border-default pb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {Icon && <Icon size={16} className="text-indigo-500 flex-shrink-0" />}
          <h3 className="text-sm font-bold text-primary leading-snug">{title}</h3>
        </div>
        {badgeText && (
          <span className={`badge shrink-0 text-[11px] px-2 py-0.5 font-bold ${badgeColor}`}>
            {badgeText}
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="flex-1 flex flex-col justify-between text-sm text-primary leading-relaxed">
        {children}
      </div>
    </div>
  )
}
