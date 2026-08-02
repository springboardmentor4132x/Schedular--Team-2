import Card from '../../../shared/components/ui/Card'
import Button from '../../../shared/components/ui/Button'

const TeamLargeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="w-12 h-12 text-indigo-400 dark:text-indigo-500" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

export default function Team() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <Card className="p-12 flex flex-col items-center justify-center text-center min-h-[240px]">
        <TeamLargeIcon />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-5">Team Workspaces</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
          Collaborate with your team by creating shared workspaces. Assign roles, manage permissions,
          and streamline your social media workflow.
        </p>
        <Button variant="outline" size="md" className="mt-6">Create Workspace</Button>
      </Card>
    </div>
  )
}
