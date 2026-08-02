import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  Users, Send, FileText, Clock, Target,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import StatCard from '../../../components/dashboard/StatCard'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { CardSkeleton } from '../../../shared/components/ui/Skeleton'
import { marketingService } from '../../../services/marketingService'

const C = { primary: '#1E3A8A', secondary: '#4F46E5', green: '#22C55E', amber: '#F59E0B' }

const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C' },
  facebook:  { icon: FaFacebook,  color: '#1877F2' },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2' },
  x:         { icon: FaXTwitter,  color: '#374151' },
  youtube:   { icon: FaXTwitter,  color: '#FF0000' },
  pinterest: { icon: FaXTwitter,  color: '#E60023' },
}

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

function platformColor(name) {
  const key = String(name || '').toLowerCase()
  const meta = PLATFORM_META[key]
  if (meta) return meta.color
  return C.primary
}

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[var(--r-md)] px-3 py-2 text-xs shadow-[var(--shadow-md)]"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color ?? p.stroke ?? 'var(--text)' }}>
          {p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function MarketingAnalyticsPage() {
  const navigate = useNavigate()
  const { activeClient } = useClient()
  const [range, setRange] = useState(7)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeClient) return
    let mounted = true
    ;(async () => {
      try {
        const result = await marketingService.analytics(activeClient.id, { days: range })
        if (!mounted) return
        setData(result)
      } catch {
        if (mounted) setData(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [activeClient, range])

  if (!activeClient) {
    return (
      <div className="p-6">
        <div className="card">
          <EmptyState
            icon={Users}
            title="No client selected"
            message="Pick a client workspace to view marketing analytics."
            action={{ label: 'View Clients', onClick: () => navigate('/dashboard/mkt/clients') }}
          />
        </div>
      </div>
    )
  }

  const kpis = data?.kpis ?? {}
  const series = data?.series ?? []
  const platformSplit = data?.platformSplit ?? []
  const approval = data?.approval ?? []
  const platformTotal = platformSplit.reduce((sum, p) => sum + (p.value || 0), 0)

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <PageHeader
        title="Marketing Analytics"
        subtitle={`Workflow performance for ${activeClient.name}`}
        actions={
          <div className="flex gap-1 p-1 rounded-[var(--r-md)]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {RANGES.map(r => (
              <button key={r.days} onClick={() => { setRange(r.days); setLoading(true) }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: range === r.days ? 'var(--primary)' : 'transparent',
                  color: range === r.days ? '#fff' : 'var(--text-muted)',
                }}>
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Posts Published" value={kpis.publishedPosts ?? 0} icon={Send} iconColor={C.primary} iconBg="rgba(30,58,138,.12)" index={0} />
            <StatCard title="Scheduled" value={kpis.scheduledPosts ?? 0} icon={Clock} iconColor={C.secondary} iconBg="rgba(79,70,229,.10)" index={1} />
            <StatCard title="Active Campaigns" value={kpis.activeCampaigns ?? 0} icon={Target} iconColor="#EF4444" iconBg="rgba(239,68,68,.10)" index={2} />
            <StatCard title="Pending Requests" value={kpis.pendingRequests ?? 0} icon={FileText} iconColor={C.amber} iconBg="rgba(245,158,11,.12)" index={3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5 lg:col-span-2">
              <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>Posts Over Time</h2>
              {series.length === 0 ? (
                <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>No posts in this period.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="mktbg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.secondary} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={C.secondary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<Tip />} />
                    <Area type="monotone" dataKey="posts" name="Posts" stroke={C.secondary} strokeWidth={2} fill="url(#mktbg)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5">
              <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>Approval Breakdown</h2>
              {approval.length === 0 ? (
                <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>No work requests yet.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={approval} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" nameKey="name" paddingAngle={3}>
                        {approval.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v}`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className="flex flex-col gap-1.5 mt-2">
                    {approval.map(p => (
                      <li key={p.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                          <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
                        </span>
                        <span className="font-semibold" style={{ color: 'var(--text)' }}>{p.value}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5">
            <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>Posts by Platform</h2>
            {platformSplit.length === 0 ? (
              <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>No platform activity yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {platformSplit.map(p => {
                  const pct = platformTotal ? Math.round((p.value / platformTotal) * 100) : 0
                  const meta = PLATFORM_META[String(p.name || '').toLowerCase()]
                  const Icon = meta?.icon
                  return (
                    <li key={p.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5">
                          {Icon && <Icon size={13} style={{ color: meta.color }} />}
                          <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
                        </span>
                        <span className="font-semibold" style={{ color: 'var(--text)' }}>{p.value} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-alt)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: platformColor(p.name) }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}
