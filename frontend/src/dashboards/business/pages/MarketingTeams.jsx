import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, MapPin, Clock, CheckCircle2,
  Mail, X, Loader2, Send, RefreshCw, Clock3,
} from 'lucide-react'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import StatCard from '../../../components/dashboard/StatCard'
import {
  cancelTeamRequest, fetchAssignedTeam, fetchMarketingTeams,
  fetchTeamRequests, removeMarketingTeam, requestMarketingTeam,
} from '../services/businessService'

const STATUS_META = {
  approved: { label: 'Managing you', color: '#22C55E', bg: 'rgba(34,197,94,.12)' },
  pending: { label: 'Request pending', color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
  rejected: { label: 'Request rejected', color: '#EF4444', bg: 'rgba(239,68,68,.12)' },
  none: { label: 'Available', color: '#64748B', bg: 'rgba(100,116,139,.12)' },
}

function AssignSuccessModal({ team, onConfirm }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
        className="w-full max-w-md rounded-[var(--r-xl)] p-6 shadow-[var(--shadow-lg)]"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(34,197,94,.12)' }}>
            <CheckCircle2 size={28} style={{ color: '#22C55E' }} />
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>
            Connection Request Sent!
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="font-semibold" style={{ color: 'var(--text)' }}>{team}</span> has received your request.
          </p>
          <p className="text-sm mt-2 px-2" style={{ color: 'var(--text-muted)' }}>
            They will review and approve it before they start managing your social media.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={onConfirm}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105 transition-all"
            style={{ background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ConfirmRemoveModal({ teamName, onConfirm, onCancel, submitting }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-md rounded-[var(--r-xl)] p-6 shadow-[var(--shadow-lg)]"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-base font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>
            Remove Marketing Team?
          </h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
          Removing <span className="font-semibold" style={{ color: 'var(--text)' }}>{teamName}</span> will unassign your marketing team. Active campaigns will not be affected, but no new content will be created until you assign a new team.
        </p>
        <div className="flex flex-col gap-2">
          <button onClick={onConfirm} disabled={submitting}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105 transition-all"
            style={{ background: 'linear-gradient(135deg,#DC2626,#EF4444)' }}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Remove team
          </button>
          <button onClick={onCancel}
            className="w-full h-10 rounded-[var(--r-md)] border text-sm font-semibold transition-all"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            Keep team
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function MarketingTeams() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [team, setTeam] = useState(null)
  const [teams, setTeams] = useState([])
  const [requests, setRequests] = useState([])
  const [notice, setNotice] = useState(null)
  const [successTeam, setSuccessTeam] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const [teamRes, directory, requestsRes] = await Promise.all([
        fetchAssignedTeam(), fetchMarketingTeams(), fetchTeamRequests(),
      ])
      setTeam(teamRes?.team ?? null)
      setTeams(directory)
      setRequests(requestsRes ?? [])
    } catch {
      setNotice({ type: 'error', text: 'Failed to load marketing teams.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [teamRes, directory, requestsRes] = await Promise.all([
          fetchAssignedTeam(), fetchMarketingTeams(), fetchTeamRequests(),
        ])
        if (active) {
          setTeam(teamRes?.team ?? null)
          setTeams(directory)
          setRequests(requestsRes ?? [])
        }
      } catch {
        if (active) setNotice({ type: 'error', text: 'Failed to load marketing teams.' })
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const members = team?.members ?? []
  const assignedId = members.find(member => member.role === 'Marketing')?.id ?? members[0]?.id ?? null
  const hasApprovedTeam = !!assignedId || teams.some(item => item.request_status === 'approved')
  const pendingRequests = requests.filter(item => item.status === 'pending')

  const handleRequest = async (teamId) => {
    setSubmitting(true)
    setNotice(null)
    try {
      await requestMarketingTeam(teamId)
      const requestedTeam = teams.find(item => item.id === teamId)
      await refresh()
      setSuccessTeam(requestedTeam?.name ?? 'The marketing team')
    } catch (error) {
      await refresh()
      setNotice({ type: 'error', text: error?.response?.data?.detail ?? 'Could not send the request.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelRequest = async (requestId) => {
    setSubmitting(true)
    setNotice(null)
    try {
      await cancelTeamRequest(requestId)
      await refresh()
      setNotice({ type: 'success', text: 'Connection request cancelled.' })
    } catch (error) {
      await refresh()
      setNotice({ type: 'error', text: error?.response?.data?.detail ?? 'Could not cancel the request.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async () => {
    setSubmitting(true)
    setNotice(null)
    try {
      await removeMarketingTeam()
      setConfirmRemove(false)
      await refresh()
      setNotice({ type: 'success', text: 'Marketing team removed. You can now request a different team.' })
    } catch (error) {
      await refresh()
      setNotice({ type: 'error', text: error?.response?.data?.detail ?? 'Could not remove the marketing team.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Marketing Teams" subtitle="Request a team to manage your business. Your request must be approved by the team before they manage your social media." />

      {notice && (
        <div className="mb-4 px-4 py-3 rounded-[var(--r-md)] text-sm font-medium" style={{ background: notice.type === 'success' ? 'rgba(34,197,94,.10)' : 'rgba(239,68,68,.10)', color: notice.type === 'success' ? '#22C55E' : '#EF4444', border: `1px solid ${notice.type === 'success' ? 'rgba(34,197,94,.20)' : 'rgba(239,68,68,.20)'}` }}>
          {notice.text}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => <div key={i} className="h-40 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)' }} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Available Teams" value={teams.length} icon={Users} iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)" index={0} />
            <StatCard title="Assigned Team" value={assignedId ? 1 : 0} icon={CheckCircle2} iconColor="#22C55E" iconBg="rgba(34,197,94,.12)" index={1} />
            <StatCard title="Pending Requests" value={pendingRequests.length} icon={Clock3} iconColor="#F59E0B" iconBg="rgba(245,158,11,.12)" index={2} />
            <StatCard title="Other Teams" value={teams.filter(item => item.request_status === 'none' || item.request_status === 'rejected').length} icon={Users} iconColor="#F59E0B" iconBg="rgba(245,158,11,.12)" index={3} />
          </div>

          <div className="card p-5 mb-4">
            <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text)' }}>All Marketing Teams</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-subtle)' }}>You can have one approved team at a time. A team manages you only after it approves your request.</p>
            {teams.length === 0 ? <EmptyState icon={Users} title="No marketing teams available" message="Marketing teams will appear here after they register." /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teams.map(item => {
                  const status = STATUS_META[item.request_status] ?? STATUS_META.none
                  return (
                    <motion.div key={item.id} whileHover={{ y: -2 }} className="p-4 rounded-[var(--r-md)] border" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{item.name}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.contact_name} · {item.email}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap" style={{ background: status.bg, color: status.color }}>{status.label}</span>
                      </div>
                      <p className="text-xs mt-3" style={{ color: 'var(--text-subtle)' }}>{item.client_count} business client{item.client_count === 1 ? '' : 's'} · {item.bio || 'No team description provided.'}</p>
                      <div className="flex items-center gap-2 mt-4">
                        {item.request_status === 'approved' ? (
                          <button type="button" onClick={() => setConfirmRemove(true)} disabled={submitting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-sm)] text-xs font-semibold transition" style={{ background: 'rgba(239,68,68,.10)', color: '#EF4444' }}>
                            {submitting ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Remove team
                          </button>
                        ) : item.request_status === 'pending' ? (
                          <button type="button" onClick={() => handleCancelRequest(item.request_id)} disabled={submitting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-sm)] text-xs font-semibold transition" style={{ background: 'rgba(245,158,11,.12)', color: '#D97706' }}>
                            {submitting ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Cancel request
                          </button>
                        ) : (
                          <button type="button"
                            onClick={() => !hasApprovedTeam && handleRequest(item.id)}
                            disabled={submitting || hasApprovedTeam}
                            title={hasApprovedTeam ? 'Remove your current team before requesting another.' : 'Send a connection request'}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-sm)] text-xs font-semibold transition"
                            style={hasApprovedTeam
                              ? { background: 'var(--bg-alt)', color: 'var(--text-subtle)', cursor: 'not-allowed', border: '1px solid var(--border)' }
                              : { background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)', color: '#fff' }}>
                            {submitting ? <Loader2 size={13} className="animate-spin" /> : item.request_status === 'rejected' ? <RefreshCw size={13} /> : <Send size={13} />} {item.request_status === 'rejected' ? 'Request again' : hasApprovedTeam ? 'Remove current team first' : 'Request this team'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {requests.length > 0 && (
            <div className="card p-5 mb-4">
              <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>Your Connection Requests</h2>
              <div className="flex flex-col gap-2">
                {requests.map(request => (
                  <div key={request.id} className="flex items-center justify-between gap-3 p-3 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{request.team_name}</p>
                      <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>{request.status}{request.decision_note && request.status !== 'pending' ? ` — ${request.decision_note}` : ''}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap capitalize" style={{ background: STATUS_META[request.status]?.bg ?? 'rgba(100,116,139,.12)', color: STATUS_META[request.status]?.color ?? '#64748B' }}>{request.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {team ? <div className="card p-5 mb-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Workspace</p>
                <h2 className="text-lg font-bold mt-1" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>{team.workspace_name}</h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-subtle)' }}>Database-backed team membership and roles</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-md)]" style={{ background: 'rgba(34,197,94,.10)', border: '1px solid rgba(34,197,94,.20)' }}>
                <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
                <span className="text-xs font-semibold" style={{ color: '#22C55E' }}>Assigned</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                    {member.name.split(' ').map(part => part[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{member.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.role}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-[11px]" style={{ color: 'var(--text-subtle)' }}>
                    <span className="flex items-center gap-1"><Mail size={11} /> {member.email}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> Workspace member</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <MapPin size={13} /> Workspace ID: {team.workspace_id}
            </div>
          </div> : <div className="card"><EmptyState icon={Users} title="No team assigned" message="Request a team from the directory above. Once the team approves, they will appear here." /></div>}
        </>
      )}

      <AnimatePresence>
        {successTeam && <AssignSuccessModal team={successTeam} onConfirm={() => setSuccessTeam(null)} />}
        {confirmRemove && <ConfirmRemoveModal teamName={team?.workspace_name ?? 'Marketing team'} onConfirm={handleRemove} onCancel={() => setConfirmRemove(false)} submitting={submitting} />}
      </AnimatePresence>
    </div>
  )
}
