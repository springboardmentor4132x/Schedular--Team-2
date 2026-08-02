import Card from '../../../shared/components/ui/Card'
import Button from '../../../shared/components/ui/Button'

const CalendarLargeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="w-12 h-12 text-indigo-400 dark:text-indigo-500" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

export default function Calendar() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <Card className="p-12 flex flex-col items-center justify-center text-center min-h-[340px]">
        <CalendarLargeIcon />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-5">Content Calendar</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
          Plan, schedule, and visualize your social media content across all connected platforms.
          Your upcoming posts will appear here.
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="primary" size="md">Create Post</Button>
          <Button variant="outline" size="md">Import Schedule</Button>
        </div>
      </Card>
    </div>
  )
}
