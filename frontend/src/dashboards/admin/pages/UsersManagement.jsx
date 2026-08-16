import { Users, UserPlus, Shield, UserCheck, Building2 } from 'lucide-react'
import UsersListPage from '../components/UsersListPage'
import { isThisMonth } from '../utils/userFormat'

const kpis = (users) => [
  {
    label: 'Total Users',
    value: users.length,
    icon: Users,
    accent: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
  },
  {
    label: 'New This Month',
    value: users.filter((u) => isThisMonth(u.created_at)).length,
    icon: UserPlus,
    accent: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
  },
  {
    label: 'Administrators',
    value: users.filter((u) => u.role === 'administrator').length,
    icon: Shield,
    accent: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400',
  },
  {
    label: 'Content Creators',
    value: users.filter((u) => u.role === 'creator').length,
    icon: UserCheck,
    accent: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
  },
  {
    label: 'Business Users',
    value: users.filter((u) => u.role === 'business').length,
    icon: Building2,
    accent: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
  },
]

export default function UsersManagement() {
  return (
    <UsersListPage
      title="Users"
      description="Manage platform users, roles, and activity."
      entityLabel="users"
      csvFilename="OrbitSocial_Users"
      identityLabel="USER"
      identityField="name"
      kpis={kpis}
      showRoleColumn
      showCompanyColumn
      addRoleOptions={['creator', 'business', 'marketing']}
      addDefaultRole="creator"
      searchPlaceholder="Search users by name, email, or username..."
    />
  )
}
