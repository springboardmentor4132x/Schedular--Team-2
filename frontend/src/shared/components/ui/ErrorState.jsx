import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Button from '../Button'

/**
 * Reusable Error State Component with Retry
 *
 * @param {Object} props
 * @param {string} [props.title] - Error heading
 * @param {string} [props.message] - User-friendly error message
 * @param {Function} [props.onRetry] - Function to trigger reload/retry
 * @param {string} [props.className] - Additional classes
 */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error loading this data. Please try again.',
  onRetry,
  className = ''
}) {
  return (
    <div className={`card flex flex-col items-center justify-center p-8 sm:p-12 text-center border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
        <AlertTriangle size={24} />
      </div>
      <h3 className="text-base font-bold text-primary">{title}</h3>
      <p className="text-xs md:text-sm text-secondary mt-1 max-w-md leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
            <RefreshCw size={14} />
            <span>Retry</span>
          </Button>
        </div>
      )}
    </div>
  )
}
