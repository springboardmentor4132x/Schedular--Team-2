import { useState, forwardRef } from 'react'

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

const UIInput = forwardRef(function UIInput(
  { label, id, error, hint, type = 'text', className = '', disabled, readOnly, leftIcon, rightSlot, ...props },
  ref
) {
  const [showPw, setShowPw] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (showPw ? 'text' : 'password') : type

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={id} className="label-base">
          {label}
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
          id={id}
          type={resolvedType}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={[
            'input-base',
            error ? 'input-error' : '',
            leftIcon ? '!pl-10' : '',
            (isPassword || rightSlot) ? '!pr-10' : '',
            className,
          ].filter(Boolean).join(' ')}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw(v => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                       transition-colors focus:outline-none focus-visible:ring-1
                       focus-visible:ring-indigo-400 rounded"
          >
            {showPw ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        ) : (
          rightSlot && (
            <span className="absolute right-3 flex items-center text-slate-400 dark:text-slate-500">
              {rightSlot}
            </span>
          )
        )}
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

export default UIInput
