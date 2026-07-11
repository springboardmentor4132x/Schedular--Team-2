import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

// ── Team Icon ─────────────────────────────────────────────────────────────────
const TeamLargeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="w-12 h-12 text-primary-400 dark:text-primary-500" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

export default function Team() {
  const members = [
    { name: 'John Doe',      role: 'Admin',       email: 'john@orbitsocial.com',    initials: 'JD', status: 'Active'  },
    { name: 'Sarah Miller',  role: 'Editor',      email: 'sarah@orbitsocial.com',   initials: 'SM', status: 'Active'  },
    { name: 'Alex Johnson',  role: 'Contributor', email: 'alex@orbitsocial.com',    initials: 'AJ', status: 'Active'  },
    { name: 'Emily Chen',    role: 'Viewer',      email: 'emily@orbitsocial.com',   initials: 'EC', status: 'Invited' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Summary Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Team summary">
        {[
          { label: 'Team Members', value: '4', icon: '👥', color: 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400' },
          { label: 'Active Now', value: '3', icon: '🟢', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
          { label: 'Pending Invites', value: '1', icon: '✉️', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
          { label: 'Roles Assigned', value: '4', icon: '🔑', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
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

      {/* Member List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Team Members</h3>
          <Button variant="primary" size="sm">Invite Member</Button>
        </div>
        <div className="space-y-3">
          {members.map((m, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {m.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{m.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{m.email}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                {m.role}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                m.status === 'Active'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
              }`}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Empty State — Workspaces */}
      <Card className="p-12 flex flex-col items-center justify-center text-center min-h-[240px]">
        <TeamLargeIcon />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-5">Team Workspaces</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
          Collaborate with your team by creating shared workspaces. Assign roles, manage permissions,
          and streamline your social media workflow.
        </p>
        <Button variant="secondary" size="md" className="mt-6">Create Workspace</Button>
      </Card>
    </div>
  )
}
