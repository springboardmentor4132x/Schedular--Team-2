import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2, Clock3, Eye, X, Users, RefreshCw, AlertCircle,
} from 'lucide-react'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { marketingService } from '../../../services/marketingService'

const REJECTION_REASONS = [
  'Incomplete requirements',
  'Budget not sufficient',
  'Campaign timeline not feasible',
  'Platforms not supported',
  'Other',
]

function StatusBadge({ status }) {
  const styles = {
    pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
    approved: { label: 'Approved', color: '#22C55E', bg: 'rgba(34,197,94,.12)' },
    rejected: { label: 'Rejected', color: '#EF4444', bg: 'rgba(239,68,68,.12)' },
    draft: { label: 'Draft', color: '#64748B', bg: 'rgba(100,116,139,.12)' },
  }
  const current = styles[status] ?? styles.pending
  return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: current.bg, color: current.color }}>{current.label}</span>
}

function DetailSection({ title, children }) {
  return (
    <div className="rounded-[var(--r-md)] border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
      <h3 className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--text-muted)' }}>{title}</h3>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="font-semibold text-right" style={{ color: 'var(--text)' }}>{value || '—'}</span>
    </div>
  )
}

export default function ClientRequests() {
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectPreset, setRejectPreset] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadRequests = () => marketingService.workRequests().then(items => setRequests(items.map(item => ({ ...item.details, id:item.id, clientId:item.clientId, status:item.status, rejectionReason:item.decisionNote, reviewedAt:item.updatedAt, submissionDate:item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently submitted' })))).catch(() => setRequests([]))
  useEffect(() => { loadRequests() }, [])

  const pendingRequests = useMemo(() => requests.filter(item => item.status === 'pending'), [requests])

  const openDetails = request => {
    setSelectedRequest(request)
    setRejectReason('')
    setRejectPreset('')
    setSuccessMessage('')
  }

  const handleAccept = async request => {
    try {
      await marketingService.decideWorkRequest(request.id, 'approved')
      setSelectedRequest({ ...request, status: 'approved' }); setSuccessMessage('Work request approved and the business user has been notified.'); loadRequests()
    } catch (error) { setSuccessMessage(error.response?.data?.detail || 'Could not approve the request.') }
  }

  const handleReject = async request => {
    const finalReason = rejectPreset || rejectReason || 'Other'
    if (!finalReason.trim()) {
      setSuccessMessage('Please provide a rejection reason before continuing.')
      return
    }

    try {
      await marketingService.decideWorkRequest(request.id, 'rejected', finalReason)
      setSelectedRequest({ ...request, status: 'rejected', rejectionReason: finalReason }); setSuccessMessage('Work request rejected and the business user has been notified.'); loadRequests()
    } catch (error) { setSuccessMessage(error.response?.data?.detail || 'Could not reject the request.') }
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <PageHeader
        title="Client Requests"
        subtitle="Review new client requests before moving them into your client workspace."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Pending Client Requests</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{pendingRequests.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Approved Clients</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{requests.filter(item => item.status === 'approved').length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Rejected Requests</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{requests.filter(item => item.status === 'rejected').length}</p>
        </div>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="card"><EmptyState icon={Users} title="No pending client requests" message="New business requests will appear here after submission." /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {pendingRequests.map(request => (
            <motion.div key={request.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: '#1E3A8A' }}>
                    {request.companyName ? request.companyName.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() : 'CL'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{request.companyName || 'Untitled Request'}</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{request.industry || 'Unspecified industry'}</p>
                  </div>
                </div>
                <StatusBadge status={request.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div className="rounded-[var(--r-md)] p-2.5" style={{ background: 'var(--bg-alt)' }}>
                  <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Submission Date</p>
                  <p>{request.submissionDate || 'Recently submitted'}</p>
                </div>
                <div className="rounded-[var(--r-md)] p-2.5" style={{ background: 'var(--bg-alt)' }}>
                  <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Campaign Required</p>
                  <p>{request.requiresCampaign ? 'Yes' : 'No'}</p>
                </div>
                <div className="rounded-[var(--r-md)] p-2.5" style={{ background: 'var(--bg-alt)' }}>
                  <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Posting Frequency</p>
                  <p>{request.postingFrequency || 'Not specified'}</p>
                </div>
                <div className="rounded-[var(--r-md)] p-2.5" style={{ background: 'var(--bg-alt)' }}>
                  <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Platforms</p>
                  <p>{(request.preferredPlatforms || []).length ? request.preferredPlatforms.join(', ') : 'Not selected'}</p>
                </div>
              </div>

              <button onClick={() => openDetails(request)} className="flex items-center justify-center gap-2 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                <Eye size={14} /> View Details
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {selectedRequest && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[var(--r-xl)] border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>Client Request Review</p>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{selectedRequest.companyName || 'Client Request'}</h2>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="p-2 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            {successMessage && (
              <div className="mb-4 rounded-[var(--r-md)] border p-3" style={{ borderColor: 'rgba(34,197,94,.20)', background: 'rgba(34,197,94,.08)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{successMessage}</p>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-5">
              <div className="space-y-4">
                <DetailSection title="Company Information">
                  <DetailRow label="Company Name" value={selectedRequest.companyName} />
                  <DetailRow label="Industry" value={selectedRequest.industry} />
                  <DetailRow label="Website" value={selectedRequest.companyWebsite} />
                  <DetailRow label="Description" value={selectedRequest.companyDescription} />
                </DetailSection>

                <DetailSection title="Brand Guidelines">
                  <DetailRow label="Brand Voice" value={selectedRequest.brandVoice} />
                  <DetailRow label="Brand Personality" value={selectedRequest.brandPersonality} />
                  <DetailRow label="Colors" value={(selectedRequest.brandColors || []).join(', ')} />
                  <DetailRow label="Fonts" value={selectedRequest.preferredFonts} />
                </DetailSection>

                <DetailSection title="Target Audience">
                  <DetailRow label="Age Group" value={selectedRequest.ageGroup} />
                  <DetailRow label="Location" value={selectedRequest.location} />
                  <DetailRow label="Interests" value={selectedRequest.interests} />
                  <DetailRow label="Languages" value={(selectedRequest.languages || []).join(', ')} />
                </DetailSection>

                <DetailSection title="Content Requirements">
                  <DetailRow label="Platforms" value={(selectedRequest.preferredPlatforms || []).join(', ')} />
                  <DetailRow label="Content Types" value={(selectedRequest.preferredContentTypes || []).join(', ')} />
                  <DetailRow label="Posting Frequency" value={selectedRequest.postingFrequency} />
                  <DetailRow label="Expected Posts / Week" value={selectedRequest.expectedPostsPerWeek} />
                  <DetailRow label="Expected Posts / Month" value={selectedRequest.expectedPostsPerMonth} />
                  <DetailRow label="Content Goals" value={(selectedRequest.contentGoals || []).join(', ')} />
                  <DetailRow label="Caption Style" value={selectedRequest.captionStyle} />
                </DetailSection>

                <DetailSection title="Campaign Requirements">
                  <DetailRow label="Campaign Required" value={selectedRequest.requiresCampaign ? 'Yes' : 'No'} />
                  {selectedRequest.requiresCampaign ? (
                    <>
                      <DetailRow label="Campaign Name" value={selectedRequest.campaignName} />
                      <DetailRow label="Objective" value={selectedRequest.campaignObjective} />
                      <DetailRow label="Budget" value={selectedRequest.campaignBudget} />
                      <DetailRow label="Start Date" value={selectedRequest.preferredStartDate} />
                      <DetailRow label="End Date" value={selectedRequest.preferredEndDate} />
                    </>
                  ) : (
                    <DetailRow label="Normal Content Posting" value="Yes" />
                  )}
                </DetailSection>

                <DetailSection title="Approval Preferences">
                  <DetailRow label="Require approval before publishing" value={selectedRequest.approvalBeforePublishing ? 'Yes' : 'No'} />
                  <DetailRow label="Allow direct publishing" value={selectedRequest.allowDirectPublishing ? 'Yes' : 'No'} />
                  <DetailRow label="Notify before publishing" value={selectedRequest.notifyBeforePublishing ? 'Yes' : 'No'} />
                </DetailSection>
              </div>

              <div className="space-y-4">
                <div className="rounded-[var(--r-xl)] border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock3 size={15} style={{ color: 'var(--text-muted)' }} />
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Review Status</h3>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Current status</span>
                    <StatusBadge status={selectedRequest.status} />
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Review the client brief fully before approving the request. Approved requests move into the client workspace automatically.
                  </p>
                </div>

                <div className="rounded-[var(--r-xl)] border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Action Panel</h3>
                  {selectedRequest.status === 'approved' || selectedRequest.status === 'rejected' ? (
                    <div className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <p>This request has already been {selectedRequest.status}.</p>
                      {selectedRequest.rejectionReason && <p><span className="font-semibold">Reason:</span> {selectedRequest.rejectionReason}</p>}
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2 mb-3">
                        <button onClick={() => handleAccept(selectedRequest)} className="flex-1 flex items-center justify-center gap-2 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)' }}>
                          <CheckCircle2 size={14} /> Accept Request
                        </button>
                        <button onClick={() => setSuccessMessage('Please provide a rejection reason before continuing.')} className="flex-1 flex items-center justify-center gap-2 h-10 rounded-[var(--r-md)] border text-sm font-semibold" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                          <AlertCircle size={14} /> Reject Request
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold block" style={{ color: 'var(--text-muted)' }}>Rejection reason</label>
                        <select value={rejectPreset} onChange={e => setRejectPreset(e.target.value)} className="w-full h-9 px-3 text-sm rounded-[var(--r-md)] border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                          <option value="">Select a reason</option>
                          {REJECTION_REASONS.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Add any supporting detail for the business user." className="w-full px-3 py-2 text-sm rounded-[var(--r-md)] border outline-none" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
                        <button onClick={() => handleReject(selectedRequest)} className="w-full flex items-center justify-center gap-2 h-10 rounded-[var(--r-md)] border text-sm font-semibold" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                          <RefreshCw size={14} /> Submit Rejection
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
