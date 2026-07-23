import { motion } from 'framer-motion'

/**
 * ActivityFeed — scrollable list of recent activity events.
 * Props:
 *   items  Array<{ id, icon: LucideIcon, iconColor, iconBg, title, description, time, badge, badgeColor }>
 *   title  string  (section title, optional)
 */
export default function ActivityFeed({ items = [], title = 'Recent Activity' }) {
  if (!items.length) return null

  return (
    <div className="card p-5">
      <h2
        className="text-sm font-bold mb-4"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
      >
        {title}
      </h2>
      <ul className="flex flex-col divide-y" style={{ '--tw-divide-opacity': 1 }}>
        {items.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.li
              key={item.id ?? i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
              style={{ borderColor: 'var(--border)' }}
            >
              {/* Icon bubble */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: item.iconBg ?? 'var(--bg-alt)' }}
              >
                {Icon && <Icon size={15} style={{ color: item.iconColor ?? 'var(--text-muted)' }} />}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text)' }}>
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                    {item.description}
                  </p>
                )}
              </div>

              {/* Right side: badge + time */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {item.badge && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: item.badgeColor ? `${item.badgeColor}18` : 'var(--bg-alt)',
                      color: item.badgeColor ?? 'var(--text-muted)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {item.time && (
                  <span className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>{item.time}</span>
                )}
              </div>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
