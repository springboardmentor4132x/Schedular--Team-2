import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Link2, Plus, Trash2, RefreshCw, CheckCircle2,
  AlertTriangle, Clock, Shield, Zap,
} from 'lucide-react'
import {
  FaInstagram, FaFacebook, FaLinkedin,
  FaXTwitter, FaYoutube, FaPinterest,
} from 'react-icons/fa6'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/dashboard/PageHeader'
import axiosInstance from '../../api/axios'
import Toast from '../../components/Toast'

/**
 * ConnectedAccounts — Business User Module 2
 * Social Media Account Integration:
 *   - Connect / disconnect accounts
 *   - View sync status
 *   - Platform permissions
 *   - Account authorization
 */

const PLATFORMS = [
  {
    id: 'instagram',
    label: 'Instagram',
    icon: FaInstagram,
    color: '#E1306C',
    bg: 'rgba(225,48,108,.10)',
    features: ['Post photos', 'Post reels', 'Stories', 'Carousels'],
    connected: true,
    username: '@orbitsocial',
    syncStatus: 'synced',
    lastSync: '2 min ago',
    followers: '12.4K',
    permissions: ['Read profile', 'Publish posts', 'View insights'],
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: FaFacebook,
    color: '#1877F2',
    bg: 'rgba(24,119,242,.10)',
    features: ['Post updates', 'Share links', 'Schedule posts'],
    connected: true,
    username: 'OrbitSocial Page',
    syncStatus: 'synced',
    lastSync: '5 min ago',
    followers: '8.2K',
    permissions: ['Manage Page', 'Publish content', 'View analytics'],
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: FaLinkedin,
    color: '#0A66C2',
    bg: 'rgba(10,102,194,.10)',
    features: ['Post articles', 'Company updates', 'Thought leadership'],
    connected: true,
    username: 'OrbitSocial Inc.',
    syncStatus: 'warning',
    lastSync: '3 hours ago',
    followers: '4.1K',
    permissions: ['Share content', 'Manage company page'],
  },
  {
    id: 'x',
    label: 'X (Twitter)',
    icon: FaXTwitter,
    color: '#000000',
    bg: 'rgba(0,0,0,.07)',
    features: ['Post tweets', 'Thread posts', 'Schedule'],
    connected: false,
    username: null,
    syncStatus: null,
    lastSync: null,
    followers: null,
    permissions: ['Read timeline', 'Post tweets', 'View analytics'],
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: FaYoutube,
    color: '#FF0000',
    bg: 'rgba(255,0,0,.10)',
    features: ['Upload videos', 'Shorts', 'Community posts'],
    connected: false,
    username: null,
    syncStatus: null,
    lastSync: null,
    followers: null,
    permissions: ['Upload videos', 'Manage channel', 'View analytics'],
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    icon: FaPinterest,
    color: '#E60023',
    bg: 'rgba(230,0,35,.10)',
    features: ['Create pins', 'Board management', 'Rich pins'],
    connected: false,
    username: null,
    syncStatus: null,
    lastSync: null,
    followers: null,
    permissions: ['Create pins', 'Manage boards'],
  },
]

const SYNC_STATUS = {
  synced:  { icon: CheckCircle2,  color: '#22C55E', label: 'Synced'  },
  warning: { icon: AlertTriangle, color: '#F59E0B', label: 'Warning' },
  error:   { icon: AlertTriangle, color: '#EF4444', label: 'Error'   },
  syncing: { icon: RefreshCw,     color: '#1E3A8A', label: 'Syncing' },
}

export default function ConnectedAccounts() {
  const { user } = useAuth()
  const [platforms, setPlatforms] = useState(PLATFORMS)
  const [syncing,   setSyncing]   = useState(null)
  const [expanded,  setExpanded]  = useState(null)
  const [toast,     setToast]     = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    fetchConnectedAccounts()
    checkUrlParams()
  }, [])

  const checkUrlParams = () => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success')) {
      setToast({ type: 'success', message: 'Account connected successfully!' })
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (params.get('error')) {
      setToast({ type: 'error', message: `Connection failed: ${params.get('error')}` })
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }

  const fetchConnectedAccounts = async () => {
    try {
      const res = await axiosInstance.get('/api/v1/social/')
      const connectedData = res.data
      
      setPlatforms(prev => prev.map(p => {
        const dbAcc = connectedData.find(a => a.platform === p.id)
        if (dbAcc) {
          return {
            ...p,
            connected: true,
            username: dbAcc.username,
            syncStatus: dbAcc.health === 'Healthy' ? 'synced' : 'error',
            lastSync: 'Recently',
            followers: dbAcc.followers_count || '0',
            accountId: dbAcc.id // Store DB id for deletion
          }
        }
        return { ...p, connected: false }
      }))
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load connected accounts' })
    } finally {
      setLoading(false)
    }
  }

  const connected    = platforms.filter(p => p.connected)
  const disconnected = platforms.filter(p => !p.connected)

  const handleConnect = async id => {
    try {
      // For phase 1, only LinkedIn and X are truly implemented.
      // The backend handles fallbacks or real OAuth URLs.
      const res = await axiosInstance.get(`/api/v1/social/connect/${id}`)
      if (res.data.auth_url) {
        window.location.href = res.data.auth_url
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to initiate connection' })
    }
  }

  const handleDisconnect = async (id, accountId) => {
    if (!accountId) return
    if (!confirm('Are you sure you want to disconnect this account?')) return
    
    try {
      await axiosInstance.delete(`/api/v1/social/${accountId}`)
      setToast({ type: 'success', message: 'Account disconnected' })
      setPlatforms(prev => prev.map(p =>
        p.id === id ? {
          ...p,
          connected: false,
          username: null,
          syncStatus: null,
          lastSync: null,
          followers: null,
          accountId: null
        } : p
      ))
      if (expanded === id) setExpanded(null)
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to disconnect account' })
    }
  }

  const handleSync = async (id, accountId) => {
    if (!accountId) return
    setSyncing(id)
    try {
      await axiosInstance.post(`/api/v1/social/${accountId}/sync`)
      setPlatforms(prev => prev.map(p =>
        p.id === id ? { ...p, syncStatus: 'synced', lastSync: 'Just now' } : p
      ))
      setToast({ type: 'success', message: 'Account synced' })
    } catch (err) {
      setToast({ type: 'error', message: 'Sync failed' })
    } finally {
      setSyncing(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1000px] mx-auto relative">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <PageHeader
        title="Connected Accounts"
        subtitle="Manage your social media accounts and platform permissions."
      />

      {/* ── Summary row ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Connected',    value: connected.length,    color: '#22C55E' },
          { label: 'Disconnected', value: disconnected.length, color: 'var(--text-muted)' },
          { label: 'Needs Attention', value: platforms.filter(p => p.syncStatus === 'warning' || p.syncStatus === 'error').length, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Connected platforms ── */}
      {connected.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Connected Platforms
          </h2>
          <div className="flex flex-col gap-3">
            {connected.map(p => {
              const Icon = p.icon
              const sync = SYNC_STATUS[p.syncStatus]
              const SyncIcon = sync?.icon
              const isExpanded = expanded === p.id
              const isSyncing  = syncing === p.id

              return (
                <motion.div
                  key={p.id}
                  layout
                  className="card overflow-hidden"
                  style={{ borderLeft: `3px solid ${p.color}` }}
                >
                  {/* Main row */}
                  <div className="flex items-center gap-4 p-4">
                    {/* Platform icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: p.bg }}
                    >
                      <Icon size={22} style={{ color: p.color }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{p.label}</p>
                        {sync && (
                          <span
                            className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: `${sync.color}15`, color: sync.color }}
                          >
                            {isSyncing
                              ? <><RefreshCw size={9} className="animate-spin" /> Syncing</>
                              : <><SyncIcon size={9} /> {sync.label}</>
                            }
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                          {p.username}
                        </span>
                        {p.followers && (
                          <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                            {p.followers} followers
                          </span>
                        )}
                        {p.lastSync && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-subtle)' }}>
                            <Clock size={10} /> Synced {p.lastSync}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleSync(p.id, p.accountId)}
                        disabled={isSyncing}
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)] transition-colors"
                        title="Sync now"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                      </button>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : p.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all"
                        style={{ background: 'var(--bg-alt)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                      >
                        {isExpanded ? 'Hide' : 'Details'}
                      </button>
                      <button
                        onClick={() => handleDisconnect(p.id, p.accountId)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all"
                        style={{ background: 'rgba(239,68,68,.06)', borderColor: 'rgba(239,68,68,.20)', color: '#EF4444' }}
                      >
                        <Trash2 size={11} /> Disconnect
                      </button>
                    </div>
                  </div>

                  {/* Expanded permissions */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="px-4 pb-4 pt-0 grid sm:grid-cols-2 gap-4 border-t" style={{ borderColor: 'var(--border)' }}>
                          <div className="pt-3">
                            <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
                              <Shield size={12} /> Permissions
                            </p>
                            <ul className="flex flex-col gap-1.5">
                              {p.permissions.map(perm => (
                                <li key={perm} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                                  <CheckCircle2 size={11} style={{ color: '#22C55E', flexShrink: 0 }} />
                                  {perm}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="pt-3">
                            <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
                              <Zap size={12} /> Features Available
                            </p>
                            <ul className="flex flex-col gap-1.5">
                              {p.features.map(feat => (
                                <li key={feat} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: p.color }} />
                                  {feat}
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

      {/* ── Available to connect ── */}
      {disconnected.length > 0 && (
        <div>
          <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Available Platforms
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {disconnected.map(p => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-4 flex items-center gap-4"
                  style={{ opacity: 0.8 }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: p.bg }}
                  >
                    <Icon size={22} style={{ color: p.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{p.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>Not connected</p>
                  </div>
                  <button
                    onClick={() => handleConnect(p.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-105 text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                  >
                    <Plus size={12} /> Connect
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
