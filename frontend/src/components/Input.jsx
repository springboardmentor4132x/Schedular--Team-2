import { forwardRef } from 'react'
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi2'

/**
 * Input — premium form input with full validation states.
 *
 * States
 *   normal  — clean border, light shadow
 *   focused — navy border, soft glow ring
 *   valid   — green border + check icon (pass `valid={true}`)
 *   invalid — red border + warning icon + animated error card below
 *
 * Props
 *   label      string        — visible label text
 *   required   bool          — shows red asterisk, sets aria
 *   error      string|null   — error message (shows invalid state)
 *   valid      bool          — shows valid state when true and no error
 *   hint       string|null   — helper text shown when no error
 *   leftIcon   ReactNode     — icon slot on the left
 *   rightSlot  ReactNode     — button / icon slot on the right
 *   id         string        — overrides generated id
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
    ...props
  },
  ref
) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') ?? Math.random().toString(36).slice(2)}`

  // Derive border / ring style from state
  const borderStyle = (() => {
    if (error) return {
      borderColor: '#FCA5A5',          // red-300
      boxShadow:   '0 0 0 3px rgba(239,68,68,.10)',
    }
    if (valid) return {
      borderColor: '#86EFAC',          // green-300
      boxShadow:   '0 0 0 3px rgba(22,163,74,.08)',
    }
    return {
      borderColor: 'var(--border)',
      boxShadow:   'none',
    }
  })()

  // Right-side state icon: only shown when no custom rightSlot
  const stateIcon = (() => {
    if (rightSlot) return null          // custom slot takes precedence
    if (error) return (
      <HiExclamationCircle
        size={17}
        style={{ color: '#EF4444', flexShrink: 0 }}
        aria-hidden="true"
      />
    )
    if (valid) return (
      <HiCheckCircle
        size={17}
        style={{ color: '#16A34A', flexShrink: 0 }}
        aria-hidden="true"
      />
    )
    return null
  })()

  return (
    <div className="flex flex-col gap-1.5 w-full">

      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium"
          style={{ color: 'var(--text)' }}
        >
          {label}
          {required && (
            <span className="ml-0.5" style={{ color: '#EF4444' }} aria-hidden="true">*</span>
          )}
        </label>
      )}

      {/* Input row */}
      <div className="relative flex items-center">

        {/* Left icon */}
        {leftIcon && (
          <span
            className="absolute left-3 pointer-events-none flex items-center"
            style={{ color: error ? '#EF4444' : valid ? '#16A34A' : 'var(--text-subtle)' }}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error  ? `${inputId}-error` :
            hint   ? `${inputId}-hint`  :
            undefined
          }
          className={`
            w-full h-11 px-4 text-sm
            border rounded-[var(--r-md)]
            transition-all duration-200
            focus:outline-none
            placeholder:text-[var(--text-subtle)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon  ? 'pl-10'  : ''}
            ${(rightSlot || stateIcon) ? 'pr-11' : ''}
            ${className}
          `}
          style={{
            background:   'var(--card)',
            color:        'var(--text)',
            borderWidth:  '1.5px',
            borderStyle:  'solid',
            ...borderStyle,
          }}
          onFocus={e => {
            // Apply focus glow on top of current state
            if (!error && !valid) {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.boxShadow   = 'var(--shadow-glow)'
            }
          }}
          onBlur={e => {
            // Restore state-based border when focus leaves
            if (!error && !valid) {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow   = 'none'
            }
            // Call any external onBlur passed in
            props.onBlur?.(e)
          }}
          {...props}
        />

        {/* Right slot or state icon */}
        <span className="absolute right-3 flex items-center">
          {rightSlot ?? stateIcon}
        </span>

      </div>

      {/* Error card — animated fade-in */}
      {error && (
        <div
          id={`${inputId}-error`}
          role="alert"
          aria-live="assertive"
          style={{
            display:         'flex',
            alignItems:      'flex-start',
            gap:             '0.5rem',
            padding:         '0.5rem 0.75rem',
            borderRadius:    '10px',
            background:      '#FEF2F2',
            border:          '1px solid #FECACA',
            color:           '#B91C1C',
            fontSize:        '0.8125rem',
            fontWeight:      500,
            lineHeight:      1.45,
            animation:       'inputErrorFadeIn 0.2s ease forwards',
          }}
        >
          <HiExclamationCircle
            size={15}
            style={{ marginTop: '0.1rem', flexShrink: 0, color: '#EF4444' }}
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      )}

      {/* Hint text — only when no error */}
      {!error && hint && (
        <p
          id={`${inputId}-hint`}
          className="text-xs"
          style={{ color: 'var(--text-subtle)' }}
        >
          {hint}
        </p>
      )}

    </div>
  )
})

export default Input
