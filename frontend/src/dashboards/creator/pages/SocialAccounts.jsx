import { useEffect, useState, useCallback } from 'react'
import Card from '../../../shared/components/ui/Card'
import Button from '../../../shared/components/Button'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import { CardSkeleton } from '../../../shared/components/ui/Skeleton'
import { getPlatformLabel, getPlatformBrand } from '../../../services/postAdapter'
import BrandIcon from '../../../shared/components/ui/BrandIcon'
import { PLATFORM_OPTIONS } from '../constants/campaigns'
import {
  fetchSocialAccounts,
  connectSocialAccount,
  disconnectSocialAccount,
  syncSocialAccount,
} from '../services/creatorService'
import { Link2, Sparkles, RefreshCw } from 'lucide-react'

function formatFollowers(n) {
  if (n == null) return '—'
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}

function formatLastSync(iso) {
  if (!iso) return 'Never'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Never'
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function SocialAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const getAccounts = useCallback(async () => {
    try {
      const data = await fetchSocialAccounts()
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  }, [])

  const loadAccounts = useCallback(async () => {
    setLoading(true)
    const data = await getAccounts()
    setAccounts(data)
    setLoading(false)
  }, [getAccounts])

  useEffect(() => {
    let active = true
    getAccounts().then((data) => {
      if (!active) return
      setAccounts(data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [getAccounts])

  const handleConnect = async (platform) => {
    if (busyId) return
    setBusyId(`connect:${platform}`)
    try {
      await connectSocialAccount(platform)
      setToast(`${getPlatformLabel(platform)} connected successfully!`)
      await loadAccounts()
    } catch (err) {
      setToast(err?.response?.data?.detail || 'Failed to connect account.')
    } finally {
      setBusyId(null)
    }
  }

  const handleDisconnect = async (account) => {
    if (busyId) return
    setBusyId(account.id)
    try {
      await disconnectSocialAccount(account.id)
      setToast(`${getPlatformLabel(account.platform)} disconnected.`)
      await loadAccounts()
    } catch (err) {
      setToast(err?.response?.data?.detail || 'Failed to disconnect account.')
    } finally {
      setBusyId(null)
    }
  }

  const handleSync = async (account) => {
    if (busyId) return
    setBusyId(account.id)
    try {
      await syncSocialAccount(account.id)
      setToast(`${getPlatformLabel(account.platform)} synced successfully!`)
      await loadAccounts()
    } catch (err) {
      setToast(err?.response?.data?.detail || 'Failed to sync account.')
    } finally {
      setBusyId(null)
    }
  }

  const connectedPlatforms = accounts.map((a) => a.platform?.toLowerCase())
  const availablePlatforms = PLATFORM_OPTIONS.filter((p) => !connectedPlatforms.includes(p.id))

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-slide-up">
          <Sparkles size={16} className="text-indigo-400 dark:text-indigo-600" />
          <span>{toast}</span>
        </div>
      )}

      <section aria-label="Page header" className="card p-5 sm:p-6 relative overflow-hidden bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-950/40 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Social Accounts</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">
              Connect your social platforms to publish and track content from OrbitSocial.
            </p>
          </div>
          <Button variant="outline" size="md" onClick={loadAccounts} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
        </div>
      </section>

      <section aria-label="Connected social accounts">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Link2 size={18} className="text-indigo-500" />
          <span>Connected Platforms</span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
            <span className="text-2xl mb-1.5">🔗</span>
            <p className="font-bold text-sm">No connected accounts</p>
            <p className="text-xs mt-1">Connect a platform below to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => {
              return (
                <Card key={account.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-indigo-400/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getPlatformBrand(account.platform).bg}`}>
                        <BrandIcon platform={account.platform} size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{getPlatformLabel(account.platform)}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                          {account.username ? `@${account.username.replace(/^@/, '')}` : '—'}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status="active" dot />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Followers</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{formatFollowers(account.followers_count)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Health</span>
                      <span className={`font-bold ${account.health === 'Healthy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {account.health || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Last sync</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{formatLastSync(account.last_sync)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        loading={busyId === account.id}
                        onClick={() => handleSync(account)}
                      >
                        Sync
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        fullWidth
                        loading={busyId === account.id}
                        onClick={() => handleDisconnect(account)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section aria-label="Available platforms to connect">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-500" />
          <span>Available Platforms</span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : availablePlatforms.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
            <span className="text-2xl mb-1.5">🎉</span>
            <p className="font-bold text-sm">All platforms connected</p>
            <p className="text-xs mt-1">You have connected every available platform.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePlatforms.map((platform) => {
              return (
                <Card key={platform.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-indigo-400/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getPlatformBrand(platform.id).bg}`}>
                      <BrandIcon platform={platform.id} size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{platform.label}</h3>
                      <p className="text-xs text-slate-400 font-semibold">Not connected</p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    loading={busyId === `connect:${platform.id}`}
                    onClick={() => handleConnect(platform.id)}
                  >
                    Connect
                  </Button>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
