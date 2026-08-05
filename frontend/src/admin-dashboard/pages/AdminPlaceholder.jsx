export default function AdminPlaceholder({ title, description }) {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
      <div className="card relative overflow-hidden bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 rounded-2xl">
        <div className="space-y-4">
          <div className="inline-block bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 px-3 py-1 rounded-full text-xs font-bold">
            Admin Module
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            {title}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl font-medium">
            {description}
          </p>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-center text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Integration Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

