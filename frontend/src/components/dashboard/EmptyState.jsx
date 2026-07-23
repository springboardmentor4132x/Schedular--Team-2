import { motion } from 'framer-motion'

/**
 * EmptyState — shown when a list/table has no data.
 * Props:
 *   icon      LucideIcon component
 *   title     string
 *   message   string
 *   action    ReactNode  (optional button)
 */
export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {Icon && (
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}
        >
          <Icon size={26} style={{ color: 'var(--text-subtle)' }} />
        </div>
      )}
      <h3
        className="text-base font-bold mb-1"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
      >
        {title}
      </h3>
      <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
