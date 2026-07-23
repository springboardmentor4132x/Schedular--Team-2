/**
 * Card — OrbitSocial Design System
 * Unified surface component matching the .card CSS class.
 * Props:
 *   as       — HTML tag to render ('div', 'section', 'article', etc.)
 *   hover    — adds hover elevation effect
 *   padding  — 'none' | 'sm' | 'md' | 'lg' (default: 'md')
 *   className — additional classes
 */

const paddingMap = {
  none: 'p-0',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

export default function Card({
  children,
  className = '',
  id,
  as: Tag   = 'div',
  hover     = false,
  padding   = 'md',
  onClick,
}) {
  return (
    <Tag
      id={id}
      onClick={onClick}
      className={[
        'bg-white dark:bg-slate-800/90',
        'border border-slate-100 dark:border-slate-700/60',
        'rounded-2xl shadow-card dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]',
        'text-slate-800 dark:text-slate-100',
        'transition-all duration-250',
        paddingMap[padding] ?? paddingMap.md,
        hover ? 'hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 cursor-pointer' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </Tag>
  )
}
