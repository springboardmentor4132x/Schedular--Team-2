/**
 * Card — reusable surface with 20px radius, soft shadow, and dark mode support.
 * Matches the Profile module design system (navy / light bg).
 */
export default function Card({ children, className = '', id, as: Tag = 'div' }) {
  return (
    <Tag
      id={id}
      className={[
        'bg-white dark:bg-slate-800',
        'border border-slate-100 dark:border-slate-700',
        'rounded-[20px]',
        'shadow-[0_2px_16px_rgba(36,59,107,0.07)]',
        'dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)]',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  )
}
