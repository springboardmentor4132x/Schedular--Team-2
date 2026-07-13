import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useTheme } from '../hooks/useTheme'
import { settingsService } from '../services/settingsService'

// ── Icons (Inline SVGs, zero extra dependencies) ──────────────────────────────
const AccountIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-5 h-5" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-5 h-5" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8M8 12h8" />
  </svg>
)

const PaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-5 h-5" aria-hidden="true">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.32168 19.4631 5.48512 20.1264 5.28185 20.7362L5 21.5818C4.85108 22.0285 5.24716 22.4246 5.69385 22.2757L6.53951 21.9939C7.14925 21.7906 7.81261 21.954 8.2757 22.4171C9.4005 23.5419 10.9328 24.2308 12.6282 24.2308" />
    <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor"/>
    <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor"/>
    <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor"/>
    <circle cx="15.5" cy="14.5" r="1.5" fill="currentColor"/>
  </svg>
)

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-5 h-5" aria-hidden="true">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-5 h-5" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-5 h-5" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const ConnectedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-5 h-5" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const BillingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-5 h-5" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
)

const SupportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-5 h-5" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const AlertTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="w-5 h-5 text-rose-600" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

// ── Reusable Toggle Switch Component ──────────────────────────────────────────
function Toggle({ checked, onChange, id, label, ariaDescribedby }) {
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onChange(!checked)
    }
  }

  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      aria-describedby={ariaDescribedby}
      onClick={() => onChange(!checked)}
      onKeyDown={handleKeyDown}
      className={[
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800',
        checked ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

// ── Reusable Custom Dropdown Component ────────────────────────────────────────
function Dropdown({ id, label, value, options, onChange }) {
  return (
    <div className="space-y-1.5 w-full">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:border-primary-400 transition-all duration-150 appearance-none pr-10"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="w-4 h-4">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// ── Reusable Card Wrapper ────────────────────────────────────────────────────
function SettingsCard({ title, icon: Icon, children, id, className = '' }) {
  return (
    <Card id={id} className={`p-5 sm:p-7 flex flex-col gap-6 ${className}`}>
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-4">
        {Icon && (
          <span className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Icon />
          </span>
        )}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      </div>
      <div className="flex flex-col gap-5">
        {children}
      </div>
    </Card>
  )
}

// ── Settings Page Root Component ──────────────────────────────────────────────
export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', title: '', message: '' })
  
  // Navigation active tab category state
  const [activeTab, setActiveTab] = useState('account')

  useEffect(() => {
    const loadSettings = async () => {
      const data = await settingsService.getSettings()
      setSettings(data)
      setLoading(false)
    }
    loadSettings()
  }, [])

  // Keep theme select matched with local context theme
  const getThemeValue = () => {
    const stored = localStorage.getItem('orbit-theme')
    if (stored) return stored
    return 'system'
  }
  const [selectedTheme, setSelectedTheme] = useState(getThemeValue())

  // Handle theme preference option changes
  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme)
    if (newTheme === 'system') {
      localStorage.removeItem('orbit-theme')
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const root = document.documentElement
      if (systemDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    } else {
      localStorage.setItem('orbit-theme', newTheme)
      const root = document.documentElement
      if (newTheme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  // Update specific sections helper
  const updateNotificationSetting = async (key, val) => {
    const updated = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: val
      }
    }
    setSettings(updated)
    await settingsService.saveSettings(updated)
  }

  const updateSecuritySetting = async (key, val) => {
    const updated = {
      ...settings,
      security: {
        ...settings.security,
        [key]: val
      }
    }
    setSettings(updated)
    await settingsService.saveSettings(updated)
  }

  const updatePrivacySetting = async (key, val) => {
    const updated = {
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: val
      }
    }
    setSettings(updated)
    await settingsService.saveSettings(updated)
  }

  const updateRegionSetting = async (key, val) => {
    const updated = {
      ...settings,
      region: {
        ...settings.region,
        [key]: val
      }
    }
    setSettings(updated)
    await settingsService.saveSettings(updated)
  }

  // Danger Zone Handlers
  const triggerDangerAction = (type, title, message) => {
    setModalConfig({
      isOpen: true,
      type,
      title,
      message
    })
  }

  const confirmDangerAction = () => {
    alert(`Action confirmed: ${modalConfig.title}`)
    setModalConfig({ isOpen: false, type: '', title: '', message: '' })
  }

  // Tab configurations
  const tabs = [
    { id: 'account',            label: 'Account',            icon: AccountIcon },
    { id: 'profile',            label: 'Profile',            icon: ProfileIcon },
    { id: 'notifications',      label: 'Notifications',      icon: BellIcon },
    { id: 'privacy',            label: 'Privacy',            icon: EyeIcon },
    { id: 'security',           label: 'Security',           icon: ShieldIcon },
    { id: 'appearance',          label: 'Appearance',          icon: PaletteIcon },
    { id: 'connected-accounts', label: 'Connected Accounts', icon: ConnectedIcon },
    { id: 'support',            label: 'Support',            icon: SupportIcon },
  ]

  if (loading || !settings) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Account Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your OrbitSocial account configuration, integrations, security, and workspaces.
          </p>
        </div>
      </div>

      {/* Main Two-Column Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
        
        {/* Left Panel Sidebar */}
        <Card className="p-3 lg:p-4 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible whitespace-nowrap lg:whitespace-normal gap-1 scrollbar-hide shrink-0 z-10">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-150 w-full text-left',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-slate-850 dark:hover:text-slate-200'
                ].join(' ')}
              >
                <span className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}>
                  <IconComponent />
                </span>
                <span className="flex-1">{tab.label}</span>
                {tab.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-750 dark:text-slate-400 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </Card>

        {/* Right Panel Workspace Sections */}
        <div className="space-y-6">
          
          {/* 1. Account Section */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <SettingsCard title="Language & Region" icon={AccountIcon}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dropdown
                    id="region-language"
                    label="Language"
                    value={settings.region.language}
                    onChange={(val) => updateRegionSetting('language', val)}
                    options={[
                      { value: 'en', label: 'English (US)' },
                      { value: 'es', label: 'Español' },
                      { value: 'fr', label: 'Français' },
                      { value: 'de', label: 'Deutsch' },
                    ]}
                  />
                  <Dropdown
                    id="region-timezone"
                    label="Timezone"
                    value={settings.region.timezone}
                    onChange={(val) => updateRegionSetting('timezone', val)}
                    options={[
                      { value: 'UTC-8', label: 'Pacific Time (UTC-8)' },
                      { value: 'UTC-5', label: 'Eastern Time (UTC-5)' },
                      { value: 'UTC+0', label: 'Greenwich Mean Time (UTC+0)' },
                      { value: 'UTC+1', label: 'Central European Time (UTC+1)' },
                    ]}
                  />
                  <Dropdown
                    id="region-dateformat"
                    label="Date Format"
                    value={settings.region.dateFormat}
                    onChange={(val) => updateRegionSetting('dateFormat', val)}
                    options={[
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    ]}
                  />
                  <Dropdown
                    id="region-timeformat"
                    label="Time Format"
                    value={settings.region.timeFormat}
                    onChange={(val) => updateRegionSetting('timeFormat', val)}
                    options={[
                      { value: '12h', label: '12-hour (AM/PM)' },
                      { value: '24h', label: '24-hour' },
                    ]}
                  />
                </div>
              </SettingsCard>

              <SettingsCard title="Account Info" icon={AccountIcon}>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
                  <div className="py-3 flex justify-between gap-4 items-center">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Current Plan</span>
                    <span className="font-bold text-primary-650 dark:text-primary-400">{settings.accountInfo.currentPlan}</span>
                  </div>
                  <div className="py-3 flex justify-between gap-4 items-center">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Storage Used</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{settings.accountInfo.storageUsed}</span>
                  </div>
                  <div className="py-3 flex justify-between gap-4 items-center">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Connected Devices</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{settings.accountInfo.connectedDevices}</span>
                  </div>
                  <div className="py-3 flex justify-between gap-4 items-center">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Created Date</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{settings.accountInfo.createdDate}</span>
                  </div>
                  <div className="py-3 flex justify-between gap-4 items-center">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Last Login</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{settings.accountInfo.lastLogin}</span>
                  </div>
                </div>
              </SettingsCard>

              <SettingsCard title="Danger Zone" icon={AlertTriangleIcon}>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/30 dark:bg-rose-950/10">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-rose-700 dark:text-rose-400">Logout Account</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">End your current session on this device.</span>
                    </div>
                    <Button
                      id="danger-logout"
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 whitespace-nowrap"
                      onClick={() => triggerDangerAction('logout', 'Log Out Account', 'Are you sure you want to end your current session? You will need to sign in again to access OrbitSocial.')}
                    >
                      Logout
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/30 dark:bg-rose-950/10">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-rose-700 dark:text-rose-400">Deactivate Account</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Temporarily hide your profile. You can reactivate at any time.</span>
                    </div>
                    <Button
                      id="danger-deactivate"
                      variant="danger"
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() => triggerDangerAction('deactivate', 'Deactivate Account', 'Are you sure you want to temporarily deactivate your account? Your social campaigns and profile stats will be hidden until you sign back in.')}
                    >
                      Deactivate
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/30 dark:bg-rose-950/10">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-rose-700 dark:text-rose-400">Delete Account</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Permanently delete your profile, workspaces and analytics. This cannot be undone.</span>
                    </div>
                    <Button
                      id="danger-delete"
                      variant="danger"
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() => triggerDangerAction('delete', 'Delete Account', 'WARNING: Are you absolutely sure you want to permanently delete your account? This action will destroy all analytics, OrbitSocial profiles, and workspace settings. This operation is irreversible.')}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </SettingsCard>
            </div>
          )}

          {/* 2. Profile Section */}
          {activeTab === 'profile' && (
            <SettingsCard title="Profile Summary" icon={AccountIcon}>
              <div className="flex flex-col items-center sm:items-start gap-5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0">
                    JD
                  </div>
                  <div className="text-center sm:text-left min-w-0 flex-1">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">John Doe</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">john@orbitsocial.com</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                      <span className="px-2.5 py-0.5 text-xs font-semibold text-primary-750 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40 rounded-full">
                        Role: Administrator
                      </span>
                      <span className="px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 rounded-full">
                        Status: Active
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full h-px bg-slate-200/60 dark:bg-slate-700" />

                <div className="space-y-3 w-full text-sm">
                  <div>
                    <span className="block font-bold text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-wider">Company</span>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">OrbitSocial Inc.</p>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-wider">Bio</span>
                    <p className="text-slate-600 dark:text-slate-355 mt-0.5 leading-relaxed">
                      Senior Marketing Manager &amp; Content Strategist. Overseeing full cycle social integration campaigns and growth analytics workflows.
                    </p>
                  </div>
                </div>

                <div className="w-full flex justify-end pt-2">
                  <Button variant="primary" size="md" onClick={() => navigate('/profile')}>
                    Go to Profile Page
                  </Button>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* 3. Notifications Section */}
          {activeTab === 'notifications' && (
            <SettingsCard title="Notification Toggles" icon={BellIcon}>
              <div className="space-y-5">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive real-time updates and notifications via email.' },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Enable push alerts in your browser window.' },
                  { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive emails about new features, promotions, and tips.' },
                  { key: 'productUpdates', label: 'Product Updates', desc: 'Stay informed about regular updates, security releases, and changelogs.' },
                  { key: 'weeklySummary', label: 'Weekly Summary', desc: 'Get a consolidated digest of your social analytics once a week.' },
                  { key: 'securityAlerts', label: 'Security Alerts', desc: 'Immediate warnings about unknown sign-ins or password resets.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors duration-150">
                    <div className="flex flex-col">
                      <label htmlFor={`toggle-notif-${item.key}`} className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {item.label}
                      </label>
                      <span id={`desc-notif-${item.key}`} className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {item.desc}
                      </span>
                    </div>
                    <Toggle
                      id={`toggle-notif-${item.key}`}
                      label={item.label}
                      ariaDescribedby={`desc-notif-${item.key}`}
                      checked={settings.notifications[item.key]}
                      onChange={(val) => updateNotificationSetting(item.key, val)}
                    />
                  </div>
                ))}
              </div>
            </SettingsCard>
          )}

          {/* 4. Privacy Section */}
          {activeTab === 'privacy' && (
            <SettingsCard title="Privacy Settings" icon={EyeIcon}>
              <div className="space-y-5">
                {[
                  { key: 'publicProfile', label: 'Public Profile', desc: 'Allow visitors to view your profile statistics and feed.' },
                  { key: 'showEmail', label: 'Show Email', desc: 'Display your business email address publicly on your page.' },
                  { key: 'showActivityStatus', label: 'Show Activity Status', desc: 'Allow others to see when you are active on the platform.' },
                  { key: 'allowSearchEngines', label: 'Allow Search Engines', desc: 'Let external search engines index your public profile.' },
                  { key: 'personalizedRecs', label: 'Personalized Recommendations', desc: 'Receive tailor-made analytics insights based on your behavior.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors duration-150">
                    <div className="flex flex-col">
                      <label htmlFor={`toggle-privacy-${item.key}`} className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {item.label}
                      </label>
                      <span id={`desc-privacy-${item.key}`} className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {item.desc}
                      </span>
                    </div>
                    <Toggle
                      id={`toggle-privacy-${item.key}`}
                      label={item.label}
                      ariaDescribedby={`desc-privacy-${item.key}`}
                      checked={settings.privacy[item.key]}
                      onChange={(val) => updatePrivacySetting(item.key, val)}
                    />
                  </div>
                ))}
              </div>
            </SettingsCard>
          )}

          {/* 5. Security Section */}
          {activeTab === 'security' && (
            <SettingsCard title="Security Preferences" icon={ShieldIcon}>
              <div className="space-y-5">
                {[
                  { key: 'twoFactorAuth', label: 'Two-Factor Authentication', desc: 'Protect your account by requiring a verification code in addition to your password.' },
                  { key: 'rememberDevice', label: 'Remember This Device', desc: 'Keep me signed in on this computer for future sessions.' },
                  { key: 'loginAlerts', label: 'Login Alerts', desc: 'Get notified when a new sign-in is attempted from an unrecognized device.' },
                  { key: 'sessionTimeout', label: 'Session Timeout', desc: 'Automatically log out after 30 minutes of inactivity.' },
                  { key: 'deviceVerification', label: 'Device Verification', desc: 'Enforce dual verification procedures on new computer logins.' },
                  { key: 'trustedDevices', label: 'Trusted Devices', desc: 'Manage your connected secure credentials list.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors duration-150">
                    <div className="flex flex-col">
                      <label htmlFor={`toggle-sec-${item.key}`} className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {item.label}
                      </label>
                      <span id={`desc-sec-${item.key}`} className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {item.desc}
                      </span>
                    </div>
                    <Toggle
                      id={`toggle-sec-${item.key}`}
                      label={item.label}
                      ariaDescribedby={`desc-sec-${item.key}`}
                      checked={settings.security[item.key]}
                      onChange={(val) => updateSecuritySetting(item.key, val)}
                    />
                  </div>
                ))}
              </div>
            </SettingsCard>
          )}

          {/* 6. Appearance Section */}
          {activeTab === 'appearance' && (
            <SettingsCard title="Appearance" icon={PaletteIcon}>
              <div className="space-y-4">
                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Theme Preference
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { value: 'light', label: '☀ Light' },
                    { value: 'dark', label: '🌙 Dark' },
                    { value: 'system', label: '💻 System' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleThemeChange(option.value)}
                      className={[
                        'px-3 py-3 text-sm font-medium rounded-xl border transition-all duration-150',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
                        selectedTheme === option.value
                          ? 'bg-primary-50 border-primary-600 text-primary-700 dark:bg-primary-950/40 dark:border-primary-450 dark:text-primary-300 font-bold'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                      ].join(' ')}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </SettingsCard>
          )}

          {/* 7. Connected Accounts Section */}
          {activeTab === 'connected-accounts' && (
            <SettingsCard title="Connected Social Accounts" icon={ConnectedIcon}>
              <div className="space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  You have connected the following social media accounts. You can customize post targets, scheduling queues, and sync parameters.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'Instagram', handle: '@johndoe_os', status: 'Connected', icon: '📸', color: 'text-indigo-500' },
                    { name: 'Facebook', handle: 'John Doe Business', status: 'Connected', icon: '👥', color: 'text-blue-600' },
                    { name: 'LinkedIn', handle: 'John Doe', status: 'Connected', icon: '💼', color: 'text-sky-700' },
                    { name: 'Twitter (X)', handle: '@johndoe_dev', status: 'Connected', icon: '🐦', color: 'text-slate-800 dark:text-slate-200' },
                  ].map((platform) => (
                    <div key={platform.name} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center gap-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{platform.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{platform.handle}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 rounded-full">
                        {platform.status}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="md" onClick={() => navigate('/social-accounts')}>
                    Manage Social Accounts
                  </Button>
                </div>
              </div>
            </SettingsCard>
          )}



          {/* 9. Support Section */}
          {activeTab === 'support' && (
            <SettingsCard title="Help & Support" icon={SupportIcon}>
              <div className="space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Have a question or running into workspace integration issues? Submit a support request directly to our team.
                </p>
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-655 dark:text-slate-355" htmlFor="support-subject">Subject</label>
                    <input
                      type="text"
                      id="support-subject"
                      placeholder="How can we help you?"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:border-primary-400 transition-all duration-150"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-655 dark:text-slate-355" htmlFor="support-message">Message</label>
                    <textarea
                      id="support-message"
                      rows="4"
                      placeholder="Describe your issue or feedback in detail..."
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:border-primary-400 transition-all duration-150 resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" size="md" onClick={() => navigate('/dashboard')}>Cancel</Button>
                    <Button variant="primary" size="md" onClick={() => alert('Support ticket simulated successfully!')}>Submit Ticket</Button>
                  </div>
                </div>
              </div>
            </SettingsCard>
          )}

        </div>
      </div>

      {/* Danger Zone Confirmation Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, type: '', title: '', message: '' })}
        title={modalConfig.title}
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {modalConfig.message}
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              id="confirm-modal-cancel"
              variant="secondary"
              onClick={() => setModalConfig({ isOpen: false, type: '', title: '', message: '' })}
            >
              Cancel
            </Button>
            <Button
              id="confirm-modal-submit"
              variant="danger"
              onClick={confirmDangerAction}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
