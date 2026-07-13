import { useState, forwardRef } from 'react'

// ── Eye icons ─────────────────────────────────────────────────────────────────

const EyeOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-4 h-4" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-4 h-4" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

/**
 * Input — reusable form input with:
 * - optional visible label
 * - error message (shown red, with role="alert")
 * - optional hint text
 * - built-in password visibility toggle when type="password"
 * - dark mode support
 * - forwarded ref for programmatic focus
 */
const Input = forwardRef(function Input(
  { label, id, error, hint, type = 'text', className = '', disabled, readOnly, ...props },
  ref
) {
  const [showPw, setShowPw] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (showPw ? 'text' : 'password') : type

  const baseInput = [
    'w-full px-4 py-2.5 text-sm rounded-xl border transition-all duration-150',
    'bg-white dark:bg-slate-800',
    'text-slate-800 dark:text-slate-100',
    'placeholder:text-slate-400 dark:placeholder:text-slate-500',
    'focus:outline-none focus-visible:ring-2',
    disabled || readOnly
      ? 'bg-slate-50 dark:bg-slate-900 cursor-not-allowed opacity-70'
      : '',
    error
      ? 'border-rose-400 dark:border-rose-500 focus-visible:ring-rose-400'
      : 'border-slate-200 dark:border-slate-600 focus-visible:ring-navy-400 focus-visible:border-navy-400',
    isPassword ? 'pr-10' : '',
    className,
  ].join(' ')

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={resolvedType}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={baseInput}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw(v => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2
                       text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                       transition-colors focus:outline-none focus-visible:ring-1
                       focus-visible:ring-navy-400 rounded"
          >
            {showPw ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-rose-500 dark:text-rose-400">
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

export default Input
