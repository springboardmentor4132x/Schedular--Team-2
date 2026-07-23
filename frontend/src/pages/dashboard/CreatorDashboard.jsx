import { motion } from 'framer-motion'
import { PenSquare, CalendarDays, BarChart2, FileText } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import EmptyState from '../../components/dashboard/EmptyState'
import QuickActions from '../../components/dashboard/QuickActions'

/**
 * Creator Dashboard — simple placeholder.
 * Content Creator module is out of scope for Milestone 2.
 */
const quickActions = [
  { label: 'Create Post', icon: PenSquare,    href: '/dashboard/create-post', color: '#1E3A8A' },
  { label: 'Calendar',    icon: CalendarDays, href: '/dashboard/calendar',    color: '#4F46E5' },
  { label: 'Analytics',  icon: BarChart2,    href: '/dashboard/analytics',   color: '#22C55E' },
  { label: 'Drafts',     icon: FileText,     href: '/dashboard/drafts',      color: '#F59E0B' },
]

export default function CreatorDashboard() {
  const { user } = useAuth()
  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-[var(--r-xl)] p-6 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)' }}>
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-1">Content Creator</p>
          <h2 className="text-2xl font-extrabold text-white mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Welcome, {user?.name ?? 'Creator'} 👋
          </h2>
          <p className="text-white/70 text-sm">Start creating and scheduling your content.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <EmptyState
            icon={PenSquare}
            title="Creator Dashboard Coming Soon"
            message="The full Content Creator module is under development. Use the quick actions to start posting."
          />
        </div>
        <QuickActions actions={quickActions} />
      </div>
    </div>
  )
}
