import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search, Users, Megaphone, CalendarCheck,
  FileText, ExternalLink, ChevronDown,
  Globe, Mail, MapPin, Check, X, Loader2, Inbox, Clock,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import { useClient } from '../../../context/ClientContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { marketingService } from '../../../services/marketingService'

function formatRequestTime(value) {
  if (!value) return 'Recently'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Recently'
  const diff = Math.round((Date.now() - d.getTime()) / 60000)
  if (diff < 60) return `${Math.max(diff, 1)}m ago`
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ApproveModal({ request, action, onConfirm, onCancel, submitting }) {
  const [note, setNote] = useState('')
  const approve = action === 'approved'
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-md rounded-[var(--r-xl)] p-6 shadow-[var(--shadow-lg)]"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-base font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>
            {approve ? 'Approve client' : 'Reject request'}
          </h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {approve ? (
            <>Approve <span className="font-semibold" style={{ color: 'var(--text)' }}>{request.companyName}</span> as a client? They will appear in your workspace immediately.</>
          ) : (
            <>Reject <span className="font-semibold" style={{ color: 'var(--text)' }}>{request.companyName}</span>'s request? They will be notified.</>
          )}
        </p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          placeholder="Optional note…"
          className="w-full p-3 text-sm rounded-[var(--r-md)] border outline-none resize-none mb-5"
          style={{ background: 'var(--bg-alt)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        <div className="flex flex-col gap-2">
          <button onClick={() => onConfirm(note.trim())} disabled={submitting}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105 transition-all"
            style={{ background: approve ? 'linear-gradient(135deg,#16A34A,#22C55E)' : 'linear-gradient(135deg,#DC2626,#EF4444)' }}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : approve ? <Check size={14} /> : <X size={14} />}
            {approve ? 'Approve client' : 'Reject request'}
          </button>
          <button onClick={onCancel}
            className="w-full h-10 rounded-[var(--r-md)] border text-sm font-semibold transition-all"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const PLATFORM_ICONS = {
  instagram: { icon: FaInstagram, color: '#E1306C' },
  facebook:  { icon: FaFacebook,  color: '#1877F2' },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2' },
  x:         { icon: FaXTwitter,  color: '#374151' },
  youtube:   { icon: FaYoutube,   color: '#FF0000' },
  pinterest: { icon: FaPinterest, color: '#E60023' },
}

const STATUS_STYLES = {
  active: { label: 'Active', color: '#22C55E', bg: 'rgba(34,197,94,.12)' },
  paused: { label: 'Paused', color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
}

const INDUSTRIES = ['All', 'Technology', 'E-Commerce', 'Finance', 'Health & Wellness']

export default function Clients() {
  const navigate = useNavigate()
  const { selectClient, clients, loadingClients, refreshClients } = useClient()
  const [search,   setSearch]   = useState('')
  const [industry, setIndustry] = useState('All')
  const [status,   setStatus]   = useState('all')
  const [sortBy,   setSortBy]   = useState('name')
  const [requests, setRequests] = useState([])
  const [loadingReq, setLoadingReq] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notice,   setNotice]   = useState(null)
  const [decision, setDecision] = useState(null)

  const loadRequests = async () => {
    setLoadingReq(true)
    try {
      const data = await marketingService.connectionRequests()
      setRequests(data ?? [])
    } catch {
      setRequests([])
    } finally {
      setLoadingReq(false)
    }
  }

  useEffect(() => {
    let active = true
    marketingService.connectionRequests()
      .then(data => { if (active) setRequests(data ?? []) })
      .catch(() => { if (active) setRequests([]) })
    return () => { active = false }
  }, [])

  const handleDecision = async (note) => {
    setSubmitting(true)
    setNotice(null)
    try {
      await marketingService.decideConnectionRequest(decision.id, decision.status, note)
      const name = decision.companyName
      setDecision(null)
      await loadRequests()
      await refreshClients()
      setNotice({
        type: 'success',
        text: decision.status === 'approved'
          ? `${name} approved as a client.`
          : `Request from ${name} rejected.`,
      })
    } catch (error) {
      setNotice({ type: 'error', text: error?.response?.data?.detail ?? 'Could not update the request.' })
    } finally {
      setSubmitting(false)
    }
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')

  const clientSource = clients

  const filtered = clientSource
    .filter(c => {
      const matchSearch   = c.name.toLowerCase().includes(search.toLowerCase())
      const matchIndustry = industry === 'All' || c.industry === industry
      const matchStatus   = status   === 'all' || c.status   === status
      return matchSearch && matchIndustry && matchStatus
    })
    .sort((a, b) => {
      if (sortBy === 'name')      return a.name.localeCompare(b.name)
      if (sortBy === 'campaigns') return b.activeCampaigns - a.activeCampaigns
      if (sortBy === 'posts')     return b.scheduledPosts - a.scheduledPosts
      return 0
    })

  const openWorkspace = c => {
    selectClient(c)
    navigate('/dashboard/mkt/workspace')
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <PageHeader
        title="Clients"
        subtitle={`${clientSource.filter(c => c.status === 'active').length} active · ${clientSource.length} approved clients`}
      />

      {notice && (
        <div className="mb-4 px-4 py-3 rounded-[var(--r-md)] text-sm font-medium"
          style={{ background: notice.type === 'success' ? 'rgba(34,197,94,.10)' : 'rgba(239,68,68,.10)', color: notice.type === 'success' ? '#22C55E' : '#EF4444', border: `1px solid ${notice.type === 'success' ? 'rgba(34,197,94,.20)' : 'rgba(239,68,68,.20)'}` }}>
          {notice.text}
        </div>
      )}

      {/* Pending client requests */}
      {(loadingReq || pendingRequests.length > 0) && (
        <div className="card p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,.12)' }}>
              <Inbox size={15} style={{ color: '#F59E0B' }} />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
                Client Requests ({pendingRequests.length})
              </h2>
              <p className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>Businesses requesting your team — approve to add them as a client.</p>
            </div>
          </div>

          {loadingReq ? (
            <div className="animate-pulse space-y-2">{[1, 2].map(i => <div key={i} className="h-16 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)' }} />)}</div>
          ) : (
            <div className="flex flex-col gap-2">
              {pendingRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between gap-3 p-3 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                      {(req.companyName || '?').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{req.companyName}</p>
                      <p className="text-[11px] truncate flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <Mail size={10} /> {req.email} · <Clock size={10} /> {formatRequestTime(req.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setDecision({ ...req, status: 'approved' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-sm)] text-xs font-semibold text-white transition-all hover:brightness-105"
                      style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                      <Check size={13} /> Approve
                    </button>
                    <button onClick={() => setDecision({ ...req, status: 'rejected' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-sm)] text-xs font-semibold transition-all"
                      style={{ background: 'rgba(239,68,68,.10)', color: '#EF4444' }}>
                      <X size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-subtle)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="w-full h-10 pl-9 pr-4 text-sm rounded-[var(--r-md)] border outline-none"
            style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }} />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {INDUSTRIES.map(i => (
            <button key={i} onClick={() => setIndustry(i)}
              className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
              style={{
                background:  industry === i ? 'var(--primary-light)' : 'var(--card)',
                borderColor: industry === i ? 'var(--primary)' : 'var(--border)',
                color:       industry === i ? 'var(--primary)' : 'var(--text-muted)',
              }}>
              {i}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 ml-auto">
          {['all','active','paused'].map(s => {
            const st = STATUS_STYLES[s]
            return (
              <button key={s} onClick={() => setStatus(s)}
                className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                style={{
                  background:  status === s ? (st?.bg ?? 'var(--primary-light)') : 'var(--card)',
                  borderColor: status === s ? (st?.color ?? 'var(--primary)')    : 'var(--border)',
                  color:       status === s ? (st?.color ?? 'var(--primary)')    : 'var(--text-muted)',
                }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            )
          })}
          <div className="relative">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="h-9 pl-3 pr-7 text-xs font-semibold rounded-[var(--r-md)] border outline-none appearance-none"
              style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
              <option value="name">Sort: Name</option>
              <option value="campaigns">Sort: Campaigns</option>
              <option value="posts">Sort: Posts</option>
            </select>
            <ChevronDown size={11} className="absolute right-2 top-3 pointer-events-none" style={{ color:'var(--text-subtle)' }} />
          </div>
        </div>
      </div>

      {loadingClients && <div className="card p-5 text-sm" style={{ color:'var(--text-muted)' }}>Loading assigned clients…</div>}
      {!loadingClients && filtered.length === 0 && (
        <div className="card"><EmptyState icon={Users} title="No clients found" message="Adjust your search or filters." /></div>
      )}

      {/* Client cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((c, i) => {
          const st = STATUS_STYLES[c.status]
          return (
            <motion.div key={c.id}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.25, delay:i * 0.05 }}
              whileHover={{ y:-2, transition:{ duration:0.15 } }}
              className="card p-5 flex flex-col gap-4"
              style={{ borderTop:`3px solid ${c.logoColor}` }}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background:c.logoColor }}>
                  {c.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3 className="text-sm font-bold truncate" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>
                      {c.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background:st?.bg, color:st?.color }}>
                      {st?.label}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color:'var(--text-muted)' }}>{c.industry}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-col gap-1.5">
                <p className="flex items-center gap-1.5 text-xs" style={{ color:'var(--text-subtle)' }}>
                  <MapPin size={11} /> {c.location}
                </p>
                <p className="flex items-center gap-1.5 text-xs" style={{ color:'var(--text-subtle)' }}>
                  <Mail size={11} /> {c.email}
                </p>
                <p className="flex items-center gap-1.5 text-xs" style={{ color:'var(--text-subtle)' }}>
                  <Globe size={11} /> {c.website}
                </p>
              </div>

              {/* Connected platforms */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {c.connectedPlatforms.map(p => {
                  const meta = PLATFORM_ICONS[p]; const Icon = meta?.icon
                  return Icon ? (
                    <div key={p} className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background:`${meta.color}15` }}>
                      <Icon size={12} style={{ color:meta.color }} />
                    </div>
                  ) : null
                })}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon:Megaphone,    label:'Campaigns', value:c.activeCampaigns, color:'#4F46E5' },
                  { icon:CalendarCheck,label:'Scheduled', value:c.scheduledPosts,  color:'#1E3A8A' },
                  { icon:FileText,     label:'Drafts',    value:c.draftPosts,      color:'#F59E0B' },
                  { icon:Users,        label:'Published', value:c.publishedPosts,  color:'#22C55E' },
                ].map(m => {
                  const Icon = m.icon
                  return (
                    <div key={m.label} className="flex flex-col items-center gap-0.5 p-2 rounded-lg"
                      style={{ background:'var(--bg-alt)' }}>
                      <Icon size={11} style={{ color:m.color }} />
                      <span className="text-xs font-bold" style={{ color:m.color }}>{m.value}</span>
                      <span className="text-[9px]" style={{ color:'var(--text-subtle)' }}>{m.label}</span>
                    </div>
                  )
                })}
              </div>

              <p className="text-[11px]" style={{ color:'var(--text-subtle)' }}>
                Last activity: {c.lastActivity}
              </p>

              {/* CTA */}
              <button onClick={() => openWorkspace(c)}
                className="w-full flex items-center justify-center gap-2 h-9 rounded-[var(--r-md)] text-sm font-semibold text-white transition-all hover:brightness-105 mt-auto"
                style={{ background:'linear-gradient(135deg, #1E3A8A, #4F46E5)' }}>
                <ExternalLink size={14} /> Open Workspace
              </button>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {decision && <ApproveModal request={decision} action={decision.status} onConfirm={handleDecision} onCancel={() => setDecision(null)} submitting={submitting} />}
      </AnimatePresence>
    </div>
  )
}
