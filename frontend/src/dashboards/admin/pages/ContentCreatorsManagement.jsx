import { Users, Target, Send, Layers, Briefcase } from 'lucide-react'
import UsersListPage from '../components/UsersListPage'

const kpis = (users) => [
  {
    label: 'Total Creators',
    value: users.length,
    icon: Users,
    accent: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
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
    accent: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400',
  },
  {
    label: 'Social Accounts',
    value: users.reduce((acc, u) => acc + (u.social_accounts_count || 0), 0),
    icon: Layers,
    accent: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Workspaces',
    value: users.reduce((acc, u) => acc + (u.workspaces_count || 0), 0),
    icon: Briefcase,
    accent: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
  },
]

export default function ContentCreatorsManagement() {
  return (
    <UsersListPage
      title="Content Creators"
      description="Manage creators, campaigns, posts, and connected social platforms."
      roleFilter="creator"
      entityLabel="content creators"
      csvFilename="OrbitSocial_ContentCreators"
      identityLabel="CREATOR"
      identityField="name"
      kpis={kpis}
      addRoleOptions={['creator']}
      addDefaultRole="creator"
      searchPlaceholder="Search creators by name, username, or email..."
    />
  )
}
