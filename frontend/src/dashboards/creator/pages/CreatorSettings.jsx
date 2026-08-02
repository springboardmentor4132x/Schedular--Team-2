import { useState, useEffect } from 'react'
import { useTheme } from '../../../shared/hooks/useTheme'
import Card from '../../../shared/components/ui/Card'
import Button from '../../../shared/components/Button'
import Input from '../../../shared/components/Input'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import Modal from '../../../shared/components/ui/Modal'
import { CardSkeleton } from '../../../shared/components/ui/Skeleton'
import { 
  User, 
  UserCircle, 
  Bell, 
  Eye, 
  ShieldCheck, 
  Palette, 
  Link as LinkIcon, 
  Layout, 
  HelpCircle, 
  Sparkles, 
  Sun, 
  Moon, 
  Lock, 
  RefreshCw, 
  Download, 
  ExternalLink,
  LifeBuoy,
  FileText,
  Bug,
  Mail,
  Info
} from 'lucide-react'
import { getPlatformIcon, getPlatformLabel } from '../../../services/postAdapter'
import {
  getMe,
  updateMe,
  getSettings,
  updateSettings,
  changePassword,
  fetchSocialAccounts,
  connectSocialAccount,
  disconnectSocialAccount,
} from '../services/creatorService'

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English (US)' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
]

const TIMEZONE_OPTIONS = [
  { value: 'Pacific Time (US & Canada)', label: 'Pacific Time (US & Canada)' },
  { value: 'Eastern Time (US & Canada)', label: 'Eastern Time (US & Canada)' },
  { value: 'UTC / GMT', label: 'UTC / GMT' },
  { value: 'Central European Time', label: 'Central European Time' },
]

const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

const TIME_FORMAT_OPTIONS = [
  { value: '12-hour (AM/PM)', label: '12-hour (AM/PM)' },
  { value: '24-hour', label: '24-hour' },
]

const NOTIFICATION_FIELDS = {
  emailNotifications: 'email_notifications',
  pushNotifications: 'push_notifications',
  weeklySummary: 'weekly_summary',
  securityAlerts: 'security_alerts',
  productUpdates: 'product_updates',
}

const PRIVACY_FIELDS = {
  publicProfile: 'public_profile',
  showContactInfo: 'show_email',
  showActivityStatus: 'show_activity_status',
  allowSearchEngines: 'allow_search_engines',
}

// Settings Card Wrapper matching OrbitSocial Settings style
function SettingsCard({ title, icon: IconComponent, children }) {
  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        {IconComponent && (
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <IconComponent size={20} />
          </div>
        )}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      </div>
      {children}
    </Card>
  )
}

// Dropdown Helper Component matching Settings.jsx style
function SettingsDropdown({ id, label, value, options, onChange }) {
  return (
    <div className="space-y-1.5 w-full">
      <label htmlFor={id} className="label-base">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base select-base"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// Reusable Toggle Switch Component
function ToggleSwitch({ checked, onChange, label, description, id }) {
  return (
    <div className="flex items-center justify-between py-2 gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer block">
          {label}
        </label>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
          checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

const supportInfo = {
  helpCenterUrl: 'https://help.orbitsocial.app',
  documentationUrl: 'https://docs.orbitsocial.app',
  contactEmail: 'support@orbitsocial.app',
  appVersion: 'v2.4.0 (Build 2026.07)',
}

export default function CreatorSettings() {
  const { theme, toggleTheme } = useTheme()

  // Active Tab State (Account by default)
  const [activeTab, setActiveTab] = useState('account')

  // Form & Settings States
  const [account, setAccount] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    language: 'en',
    timezone: 'UTC / GMT',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour (AM/PM)',
  })
  const [profile, setProfile] = useState({ bio: '', website: '', location: '', profileVisibility: true })
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklySummary: true,
    securityAlerts: true,
    productUpdates: true,
  })
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showContactInfo: false,
    showActivityStatus: true,
    allowSearchEngines: true,
  })
  const [security, setSecurity] = useState({ twoFactorEnabled: false })
  const [socials, setSocials] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Modals & Feedback
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [me, settings, accounts] = await Promise.all([
          getMe(),
          getSettings().catch(() => null),
          fetchSocialAccounts().catch(() => []),
        ])
        if (!mounted) return

        if (me) {
          setAccount(prev => ({
            ...prev,
            fullName: [me.first_name, me.last_name].filter(Boolean).join(' ') || me.username,
            username: me.username || '',
            email: me.email || '',
            phone: me.phone || '',
          }))
          setProfile(prev => ({
            ...prev,
            bio: me.bio || '',
            website: me.website || '',
            location: me.location || '',
          }))
        }

        if (settings) {
          setAccount(prev => ({
            ...prev,
            language: LANGUAGE_OPTIONS.some((o) => o.value === settings.language) ? settings.language : 'en',
            timezone: TIMEZONE_OPTIONS.some((o) => o.value === settings.timezone) ? settings.timezone : 'UTC / GMT',
            dateFormat: DATE_FORMAT_OPTIONS.some((o) => o.value === settings.date_format) ? settings.date_format : 'MM/DD/YYYY',
            timeFormat: settings.time_format === '24h' ? '24-hour' : '12-hour (AM/PM)',
          }))
          setNotifications({
            emailNotifications: Boolean(settings.email_notifications),
            pushNotifications: Boolean(settings.push_notifications),
            weeklySummary: Boolean(settings.weekly_summary),
            securityAlerts: Boolean(settings.security_alerts),
            productUpdates: Boolean(settings.product_updates),
          })
          setPrivacy({
            publicProfile: Boolean(settings.public_profile),
            showContactInfo: Boolean(settings.show_email),
            showActivityStatus: Boolean(settings.show_activity_status),
            allowSearchEngines: Boolean(settings.allow_search_engines),
          })
          setSecurity({ twoFactorEnabled: Boolean(settings.two_factor_auth) })
        }

        setSocials(accounts)
      } catch {
        /* keep defaults */
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const toSettingsPayload = () => ({
    email_notifications: notifications.emailNotifications,
    push_notifications: notifications.pushNotifications,
    weekly_summary: notifications.weeklySummary,
    security_alerts: notifications.securityAlerts,
    product_updates: notifications.productUpdates,
    public_profile: privacy.publicProfile,
    show_email: privacy.showContactInfo,
    show_activity_status: privacy.showActivityStatus,
    allow_search_engines: privacy.allowSearchEngines,
    two_factor_auth: security.twoFactorEnabled,
    language: account.language,
    timezone: account.timezone,
    date_format: account.dateFormat,
    time_format: account.timeFormat === '24-hour' ? '24h' : '12h',
  })

  // Handlers
  const handleSaveAccount = async (e) => {
    e.preventDefault()
    const parts = (account.fullName || '').trim().split(/\s+/)
    const userPayload = {
      first_name: parts[0] || '',
      last_name: parts.slice(1).join(' '),
      username: account.username,
      phone: account.phone || null,
    }
    try {
      await Promise.all([updateMe(userPayload), updateSettings(toSettingsPayload())])
      showToast('Account settings saved successfully!')
    } catch {
      showToast('Failed to save account settings.')
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    const userPayload = {
      bio: profile.bio || null,
      website: profile.website || null,
      location: profile.location || null,
    }
    try {
      await Promise.all([updateMe(userPayload), updateSettings(toSettingsPayload())])
      showToast('Creator profile settings saved!')
    } catch {
      showToast('Failed to save profile settings.')
    }
  }

  const persistSetting = async (payload, successMsg, rollback) => {
    try {
      await updateSettings(payload)
      showToast(successMsg)
    } catch {
      if (rollback) rollback()
      showToast('Failed to save setting.')
    }
  }

  const handleToggleNotification = (key) => {
    const next = !notifications[key]
    setNotifications(prev => ({ ...prev, [key]: next }))
    persistSetting(
      { [NOTIFICATION_FIELDS[key]]: next },
      'Notification preference updated.',
      () => setNotifications(prev => ({ ...prev, [key]: !next }))
    )
  }

  const handleTogglePrivacy = (key) => {
    const next = !privacy[key]
    setPrivacy(prev => ({ ...prev, [key]: next }))
    persistSetting(
      { [PRIVACY_FIELDS[key]]: next },
      'Privacy setting updated.',
      () => setPrivacy(prev => ({ ...prev, [key]: !next }))
    )
  }

  const handleToggleTwoFactor = () => {
    const next = !security.twoFactorEnabled
    setSecurity({ twoFactorEnabled: next })
    persistSetting(
      { two_factor_auth: next },
      `2FA ${next ? 'enabled' : 'disabled'}.`,
      () => setSecurity({ twoFactorEnabled: !next })
    )
  }

  const handleToggleSocialConnect = async (social) => {
    try {
      if (social.status === 'Connected') {
        await disconnectSocialAccount(social.id)
        showToast(`${getPlatformLabel(social.platform)} disconnected.`)
      } else {
        await connectSocialAccount(social.platform)
        showToast(`${getPlatformLabel(social.platform)} connected.`)
      }
      setSocials(await fetchSocialAccounts())
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to update account.')
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.next !== passwordForm.confirm) {
      showToast('Error: Passwords do not match!')
      return
    }
    try {
      await changePassword({ current_password: passwordForm.current, new_password: passwordForm.next })
      setIsPasswordModalOpen(false)
      setPasswordForm({ current: '', next: '', confirm: '' })
      showToast('Password changed successfully.')
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to change password.')
    }
  }

  const handleDownloadData = () => {
    showToast('Preparing your creator data download ZIP file...')
  }

  // Navigation Tabs Definition
  const tabs = [
    { id: 'account',            label: 'Account',            icon: User },
    { id: 'profile',            label: 'Profile',            icon: UserCircle },
    { id: 'notifications',      label: 'Notifications',      icon: Bell },
    { id: 'privacy',            label: 'Privacy',            icon: Eye },
    { id: 'security',           label: 'Security',           icon: ShieldCheck },
    { id: 'appearance',          label: 'Appearance',          icon: Palette },
    { id: 'connected-accounts', label: 'Connected Accounts', icon: LinkIcon },
    { id: 'workspace',          label: 'Workspace Preferences', icon: Layout },
    { id: 'support',            label: 'Support',            icon: HelpCircle },
  ]

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6 pb-16">
        <div className="card p-5 sm:p-6 h-24 animate-pulse bg-slate-100/60 dark:bg-slate-800/40"></div>
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
          <div className="h-72 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 animate-pulse"></div>
          <CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in pb-16">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-slide-up">
          <Sparkles size={16} className="text-indigo-400 dark:text-indigo-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Creator Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage your workspace, notifications, privacy and creator preferences.
          </p>
        </div>
      </div>

      {/* Two-Column Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
        {/* LEFT PANEL — Vertical Settings Navigation */}
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
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-slate-800 dark:hover:text-slate-200'
                ].join(' ')}
              >
                <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}>
                  <IconComponent size={18} />
                </span>
                <span className="flex-1">{tab.label}</span>
              </button>
            )
          })}
        </Card>

        {/* RIGHT PANEL — Active Section Card */}
        <div className="space-y-6">
          {/* TAB 1: ACCOUNT */}
          {activeTab === 'account' && (
            <SettingsCard title="Account Settings" icon={User}>
              <form onSubmit={handleSaveAccount} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={account.fullName}
                    onChange={(e) => setAccount({ ...account, fullName: e.target.value })}
                    required
                  />
                  <Input
                    label="Username"
                    value={account.username}
                    onChange={(e) => setAccount({ ...account, username: e.target.value })}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={account.email}
                    onChange={(e) => setAccount({ ...account, email: e.target.value })}
                    readOnly
                  />
                  <Input
                    label="Phone Number"
                    value={account.phone}
                    onChange={(e) => setAccount({ ...account, phone: e.target.value })}
                  />
                  <SettingsDropdown
                    id="account-language"
                    label="Language"
                    value={account.language}
                    onChange={(val) => setAccount({ ...account, language: val })}
                    options={LANGUAGE_OPTIONS}
                  />
                  <SettingsDropdown
                    id="account-timezone"
                    label="Timezone"
                    value={account.timezone}
                    onChange={(val) => setAccount({ ...account, timezone: val })}
                    options={TIMEZONE_OPTIONS}
                  />
                  <SettingsDropdown
                    id="account-date-format"
                    label="Date Format"
                    value={account.dateFormat}
                    onChange={(val) => setAccount({ ...account, dateFormat: val })}
                    options={DATE_FORMAT_OPTIONS}
                  />
                  <SettingsDropdown
                    id="account-time-format"
                    label="Time Format"
                    value={account.timeFormat}
                    onChange={(val) => setAccount({ ...account, timeFormat: val })}
                    options={TIME_FORMAT_OPTIONS}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button type="submit" variant="primary" size="md">
                    Save Changes
                  </Button>
                </div>
              </form>
            </SettingsCard>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'profile' && (
            <SettingsCard title="Creator Profile Details" icon={UserCircle}>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="label-base">Creator Biography</label>
                  <textarea
                    rows={3}
                    className="input-base"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Website URL"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  />
                  <Input
                    label="Location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <ToggleSwitch
                    id="profile-visibility-toggle"
                    label="Profile Visibility"
                    description="Make your creator profile discoverable in directory"
                    checked={profile.profileVisibility}
                    onChange={(val) => {
                      setProfile({ ...profile, profileVisibility: val })
                      persistSetting(
                        { public_profile: val },
                        `Profile visibility set to ${val ? 'Public' : 'Private'}.`,
                        () => setProfile(prev => ({ ...prev, profileVisibility: !val }))
                      )
                    }}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button type="submit" variant="primary" size="md">
                    Save Changes
                  </Button>
                </div>
              </form>
            </SettingsCard>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <SettingsCard title="Notification Preferences" icon={Bell}>
              <div className="space-y-3">
                <ToggleSwitch
                  id="notif-email"
                  label="Email Notifications"
                  description="Weekly digests, major workspace updates, and account alerts"
                  checked={notifications.emailNotifications}
                  onChange={() => handleToggleNotification('emailNotifications')}
                />
                <ToggleSwitch
                  id="notif-push"
                  label="Push Notifications"
                  description="Real-time browser pop-up alerts for urgent comments and publishing status"
                  checked={notifications.pushNotifications}
                  onChange={() => handleToggleNotification('pushNotifications')}
                />
                <ToggleSwitch
                  id="notif-security"
                  label="Security Alerts"
                  description="Notifications for login activity and security events"
                  checked={notifications.securityAlerts}
                  onChange={() => handleToggleNotification('securityAlerts')}
                />
                <ToggleSwitch
                  id="notif-product"
                  label="Product Updates"
                  description="Announcements and new feature releases"
                  checked={notifications.productUpdates}
                  onChange={() => handleToggleNotification('productUpdates')}
                />
                <ToggleSwitch
                  id="notif-weekly-summary"
                  label="Weekly Summary"
                  description="Comprehensive weekly content analytics delivered every Monday morning"
                  checked={notifications.weeklySummary}
                  onChange={() => handleToggleNotification('weeklySummary')}
                />
              </div>
            </SettingsCard>
          )}

          {/* TAB 4: PRIVACY */}
          {activeTab === 'privacy' && (
            <SettingsCard title="Privacy & Data Settings" icon={Eye}>
              <div className="space-y-4">
                <ToggleSwitch
                  id="priv-public-profile"
                  label="Public Profile"
                  description="Allow public visitors to view your profile banner and statistics"
                  checked={privacy.publicProfile}
                  onChange={() => handleTogglePrivacy('publicProfile')}
                />
                <ToggleSwitch
                  id="priv-show-contact"
                  label="Show Contact Info"
                  description="Display contact email address on public portfolio page"
                  checked={privacy.showContactInfo}
                  onChange={() => handleTogglePrivacy('showContactInfo')}
                />
                <ToggleSwitch
                  id="priv-show-activity"
                  label="Show Activity Status"
                  description="Show your online activity status to other users"
                  checked={privacy.showActivityStatus}
                  onChange={() => handleTogglePrivacy('showActivityStatus')}
                />
                <ToggleSwitch
                  id="priv-allow-search"
                  label="Allow Search Engines"
                  description="Allow search engines to index your public profile"
                  checked={privacy.allowSearchEngines}
                  onChange={() => handleTogglePrivacy('allowSearchEngines')}
                />

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Download My Data</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Export a complete archive of your creator posts, media links, and settings.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDownloadData}>
                    <Download size={14} />
                    <span>Export Data</span>
                  </Button>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === 'security' && (
            <SettingsCard title="Security & Authentication" icon={ShieldCheck}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Password</h4>
                      <p className="text-xs text-slate-400">Update your account password</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsPasswordModalOpen(true)}>
                      <Lock size={14} />
                      <span>Change Password</span>
                    </Button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Two Factor Auth</h4>
                      <p className="text-xs text-emerald-500 font-semibold">{security.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <Button
                      variant={security.twoFactorEnabled ? 'outline' : 'primary'}
                      size="sm"
                      onClick={handleToggleTwoFactor}
                    >
                      {security.twoFactorEnabled ? 'Configure' : 'Enable 2FA'}
                    </Button>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Active Sessions</h4>
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
                    <span className="text-2xl mb-1.5">💻</span>
                    <p className="font-bold text-sm">No session tracking available</p>
                    <p className="text-xs mt-1">Session management will be available in a future release.</p>
                  </div>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* TAB 6: APPEARANCE */}
          {activeTab === 'appearance' && (
            <SettingsCard title="Appearance & Interface" icon={Palette}>
              <div className="space-y-5">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Theme Mode</h4>
                    <p className="text-xs text-slate-400">Current mode: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTheme}
                    className="flex items-center gap-2"
                  >
                    {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-500" />}
                    <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                  </Button>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* TAB 7: CONNECTED ACCOUNTS */}
          {activeTab === 'connected-accounts' && (
            <SettingsCard title="Connected Social Accounts" icon={LinkIcon}>
              {socials.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
                  <span className="text-2xl mb-1.5">🔗</span>
                  <p className="font-bold text-sm">No social accounts connected</p>
                  <p className="text-xs mt-1">Connect social accounts to start publishing content.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {socials.map((social) => {
                    const PlatformIcon = getPlatformIcon(social.platform)
                    const connected = social.status === 'Connected'
                    return (
                      <Card key={social.id} className="p-5 flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                              <PlatformIcon size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{getPlatformLabel(social.platform)}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{social.username ? `@${social.username}` : '—'}</p>
                            </div>
                          </div>
                          <StatusBadge status={connected ? 'active' : 'inactive'} dot />
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                          {connected ? (
                            <>
                              <Button
                                variant="outline"
                                size="xs"
                                fullWidth
                                onClick={() => showToast('Reconnecting through the platform is not supported yet.')}
                              >
                                <RefreshCw size={12} />
                                <span>Reconnect</span>
                              </Button>
                              <Button
                                variant="danger"
                                size="xs"
                                fullWidth
                                onClick={() => handleToggleSocialConnect(social)}
                              >
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="primary"
                              size="xs"
                              fullWidth
                              onClick={() => handleToggleSocialConnect(social)}
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </SettingsCard>
          )}

          {/* TAB 8: WORKSPACE PREFERENCES */}
          {activeTab === 'workspace' && (
            <SettingsCard title="Workspace Preferences" icon={Layout}>
              <div className="flex flex-col items-center justify-center p-10 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
                <span className="text-2xl mb-1.5">🖥️</span>
                <p className="font-bold text-sm">Workspace preferences are not stored yet</p>
                <p className="text-xs mt-1">Default platform, upload quality and caption templates will be saved here once supported by the backend.</p>
              </div>
            </SettingsCard>
          )}

          {/* TAB 9: SUPPORT */}
          {activeTab === 'support' && (
            <SettingsCard title="Support & Resources" icon={HelpCircle}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={supportInfo.helpCenterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 hover:border-indigo-400 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <LifeBuoy size={20} className="text-indigo-500" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">Help Center</h4>
                      <p className="text-xs text-slate-400">Browse FAQs and guides</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </a>

                <a
                  href={supportInfo.documentationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 hover:border-indigo-400 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-indigo-500" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">Documentation</h4>
                      <p className="text-xs text-slate-400">Platform API & docs</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </a>

                <button
                  onClick={() => showToast('Opening contact support dialog...')}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 hover:border-indigo-400 transition-all flex items-center justify-between group text-left"
                >
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-indigo-500" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">Contact Support</h4>
                      <p className="text-xs text-slate-400">{supportInfo.contactEmail}</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </button>

                <button
                  onClick={() => showToast('Report bug form opened.')}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 hover:border-indigo-400 transition-all flex items-center justify-between group text-left"
                >
                  <div className="flex items-center gap-3">
                    <Bug size={20} className="text-indigo-500" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">Report a Bug</h4>
                      <p className="text-xs text-slate-400">Submit issue ticket</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><Info size={14} /> OrbitSocial Application Version</span>
                <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{supportInfo.appVersion}</span>
              </div>
            </SettingsCard>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Change Password" size="sm">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.current}
            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={passwordForm.next}
            onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirm}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <Button type="button" variant="outline" size="md" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="md">Update Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
