import { forwardRef } from 'react'

const Select = forwardRef(function Select(
  {
    label,
    id,
    error,
    hint,
    children,
    className = '',
    disabled,
    ...props
  },
  ref
) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={id} className="label-base">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={[
            'input-base select-base',
            error ? 'input-error' : '',
            className,
          ].filter(Boolean).join(' ')}
          {...props}
        >
          {children}
        </select>
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-400 dark:text-slate-500">
          {hint}
        </p>
      )}
    </div>
  )
})

export default Select
