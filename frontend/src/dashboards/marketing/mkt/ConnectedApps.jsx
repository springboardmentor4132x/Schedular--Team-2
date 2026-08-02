import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Link2, CheckCircle2, AlertTriangle,
  XCircle, Shield, Zap, ArrowLeft, Users, Eye,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'

const PLATFORM_CONFIGS = {
  instagram: { icon:FaInstagram, color:'#E1306C', bg:'rgba(225,48,108,.10)', label:'Instagram', features:['Post photos','Reels','Stories','Carousels'],      permissions:['Read profile','Publish posts','View insights'] },
  facebook:  { icon:FaFacebook,  color:'#1877F2', bg:'rgba(24,119,242,.10)', label:'Facebook',  features:['Post updates','Share links','Schedule posts'],      permissions:['Manage Page','Publish content','View analytics'] },
  linkedin:  { icon:FaLinkedin,  color:'#0A66C2', bg:'rgba(10,102,194,.10)', label:'LinkedIn',  features:['Post articles','Company updates'],                  permissions:['Share content','Manage company page'] },
  x:         { icon:FaXTwitter,  color:'#374151', bg:'rgba(55,65,81,.08)',   label:'X',         features:['Post tweets','Threads','Schedule'],                 permissions:['Read timeline','Post tweets','View analytics'] },
  youtube:   { icon:FaYoutube,   color:'#FF0000', bg:'rgba(255,0,0,.10)',    label:'YouTube',   features:['Upload videos','Shorts','Community posts'],         permissions:['Upload videos','Manage channel'] },
  pinterest: { icon:FaPinterest, color:'#E60023', bg:'rgba(230,0,35,.10)',   label:'Pinterest', features:['Create pins','Board management','Rich pins'],       permissions:['Create pins','Manage boards'] },
}

function buildAccounts(platforms) {
  return Object.entries(PLATFORM_CONFIGS).map(([id, cfg]) => ({
    id, ...cfg,
    connected: platforms.includes(id),
  }))
}

export default function ConnectedApps() {
  const navigate = useNavigate()
  const { activeClient } = useClient()
  const [expanded, setExpanded] = useState(null)
  const accounts = useMemo(() => {
    if (!activeClient) return []
    return buildAccounts(activeClient.connectedPlatforms ?? [])
  }, [activeClient])

  if (!activeClient) {
    return (
      <div className="p-6"><div className="card">
        <EmptyState icon={Users} title="No client selected" message="Select a client first."
          action={{ label: 'View Clients', onClick: () => navigate('/dashboard/mkt/clients') }} />
      </div></div>
    )
  }

  const connected    = accounts.filter(a => a.connected)
  const disconnected = accounts.filter(a => !a.connected)

  return (
    <div className="p-4 sm:p-6 max-w-[1000px] mx-auto">
      <button onClick={() => navigate('/dashboard/mkt/workspace')}
        className="flex items-center gap-1.5 text-sm font-semibold mb-4 hover:underline"
        style={{ color:'var(--primary)' }}>
        <ArrowLeft size={15} /> Back to Workspace
      </button>

      <PageHeader
        title="Connected Apps"
        subtitle={`Social accounts for ${activeClient.name}`}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label:'Connected',      value:connected.length,      color:'#22C55E', icon:Link2 },
          { label:'Not Connected',  value:disconnected.length,   color:'var(--text-muted)', icon:XCircle },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <s.icon size={16} className="mx-auto mb-1" style={{ color:s.color }} />
            <p className="text-2xl font-extrabold" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Connected */}
      {connected.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3" style={{ color:'var(--text)', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>Connected Platforms</h2>
          <div className="flex flex-col gap-3">
            {connected.map(p => {
              const Icon    = p.icon
              const isExp   = expanded === p.id
              return (
                <motion.div key={p.id} layout className="card overflow-hidden" style={{ borderLeft:`3px solid ${p.color}` }}>
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:p.bg }}>
                      <Icon size={22} style={{ color:p.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold" style={{ color:'var(--text)' }}>{p.label}</p>
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background:'rgba(34,197,94,.12)', color:'#22C55E' }}>
                          <CheckCircle2 size={9} /> Connected
                        </span>
                      </div>
                      <p className="text-xs" style={{ color:'var(--text-subtle)' }}>
                        Connected by {activeClient.name} and ready for publishing.
                      </p>
                    </div>
                    <button onClick={() => setExpanded(isExp ? null : p.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold flex-shrink-0"
                      style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text-muted)' }}>
                      <Eye size={11} /> {isExp ? 'Hide' : 'Details'}
                    </button>
                  </div>
                  <AnimatePresence initial={false}>
                    {isExp && (
                      <motion.div
                        initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                        exit={{ height:0, opacity:0 }} transition={{ duration:0.22 }}
                        style={{ overflow:'hidden' }}
                      >
                        <div className="px-4 pb-4 grid sm:grid-cols-2 gap-4 border-t pt-4" style={{ borderColor:'var(--border)' }}>
                          <div>
                            <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color:'var(--text)' }}>
                              <Shield size={12} /> Permissions
                            </p>
                            <ul className="flex flex-col gap-1.5">
                              {p.permissions.map(perm => (
                                <li key={perm} className="flex items-center gap-1.5 text-xs" style={{ color:'var(--text-muted)' }}>
                                  <CheckCircle2 size={11} style={{ color:'#22C55E', flexShrink:0 }} />{perm}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color:'var(--text)' }}>
                              <Zap size={12} /> Features
                            </p>
                            <ul className="flex flex-col gap-1.5">
                              {p.features.map(f => (
                                <li key={f} className="flex items-center gap-1.5 text-xs" style={{ color:'var(--text-muted)' }}>
                                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background:p.color }} />{f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Disconnected */}
      {disconnected.length > 0 && (
        <div>
          <h2 className="text-sm font-bold mb-3" style={{ color:'var(--text)', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
            Not Connected
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {disconnected.map(p => {
              const Icon = p.icon
              return (
                <div key={p.id} className="card p-4 flex items-center gap-4 opacity-70">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:p.bg }}>
                    <Icon size={22} style={{ color:p.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color:'var(--text)' }}>{p.label}</p>
                    <p className="text-xs" style={{ color:'var(--text-subtle)' }}>Not connected by client</p>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background:'rgba(239,68,68,.10)', color:'#EF4444' }}>
                    <XCircle size={9} /> Not Connected
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {connected.length === 0 && disconnected.length === 0 && (
        <div className="card p-10 text-center">
          <AlertTriangle size={20} className="mx-auto mb-2" style={{ color:'var(--text-muted)' }} />
          <p className="text-xs" style={{ color:'var(--text-muted)' }}>No platform information available.</p>
        </div>
      )}
    </div>
  )
}
