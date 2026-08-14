import React from 'react'
import Button from '../Button'

/**
 * Reusable Empty State Component
 *
 * @param {Object} props
 * @param {React.ReactNode|string} props.icon - Emoji or Lucide icon component
 * @param {string} props.title - Title of the empty state
 * @param {string} props.description - Explanatory message
 * @param {string} [props.actionLabel] - CTA button text
 * @param {Function} [props.onAction] - CTA button click handler
 * @param {string} [props.className] - Additional wrapper class names
 */
export default function EmptyState({
  icon = '📭',
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`card flex flex-col items-center justify-center p-8 sm:p-12 text-center border-dashed border-2 border-default bg-surface ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-card border border-default flex items-center justify-center text-3xl mb-3 shadow-xs">
        {typeof icon === 'string' ? <span>{icon}</span> : icon}
      </div>
      <h3 className="text-base font-bold text-primary tracking-tight">{title}</h3>
      <p className="text-xs md:text-sm text-secondary mt-1 max-w-md leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
