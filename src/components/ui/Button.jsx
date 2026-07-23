/**
 * Button — OrbitSocial Design System
 * Unified button component using primary (indigo) design tokens.
 * Variants: primary | secondary | success | danger | warning | outline | ghost | info
 * Sizes: xs | sm | md | lg | xl
 */

import { forwardRef } from 'react'

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <svg
    className="animate-spin w-4 h-4 flex-shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

// ── Maps ──────────────────────────────────────────────────────────────────────
const variantMap = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  success:   'btn-success',
  danger:    'btn-danger',
  warning:   'btn-warning',
  outline:   'btn-outline',
  ghost:     'btn-ghost',
  info:      'btn-info',
}

const sizeMap = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  xl: 'btn-xl',
}

// ── Component ─────────────────────────────────────────────────────────────────
const Button = forwardRef(function Button(
  {
    children,
    variant   = 'primary',
    size      = 'md',
    type      = 'button',
    disabled  = false,
    loading   = false,
    fullWidth = false,
    iconOnly  = false,
    onClick,
    className = '',
    id,
    'aria-label': ariaLabel,
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      id={id}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      className={[
        'btn',
        variantMap[variant] ?? variantMap.primary,
        sizeMap[size]       ?? sizeMap.md,
        fullWidth ? 'w-full' : '',
        iconOnly  ? '!p-2 aspect-square' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
})

export default Button
