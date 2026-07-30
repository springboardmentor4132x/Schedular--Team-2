import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  Users, Eye, Heart, TrendingUp, MousePointer, Share2,
  CheckSquare, Clock, Send, FileText,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import StatCard from '../../../components/dashboard/StatCard'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'

const C = { primary: '#1E3A8A', secondary: '#4F46E5', green: '#22C55E', amber: '#F59E0B' }

const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C' },
  facebook:  { icon: FaFacebook,  color: '#1877F2' },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2' },
  x:         { icon: FaXTwitter,  color: '#374151' },
}

const MKT_TASK_PERF = [
  { week:'W1', assigned:8, completed:6, approved:5 },
  { week:'W2', assigned:12, completed:10, approved:9 },
  { week:'W3', assigned:9, completed:8, approved:7 },
  { week:'W4', assigned:14, completed:13, approved:12 },
]

const MKT_APPROVAL = [
  { name:'Approved', value:62, color: C.green },
  { name:'Rejected', value:18, color:'#EF4444' },
  { name:'Pending', value:20, color: C.amber },
]

const MKT_MEMBER_PERF = [
  { name:'Alex T.', submitted:12, approved:10, published:9 },
  { name:'Sam R.', submitted:9, approved:8, published:7 },
  { name:'Jordan L.', submitted:15, approved:13, published:12 },
  { name:'Riley K.', submitted:7, approved:5, published:5 },
]

const MKT_PLATFORM_OUTPUT = [
  { name:'Instagram', posts:24 },
  { name:'Facebook', posts:18 },
  { name:'LinkedIn', posts:12 },
  { name:'X', posts:31 },
]

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[var(--r-md)] px-3 py-2 text-xs shadow-[var(--shadow-md)]"
      style={{ background:'var(--card)', border:'1px solid var(--border)', color:'var(--text)' }}>
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
  const [range, setRange] = useState('7 days')

  const ranges = ['7 days', '30 days', '90 days']

  if (!activeClient) {
    return (
      <div className="p-6">
        <div className="card">
          <EmptyState
            icon={Users}
            title="No client selected"
            message="Pick a client workspace to view marketing analytics."
            action={{ label:'View Clients', onClick: () => navigate('/dashboard/mkt/clients') }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <PageHeader
        title="Marketing Analytics"
        subtitle={`Workflow performance for ${activeClient.name}`}
        actions={
          <div className="flex gap-1 p-1 rounded-[var(--r-md)]" style={{ background:'var(--card)', border:'1px solid var(--border)' }}>
            {ranges.map(r => (
              <button key={r} onClick={() => setRange(r)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: range === r ? 'var(--primary)' : 'transparent',
                  color: range === r ? '#fff' : 'var(--text-muted)',
                }}>
                {r}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Posts Published" value="47" icon={Send} iconColor={C.primary} iconBg="rgba(30,58,138,.12)" trend={12} index={0} />
        <StatCard title="Approval Rate" value="84%" icon={CheckSquare} iconColor={C.green} iconBg="rgba(34,197,94,.12)" trend={5} index={1} />
        <StatCard title="Avg. Review Time" value="3.2h" icon={Clock} iconColor={C.amber} iconBg="rgba(245,158,11,.12)" trend={-8} index={2} />
        <StatCard title="Pending This Week" value="8" icon={FileText} iconColor={C.secondary} iconBg="rgba(79,70,229,.10)" trend={0} index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>Weekly Workflow Performance</h2>
            <div className="flex gap-4 text-xs" style={{ color:'var(--text-muted)' }}>
              {[['#A7B6D0','Assigned'],[C.secondary,'Completed'],[C.green,'Approved']].map(([c,n]) => (
                <span key={n} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background:c }} />{n}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MKT_TASK_PERF} margin={{ top:4, right:4, bottom:0, left:-20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize:11, fill:'var(--text-subtle)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'var(--text-subtle)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="assigned" name="Assigned" fill="#A7B6D0" radius={[4,4,0,0]} />
              <Bar dataKey="completed" name="Completed" fill={C.secondary} radius={[4,4,0,0]} />
              <Bar dataKey="approved" name="Approved" fill={C.green} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className="card p-5">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>Approval Breakdown</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={MKT_APPROVAL} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {MKT_APPROVAL.map(e => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v,n) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="flex flex-col gap-1.5 mt-2">
            {MKT_APPROVAL.map(p => (
              <li key={p.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background:p.color }} />
                  <span style={{ color:'var(--text-muted)' }}>{p.name}</span>
                </span>
                <span className="font-semibold" style={{ color:'var(--text)' }}>{p.value}%</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="card p-5 mb-4">
        <h2 className="text-sm font-bold mb-4" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>Team Member Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Member','Submitted','Approved','Published','Approval Rate'].map(h => (
                  <th key={h} className="text-left pb-3 pr-6 text-xs font-semibold" style={{ color:'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MKT_MEMBER_PERF.map((m, i) => {
                const approvalRate = ((m.approved / m.submitted) * 100).toFixed(0)
                return (
                  <motion.tr key={m.name} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i * 0.04 }} className="hover:bg-[var(--bg-alt)] transition-colors" style={{ borderBottom:'1px solid var(--border)' }}>
                    <td className="py-3 pr-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background:'linear-gradient(135deg, #1E3A8A, #4F46E5)' }}>
                          {m.name[0]}
                        </div>
                        <span className="font-semibold text-sm" style={{ color:'var(--text)' }}>{m.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-6 text-sm font-semibold" style={{ color:'var(--text)' }}>{m.submitted}</td>
                    <td className="py-3 pr-6 text-sm font-semibold" style={{ color:C.green }}>{m.approved}</td>
                    <td className="py-3 pr-6 text-sm font-semibold" style={{ color:C.primary }}>{m.published}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full max-w-[80px]" style={{ background:'var(--bg-alt)' }}>
                          <div className="h-1.5 rounded-full" style={{ width:`${approvalRate}%`, background:C.green }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color:C.green }}>{approvalRate}%</span>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }} className="card p-5">
        <h2 className="text-sm font-bold mb-4" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>Posts Published by Platform</h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={MKT_PLATFORM_OUTPUT} margin={{ top:4, right:4, bottom:0, left:-20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize:11, fill:'var(--text-subtle)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'var(--text-subtle)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="posts" name="Posts Published" fill={C.primary} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
