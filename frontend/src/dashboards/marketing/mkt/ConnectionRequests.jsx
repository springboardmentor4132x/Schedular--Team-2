import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, CheckCircle2, X, Users, Clock3, Mail, RefreshCw, AlertCircle,
} from 'lucide-react'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { marketingService } from '../../../services/marketingService'
import { useClient } from '../../../context/ClientContext'

const STATUS_META = {
  pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
  approved: { label: 'Approved', color: '#22C55E', bg: 'rgba(34,197,94,.12)' },
  rejected: { label: 'Rejected', color: '#EF4444', bg: 'rgba(239,68,68,.12)' },
  cancelled: { label: 'Cancelled', color: '#64748B', bg: 'rgba(100,116,139,.12)' },
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending
  return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
}

export default function ConnectionRequests() {
  const { refreshClients } = useClient()
  const [requests, setRequests] = useState([])
  const [notice, setNotice] = useState(null)
  const [actingId, setActingId] = useState(null)
  const [rejectFor, setRejectFor] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = async () => {
    try {
      setRequests(await marketingService.connectionRequests())
    } catch {
      setRequests([])
    }
  }

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const items = await marketingService.connectionRequests()
        if (active) setRequests(items)
      } catch {
        if (active) setRequests([])
      }
    }
    load()
    return () => { active = false }
  }, [])

  const pendingRequests = useMemo(() => requests.filter(item => item.status === 'pending'), [requests])

  const handleApprove = async request => {
    setActingId(request.id)
    setNotice(null)
    try {
      await marketingService.decideConnectionRequest(request.id, 'approved', 'Approved')
      setNotice({ type: 'success', text: `Approved ${request.companyName}. They can now connect to your team.` })
      load()
      refreshClients()
    } catch (error) {
      setNotice({ type: 'error', text: error?.response?.data?.detail ?? 'Could not approve the request.' })
      load()
    } finally {
      setActingId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectFor) return
    const reason = rejectReason.trim() || 'Not accepted'
    setActingId(rejectFor.id)
    setNotice(null)
    try {
      await marketingService.decideConnectionRequest(rejectFor.id, 'rejected', reason)
      setNotice({ type: 'success', text: `Rejected ${rejectFor.companyName}.` })
      setRejectFor(null)
      setRejectReason('')
      load()
    } catch (error) {
      setNotice({ type: 'error', text: error?.response?.data?.detail ?? 'Could not reject the request.' })
      load()
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <PageHeader title="Connection Requests" subtitle="Approve or reject businesses that asked your team to manage their social media." />

      {notice && (
        <div className="mb-4 px-4 py-3 rounded-[var(--r-md)] text-sm font-medium" style={{ background: notice.type === 'success' ? 'rgba(34,197,94,.10)' : 'rgba(239,68,68,.10)', color: notice.type === 'success' ? '#22C55E' : '#EF4444', border: `1px solid ${notice.type === 'success' ? 'rgba(34,197,94,.20)' : 'rgba(239,68,68,.20)'}` }}>
          {notice.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Pending Requests</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{pendingRequests.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Approved Connections</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{requests.filter(item => item.status === 'approved').length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Rejected</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{requests.filter(item => item.status === 'rejected').length}</p>
        </div>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="card"><EmptyState icon={Users} title="No pending connection requests" message="Businesses that request your team will appear here for approval." /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {pendingRequests.map(request => (
            <motion.div key={request.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                    {request.companyName.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{request.companyName}</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{request.industry}</p>
                  </div>
                </div>
                <StatusBadge status={request.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div className="rounded-[var(--r-md)] p-2.5" style={{ background: 'var(--bg-alt)' }}>
                  <p className="font-semibold mb-1 flex items-center gap-1" style={{ color: 'var(--text)' }}><Users size={11} /> Contact</p>
                  <p>{request.contactName}</p>
                </div>
                <div className="rounded-[var(--r-md)] p-2.5" style={{ background: 'var(--bg-alt)' }}>
                  <p className="font-semibold mb-1 flex items-center gap-1" style={{ color: 'var(--text)' }}><Mail size={11} /> Email</p>
                  <p className="truncate">{request.email}</p>
                </div>
                <div className="rounded-[var(--r-md)] p-2.5" style={{ background: 'var(--bg-alt)' }}>
                  <p className="font-semibold mb-1 flex items-center gap-1" style={{ color: 'var(--text)' }}><Clock3 size={11} /> Requested</p>
                  <p>{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Recently'}</p>
                </div>
                <div className="rounded-[var(--r-md)] p-2.5" style={{ background: 'var(--bg-alt)' }}>
                  <p className="font-semibold mb-1 flex items-center gap-1" style={{ color: 'var(--text)' }}><Building2 size={11} /> Industry</p>
                  <p>{request.industry}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => handleApprove(request)} disabled={actingId === request.id} className="flex-1 flex items-center justify-center gap-2 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)' }}>
                  <CheckCircle2 size={14} /> Approve
                </button>
                <button onClick={() => { setRejectFor(request); setRejectReason('') }} disabled={actingId === request.id} className="flex-1 flex items-center justify-center gap-2 h-10 rounded-[var(--r-md)] border text-sm font-semibold" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <AlertCircle size={14} /> Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {requests.length > 0 && (
        <div className="card p-5 mt-4">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>Request History</h2>
          <div className="flex flex-col gap-2">
            {requests.filter(item => item.status !== 'pending').map(request => (
              <div key={request.id} className="flex items-center justify-between gap-3 p-3 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{request.companyName}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{request.decisionNote || request.status}</p>
                </div>
                <StatusBadge status={request.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {rejectFor && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-[var(--r-xl)] border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Reject connection request</p>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{rejectFor.companyName}</h2>
              </div>
              <button onClick={() => setRejectFor(null)} className="p-2 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>
            <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>Reason (optional)</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Tell the business why the request was not accepted." className="w-full px-3 py-2 text-sm rounded-[var(--r-md)] border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            <button onClick={handleReject} disabled={actingId === rejectFor.id} className="w-full flex items-center justify-center gap-2 h-10 mt-3 rounded-[var(--r-md)] border text-sm font-semibold" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
              <RefreshCw size={14} /> Submit Rejection
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
