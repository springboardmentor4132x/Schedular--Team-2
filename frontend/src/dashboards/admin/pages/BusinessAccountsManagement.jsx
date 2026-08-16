import { Building2, Briefcase, Target, Send, Layers } from 'lucide-react'
import UsersListPage from '../components/UsersListPage'

const kpis = (users) => [
  {
    label: 'Total Accounts',
    value: users.length,
    icon: Building2,
    accent: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
  },
  {
    label: 'Workspaces',
    value: users.reduce((acc, u) => acc + (u.workspaces_count || 0), 0),
    icon: Briefcase,
    accent: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
  },
  {
    label: 'Campaigns',
    value: users.reduce((acc, u) => acc + (u.campaigns_count || 0), 0),
    icon: Target,
    accent: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
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
    accent: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400',
  },
]

export default function BusinessAccountsManagement() {
  return (
    <UsersListPage
      title="Business Accounts"
      description="Manage business accounts, connected platforms, campaigns, and account activity."
      roleFilter="business"
      entityLabel="business accounts"
      csvFilename="OrbitSocial_BusinessAccounts"
      identityLabel="BUSINESS"
      identityField="company"
      kpis={kpis}
      showOwnerColumn
      showWorkspacesColumn
      addRoleOptions={['business']}
      addDefaultRole="business"
      searchPlaceholder="Search business accounts, owner, or email..."
    />
  )
}
