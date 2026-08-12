export default function ProgressList({ title, items = [], labelKey = 'label', valueKey = 'percentage', extraKey = 'count', iconKey }) {
  if (!items || items.length === 0) return null

  return (
    <div className="card p-5 space-y-4">
      {title && (
        <div className="border-b border-default pb-3">
          <h3 className="text-base font-bold text-primary">{title}</h3>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, idx) => {
          const val = item[valueKey] || 0
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  {iconKey && item[iconKey] && <span className="text-sm">{item[iconKey]}</span>}
                  <span className="text-primary">{item[labelKey] || item.country || item.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">{val}%</span>
                  {extraKey && item[extraKey] && (
                    <span className="text-secondary font-medium">({item[extraKey]})</span>
                  )}
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-surface border border-default overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
