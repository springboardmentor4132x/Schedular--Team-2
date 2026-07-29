import { forwardRef } from 'react'
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi2'

/**
 * Input — Standardized OrbitSocial Form Input component.
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    valid = false,
    hint,
    leftIcon,
    rightSlot,
    required,
    className = '',
    id,
    type = 'text',
    disabled,
    readOnly,
    ...props
  },
  ref
) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') ?? Math.random().toString(36).slice(2)}`

  const stateIcon = (() => {
    if (rightSlot) return null
    if (error) return (
      <HiExclamationCircle
        size={18}
        className="text-rose-500 flex-shrink-0"
        aria-hidden="true"
      />
    )
    if (valid) return (
      <HiCheckCircle
        size={18}
        className="text-emerald-600 dark:text-emerald-400 flex-shrink-0"
        aria-hidden="true"
      />
    )
    return null
  })()

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="label-base flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="ml-1 text-rose-500" aria-hidden="true">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span
            className="absolute left-3.5 pointer-events-none flex items-center text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` :
            hint  ? `${inputId}-hint`  : undefined
          }
          className={[
            'input-base',
            error ? 'input-error' : '',
            valid ? '!border-emerald-500 !ring-emerald-500/20' : '',
            leftIcon ? '!pl-10' : '',
            (rightSlot || stateIcon) ? '!pr-10' : '',
            className,
          ].filter(Boolean).join(' ')}
          {...props}
        />

        {(rightSlot || stateIcon) && (
          <span className="absolute right-3 flex items-center text-slate-400 dark:text-slate-500">
            {rightSlot ?? stateIcon}
          </span>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
          <HiExclamationCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-xs text-slate-400 dark:text-slate-500">
          {hint}
        </p>
      )}
    </div>
  )
})

export default Input
