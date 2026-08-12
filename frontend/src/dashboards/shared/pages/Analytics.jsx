import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  FileText, CheckCircle2, Clock, Target, Link2,
  Send, Users, Heart,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { useAuth } from '../../../context/AuthContext'
import StatCard from '../../../components/dashboard/StatCard'
import PageHeader from '../../../components/dashboard/PageHeader'
import { CardSkeleton } from '../../../shared/components/ui/Skeleton'
import { fetchBusinessAnalytics } from '../../business/services/businessService'
import { marketingService } from '../../../services/marketingService'

/* ── Shared chart colors ────────────────────────────────────────── */
const C = { primary: '#1E3A8A', secondary: '#4F46E5', green: '#22C55E', amber: '#F59E0B' }

const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C' },
  facebook:  { icon: FaFacebook,  color: '#1877F2' },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2' },
  x:         { icon: FaXTwitter,  color: '#374151' },
  youtube:   { icon: FaXTwitter,  color: '#FF0000' },
  pinterest: { icon: FaXTwitter,  color: '#E60023' },
}
const PLATFORM_FALLBACK = ['#1E3A8A', '#4F46E5', '#E1306C', '#0A66C2', '#22C55E', '#F59E0B']

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

function platformColor(name) {
  const key = String(name || '').toLowerCase()
  const meta = PLATFORM_META[key]
  if (meta) return meta.color
  return PLATFORM_FALLBACK[(PLATFORM_FALLBACK.length + key.length) % PLATFORM_FALLBACK.length]
}

/* ── Tooltip ────────────────────────────────────────────────────── */
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

/* ── Loading / empty states ─────────────────────────────────────── */
function LoadingState() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </>
  )
}

/* ── Business Analytics view ────────────────────────────────────── */
function BusinessAnalytics({ data }) {
  const kpis = data?.kpis ?? {}
  const series = data?.series ?? []
  const monthly = data?.monthly ?? []
  const platformSplit = data?.platformSplit ?? []
  const topPosts = data?.topPosts ?? []
  const platformTotal = platformSplit.reduce((sum, p) => sum + (p.value || 0), 0)

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard title="Published" value={kpis.publishedPosts ?? 0} icon={CheckCircle2} iconColor={C.green} iconBg="rgba(34,197,94,.10)" index={0} />
        <StatCard title="Scheduled" value={kpis.scheduledPosts ?? 0} icon={Clock} iconColor={C.secondary} iconBg="rgba(79,70,229,.10)" index={1} />
        <StatCard title="Drafts" value={kpis.drafts ?? 0} icon={FileText} iconColor={C.amber} iconBg="rgba(245,158,11,.12)" index={2} />
        <StatCard title="Active Campaigns" value={kpis.activeCampaigns ?? 0} icon={Target} iconColor="#EF4444" iconBg="rgba(239,68,68,.10)" index={3} />
        <StatCard title="Connected Accounts" value={kpis.connectedAccounts ?? 0} icon={Link2} iconColor={C.primary} iconBg="rgba(30,58,138,.12)" index={4} />
        <StatCard title="Total Posts" value={kpis.totalPosts ?? 0} icon={Heart} iconColor="#A7B6D0" iconBg="rgba(167,182,208,.20)" index={5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            Posts Over Time
          </h2>
          {series.length === 0 ? (
            <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>No posts in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="bgposts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.primary} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="posts" name="Posts" stroke={C.primary} strokeWidth={2} fill="url(#bgposts)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card p-5">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            Platform Split
          </h2>
          {platformSplit.length === 0 ? (
            <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>No connected platforms yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={platformSplit} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="value" nameKey="name" paddingAngle={3}>
                    {platformSplit.map(entry => <Cell key={entry.name} fill={platformColor(entry.name)} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v}`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex flex-col gap-1.5 mt-2">
                {platformSplit.map(p => {
                  const pct = platformTotal ? Math.round((p.value / platformTotal) * 100) : 0
                  return (
                    <li key={p.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: platformColor(p.name) }} />
                        <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
                      </span>
                      <span className="font-semibold" style={{ color: 'var(--text)' }}>{p.value} ({pct}%)</span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card p-5">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            Monthly Post Volume
          </h2>
          {monthly.length === 0 ? (
            <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>No posts yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Line type="monotone" dataKey="posts" name="Posts" stroke={C.primary} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card p-5">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            Recent Posts
          </h2>
          {topPosts.length === 0 ? (
            <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>No posts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Post', 'Platform', 'Date', 'Status'].map(h => (
                      <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topPosts.map(p => {
                    const meta = PLATFORM_META[String(p.platform || '').toLowerCase()]
                    const Icon = meta?.icon
                    return (
                      <tr key={p.id} className="hover:bg-[var(--bg-alt)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-2.5 pr-4 font-medium" style={{ color: 'var(--text)' }}>{p.title}</td>
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-1.5">
                            {Icon && <Icon size={13} style={{ color: meta.color }} />}
                            <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{p.platform}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 text-xs" style={{ color: 'var(--text-muted)' }}>{p.date}</td>
                        <td className="py-2.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(34,197,94,.12)', color: '#22C55E' }}>{p.status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}

/* ── Marketing Analytics view ───────────────────────────────────── */
function MarketingAnalytics({ data }) {
  const kpis = data?.kpis ?? {}
  const series = data?.series ?? []
  const platformSplit = data?.platformSplit ?? []
  const publishingStatus = data?.publishingStatus ?? []
  const clients = data?.clients ?? []
  const platformTotal = platformSplit.reduce((sum, p) => sum + (p.value || 0), 0)

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard title="Posts Published" value={kpis.publishedPosts ?? 0} icon={Send} iconColor={C.primary} iconBg="rgba(30,58,138,.12)" index={0} />
        <StatCard title="Scheduled" value={kpis.scheduledPosts ?? 0} icon={Clock} iconColor={C.secondary} iconBg="rgba(79,70,229,.10)" index={1} />
        <StatCard title="Drafts" value={kpis.drafts ?? 0} icon={FileText} iconColor={C.amber} iconBg="rgba(245,158,11,.12)" index={2} />
        <StatCard title="Active Campaigns" value={kpis.activeCampaigns ?? 0} icon={Target} iconColor="#EF4444" iconBg="rgba(239,68,68,.10)" index={3} />
        <StatCard title="Pending Requests" value={kpis.pendingRequests ?? 0} icon={Heart} iconColor={C.green} iconBg="rgba(34,197,94,.12)" index={4} />
        <StatCard title="Assigned Clients" value={kpis.assignedClients ?? 0} icon={Users} iconColor="#A7B6D0" iconBg="rgba(167,182,208,.20)" index={5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            Posts Over Time
          </h2>
          {series.length === 0 ? (
            <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>No posts in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="bgmkposts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.secondary} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={C.secondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="posts" name="Posts" stroke={C.secondary} strokeWidth={2} fill="url(#bgmkposts)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card p-5">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            Publishing Status
          </h2>
          {publishingStatus.length === 0 ? (
            <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>No posts yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={publishingStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="value" nameKey="name" paddingAngle={3}>
                    {publishingStatus.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v}`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex flex-col gap-1.5 mt-2">
                {publishingStatus.map(p => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card p-5">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            Client Output
          </h2>
          {clients.length === 0 ? (
            <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>No clients assigned.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Client', 'Submitted', 'Approved', 'Published'].map(h => (
                      <th key={h} className="text-left pb-3 pr-6 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map((m, i) => (
                    <motion.tr key={m.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="hover:bg-[var(--bg-alt)] transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3 pr-6">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #1E3A8A, #4F46E5)' }}>
                            {m.logo}
                          </div>
                          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{m.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-6 text-sm font-semibold" style={{ color: 'var(--text)' }}>{m.submitted}</td>
                      <td className="py-3 pr-6 text-sm font-semibold" style={{ color: C.green }}>{m.approved}</td>
                      <td className="py-3 text-sm font-semibold" style={{ color: C.primary }}>{m.published}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card p-5">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
            Posts by Platform
          </h2>
          {platformSplit.length === 0 ? (
            <p className="text-xs py-8 text-center" style={{ color: 'var(--text-muted)' }}>No platform activity yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {platformSplit.map(p => {
                const pct = platformTotal ? Math.round((p.value / platformTotal) * 100) : 0
                return (
                  <li key={p.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
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
      </div>
    </>
  )
}

/* ── Main export ────────────────────────────────────────────────── */
export default function Analytics() {
  const { role } = useAuth()
  const isMarketing = role === 'marketing'
  const [range, setRange] = useState(7)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const result = isMarketing
          ? await marketingService.analytics(null, { days: range })
          : await fetchBusinessAnalytics({ days: range })
        if (!mounted) return
        setData(result)
      } catch {
        if (mounted) setData(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [isMarketing, range])

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Analytics"
        subtitle={isMarketing
          ? 'Team workflow metrics — output, publishing status, and platform performance.'
          : 'Content activity across your connected platforms.'}
        actions={
          <div
            className="flex gap-1 p-1 rounded-[var(--r-md)]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
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

      {loading ? <LoadingState /> : (
        isMarketing
          ? <MarketingAnalytics data={data} />
          : <BusinessAnalytics data={data} />
      )}
    </div>
  )
}
