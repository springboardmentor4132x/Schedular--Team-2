import React from 'react'

export default function CreatorPlaceholder({ title, description }) {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div className="card relative overflow-hidden bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-150 dark:border-indigo-900/60 p-8 rounded-2xl shadow-card">
        <div className="space-y-4">
          <div className="inline-block bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
            Creator Module
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            {description}
          </p>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap gap-3 items-center text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Integration Ready (Module 3 & Module 4)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
