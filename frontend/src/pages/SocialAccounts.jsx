import { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { socialAccountsService } from '../services/socialAccountsService'

// ── Official Platform SVGs ───────────────────────────────────────────────────
const InstagramLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const FacebookLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const LinkedInLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const XLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const YouTubeLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.528 3.545 12 3.545 12 3.545s-7.528 0-9.388.51a3.004 3.004 0 0 0-2.11 2.108C0 8.024 0 12 0 12s0 3.976.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.86.51 9.388.51 9.388.51s7.528 0 9.388-.51a3.003 3.003 0 0 0 2.11-2.108c.502-1.86.502-5.837.502-5.837s0-3.976-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const PinterestLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.715-.359-1.774c0-1.663.963-2.9 2.162-2.9 1.02 0 1.512.765 1.512 1.682 0 1.025-.653 2.561-.99 3.981-.281 1.19.599 2.161 1.774 2.161 2.128 0 3.768-2.245 3.768-5.487 0-2.868-2.061-4.87-5.007-4.87-3.41 0-5.41 2.558-5.41 5.198 0 1.03.397 2.133.892 2.734.098.119.112.224.083.342-.091.381-.295 1.205-.335 1.371-.053.219-.176.265-.407.158-1.524-.709-2.476-2.938-2.476-4.731 0-3.85 2.8-7.387 8.066-7.387 4.235 0 7.528 3.018 7.528 7.054 0 4.208-2.654 7.596-6.337 7.596-1.238 0-2.4-.643-2.8-1.406 0 0-.612 2.33-.76 2.894-.275 1.055-.99 2.378-1.48 3.181 1.127.348 2.321.537 3.559.537 6.62 0 11.987-5.367 11.987-11.987C24.007 5.367 18.64 0 12.017 0z"/>
  </svg>
)

const platformLogos = {
  instagram: { component: InstagramLogo, brandColor: 'text-[#E1306C]', iconColor: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-[#ee2a7b]/20 shadow-md' },
  facebook: { component: FacebookLogo, brandColor: 'text-[#1877F2]', iconColor: 'bg-[#1877F2] text-white shadow-[#1877F2]/20 shadow-md' },
  linkedin: { component: LinkedInLogo, brandColor: 'text-[#0A66C2]', iconColor: 'bg-[#0A66C2] text-white shadow-[#0A66C2]/20 shadow-md' },
  twitter: { component: XLogo, brandColor: 'text-slate-900 dark:text-slate-100', iconColor: 'bg-slate-900 dark:bg-slate-700 text-white shadow-slate-900/20 shadow-md' },
  youtube: { component: YouTubeLogo, brandColor: 'text-[#FF0000]', iconColor: 'bg-[#FF0000] text-white shadow-[#FF0000]/20 shadow-md' },
  pinterest: { component: PinterestLogo, brandColor: 'text-[#BD081C]', iconColor: 'bg-[#BD081C] text-white shadow-[#BD081C]/20 shadow-md' },
}

// ── Status styling resolver ───────────────────────────────────────────────────
const getStatusProps = (status) => {
  switch (status) {
    case 'Connected':
      return { variant: 'success', label: 'Connected' }
    case 'Syncing':
      return { variant: 'primary', label: 'Syncing' }
    case 'Expired Token':
      return { variant: 'danger', label: 'Failed' }
    case 'Requires Login':
      return { variant: 'warning', label: 'Pending' }
    case 'Not Connected':
    default:
      return { variant: 'default', label: 'Disconnected' }
  }
}

// ── Health text indicator styling resolver ────────────────────────────────────
const getHealthClass = (health) => {
  switch (health) {
    case 'Healthy':
    case 'Good':
      return 'text-emerald-600 dark:text-emerald-400 font-semibold'
    case 'Fair':
      return 'text-amber-600 dark:text-amber-400 font-semibold'
    case 'Action Required':
    case 'Critical':
      return 'text-rose-600 dark:text-rose-400 font-bold'
    default:
      return 'text-slate-400 dark:text-slate-500 font-medium'
  }
}

export default function SocialAccounts() {
  const [accounts, setAccounts] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    const data = await socialAccountsService.getAccounts()
    setAccounts(data)
    setActivities(socialAccountsService.getActivities())
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Connect helper - opens the login page and simulates connection
  const handleConnect = async (platformId) => {
    try {
      // 1. Open the requested login page in a new tab to satisfy the visual requirement
      window.open(`http://localhost:8000/api/v1/social/connect/${platformId}`, '_blank')
      
      // 2. Mock the DB connection using the POST endpoint
      await socialAccountsService.connectAccount(platformId)
      
      // 3. Reload the data so the new connection shows up immediately
      await loadData()
    } catch (e) {
      console.error(e)
      alert("Failed to connect platform.")
    }
  }

  // Disconnect helper
  const handleDisconnect = async (accountId, platformName) => {
    try {
      await socialAccountsService.disconnectAccount(accountId)
      socialAccountsService.addActivity({
        id: Date.now(),
        text: `${platformName} connection was removed`,
        time: 'Just now',
        type: 'warning'
      })
      await loadData()
    } catch (e) {
      console.error(e)
      alert("Failed to disconnect platform.")
    }
  }

  // Refresh sync helper
  const handleRefresh = async (accountId, platformName) => {
    try {
      await socialAccountsService.syncAccount(accountId)
      socialAccountsService.addActivity({
        id: Date.now(),
        text: `${platformName} connection synched and verified`,
        time: 'Just now',
        type: 'info'
      })
      await loadData()
    } catch (e) {
      console.error(e)
      alert("Failed to sync platform.")
    }
  }

  // Global Actions
  const handleConnectAll = async () => {
    alert("Connect All feature is disabled in manual mode.")
  }

  const handleRefreshAll = async () => {
    const connectedAccounts = accounts.filter(a => a.status === 'Connected')
    for (const acc of connectedAccounts) {
      await socialAccountsService.syncAccount(acc.id)
    }
    socialAccountsService.addActivity({
      id: Date.now(),
      text: 'Triggered global verification and channel synchronization',
      time: 'Just now',
      type: 'info'
    })
    await loadData()
  }

  const handleDisconnectAll = async () => {
    const connectedAccounts = accounts.filter(a => a.status === 'Connected')
    for (const acc of connectedAccounts) {
      await socialAccountsService.disconnectAccount(acc.id)
    }
    socialAccountsService.addActivity({
      id: Date.now(),
      text: 'All connected platform tokens revoked',
      time: 'Just now',
      type: 'error'
    })
    await loadData()
  }

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(accounts, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href",     dataStr);
    dlAnchorElem.setAttribute("download", "orbit_social_connections.json");
    dlAnchorElem.click();
  }

  if (loading && accounts.length === 0) {
    return <div className="p-8 text-center text-slate-500">Loading social accounts...</div>
  }

  // Summary Metrics calculations
  const connectedCount = accounts.filter(a => a.status === 'Connected' || a.status === 'Syncing').length
  const pendingCount = accounts.filter(a => a.status === 'Requires Login' || a.status === 'Syncing').length
  const failedCount = accounts.filter(a => a.status === 'Expired Token').length
  const postsScheduled = 47 // Constant matching mock statistics

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Summary stats">
        {[
          { label: 'Connected Platforms', value: connectedCount, icon: '🔗', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
          { label: 'Pending Connections', value: pendingCount, icon: '⏳', color: 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400' },
          { label: 'Failed Connections', value: failedCount, icon: '⚠️', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
          { label: 'Posts Scheduled', value: postsScheduled, icon: '🗓️', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
        ].map((stat, idx) => (
          <Card key={idx} className="p-5 flex items-center gap-4 border border-slate-100 dark:border-slate-700/60 transition-all duration-300 hover:shadow-card-lg dark:hover:shadow-[0_2px_16px_rgba(0,0,0,0.35)] min-h-[96px]">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{stat.value}</p>
            </div>
          </Card>
        ))}
      </section>

      {/* Main Connection Channels Cards Grid */}
      <section aria-label="Social connection accounts">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">Connection Channels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => {
            const statusProps = getStatusProps(acc.status)
            const isConnected = acc.status !== 'Not Connected'
            const platformKey = acc.platformId || acc.id // fallback for unconnected
            const LogoConfig = platformLogos[platformKey] || platformLogos['twitter']
            const LogoComponent = LogoConfig.component

            return (
              <Card key={acc.id} id={`account-card-${acc.id}`} className="p-5 flex flex-col justify-between gap-5 border border-slate-100 dark:border-slate-700/60 shadow-[0_2px_16px_rgba(36,59,107,0.07)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)] transition-all duration-300 hover:shadow-card-lg dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.45)] hover:-translate-y-0.5">
                {/* Header: Platform details + status badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${LogoConfig.iconColor}`}>
                      <LogoComponent />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{acc.platform}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[120px] sm:max-w-[150px]">
                        {acc.username}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusProps.variant} className="whitespace-nowrap">
                    {statusProps.label}
                  </Badge>
                </div>

                {/* Metrics detail row */}
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 dark:border-slate-700/60 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-wider">Followers</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold text-sm">{acc.followers}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-wider">Connected Since</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{acc.connectedSince}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-wider">Last Sync</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{acc.lastSync}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-wider">Health Status</span>
                    <span className={getHealthClass(acc.health)}>{acc.health}</span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  {isConnected ? (
                    <>
                      <Button
                        id={`disconnect-btn-${acc.id}`}
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onClick={() => handleDisconnect(acc.id, acc.platform)}
                        className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      >
                        Disconnect Account
                      </Button>
                      <Button
                        id={`refresh-btn-${acc.id}`}
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={() => handleRefresh(acc.id, acc.platform)}
                        className="text-navy-600 dark:text-navy-300"
                      >
                        Sync Link
                      </Button>
                    </>
                  ) : (
                    <Button
                      id={`connect-btn-${acc.id}`}
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => handleConnect(platformKey)}
                    >
                      Connect Account
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Middle Row: Quick Actions + Recent Connection Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Quick Actions Card */}
        <section aria-label="Platform connection actions" className="lg:col-span-1">
          <Card className="p-5 flex flex-col gap-4 border border-slate-100 dark:border-slate-700/60 shadow-[0_2px_16px_rgba(36,59,107,0.07)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-700/60">
              Control Panel
            </h3>
            <div className="flex flex-col gap-2.5">
              <Button id="action-connect-all" onClick={handleConnectAll} size="sm" variant="primary">
                Connect Platform
              </Button>
              <Button id="action-refresh-all" onClick={handleRefreshAll} size="sm" variant="secondary">
                Refresh All
              </Button>
              <Button id="action-disconnect-all" onClick={handleDisconnectAll} size="sm" variant="ghost" className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20">
                Disconnect All
              </Button>
              <Button id="action-export" onClick={handleExport} size="sm" variant="ghost">
                Export Connections
              </Button>
            </div>
          </Card>
        </section>

        {/* Recent Connection Activity Card */}
        <section aria-label="Recent activity logs" className="lg:col-span-2">
          <Card className="p-5 flex flex-col gap-4 border border-slate-100 dark:border-slate-700/60 shadow-[0_2px_16px_rgba(36,59,107,0.07)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-700/60">
              Recent Connection Activity
            </h3>
            
            {/* Timeline structure */}
            <div className="relative pl-6 border-l border-slate-100 dark:border-slate-700/80 space-y-5 max-h-[260px] overflow-y-auto pr-1">
              {activities.map((act) => (
                <div key={act.id} className="relative flex flex-col gap-1">
                  {/* Timeline dot */}
                  <span className={[
                    'absolute -left-[30px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800',
                    act.type === 'success' ? 'bg-emerald-500' :
                    act.type === 'info' ? 'bg-primary-500' :
                    act.type === 'warning' ? 'bg-amber-500' :
                    act.type === 'error' ? 'bg-rose-500' : 'bg-slate-400'
                  ].join(' ')} aria-hidden="true" />
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {act.text}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
