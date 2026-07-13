/**
 * Button — reusable button component for the Profile module.
 * Uses the navy design system; does not interfere with existing .btn-primary / .btn-ghost classes.
 */

const variantMap = {
  primary:   'bg-navy-600 hover:bg-navy-700 active:bg-navy-800 text-white shadow-sm focus-visible:ring-navy-500',
  secondary: 'bg-white dark:bg-slate-700 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-200 hover:bg-navy-50 dark:hover:bg-slate-600 shadow-sm focus-visible:ring-navy-400',
  ghost:     'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus-visible:ring-slate-400',
  danger:    'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm focus-visible:ring-rose-400',
}

const sizeMap = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2   text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
}

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  type     = 'button',
  disabled = false,
  fullWidth = false,
  onClick,
  className = '',
  id,
  'aria-label': ariaLabel,
}) {
  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        'inline-flex items-center justify-center font-semibold rounded-xl',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantMap[variant] ?? variantMap.primary,
        sizeMap[size]       ?? sizeMap.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
