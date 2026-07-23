import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone, Plus, Search, Edit3, Archive,
  Users, TrendingUp, Calendar, DollarSign,
  Target, MoreHorizontal, X, CheckCircle2,
} from 'lucide-react'
import PageHeader from '../../components/dashboard/PageHeader'
import EmptyState from '../../components/dashboard/EmptyState'

const INIT_CAMPAIGNS = [
  { id:1, name:'Summer Sale 2025',   objective:'Brand Awareness', budget:2400, spent:1632, status:'active', start:'2025-07-01', end:'2025-07-31', progress:68, members:['AJ','SR','KL'], platforms:['instagram','facebook','x'],        posts:24, reach:48000 },
  { id:2, name:'Product Launch Q3',  objective:'Lead Generation', budget:5000, spent:1700, status:'active', start:'2025-07-15', end:'2025-08-31', progress:34, members:['AJ','MR'],      platforms:['linkedin','instagram'],            posts:12, reach:21000 },
  { id:3, name:'Brand Awareness',    objective:'Reach',           budget:1200, spent:972,  status:'paused', start:'2025-06-01', end:'2025-07-30', progress:81, members:['SR','KL','DT'], platforms:['instagram','facebook','linkedin'], posts:36, reach:72000 },
  { id:4, name:'Holiday Promo 2024', objective:'Sales',           budget:3500, spent:3500, status:'completed',start:'2024-12-01',end:'2024-12-31',progress:100,members:['AJ'],          platforms:['instagram','x'],                   posts:48, reach:96000 },
]

const STATUS_STYLES = {
  active:    { label:'Active',    bg:'rgba(34,197,94,.12)',   color:'#22C55E' },
  paused:    { label:'Paused',    bg:'rgba(245,158,11,.12)',  color:'#F59E0B' },
  completed: { label:'Completed', bg:'rgba(100,116,139,.12)', color:'#64748B' },
  draft:     { label:'Draft',     bg:'rgba(30,58,138,.12)',   color:'#1E3A8A' },
}

function Avatar({ initials }) {
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold -ml-1 first:ml-0 border-2 border-[var(--card)]"
      style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
      {initials}
    </div>
  )
}

function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name:'', objective:'Brand Awareness', budget:'', start:'', end:'' })
  const objectives = ['Brand Awareness','Lead Generation','Sales','Reach','Engagement']
  const submit = e => {
    e.preventDefault()
    if (!form.name.trim()) return
    onCreate({ ...form, budget: Number(form.budget) || 0, id: Date.now(), status:'draft', progress:0, spent:0, members:[], platforms:[], posts:0, reach:0 })
    onClose()
  }
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div initial={{ scale:0.95, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95 }}
        className="w-full max-w-md rounded-[var(--r-xl)] p-6 shadow-[var(--shadow-lg)]"
        style={{ background:'var(--card)', border:'1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>
            Create Campaign
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color:'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {[
            { label:'Campaign Name', key:'name', type:'text', placeholder:'e.g. Summer Sale 2025' },
            { label:'Budget ($)',    key:'budget', type:'number', placeholder:'e.g. 2500' },
            { label:'Start Date',   key:'start',  type:'date', placeholder:'' },
            { label:'End Date',     key:'end',    type:'date', placeholder:'' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>{f.label}</label>
              <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none"
                style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }} />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Objective</label>
            <select value={form.objective} onChange={e => setForm(p => ({ ...p, objective: e.target.value }))}
              className="w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none"
              style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }}>
              {objectives.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 rounded-[var(--r-md)] border text-sm font-semibold transition-all"
              style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
              Cancel
            </button>
            <button type="submit"
              className="flex-1 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white transition-all hover:brightness-105"
              style={{ background:'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
              Create Campaign
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState(INIT_CAMPAIGNS)
  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState('all')
  const [showModal, setShowModal] = useState(false)

  const filtered = campaigns.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status === 'all' || c.status === status
    return matchSearch && matchStatus
  })

  const archive = id => setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status:'completed' } : c))

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Campaigns"
        subtitle={`${campaigns.filter(c => c.status === 'active').length} active campaigns`}
        actions={
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105 transition-all"
            style={{ background:'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
            <Plus size={15} /> New Campaign
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-subtle)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns…"
            className="w-full h-10 pl-9 pr-4 text-sm rounded-[var(--r-md)] border outline-none"
            style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }} />
        </div>
        <div className="flex gap-1.5">
          {['all','active','paused','completed','draft'].map(s => {
            const st = STATUS_STYLES[s]
            const active = status === s
            return (
              <button key={s} onClick={() => setStatus(s)}
                className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                style={{
                  background:  active ? (st?.bg ?? 'var(--primary-light)') : 'var(--card)',
                  borderColor: active ? (st?.color ?? 'var(--primary)') : 'var(--border)',
                  color:       active ? (st?.color ?? 'var(--primary)') : 'var(--text-muted)',
                }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="card"><EmptyState icon={Megaphone} title="No campaigns found" message="Create your first campaign to get started." /></div>
      )}

      {/* Campaign cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filtered.map((c, i) => {
            const s = STATUS_STYLES[c.status]
            const budgetPct = c.budget ? Math.round((c.spent / c.budget) * 100) : 0
            return (
              <motion.div key={c.id}
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, scale:0.95 }}
                transition={{ duration:0.2, delay: i * 0.05 }}
                className="card p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background:s.bg, color:s.color }}>{s.label}</span>
                    </div>
                    <h3 className="text-base font-bold truncate" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Target size={11} style={{ color:'var(--text-subtle)' }} />
                      <span className="text-xs" style={{ color:'var(--text-muted)' }}>{c.objective}</span>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)] transition-colors" style={{ color:'var(--text-muted)' }}>
                    <MoreHorizontal size={15} />
                  </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { icon:DollarSign, label:'Budget',  value:`$${c.budget.toLocaleString()}` },
                    { icon:TrendingUp,  label:'Reach',   value:c.reach >= 1000 ? `${(c.reach/1000).toFixed(0)}K` : c.reach },
                    { icon:Megaphone,   label:'Posts',   value:c.posts },
                  ].map(m => {
                    const Icon = m.icon
                    return (
                      <div key={m.label} className="flex flex-col items-center gap-0.5 p-2 rounded-lg"
                        style={{ background:'var(--bg-alt)' }}>
                        <Icon size={12} style={{ color:'var(--text-muted)' }} />
                        <span className="text-xs font-bold" style={{ color:'var(--text)' }}>{m.value}</span>
                        <span className="text-[10px]" style={{ color:'var(--text-subtle)' }}>{m.label}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Budget progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color:'var(--text-muted)' }}>Budget spent</span>
                    <span className="text-xs font-bold" style={{ color: budgetPct > 90 ? 'var(--error)' : 'var(--text)' }}>
                      ${c.spent.toLocaleString()} / ${c.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background:'var(--bg-alt)' }}>
                    <div className="h-2 rounded-full transition-all duration-500"
                      style={{ width:`${budgetPct}%`, background: budgetPct > 90 ? 'var(--error)' : 'var(--primary)' }} />
                  </div>
                </div>

                {/* Date + members + actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} style={{ color:'var(--text-subtle)' }} />
                    <span className="text-[11px]" style={{ color:'var(--text-subtle)' }}>
                      {c.start} – {c.end}
                    </span>
                  </div>
                  {/* Member avatars */}
                  <div className="flex items-center">
                    {c.members.map(m => <Avatar key={m} initials={m} />)}
                  </div>
                </div>

                {/* Footer actions */}
                {c.status !== 'completed' && (
                  <div className="flex gap-2 pt-3 mt-3 border-t" style={{ borderColor:'var(--border)' }}>
                    <button className="flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color:'var(--primary)' }}>
                      <Edit3 size={11} /> Edit
                    </button>
                    <button onClick={() => archive(c.id)}
                      className="flex items-center gap-1 text-xs font-semibold hover:underline ml-auto" style={{ color:'var(--text-muted)' }}>
                      <Archive size={11} /> Archive
                    </button>
                  </div>
                )}
                {c.status === 'completed' && (
                  <div className="flex items-center gap-1 pt-3 mt-3 border-t text-xs" style={{ borderColor:'var(--border)', color:'#22C55E' }}>
                    <CheckCircle2 size={12} /> Campaign completed
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && (
          <CreateModal
            onClose={() => setShowModal(false)}
            onCreate={c => setCampaigns(prev => [c, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
