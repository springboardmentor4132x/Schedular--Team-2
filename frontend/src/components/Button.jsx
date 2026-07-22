/**
 * Button component
 * Reusable button with 3 variants + sizes + loading state
 * Props: variant, size, loading, disabled, children, ...rest
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-semibold
    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:ring-2 focus-visible:ring-offset-2
  `

  const variants = {
    primary: `
      bg-brand text-white shadow-[var(--shadow-card)]
      hover:brightness-105 active:brightness-95
      focus-visible:ring-[var(--primary)]
    `,
    secondary: `
      bg-[var(--card)] text-[var(--text)] border border-[var(--border)]
      hover:border-[var(--primary)] hover:bg-[var(--card-hover)]
      focus-visible:ring-[var(--primary)]
    `,
    ghost: `
      bg-transparent text-[var(--text-muted)]
      hover:bg-[var(--bg-alt)] hover:text-[var(--text)]
    `,
  }

  const sizes = {
    sm: 'h-8 px-3 text-sm rounded-[var(--r-sm)]',
    md: 'h-10 px-5 text-sm rounded-[var(--r-md)]',
    lg: 'h-12 px-7 text-base rounded-[var(--r-md)]',
    xl: 'h-14 px-8 text-base rounded-[var(--r-lg)]',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  )
}
