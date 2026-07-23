import { motion } from 'framer-motion'
import { ShieldCheck, Users, Settings, BarChart2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/dashboard/StatCard'
import EmptyState from '../../components/dashboard/EmptyState'
import QuickActions from '../../components/dashboard/QuickActions'

/**
 * Admin Dashboard — simple placeholder.
 * Administrator module is out of scope for Milestone 2.
 */
const quickActions = [
  { label: 'Settings',  icon: Settings,  href: '/dashboard/settings',  color: '#1E3A8A' },
  { label: 'Analytics', icon: BarChart2, href: '/dashboard/analytics', color: '#4F46E5' },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-[var(--r-xl)] p-6 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)' }}>
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-1">Administrator</p>
          <h2 className="text-2xl font-extrabold text-white mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Welcome, {user?.name ?? 'Admin'} 🛡️
          </h2>
          <p className="text-white/70 text-sm">System administration panel — Orbit Social.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Users"     value="248" icon={Users}       iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)"  trend={4}  index={0} />
        <StatCard title="Active Sessions" value="31"  icon={ShieldCheck} iconColor="#22C55E" iconBg="rgba(34,197,94,.12)"  index={1} />
        <StatCard title="Roles"           value="4"   icon={Users}       iconColor="#F59E0B" iconBg="rgba(245,158,11,.12)" index={2} />
        <StatCard title="System Health"   value="99%" icon={ShieldCheck} iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)"  index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <EmptyState
            icon={ShieldCheck}
            title="Admin Module Coming Soon"
            message="The full Administrator module is under development. User management, audit logs and system settings will appear here."
          />
        </div>
        <QuickActions actions={quickActions} />
      </div>
    </div>
  )
}
