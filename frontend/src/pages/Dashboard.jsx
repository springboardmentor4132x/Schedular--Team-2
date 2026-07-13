// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, change, positive, icon, accent }) {
  return (
    <div className="stat-card">
      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <span className="text-xl">{icon}</span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{value}</p>
        <p className={`text-xs font-medium mt-1 ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
          {positive ? '▲' : '▼'} {change} vs last month
        </p>
      </div>
    </div>
  )
}

// ── Recent Activity ───────────────────────────────────────────────────────────

const recentActivity = [
  { id: 1, platform: 'Twitter',   action: 'Post published',   time: '2 min ago',  status: 'success' },
  { id: 2, platform: 'Instagram', action: 'Post scheduled',   time: '18 min ago', status: 'pending' },
  { id: 3, platform: 'LinkedIn',  action: 'Draft saved',      time: '1 hr ago',   status: 'draft'   },
  { id: 4, platform: 'Facebook',  action: 'Post failed',      time: '3 hr ago',   status: 'error'   },
  { id: 5, platform: 'Twitter',   action: 'Post published',   time: '5 hr ago',   status: 'success' },
 ]

const statusStyles = {
  success: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
  pending: 'bg-amber-100 dark:bg-amber-950/40  text-amber-700 dark:text-amber-400',
  draft:   'bg-slate-100 dark:bg-slate-700/60  text-slate-600 dark:text-slate-300',
  error:   'bg-rose-100 dark:bg-rose-950/40   text-rose-700 dark:text-rose-400',
}

const platformEmoji = {
  Twitter:   '𝕏',
  Instagram: '📸',
  LinkedIn:  '💼',
  Facebook:  '📘',
}

// ── Quick Action Button ───────────────────────────────────────────────────────

function QuickAction({ emoji, label, desc }) {
  return (
    <button
      type="button"
      className="flex flex-col items-start gap-1 p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800
                 hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-card-lg dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.45)] transition-all duration-200 text-left group"
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
        {label}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400">{desc}</span>
    </button>
  )
}

// ── Dashboard Page ────────────────────────────────────────────────────────────

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Stats Row ── */}
      <section aria-label="Overview stats">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Posts"
            value="1,284"
            change="12%"
            positive={true}
            icon="📝"
            accent="bg-primary-50"
          />
          <StatCard
            label="Scheduled"
            value="47"
            change="8%"
            positive={true}
            icon="🗓️"
            accent="bg-amber-50"
          />
          <StatCard
            label="Reach"
            value="98.4K"
            change="23%"
            positive={true}
            icon="📡"
            accent="bg-emerald-50"
          />
          <StatCard
            label="Engagement"
            value="5.2%"
            change="1.1%"
            positive={false}
            icon="💬"
            accent="bg-rose-50"
          />
        </div>
      </section>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Quick Actions */}
        <section className="card lg:col-span-1" aria-label="Quick actions">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction emoji="✍️" label="New Post"       desc="Compose & schedule" />
            <QuickAction emoji="📅" label="View Calendar"  desc="See upcoming posts" />
            <QuickAction emoji="📊" label="Analytics"      desc="Review metrics"     />
            <QuickAction emoji="👥" label="Invite Team"    desc="Add a new member"   />
          </div>
        </section>

        {/* Upcoming Schedule */}
        <section className="card lg:col-span-2" aria-label="Upcoming schedule">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Upcoming Schedule</h2>
            <button type="button" className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {[
              { time: 'Today, 3:00 PM',   platform: 'Instagram', text: 'Product launch teaser',      tag: 'Marketing' },
              { time: 'Today, 6:00 PM',   platform: 'Twitter',   text: 'Weekly tips thread',          tag: 'Organic'   },
              { time: 'Tomorrow, 9:00 AM', platform: 'LinkedIn',  text: 'Company milestone announcement', tag: 'PR'      },
              { time: 'Tomorrow, 1:00 PM', platform: 'Facebook',  text: 'Customer spotlight story',   tag: 'Community' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <span className="text-lg mt-0.5">{platformEmoji[item.platform] ?? '📄'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{item.text}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.platform} · {item.time}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-medium whitespace-nowrap">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Recent Activity ── */}
      <section className="card" aria-label="Recent activity">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h2>
          <button type="button" className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">
            View all →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" id="activity-table">
            <thead>
              <tr className="text-left text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">
                <th className="pb-3 pr-4">Platform</th>
                <th className="pb-3 pr-4">Action</th>
                <th className="pb-3 pr-4">Time</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/60">
              {recentActivity.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition-colors">
                  <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-200">
                    <span className="mr-2">{platformEmoji[item.platform]}</span>
                    {item.platform}
                  </td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{item.action}</td>
                  <td className="py-3 pr-4 text-slate-400 dark:text-slate-500 text-xs">{item.time}</td>
                  <td className="py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[item.status]}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>


    </div>
  )
}
