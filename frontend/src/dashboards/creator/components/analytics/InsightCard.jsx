/**
 * Reusable InsightCard component for analytical findings & recommendations
 */
export default function InsightCard({
  title,
  badgeText,
  badgeColor = 'badge-primary',
  icon: Icon,
  children,
  className = ''
}) {
  return (
    <div className={`card p-5 space-y-3 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between border-b border-default pb-2.5">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-indigo-500 shrink-0" />}
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider">{title}</h3>
        </div>
        {badgeText && (
          <span className={`badge ${badgeColor} text-[10px] py-0.5 px-2 font-bold`}>
            {badgeText}
          </span>
        )}
      </div>

      <div className="flex-1">{children}</div>
    </div>
  )
}
