import {
  Calendar,
  Send,
  Target,
  Shield,
  ShieldAlert,
  Users,
  Share2,
  Info,
} from 'lucide-react'

const categoryIcons = {
  publishing: { icon: Send, color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40' },
  campaign: { icon: Target, color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/40' },
  campaigns: { icon: Target, color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/40' },
  account: { icon: Shield, color: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200/60 dark:border-sky-800/40' },
  collaboration: { icon: Users, color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40' },
  team: { icon: Users, color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40' },
  teams: { icon: Users, color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40' },
  users: { icon: Users, color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/40' },
  security: { icon: ShieldAlert, color: 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-800/40' },
  system: { icon: ShieldAlert, color: 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-800/40' },
  social: { icon: Share2, color: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border-teal-200/60 dark:border-teal-800/40' },
  scheduled: { icon: Calendar, color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/40' },
}

// Real backend notifications carry a `type` (success/error/info/campaign) instead of a priority.
const typeBadges = {
  success: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
  error: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
  warning: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
  info: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40',
  campaign: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
}

function formatTimestamp(value) {
  if (!value) return ''
  try {
    const date = new Date(value)
    const diff = Math.max(0, Date.now() - date.getTime())
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins} mins ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

export default function NotificationItem({ notification, onMarkAsRead }) {
  const { id, category, type, title, message, read, created_at } = notification

  const config = categoryIcons[category] || { icon: Info, color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' }
  const IconComponent = config.icon
  const typeBadgeStyle = typeBadges[type] || typeBadges.info
  const timestamp = formatTimestamp(created_at)

  return (
    <div
      onClick={() => !read && onMarkAsRead && onMarkAsRead(id)}
      className={`group relative flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        read
          ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-800/40 text-slate-900 dark:text-slate-100 shadow-2xs'
      }`}
    >
      {/* Category Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${config.color}`}>
        <IconComponent size={18} strokeWidth={2} />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {title}
            </h4>
            {type && (
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${typeBadgeStyle}`}>
                {type}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
            {timestamp}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="inline-block text-[10px] font-semibold text-slate-400 dark:text-slate-500 capitalize">
            Category: {category || 'system'}
          </span>

          {!read && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Unread
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
