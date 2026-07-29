import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * StatCard — metric card with icon, value, label and trend indicator.
 * Props:
 *   title       string
 *   value       string | number
 *   icon        LucideIcon component
 *   iconColor   CSS color string
 *   iconBg      CSS color string
 *   trend       number   (e.g. +12 → "+12%", -5 → "-5%", 0 → "No change")
 *   trendLabel  string   (e.g. "vs last month")
 *   index       number   for staggered animation
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'var(--primary)',
  iconBg    = 'var(--primary-light)',
  trend,
  trendLabel = 'vs last month',
  index = 0,
}) {
  const isPositive = trend > 0
  const isNeutral  = trend === 0 || trend === undefined
  const TrendIcon  = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown
  const trendColor = isNeutral ? 'var(--text-subtle)' : isPositive ? 'var(--success)' : 'var(--error)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07, ease: 'easeOut' }}
      className="card p-5 flex flex-col gap-3 cursor-default"
    >
      {/* Icon + title row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{title}</p>
          <p
            className="text-2xl font-extrabold mt-1"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
          >
            {value}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div className="flex items-center gap-1.5">
          <TrendIcon size={13} style={{ color: trendColor }} />
          <span className="text-xs font-semibold" style={{ color: trendColor }}>
            {isNeutral ? 'No change' : `${isPositive ? '+' : ''}${trend}%`}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>{trendLabel}</span>
        </div>
      )}
    </motion.div>
  )
}
