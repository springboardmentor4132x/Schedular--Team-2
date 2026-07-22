// Reusable Badge / tag component with multiple colour variants

const variants = {
  default: 'bg-slate-100  text-slate-700  hover:bg-slate-200',
  primary: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
  success: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  warning: 'bg-amber-50   text-amber-700   hover:bg-amber-100',
  danger:  'bg-rose-50    text-rose-700    hover:bg-rose-100',
}

export default function Badge({ children, variant = 'default', onRemove, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                  transition-colors duration-150 select-none
                  ${variants[variant] ?? variants.default} ${className}`}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 -mr-0.5 w-4 h-4 flex items-center justify-center rounded-full
                     hover:bg-black/10 transition-colors opacity-60 hover:opacity-100"
          aria-label={`Remove ${children}`}
        >
          ×
        </button>
      )}
    </span>
  )
}
