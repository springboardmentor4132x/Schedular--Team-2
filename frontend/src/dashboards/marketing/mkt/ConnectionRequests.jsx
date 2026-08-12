import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Mail, Building2, CheckCircle2, XCircle,
  Loader2, Clock, Inbox, Check, X, MessageSquareText,
} from 'lucide-react'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import StatCard from '../../../components/dashboard/StatCard'
import { marketingService } from '../../../services/marketingService'

const STATUS_STYLES = {
  pending:  { label: 'Pending',  color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
  approved: { label: 'Approved', color: '#22C55E', bg: 'rgba(34,197,94,.12)'  },
  rejected: { label: 'Rejected', color: '#EF4444', bg: 'rgba(239,68,68,.12)'  },
}

function formatDate(value) {
  if (!value) return 'Recently'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Recently'
  const diff = Math.round((Date.now() - d.getTime()) / 60000)
  if (diff < 60) return `${Math.max(diff, 1)}m ago`
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function DecisionModal({ request, onConfirm, onCancel, submitting }) {
  const [note, setNote] = useState('')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-md rounded-[var(--r-xl)] p-6 shadow-[var(--shadow-lg)]"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-base font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>
            {request.status === 'approved' ? 'Approve' : 'Reject'} connection request
          </h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {request.companyName} ({request.contactName}) will be{' '}
          <span className="font-semibold" style={{ color: request.status === 'approved' ? '#22C55E' : '#EF4444' }}>
            {request.status === 'approved' ? 'added as a client' : 'notified of the rejection'}
          </span>
          {' '}after this decision.
        </p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          placeholder="Optional decision note…"
          className="w-full p-3 text-sm rounded-[var(--r-md)] border outline-none resize-none mb-5"
          style={{ background: 'var(--bg-alt)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        <div className="flex flex-col gap-2">
          <button onClick={() => onConfirm(note.trim())} disabled={submitting}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105 transition-all"
            style={{ background: request.status === 'approved' ? 'linear-gradient(135deg,#16A34A,#22C55E)' : 'linear-gradient(135deg,#DC2626,#EF4444)' }}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : request.status === 'approved' ? <Check size={14} /> : <X size={14} />}
            {request.status === 'approved' ? 'Approve request' : 'Reject request'}
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

export default function ConnectionRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState(null)
  const [decision, setDecision] = useState(null)

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await marketingService.connectionRequests()
      setRequests(data ?? [])
    } catch {
      setNotice({ type: 'error', text: 'Failed to load connection requests.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    marketingService.connectionRequests()
      .then(data => { if (active) setRequests(data ?? []) })
      .catch(() => { if (active) setNotice({ type: 'error', text: 'Failed to load connection requests.' }) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const handleDecision = async (note) => {
    setSubmitting(true)
    setNotice(null)
    try {
      await marketingService.decideConnectionRequest(decision.id, decision.status, note)
      setDecision(null)
      await refresh()
      setNotice({
        type: 'success',
        text: decision.status === 'approved'
          ? `${decision.companyName} is now your client.`
          : `Request from ${decision.companyName} rejected.`,
      })
    } catch (error) {
      setDecision(null)
      await refresh()
      setNotice({ type: 'error', text: error?.response?.data?.detail ?? 'Could not update the request.' })
    } finally {
      setSubmitting(false)
    }
  }

  const pending = requests.filter(r => r.status === 'pending')
  const approved = requests.filter(r => r.status === 'approved')
  const rejected = requests.filter(r => r.status === 'rejected')

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <PageHeader title="Connection Requests" subtitle="Businesses request your team to manage their social media. Approve to add them as a client." />

      {notice && (
        <div className="mb-4 px-4 py-3 rounded-[var(--r-md)] text-sm font-medium"
          style={{ background: notice.type === 'success' ? 'rgba(34,197,94,.10)' : 'rgba(239,68,68,.10)', color: notice.type === 'success' ? '#22C55E' : '#EF4444', border: `1px solid ${notice.type === 'success' ? 'rgba(34,197,94,.20)' : 'rgba(239,68,68,.20)'}` }}>
          {notice.text}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Pending"   value={pending.length}   icon={Clock}      iconColor="#F59E0B" iconBg="rgba(245,158,11,.12)" index={0} />
        <StatCard title="Approved"  value={approved.length}  icon={CheckCircle2} iconColor="#22C55E" iconBg="rgba(34,197,94,.12)"  index={1} />
        <StatCard title="Rejected"  value={rejected.length}  icon={XCircle}    iconColor="#EF4444" iconBg="rgba(239,68,68,.12)"  index={2} />
        <StatCard title="Total"     value={requests.length}  icon={Inbox}      iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)"  index={3} />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)' }} />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="card"><EmptyState icon={Users} title="No connection requests" message="When a business requests your team, it will appear here for you to approve." /></div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((req, i) => {
            const st = STATUS_STYLES[req.status] ?? STATUS_STYLES.pending
            return (
              <motion.div key={req.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="card p-4 flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                    {(req.companyName || req.contactName || '?').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold truncate" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>{req.companyName}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                    <div className="flex flex-col gap-1 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1.5"><Building2 size={11} /> {req.industry || 'Unspecified'}</span>
                      <span className="flex items-center gap-1.5"><Mail size={11} /> {req.email}</span>
                      <span className="flex items-center gap-1.5"><Clock size={11} /> Requested {formatDate(req.createdAt)}</span>
                      {req.decisionNote && <span className="flex items-center gap-1.5 mt-0.5" style={{ color: 'var(--text-subtle)' }}><MessageSquareText size={11} /> {req.decisionNote}</span>}
                    </div>
                  </div>
                </div>

                {req.status === 'pending' ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setDecision({ ...req, status: 'approved' })}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--r-sm)] text-xs font-semibold text-white transition-all hover:brightness-105"
                      style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                      <Check size={13} /> Approve
                    </button>
                    <button onClick={() => setDecision({ ...req, status: 'rejected' })}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--r-sm)] text-xs font-semibold transition-all"
                      style={{ background: 'rgba(239,68,68,.10)', color: '#EF4444' }}>
                      <X size={13} /> Reject
                    </button>
                  </div>
                ) : req.status === 'approved' ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold flex-shrink-0" style={{ color: '#22C55E' }}>
                    <CheckCircle2 size={14} /> Managing
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-semibold flex-shrink-0" style={{ color: '#EF4444' }}>
                    <XCircle size={14} /> Rejected
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {decision && <DecisionModal request={decision} onConfirm={handleDecision} onCancel={() => setDecision(null)} submitting={submitting} />}
      </AnimatePresence>
    </div>
  )
}
