import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search, Star, Users, Megaphone, MapPin, Clock,
  CheckCircle2, X, ChevronDown, Phone, Mail,
  Globe, Trash2, Eye,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import PageHeader from '../../components/dashboard/PageHeader'
import EmptyState from '../../components/dashboard/EmptyState'
import { MOCK_MARKETING_TEAMS } from '../../services/mockData'

const PLATFORM_ICONS = {
  instagram: { icon: FaInstagram, color: '#E1306C' },
  facebook:  { icon: FaFacebook,  color: '#1877F2' },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2' },
  x:         { icon: FaXTwitter,  color: '#000000' },
  youtube:   { icon: FaYoutube,   color: '#FF0000' },
  pinterest: { icon: FaPinterest, color: '#E60023' },
}

const EXPERTISE_OPTIONS = [
  'All', 'Social Media', 'Content Strategy', 'B2B Marketing',
  'E-Commerce', 'Analytics', 'SaaS Marketing', 'Visual Design',
]

// Extended team data with contact info and members
const TEAM_CONTACTS = {
  1: { email: 'hello@digitalspark.agency', phone: '+1 (415) 555-0101', manager: 'Sarah Chen', members: ['Sarah Chen', 'James Park', 'Priya Nair', 'Marcus Webb'] },
  2: { email: 'contact@pixelandprose.co', phone: '+1 (212) 555-0182', manager: 'Leo Vargas',  members: ['Leo Vargas', 'Aisha Okafor'] },
  3: { email: 'hi@socialorbitstudio.com', phone: '+1 (310) 555-0233', manager: 'Nina Torres', members: ['Nina Torres', 'Kai Yamamoto', 'Fatima Al-Hassan', 'Ravi Patel'] },
  4: { email: 'info@brandwave.co',        phone: '+1 (512) 555-0304', manager: 'Omar Khalil', members: ['Omar Khalil', 'Lucy Grant'] },
  5: { email: 'team@momentummedia.io',    phone: '+1 (312) 555-0455', manager: 'Zoe Kim',     members: ['Zoe Kim', 'Andre Santos', 'Beth Collins'] },
  6: { email: 'studio@creativahub.com',   phone: '+1 (305) 555-0516', manager: 'Ivan Cruz',   members: ['Ivan Cruz', 'Lily Nguyen'] },
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={12}
          fill={n <= Math.round(rating) ? '#F59E0B' : 'none'}
          style={{ color: '#F59E0B' }} />
      ))}
      <span className="text-xs font-semibold ml-1" style={{ color: 'var(--text)' }}>{rating}</span>
    </div>
  )
}

/* ── Post-assign success dialog ─────────────────────────────────── */
function AssignSuccessModal({ team, onConfirm, onDismiss }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div initial={{ scale:0.92, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.92 }}
        className="w-full max-w-md rounded-[var(--r-xl)] p-6 shadow-[var(--shadow-lg)]"
        style={{ background:'var(--card)', border:'1px solid var(--border)' }}>
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
            style={{ background:'rgba(34,197,94,.12)' }}>
            <CheckCircle2 size={28} style={{ color:'#22C55E' }} />
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'var(--text)' }}>
            Marketing Team Assigned!
          </h2>
          <p className="text-sm" style={{ color:'var(--text-muted)' }}>
            <span className="font-semibold" style={{ color:'var(--text)' }}>{team.name}</span> has been assigned successfully.
          </p>
          <p className="text-sm mt-2 px-2" style={{ color:'var(--text-muted)' }}>
            Your marketing team has been notified and is ready to start working on your campaigns.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={onConfirm}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105 transition-all"
            style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
            Go to Dashboard
          </button>
          <button onClick={onDismiss}
            className="w-full h-10 rounded-[var(--r-md)] border text-sm font-semibold transition-all"
            style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text-muted)' }}>
            Stay on this page
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Change/Remove confirmation modal ───────────────────────────── */
function ConfirmActionModal({ type, currentTeam, newTeam, onConfirm, onCancel }) {
  const isRemove = type === 'remove'
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div initial={{ scale:0.95, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95 }}
        className="w-full max-w-md rounded-[var(--r-xl)] p-6 shadow-[var(--shadow-lg)]"
        style={{ background:'var(--card)', border:'1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-base font-bold" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'var(--text)' }}>
            {isRemove ? 'Remove Marketing Team?' : 'Change Marketing Team?'}
          </h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]"
            style={{ color:'var(--text-muted)' }}><X size={16} /></button>
        </div>
        {isRemove ? (
          <p className="text-sm mb-5" style={{ color:'var(--text-muted)' }}>
            Removing <span className="font-semibold" style={{ color:'var(--text)' }}>{currentTeam?.name}</span> will unassign your marketing team. Active campaigns will not be affected, but no new content will be created until you assign a new team.
          </p>
        ) : (
          <>
            <p className="text-sm mb-1" style={{ color:'var(--text-muted)' }}>
              You currently have <span className="font-semibold" style={{ color:'var(--text)' }}>{currentTeam?.name}</span> assigned.
            </p>
            <p className="text-sm mb-5" style={{ color:'var(--text-muted)' }}>
              Switching to <span className="font-semibold" style={{ color:'var(--text)' }}>{newTeam?.name}</span> will remove the current assignment. Active campaigns won't be affected.
            </p>
          </>
        )}
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 h-10 rounded-[var(--r-md)] border text-sm font-semibold"
            style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white"
            style={{ background: isRemove ? '#EF4444' : 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
            {isRemove ? 'Yes, Remove' : 'Confirm Change'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Team Detail Drawer ─────────────────────────────────────────── */
function TeamDetailDrawer({ team, onClose, onAssign, onViewGuidelines, assignedTeam }) {
  if (!team) return null
  const contact = TEAM_CONTACTS[team.id]
  const isAssigned = team.isAssigned
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <motion.aside initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
        transition={{ duration:0.25, ease:'easeInOut' }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md overflow-y-auto flex flex-col"
        style={{ background:'var(--card)', borderLeft:'1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:'var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'var(--text)' }}>
            Team Details
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]"
            style={{ color:'var(--text-muted)' }}><X size={16} /></button>
        </div>
        <div className="p-5 flex flex-col gap-5">
          {/* Identity */}
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
              style={{ background:team.logoColor }}>{team.logo}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="text-base font-bold" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'var(--text)' }}>{team.name}</p>
                {isAssigned && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background:'rgba(34,197,94,.12)', color:'#22C55E' }}>
                    <CheckCircle2 size={9} /> Assigned
                  </span>
                )}
              </div>
              <StarRating rating={team.rating} />
              <p className="text-xs mt-0.5" style={{ color:'var(--text-subtle)' }}>{team.reviews} reviews</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed" style={{ color:'var(--text-muted)' }}>{team.description}</p>

          {/* Contact info */}
          <div>
            <h3 className="text-xs font-bold mb-2" style={{ color:'var(--text)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Contact Information</h3>
            <div className="flex flex-col gap-2">
              {[
                { icon:MapPin, label:team.location },
                { icon:Mail,   label:contact?.email   },
                { icon:Phone,  label:contact?.phone   },
                { icon:Clock,  label:`Response time: ${team.responseTime}` },
              ].filter(m => m.label).map((m, i) => {
                const Icon = m.icon
                return (
                  <div key={i} className="flex items-center gap-2">
                    <Icon size={13} style={{ color:'var(--text-muted)', flexShrink:0 }} />
                    <span className="text-xs" style={{ color:'var(--text-muted)' }}>{m.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Manager + Team members */}
          <div>
            <h3 className="text-xs font-bold mb-2" style={{ color:'var(--text)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Team Members</h3>
            <p className="text-xs mb-2" style={{ color:'var(--text-muted)' }}>Manager: <span className="font-semibold" style={{ color:'var(--text)' }}>{contact?.manager}</span></p>
            <div className="flex flex-wrap gap-2">
              {contact?.members?.map(m => (
                <div key={m} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background:'var(--bg-alt)', border:'1px solid var(--border)' }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                    style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                    {m[0]}
                  </div>
                  <span className="text-xs" style={{ color:'var(--text-muted)' }}>{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expertise */}
          <div>
            <h3 className="text-xs font-bold mb-2" style={{ color:'var(--text)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Expertise</h3>
            <div className="flex flex-wrap gap-1.5">
              {team.expertise.map(e => (
                <span key={e} className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background:'rgba(79,70,229,.10)', color:'#4F46E5', border:'1px solid rgba(79,70,229,.20)' }}>{e}</span>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-xs font-bold mb-2" style={{ color:'var(--text)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Supported Platforms</h3>
            <div className="flex gap-2 flex-wrap">
              {team.platforms.map(p => {
                const meta = PLATFORM_ICONS[p]; const Icon = meta?.icon
                return Icon ? (
                  <div key={p} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ background:`${meta.color}12`, border:`1px solid ${meta.color}30` }}>
                    <Icon size={11} style={{ color:meta.color }} />
                    <span className="text-[10px] font-semibold capitalize" style={{ color:meta.color }}>{p}</span>
                  </div>
                ) : null
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'Clients',   value:team.clients },
              { label:'Campaigns', value:team.campaigns },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-[var(--r-md)] text-center"
                style={{ background:'var(--bg-alt)', border:'1px solid var(--border)' }}>
                <p className="text-xl font-extrabold" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'var(--text)' }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor:'var(--border)' }}>
            {isAssigned ? (
              <>
                <button onClick={onViewGuidelines}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105"
                  style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                  View Team Details
                </button>
                <p className="text-xs text-center" style={{ color:'var(--text-subtle)' }}>Assigned since {team.assignedSince}</p>
              </>
            ) : (
              <button onClick={() => onAssign(team)}
                className="w-full h-10 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105"
                style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                {assignedTeam ? 'Switch to this team' : 'Select Marketing Team'}
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function MarketingTeams() {
  const navigate = useNavigate()
  const [teams,         setTeams]         = useState(MOCK_MARKETING_TEAMS)
  const [search,        setSearch]        = useState('')
  const [expertise,     setExpertise]     = useState('All')
  const [sortBy,        setSortBy]        = useState('rating')
  const [pendingTeam,   setPendingTeam]   = useState(null)   // awaiting change confirm
  const [removeConfirm, setRemoveConfirm] = useState(false)  // awaiting remove confirm
  const [successTeam,   setSuccessTeam]   = useState(null)   // post-assign success dialog
  const [detailTeam,    setDetailTeam]    = useState(null)   // team detail drawer

  const assignedTeam = teams.find(t => t.isAssigned)

  const doAssign = team => {
    setTeams(prev => prev.map(t => ({
      ...t,
      isAssigned: t.id === team.id,
      assignedSince: t.id === team.id ? new Date().toISOString().split('T')[0] : null,
    })))
    if (typeof window !== 'undefined') {
      localStorage.setItem('orbit-assigned-marketing-team', team.name)
    }
    setPendingTeam(null)
    setDetailTeam(null)
    setSuccessTeam(team)
  }

  const doUnassign = () => {
    setTeams(prev => prev.map(t => ({ ...t, isAssigned: false, assignedSince: null })))
    if (typeof window !== 'undefined') {
      localStorage.removeItem('orbit-assigned-marketing-team')
    }
    setRemoveConfirm(false)
  }

  const handleSelectTeam = team => {
    if (team.isAssigned) return
    if (assignedTeam) { setPendingTeam(team) }
    else { doAssign(team) }
  }

  const filtered = teams
    .filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
      return matchSearch && (expertise === 'All' || t.expertise.includes(expertise))
    })
    .sort((a, b) => sortBy === 'rating' ? b.rating - a.rating : sortBy === 'clients' ? b.clients - a.clients : a.name.localeCompare(b.name))

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Marketing Teams"
        subtitle={assignedTeam ? `Currently assigned: ${assignedTeam.name}` : 'Select a marketing team to manage your campaigns.'}
        actions={assignedTeam && (
          <button onClick={() => navigate('/dashboard/marketing-activity')}
            className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] border text-sm font-semibold transition-all hover:shadow-[var(--shadow-sm)]"
            style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
            <Users size={14} /> View Activity
          </button>
        )}
      />

      {/* Assigned team banner */}
      {assignedTeam && (
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          className="flex items-center gap-4 p-4 rounded-[var(--r-lg)] mb-5"
          style={{ background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.20)' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background:assignedTeam.logoColor }}>{assignedTeam.logo}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-bold" style={{ color:'var(--text)' }}>{assignedTeam.name}</p>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background:'rgba(34,197,94,.12)', color:'#22C55E' }}>
                <CheckCircle2 size={9} /> Assigned
              </span>
            </div>
            <p className="text-xs" style={{ color:'var(--text-muted)' }}>
              Assigned since {assignedTeam.assignedSince} · {assignedTeam.location} · Manager: {TEAM_CONTACTS[assignedTeam.id]?.manager}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setDetailTeam(assignedTeam)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all"
              style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
              <Eye size={11} /> Details
            </button>
            <button onClick={() => setRemoveConfirm(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold"
              style={{ background:'rgba(239,68,68,.06)', borderColor:'rgba(239,68,68,.20)', color:'#EF4444' }}>
              <Trash2 size={11} /> Remove
            </button>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-subtle)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams…"
            className="w-full h-10 pl-9 pr-4 text-sm rounded-[var(--r-md)] border outline-none"
            style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXPERTISE_OPTIONS.slice(0, 6).map(e => (
            <button key={e} onClick={() => setExpertise(e)}
              className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
              style={{ background:expertise===e?'rgba(30,58,138,.12)':'var(--card)', borderColor:expertise===e?'#1E3A8A':'var(--border)', color:expertise===e?'#1E3A8A':'var(--text-muted)' }}>
              {e}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="h-10 pl-3 pr-8 text-xs font-semibold rounded-[var(--r-md)] border outline-none appearance-none"
            style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
            <option value="rating">Sort: Top Rated</option>
            <option value="clients">Sort: Most Clients</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-3.5 pointer-events-none" style={{ color:'var(--text-subtle)' }} />
        </div>
      </div>

      {filtered.length === 0 && <div className="card"><EmptyState icon={Users} title="No teams found" message="Try adjusting your search or expertise filter." /></div>}

      {/* Team cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence>
          {filtered.map((team, i) => {
            const isAssigned = team.isAssigned
            return (
              <motion.div key={team.id}
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, scale:0.95 }}
                transition={{ duration:0.25, delay:i * 0.05 }}
                whileHover={{ y:-2, transition:{ duration:0.15 } }}
                className="card p-5 flex flex-col gap-4"
                style={{ borderTop:isAssigned?'3px solid #22C55E':'3px solid transparent' }}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background:team.logoColor }}>{team.logo}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-bold truncate" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'var(--text)' }}>{team.name}</p>
                      {isAssigned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background:'rgba(34,197,94,.12)', color:'#22C55E' }}>
                          <CheckCircle2 size={9} /> Assigned
                        </span>
                      )}
                    </div>
                    <StarRating rating={team.rating} />
                    <p className="text-[11px] mt-0.5" style={{ color:'var(--text-subtle)' }}>{team.reviews} reviews</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color:'var(--text-muted)' }}>{team.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {team.expertise.slice(0, 3).map(e => (
                    <span key={e} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background:'var(--bg-alt)', color:'var(--text-muted)', border:'1px solid var(--border)' }}>{e}</span>
                  ))}
                  {team.expertise.length > 3 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background:'var(--bg-alt)', color:'var(--text-subtle)' }}>+{team.expertise.length - 3}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {team.platforms.map(p => {
                    const meta = PLATFORM_ICONS[p]; const Icon = meta?.icon
                    return Icon ? (
                      <div key={p} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background:`${meta.color}15` }}>
                        <Icon size={12} style={{ color:meta.color }} />
                      </div>
                    ) : null
                  })}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[{ icon:Users, label:'Clients', value:team.clients }, { icon:Megaphone, label:'Campaigns', value:team.campaigns }, { icon:Clock, label:'Response', value:team.responseTime }].map(m => {
                    const Icon = m.icon
                    return (
                      <div key={m.label} className="flex flex-col items-center gap-0.5 p-2 rounded-lg" style={{ background:'var(--bg-alt)' }}>
                        <Icon size={11} style={{ color:'var(--text-muted)' }} />
                        <span className="text-xs font-bold" style={{ color:'var(--text)' }}>{m.value}</span>
                        <span className="text-[10px]" style={{ color:'var(--text-subtle)' }}>{m.label}</span>
                      </div>
                    )
                  })}
                </div>
                <p className="flex items-center gap-1 text-xs" style={{ color:'var(--text-subtle)' }}>
                  <MapPin size={11} /> {team.location}
                </p>
                <div className="flex gap-2 pt-1 border-t" style={{ borderColor:'var(--border)' }}>
                  <button onClick={() => setDetailTeam(team)}
                    className="flex items-center gap-1 px-3 h-8 rounded-lg border text-xs font-semibold flex-shrink-0"
                    style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text-muted)' }}>
                    <Eye size={11} /> Details
                  </button>
                  {isAssigned ? (
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1 h-8 rounded-[var(--r-md)] flex items-center justify-center text-xs font-semibold"
                        style={{ background:'rgba(34,197,94,.10)', color:'#22C55E' }}>
                        <CheckCircle2 size={13} className="mr-1" /> Assigned
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => handleSelectTeam(team)}
                      className="flex-1 h-8 rounded-[var(--r-md)] text-xs font-semibold text-white hover:brightness-105"
                      style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                      {assignedTeam ? 'Switch' : 'Select Team'}
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Modals & drawers */}
      <AnimatePresence>
        {successTeam && (
          <AssignSuccessModal
            team={successTeam}
            onConfirm={() => { setSuccessTeam(null); navigate('/dashboard/marketing-teams') }}
            onDismiss={() => setSuccessTeam(null)}
          />
        )}
        {pendingTeam && (
          <ConfirmActionModal
            type="change"
            currentTeam={assignedTeam}
            newTeam={pendingTeam}
            onConfirm={() => doAssign(pendingTeam)}
            onCancel={() => setPendingTeam(null)}
          />
        )}
        {removeConfirm && (
          <ConfirmActionModal
            type="remove"
            currentTeam={assignedTeam}
            onConfirm={doUnassign}
            onCancel={() => setRemoveConfirm(false)}
          />
        )}
      </AnimatePresence>
      {detailTeam && (
        <TeamDetailDrawer
          team={detailTeam}
          onClose={() => setDetailTeam(null)}
          onAssign={handleSelectTeam}
          onViewGuidelines={() => { setDetailTeam(null); navigate('/dashboard/marketing-teams') }}
          assignedTeam={assignedTeam}
        />
      )}
    </div>
  )
}
