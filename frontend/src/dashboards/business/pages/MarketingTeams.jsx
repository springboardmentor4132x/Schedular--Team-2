import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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

export default function MarketingTeams() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [team, setTeam] = useState(null)
  const [teams, setTeams] = useState([])
  const [requests, setRequests] = useState([])
  const [notice, setNotice] = useState(null)

  const refresh = async () => {
    setLoading(true)
    setNotice(null)
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
  const pendingRequests = requests.filter(item => item.status === 'pending')

  const handleRequest = async (teamId) => {
    setSubmitting(true)
    setNotice(null)
    try {
      await requestMarketingTeam(teamId)
      setNotice({ type: 'success', text: 'Connection request sent. The marketing team will review and approve it.' })
      refresh()
    } catch (error) {
      setNotice({ type: 'error', text: error?.response?.data?.detail ?? 'Could not send the request.' })
      refresh()
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelRequest = async (requestId) => {
    setSubmitting(true)
    setNotice(null)
    try {
      await cancelTeamRequest(requestId)
      setNotice({ type: 'success', text: 'Connection request cancelled.' })
      refresh()
    } catch (error) {
      setNotice({ type: 'error', text: error?.response?.data?.detail ?? 'Could not cancel the request.' })
      refresh()
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async () => {
    setSubmitting(true)
    setNotice(null)
    try {
      await removeMarketingTeam()
      setNotice({ type: 'success', text: 'Marketing team removed. You can now request a different team.' })
      refresh()
    } catch (error) {
      setNotice({ type: 'error', text: error?.response?.data?.detail ?? 'Could not remove the marketing team.' })
      refresh()
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
                          <button type="button" onClick={handleRemove} disabled={submitting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-sm)] text-xs font-semibold transition" style={{ background: 'rgba(239,68,68,.10)', color: '#EF4444' }}>
                            {submitting ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Remove team
                          </button>
                        ) : item.request_status === 'pending' ? (
                          <button type="button" onClick={() => handleCancelRequest(item.request_id)} disabled={submitting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-sm)] text-xs font-semibold transition" style={{ background: 'rgba(245,158,11,.12)', color: '#D97706' }}>
                            {submitting ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Cancel request
                          </button>
                        ) : (
                          <button type="button" onClick={() => handleRequest(item.id)} disabled={submitting} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-sm)] text-xs font-semibold transition" style={{ background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)', color: '#fff' }}>
                            {submitting ? <Loader2 size={13} className="animate-spin" /> : item.request_status === 'rejected' ? <RefreshCw size={13} /> : <Send size={13} />} {item.request_status === 'rejected' ? 'Request again' : 'Request this team'}
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
    </div>
  )
}
