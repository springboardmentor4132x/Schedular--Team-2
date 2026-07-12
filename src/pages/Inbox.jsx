import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

// ── Inbox Icon ────────────────────────────────────────────────────────────────
const InboxLargeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="w-12 h-12 text-primary-400 dark:text-primary-500" aria-hidden="true">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
)

export default function Inbox() {
  const messages = [
    { from: 'Sarah Miller',  subject: 'Review: Product launch copy',        time: '10 min ago', read: false, initials: 'SM' },
    { from: 'Alex Johnson',  subject: 'Analytics report ready for Q2',      time: '1 hour ago', read: false, initials: 'AJ' },
    { from: 'Emily Chen',    subject: 'Invitation accepted — Welcome!',     time: '3 hours ago', read: true, initials: 'EC' },
    { from: 'System',        subject: 'Your weekly engagement summary',     time: 'Yesterday',   read: true, initials: 'OS' },
    { from: 'System',        subject: 'Instagram token expires in 3 days',  time: '2 days ago',  read: true, initials: 'OS' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Summary Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Inbox summary">
        {[
          { label: 'Total Messages', value: '24', icon: '📬', color: 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400' },
          { label: 'Unread', value: '2', icon: '🔔', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
          { label: 'Mentions', value: '5', icon: '💬', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
          { label: 'Archived', value: '17', icon: '📁', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
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

      {/* Messages List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Messages</h3>
          <Button variant="ghost" size="sm">Mark All Read</Button>
        </div>
        <div className="space-y-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 p-3.5 rounded-xl transition-colors cursor-pointer ${
                msg.read
                  ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  : 'bg-primary-50/50 dark:bg-primary-950/20 hover:bg-primary-50 dark:hover:bg-primary-950/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                msg.from === 'System'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  : 'bg-gradient-to-br from-primary-400 to-primary-600 text-white'
              }`}>
                {msg.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm truncate ${msg.read ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-slate-100'}`}>
                    {msg.from}
                  </p>
                  {!msg.read && (
                    <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" aria-label="Unread" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{msg.subject}</p>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">{msg.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Compose Empty State */}
      <Card className="p-12 flex flex-col items-center justify-center text-center min-h-[200px]">
        <InboxLargeIcon />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-5">Unified Inbox</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
          All comments, mentions, and direct messages from your connected platforms in one place.
        </p>
        <Button variant="primary" size="md" className="mt-6">Compose Message</Button>
      </Card>
    </div>
  )
}
