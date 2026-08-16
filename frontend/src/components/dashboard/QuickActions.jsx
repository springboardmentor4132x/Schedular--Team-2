import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

/**
 * QuickActions — grid of shortcut buttons.
 * Props:
 *   actions  Array<{ label, icon: LucideIcon, href, color, bg }>
 *   title    string  (optional)
 */
export default function QuickActions({ actions = [], title = 'Quick Actions' }) {
  const navigate = useNavigate()

  return (
    <div className="card p-5">
      <h2
        className="text-sm font-bold mb-4"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
      >
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.label}
              onClick={() => navigate(action.href)}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center gap-2 p-4 rounded-[var(--r-md)] border text-center transition-all duration-150"
              style={{
                background: action.bg ?? 'var(--bg-alt)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: action.color ? `${action.color}18` : 'var(--primary-light)' }}
              >
                {Icon && <Icon size={18} style={{ color: action.color ?? 'var(--primary)' }} />}
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                {action.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
