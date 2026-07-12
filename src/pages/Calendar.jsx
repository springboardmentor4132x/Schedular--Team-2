import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

// ── Calendar Icon ─────────────────────────────────────────────────────────────
const CalendarLargeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="w-12 h-12 text-primary-400 dark:text-primary-500" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

export default function Calendar() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Summary Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Calendar stats">
        {[
          { label: 'Scheduled Posts', value: '47', icon: '📅', color: 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400' },
          { label: 'Published Today', value: '3', icon: '✅', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
          { label: 'Drafts', value: '12', icon: '📝', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
          { label: 'Failed', value: '1', icon: '⚠️', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
        ].map((stat, idx) => (
          <Card key={idx} className="p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-card-lg dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{stat.value}</p>
            </div>
          </Card>
        ))}
      </section>

      {/* Empty State */}
      <Card className="p-12 flex flex-col items-center justify-center text-center min-h-[340px]">
        <CalendarLargeIcon />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-5">Content Calendar</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
          Plan, schedule, and visualize your social media content across all connected platforms.
          Your upcoming posts will appear here.
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="primary" size="md">Create Post</Button>
          <Button variant="secondary" size="md">Import Schedule</Button>
        </div>
      </Card>

      {/* Upcoming Schedule Preview */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Upcoming This Week</h3>
        <div className="space-y-3">
          {[
            { day: 'Today',    time: '3:00 PM',  platform: 'Instagram', text: 'Product launch teaser',         status: 'Scheduled' },
            { day: 'Today',    time: '6:00 PM',  platform: 'Twitter',   text: 'Weekly tips thread',             status: 'Draft'     },
            { day: 'Tomorrow', time: '9:00 AM',  platform: 'LinkedIn',  text: 'Company milestone announcement', status: 'Scheduled' },
            { day: 'Friday',   time: '12:00 PM', platform: 'Facebook',  text: 'Customer spotlight story',       status: 'Pending'   },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="w-14 text-center flex-shrink-0">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">{item.day}</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.time}</p>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.text}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.platform}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
                item.status === 'Scheduled' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                item.status === 'Draft' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' :
                'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
