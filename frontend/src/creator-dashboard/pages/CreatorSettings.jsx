import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../shared/hooks/useTheme'
import Card from '../../shared/components/ui/Card'
import Button from '../../shared/components/Button'
import Input from '../../shared/components/Input'
import Select from '../../shared/components/ui/Select'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import Modal from '../../shared/components/ui/Modal'
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
  Check, 
  Sparkles, 
  Sun, 
  Moon, 
  Lock, 
  Laptop, 
  RefreshCw, 
  Download, 
  ExternalLink,
  LifeBuoy,
  FileText,
  Bug,
  Mail,
  Info
} from 'lucide-react'

import {
  initialAccountSettings,
  initialProfileSettings,
  initialNotificationSettings,
  initialPrivacySettings,
  initialSecuritySettings,
  initialAppearanceSettings,
  initialConnectedAccounts,
  initialWorkspacePreferences,
  supportInfo
} from '../mock/creatorSettingsData'

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

export default function CreatorSettings() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  // Active Tab State (Account by default)
  const [activeTab, setActiveTab] = useState('account')

  // Form & Settings States
  const [account, setAccount] = useState(initialAccountSettings)
  const [profile, setProfile] = useState(initialProfileSettings)
  const [notifications, setNotifications] = useState(initialNotificationSettings)
  const [privacy, setPrivacy] = useState(initialPrivacySettings)
  const [security, setSecurity] = useState(initialSecuritySettings)
  const [appearance, setAppearance] = useState(initialAppearanceSettings)
  const [socials, setSocials] = useState(initialConnectedAccounts)
  const [workspacePref, setWorkspacePref] = useState(initialWorkspacePreferences)

  // Modals & Feedback
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Handlers
  const handleSaveAccount = (e) => {
    e.preventDefault()
    showToast('Account settings saved successfully!')
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    showToast('Creator profile settings saved!')
  }

  const handleSaveWorkspacePref = (e) => {
    e.preventDefault()
    showToast('Workspace preferences saved!')
  }

  const handleToggleNotification = (key) => {
    setNotifications(prev => {
      const next = !prev[key]
      showToast('Notification preference updated.')
      return { ...prev, [key]: next }
    })
  }

  const handleTogglePrivacy = (key) => {
    setPrivacy(prev => {
      const next = !prev[key]
      showToast('Privacy setting updated.')
      return { ...prev, [key]: next }
    })
  }

  const handleToggleSocialConnect = (id) => {
    setSocials(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.connected
        showToast(`${s.platform} ${nextState ? 'connected' : 'disconnected'}.`)
        return { ...s, connected: nextState, status: nextState ? 'Connected' : 'Disconnected' }
      }
      return s
    }))
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passwordForm.next !== passwordForm.confirm) {
      showToast('Error: Passwords do not match!')
      return
    }
    setIsPasswordModalOpen(false)
    setPasswordForm({ current: '', next: '', confirm: '' })
    showToast('Password changed successfully.')
  }

  const handleDownloadData = () => {
    showToast('Preparing your creator data download ZIP file...')
  }

  const handleRevokeSessions = () => {
    setSecurity(prev => ({
      ...prev,
      activeSessions: prev.activeSessions.filter(s => s.activeNow)
    }))
    showToast('All other active sessions revoked.')
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
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
                    required 
                  />
                  <Input 
                    label="Phone Number" 
                    value={account.phone} 
                    onChange={(e) => setAccount({ ...account, phone: e.target.value })} 
                  />
                  <SettingsDropdown 
                    id="account-country" 
                    label="Country" 
                    value={account.country} 
                    onChange={(val) => setAccount({ ...account, country: val })}
                    options={[
                      { value: 'United States', label: 'United States' },
                      { value: 'Canada', label: 'Canada' },
                      { value: 'United Kingdom', label: 'United Kingdom' },
                      { value: 'Germany', label: 'Germany' },
                      { value: 'Australia', label: 'Australia' },
                    ]}
                  />
                  <SettingsDropdown 
                    id="account-language" 
                    label="Language" 
                    value={account.language} 
                    onChange={(val) => setAccount({ ...account, language: val })}
                    options={[
                      { value: 'English (US)', label: 'English (US)' },
                      { value: 'Spanish', label: 'Spanish' },
                      { value: 'French', label: 'French' },
                      { value: 'German', label: 'German' },
                    ]}
                  />
                  <SettingsDropdown 
                    id="account-timezone" 
                    label="Timezone" 
                    value={account.timezone} 
                    onChange={(val) => setAccount({ ...account, timezone: val })}
                    options={[
                      { value: 'Pacific Time (US & Canada)', label: 'Pacific Time (US & Canada)' },
                      { value: 'Eastern Time (US & Canada)', label: 'Eastern Time (US & Canada)' },
                      { value: 'UTC / GMT', label: 'UTC / GMT' },
                      { value: 'Central European Time', label: 'Central European Time' },
                    ]}
                  />
                  <SettingsDropdown 
                    id="account-date-format" 
                    label="Date Format" 
                    value={account.dateFormat} 
                    onChange={(val) => setAccount({ ...account, dateFormat: val })}
                    options={[
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    ]}
                  />
                  <SettingsDropdown 
                    id="account-time-format" 
                    label="Time Format" 
                    value={account.timeFormat} 
                    onChange={(val) => setAccount({ ...account, timeFormat: val })}
                    options={[
                      { value: '12-hour (AM/PM)', label: '12-hour (AM/PM)' },
                      { value: '24-hour', label: '24-hour' },
                    ]}
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
                  <SettingsDropdown 
                    id="profile-category" 
                    label="Creator Category" 
                    value={profile.category} 
                    onChange={(val) => setProfile({ ...profile, category: val })}
                    options={[
                      { value: 'Tech & Digital Culture', label: 'Tech & Digital Culture' },
                      { value: 'Education & Tutorials', label: 'Education & Tutorials' },
                      { value: 'Lifestyle & Travel', label: 'Lifestyle & Travel' },
                      { value: 'Gaming & Entertainment', label: 'Gaming & Entertainment' },
                    ]}
                  />
                  <Input 
                    label="Portfolio Public Link" 
                    value={profile.portfolioLink} 
                    onChange={(e) => setProfile({ ...profile, portfolioLink: e.target.value })} 
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="label-base">Creator Specialization Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {['Technology', 'Education', 'Lifestyle', 'Frontend', 'Gadgets', 'Photography', 'Gaming'].map((tag) => {
                      const isSelected = profile.creatorTags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const updated = isSelected 
                              ? profile.creatorTags.filter(t => t !== tag)
                              : [...profile.creatorTags, tag]
                            setProfile({ ...profile, creatorTags: updated })
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{tag}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <ToggleSwitch 
                    id="profile-visibility-toggle"
                    label="Profile Visibility"
                    description="Make your creator profile discoverable in directory"
                    checked={profile.profileVisibility}
                    onChange={(val) => {
                      setProfile({ ...profile, profileVisibility: val })
                      showToast(`Profile visibility set to ${val ? 'Public' : 'Private'}.`)
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
                  id="notif-content-review"
                  label="Content Review Alerts"
                  description="Notifications when brand reviewers comment or approve post drafts"
                  checked={notifications.contentReviewAlerts}
                  onChange={() => handleToggleNotification('contentReviewAlerts')}
                />
                <ToggleSwitch 
                  id="notif-publishing"
                  label="Publishing Alerts"
                  description="Instant notification when scheduled content publishes or encounters errors"
                  checked={notifications.publishingAlerts}
                  onChange={() => handleToggleNotification('publishingAlerts')}
                />
                <ToggleSwitch 
                  id="notif-weekly-summary"
                  label="Weekly Summary"
                  description="Comprehensive weekly content analytics delivered every Monday morning"
                  checked={notifications.weeklySummary}
                  onChange={() => handleToggleNotification('weeklySummary')}
                />
                <ToggleSwitch 
                  id="notif-followers"
                  label="New Followers"
                  description="Alerts when new followers engage with your creator profile"
                  checked={notifications.newFollowers}
                  onChange={() => handleToggleNotification('newFollowers')}
                />

                {/* Campaign Invitations (keep hidden/commented for future use as per rules) */}
                {/* 
                <ToggleSwitch 
                  id="notif-campaign-invites"
                  label="Campaign Invitations"
                  description="Direct brand brief proposals and campaign collaboration invites"
                  checked={false}
                  onChange={() => {}}
                /> 
                */}
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
                  id="priv-show-analytics"
                  label="Show Analytics"
                  description="Display aggregate engagement rates and reach badges publicly"
                  checked={privacy.showAnalytics}
                  onChange={() => handleTogglePrivacy('showAnalytics')}
                />
                <ToggleSwitch 
                  id="priv-show-followers"
                  label="Show Followers"
                  description="Display follower count across all connected social channels"
                  checked={privacy.showFollowers}
                  onChange={() => handleTogglePrivacy('showFollowers')}
                />
                <ToggleSwitch 
                  id="priv-show-contact"
                  label="Show Contact Info"
                  description="Display contact email address on public portfolio page"
                  checked={privacy.showContactInfo}
                  onChange={() => handleTogglePrivacy('showContactInfo')}
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
                      <p className="text-xs text-slate-400">Last changed 30 days ago</p>
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
                      onClick={() => {
                        setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })
                        showToast(`2FA ${!security.twoFactorEnabled ? 'enabled' : 'disabled'}.`)
                      }}
                    >
                      {security.twoFactorEnabled ? 'Configure' : 'Enable 2FA'}
                    </Button>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Active Sessions</h4>
                    <button 
                      onClick={handleRevokeSessions}
                      className="text-xs text-rose-500 hover:underline font-semibold"
                    >
                      Revoke All Other Sessions
                    </button>
                  </div>
                  <div className="space-y-2">
                    {security.activeSessions.map(sess => (
                      <div key={sess.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/60 text-xs">
                        <div className="flex items-center gap-3">
                          <Laptop size={16} className="text-indigo-500" />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{sess.device}</p>
                            <p className="text-slate-400">{sess.location} • {sess.ip}</p>
                          </div>
                        </div>
                        {sess.activeNow ? (
                          <StatusBadge status="active" dot />
                        ) : (
                          <span className="text-slate-400 text-[11px]">{sess.lastActive}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connected Devices */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Connected Devices</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {security.connectedDevices.map((dev, i) => (
                      <div key={i} className="p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-700/30 flex items-center gap-3">
                        <span className="text-xl">{dev.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{dev.name}</p>
                          <p className="text-[10px] text-slate-400">{dev.os}</p>
                        </div>
                      </div>
                    ))}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SettingsDropdown 
                    id="app-sidebar-state" 
                    label="Sidebar Default State" 
                    value={appearance.sidebarDefault} 
                    onChange={(val) => {
                      setAppearance({ ...appearance, sidebarDefault: val })
                      showToast('Sidebar default state saved.')
                    }}
                    options={[
                      { value: 'Expanded', label: 'Expanded' },
                      { value: 'Collapsed', label: 'Collapsed' },
                    ]}
                  />
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <ToggleSwitch 
                    id="app-compact-mode"
                    label="Compact Mode"
                    description="Reduce spacing for high-density dashboard layouts"
                    checked={appearance.compactMode}
                    onChange={(val) => {
                      setAppearance({ ...appearance, compactMode: val })
                      showToast(`Compact mode ${val ? 'enabled' : 'disabled'}.`)
                    }}
                  />
                  <ToggleSwitch 
                    id="app-animation-toggle"
                    label="Animation Toggle"
                    description="Enable smooth micro-animations and UI transitions"
                    checked={appearance.animationToggle}
                    onChange={(val) => {
                      setAppearance({ ...appearance, animationToggle: val })
                      showToast(`UI Animations ${val ? 'enabled' : 'disabled'}.`)
                    }}
                  />
                </div>
              </div>
            </SettingsCard>
          )}

          {/* TAB 7: CONNECTED ACCOUNTS */}
          {activeTab === 'connected-accounts' && (
            <SettingsCard title="Connected Social Accounts" icon={LinkIcon}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {socials.map((social) => (
                  <Card key={social.id} className="p-5 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl">
                          {social.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{social.platform}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{social.handle}</p>
                        </div>
                      </div>
                      <StatusBadge status={social.connected ? 'active' : 'inactive'} dot />
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      {social.connected ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="xs" 
                            fullWidth 
                            onClick={() => showToast(`Reconnecting ${social.platform}...`)}
                          >
                            <RefreshCw size={12} />
                            <span>Reconnect</span>
                          </Button>
                          <Button 
                            variant="danger" 
                            size="xs" 
                            fullWidth 
                            onClick={() => handleToggleSocialConnect(social.id)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="primary" 
                          size="xs" 
                          fullWidth 
                          onClick={() => handleToggleSocialConnect(social.id)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </SettingsCard>
          )}

          {/* TAB 8: WORKSPACE PREFERENCES */}
          {activeTab === 'workspace' && (
            <SettingsCard title="Workspace Preferences" icon={Layout}>
              <form onSubmit={handleSaveWorkspacePref} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SettingsDropdown 
                    id="ws-default-platform" 
                    label="Default Platform" 
                    value={workspacePref.defaultPlatform} 
                    onChange={(val) => setWorkspacePref({ ...workspacePref, defaultPlatform: val })}
                    options={[
                      { value: 'Instagram', label: 'Instagram' },
                      { value: 'YouTube', label: 'YouTube' },
                      { value: 'LinkedIn', label: 'LinkedIn' },
                      { value: 'Facebook', label: 'Facebook' },
                      { value: 'X', label: 'X (Twitter)' },
                    ]}
                  />
                  <SettingsDropdown 
                    id="ws-upload-quality" 
                    label="Default Upload Quality" 
                    value={workspacePref.defaultUploadQuality} 
                    onChange={(val) => setWorkspacePref({ ...workspacePref, defaultUploadQuality: val })}
                    options={[
                      { value: '1080p Full HD (Recommended)', label: '1080p Full HD (Recommended)' },
                      { value: '4K Ultra HD', label: '4K Ultra HD' },
                      { value: '720p Compressed', label: '720p Compressed' },
                    ]}
                  />
                  <Input 
                    label="Default Scheduling Time" 
                    type="time" 
                    value={workspacePref.defaultSchedulingTime} 
                    onChange={(e) => setWorkspacePref({ ...workspacePref, defaultSchedulingTime: e.target.value })} 
                  />
                  <SettingsDropdown 
                    id="ws-pref-lang" 
                    label="Preferred Language" 
                    value={workspacePref.preferredLanguage} 
                    onChange={(val) => setWorkspacePref({ ...workspacePref, preferredLanguage: val })}
                    options={[
                      { value: 'English (US)', label: 'English (US)' },
                      { value: 'Spanish', label: 'Spanish' },
                      { value: 'French', label: 'French' },
                      { value: 'German', label: 'German' },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="label-base">Default Caption Template</label>
                  <textarea 
                    rows={3} 
                    className="input-base" 
                    value={workspacePref.captionTemplate} 
                    onChange={(e) => setWorkspacePref({ ...workspacePref, captionTemplate: e.target.value })} 
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button type="submit" variant="primary" size="md">
                    Save Preferences
                  </Button>
                </div>
              </form>
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
