import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCw, CheckCircle2, AlertTriangle,
  XCircle, Clock, Shield, Zap, ArrowLeft, Users, Eye,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { fetchSocialAccounts } from '../../../services/socialAccountsService'

const PLATFORM_CONFIGS = {
  instagram: { icon:FaInstagram, color:'#E1306C', bg:'rgba(225,48,108,.10)', label:'Instagram', features:['Post photos','Reels','Stories','Carousels'],      permissions:['Read profile','Publish posts','View insights'] },
  facebook:  { icon:FaFacebook,  color:'#1877F2', bg:'rgba(24,119,242,.10)', label:'Facebook',  features:['Post updates','Share links','Schedule posts'],      permissions:['Manage Page','Publish content','View analytics'] },
  linkedin:  { icon:FaLinkedin,  color:'#0A66C2', bg:'rgba(10,102,194,.10)', label:'LinkedIn',  features:['Post articles','Company updates'],                  permissions:['Share content','Manage company page'] },
  x:         { icon:FaXTwitter,  color:'#374151', bg:'rgba(55,65,81,.08)',   label:'X',         features:['Post tweets','Threads','Schedule'],                 permissions:['Read timeline','Post tweets','View analytics'] },
  youtube:   { icon:FaYoutube,   color:'#FF0000', bg:'rgba(255,0,0,.10)',    label:'YouTube',   features:['Upload videos','Shorts','Community posts'],         permissions:['Upload videos','Manage channel'] },
  pinterest: { icon:FaPinterest, color:'#E60023', bg:'rgba(230,0,35,.10)',   label:'Pinterest', features:['Create pins','Board management','Rich pins'],       permissions:['Create pins','Manage boards'] },
}

const SYNC_STATUS = {
  connected:    { icon:CheckCircle2,  color:'#22C55E', label:'Connected'    },
  warning:      { icon:AlertTriangle, color:'#F59E0B', label:'Warning'       },
  disconnected: { icon:XCircle,       color:'#EF4444', label:'Disconnected' },
  syncing:      { icon:RefreshCw,     color:'#1E3A8A', label:'Syncing'      },
}

function buildAccounts(platforms, realAccounts) {
  return Object.entries(PLATFORM_CONFIGS).map(([id, cfg]) => {
    const isConnected = platforms.includes(id)
    const real = realAccounts?.find(acc => (acc.platform || '').toLowerCase() === id)
    return {
      id, ...cfg,
      connected:  isConnected,
      username:   real?.username ? `@${real.username}` : (isConnected ? `@${id}_${Math.random().toString(36).slice(2,6)}` : null),
      followers:  real?.followers_count ? `${(real.followers_count / 1000).toFixed(1)}K` : (isConnected ? `${(Math.random()*20+1).toFixed(1)}K` : null),
      syncStatus: isConnected ? (real?.health === 'Warning' || real?.health === 'Error' ? 'warning' : 'connected') : 'disconnected',
      lastSync:   real?.last_sync ? formatLastSync(real.last_sync) : (isConnected ? '5 min ago' : null),
    }
  })
}

function formatLastSync(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Recently'
  const diff = Math.round((Date.now() - d.getTime()) / 60000)
  if (diff < 60) return `${Math.max(diff, 1)} min ago`
  if (diff < 1440) return `${Math.round(diff / 60)} hours ago`
  return `${Math.round(diff / 1440)} days ago`
}

export default function ConnectedApps() {
  const navigate = useNavigate()
  const { activeClient } = useClient()
  const [expanded, setExpanded] = useState(null)
  const [syncing,  setSyncing]  = useState(null)
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    if (!activeClient) return
    let cancelled = false
    fetchSocialAccounts()
      .then(realAccounts => { if (!cancelled) setAccounts(buildAccounts(activeClient.connectedPlatforms ?? [], realAccounts)) })
      .catch(() => { if (!cancelled) setAccounts(buildAccounts(activeClient.connectedPlatforms ?? [], [])) })
    return () => { cancelled = true }
  }, [activeClient])

  const accountsMemo = useMemo(() => accounts, [accounts])

  if (!activeClient) {
    return (
      <div className="p-6"><div className="card">
        <EmptyState icon={Users} title="No client selected" message="Select a client first."
          action={{ label:'View Clients', onClick:() => navigate('/dashboard/mkt/clients') }} />
      </div></div>
    )
  }

  const connected    = accountsMemo.filter(a => a.connected)
  const disconnected = accountsMemo.filter(a => !a.connected)

  const handleSync = id => {
    setSyncing(id)
    setTimeout(() => {
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, syncStatus:'connected', lastSync:'Just now' } : a))
      setSyncing(null)
    }, 1800)
  }

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
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:'Connected',      value:connected.length,                                                   color:'#22C55E' },
          { label:'Disconnected',   value:disconnected.length,                                                color:'var(--text-muted)' },
          { label:'Needs Attention',value:accountsMemo.filter(a=>a.syncStatus==='warning').length,                color:'#F59E0B' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
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
              const sync    = SYNC_STATUS[p.syncStatus]
              const SIcon   = sync?.icon
              const isExp   = expanded === p.id
              const isSyncing = syncing === p.id
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
                          style={{ background:`${sync.color}15`, color:sync.color }}>
                          {isSyncing ? <><RefreshCw size={9} className="animate-spin" /> Syncing</>
                                     : <><SIcon size={9} /> {sync.label}</>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color:'var(--text-subtle)' }}>
                        <span>{p.username}</span>
                        {p.followers && <span>{p.followers} followers</span>}
                        {p.lastSync && <span className="flex items-center gap-1"><Clock size={10} /> {p.lastSync}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleSync(p.id)} disabled={isSyncing}
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)] transition-colors"
                        style={{ color:'var(--text-muted)' }} title="Sync now">
                        <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                      </button>
                      <button onClick={() => setExpanded(isExp ? null : p.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold"
                        style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text-muted)' }}>
                        <Eye size={11} /> {isExp ? 'Hide' : 'Details'}
                      </button>
                    </div>
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
                        {p.syncStatus === 'warning' && (
                          <div className="mx-4 mb-4 px-3 py-2 rounded-[var(--r-md)] flex items-center gap-2"
                            style={{ background:'rgba(245,158,11,.08)', border:'1px solid rgba(245,158,11,.20)' }}>
                            <AlertTriangle size={13} style={{ color:'#F59E0B' }} />
                            <span className="text-xs font-medium" style={{ color:'#F59E0B' }}>
                              Token may have expired. Ask client to reconnect this account.
                            </span>
                          </div>
                        )}
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
    </div>
  )
}
