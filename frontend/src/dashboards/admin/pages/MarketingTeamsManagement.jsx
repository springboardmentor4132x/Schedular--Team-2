import { Users, Briefcase, Target, Send, Layers } from 'lucide-react'
import UsersListPage from '../components/UsersListPage'

const kpis = (users) => [
  {
    label: 'Total Teams',
    value: users.length,
    icon: Users,
    accent: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
  },
  {
    label: 'Accounts Managed',
    value: users.reduce((acc, u) => acc + (u.workspaces_count || 0), 0),
    icon: Briefcase,
    accent: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
  },
  {
    label: 'Campaigns',
    value: users.reduce((acc, u) => acc + (u.campaigns_count || 0), 0),
    icon: Target,
    accent: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400',
  },
  {
    label: 'Posts',
    value: users.reduce((acc, u) => acc + (u.posts_count || 0), 0),
    icon: Send,
    accent: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Social Accounts',
    value: users.reduce((acc, u) => acc + (u.social_accounts_count || 0), 0),
    icon: Layers,
    accent: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
  },
]

export default function MarketingTeamsManagement() {
  return (
    <UsersListPage
      title="Marketing Teams"
      description="Manage teams, members, business accounts, and campaign responsibilities."
      roleFilter="marketing"
      entityLabel="marketing teams"
      csvFilename="OrbitSocial_MarketingTeams"
      identityLabel="TEAM"
      identityField="name"
      kpis={kpis}
      showCompanyColumn
      showWorkspacesColumn
      addRoleOptions={['marketing']}
      addDefaultRole="marketing"
      searchPlaceholder="Search teams by name, lead, or email..."
    />
  )
}
