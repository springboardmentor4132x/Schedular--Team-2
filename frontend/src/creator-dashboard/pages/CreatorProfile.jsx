import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../shared/hooks/useTheme'
import Button from '../../shared/components/Button'
import Card from '../../shared/components/ui/Card'
import Input from '../../shared/components/Input'
import Select from '../../shared/components/ui/Select'
import Badge from '../../shared/components/ui/Badge'
import StatusBadge from '../../shared/components/ui/StatusBadge'
import Avatar from '../../shared/components/ui/Avatar'
import Modal from '../../shared/components/ui/Modal'
import { 
  Edit3, 
  Share2, 
  Download, 
  CheckCircle2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Trash2, 
  Lock, 
  Bell, 
  Moon, 
  Sun, 
  ExternalLink,
  Award,
  Sparkles,
  Zap,
  Check
} from 'lucide-react'

import {
  initialCreatorProfile,
  initialStats,
  initialSocialAccounts,
  allSpecializations,
  initialContentTypes,
  recentActivities,
  achievements,
  quickActions
} from '../mock/creatorProfileData'

export default function CreatorProfile() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  // State Management
  const [profile, setProfile] = useState(initialCreatorProfile)
  const [form, setForm] = useState(initialCreatorProfile)
  const [socials, setSocials] = useState(initialSocialAccounts)
  const [specializations, setSpecializations] = useState(['Technology', 'Education', 'Lifestyle'])
  const [contentTypes, setContentTypes] = useState(initialContentTypes)
  const [prefPlatforms, setPrefPlatforms] = useState(['Instagram Reel', 'YouTube Shorts', 'LinkedIn Article'])
  const [frequency, setFrequency] = useState('3-4 times per week')
  
  // Security & Settings State
  const [twoFactor, setTwoFactor] = useState(true)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(true)
  const [publicProfile, setPublicProfile] = useState(true)

  // UI Modals & Toasts
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Handlers
  const handleSaveProfile = (e) => {
    e.preventDefault()
    setProfile(form)
    showToast('Profile information saved successfully!')
    setIsEditModalOpen(false)
  }

  const handleCancelForm = () => {
    setForm(profile)
    showToast('Changes discarded.')
  }

  const handleToggleSocial = (id) => {
    setSocials(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.connected
        showToast(`${s.platform} ${nextState ? 'connected' : 'disconnected'}.`)
        return { ...s, connected: nextState }
      }
      return s
    }))
  }

  const handleToggleTag = (tag) => {
    setSpecializations(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleToggleContentType = (id) => {
    setContentTypes(prev => prev.map(c => 
      c.id === id ? { ...c, selected: !c.selected } : c
    ))
  }

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      showToast('Profile URL copied to clipboard!')
    } else {
      showToast('Share link copied: https://orbitsocial.app/creator/alex_creator')
    }
  }

  const handleDownloadPortfolio = () => {
    showToast('Downloading Creator Portfolio PDF...')
  }

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(false)
    showToast('Account deletion request initiated.')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-slide-up">
          <Sparkles size={16} className="text-indigo-400 dark:text-indigo-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <section aria-label="Page header" className="card relative overflow-hidden bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-950/40 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Creator Profile</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">Manage your creator profile, social presence and account settings.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="md" onClick={() => setIsEditModalOpen(true)}>
              <Edit3 size={16} />
              <span>Edit Profile</span>
            </Button>
            <Button variant="outline" size="md" onClick={handleShareProfile}>
              <Share2 size={16} />
              <span>Share Profile</span>
            </Button>
            <Button variant="ghost" size="md" onClick={handleDownloadPortfolio} className="border border-slate-200 dark:border-slate-700">
              <Download size={16} />
              <span>Portfolio</span>
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 1 — PROFILE HEADER CARD */}
      <section aria-label="Profile Card">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative group">
                <Avatar initials="AR" size="2xl" className="ring-4 ring-indigo-500/20 shadow-lg" />
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-transform group-hover:scale-110"
                  title="Change photo"
                >
                  <Edit3 size={14} />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{profile.name}</h2>
                  {profile.isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                      <CheckCircle2 size={12} className="text-indigo-500" />
                      Verified Creator
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">@{profile.username}</span>
                  <span>•</span>
                  <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-bold text-slate-600 dark:text-slate-300">ID: {profile.id}</span>
                  <span>•</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{profile.category}</span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-2 leading-relaxed font-medium">
                  {profile.bio}
                </p>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-2 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={14} className="text-slate-400" />{profile.location}</span>
                  <span className="flex items-center gap-1"><Mail size={14} className="text-slate-400" />{profile.email}</span>
                  <span className="flex items-center gap-1"><Phone size={14} className="text-slate-400" />{profile.phone}</span>
                  <span className="flex items-center gap-1"><Globe size={14} className="text-slate-400" /><a href={profile.website} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{profile.website}</a></span>
                </div>
              </div>
            </div>

            <div className="flex md:flex-col items-center gap-2 w-full md:w-auto">
              <Button variant="primary" size="md" fullWidth onClick={() => setIsEditModalOpen(true)}>
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </Button>
              <Button variant="outline" size="md" fullWidth onClick={handleShareProfile}>
                <Share2 size={16} />
                <span>Share Profile</span>
              </Button>
              <Button variant="ghost" size="md" fullWidth onClick={handleDownloadPortfolio} className="border border-slate-200 dark:border-slate-700">
                <Download size={16} />
                <span>Download Portfolio</span>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* SECTION 2 — PROFILE STATISTICS */}
      <section aria-label="Profile Statistics">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Zap size={18} className="text-indigo-500" />
          <span>Profile Statistics</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {initialStats.map((stat, idx) => (
            <div key={idx} className="stat-card cursor-pointer hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform ${stat.color}`}>
                <span>{stat.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{stat.value}</p>
                <p className={`text-[11px] font-semibold mt-1 ${stat.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                  {stat.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — SOCIAL ACCOUNTS */}
      <section aria-label="Social Accounts">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Globe size={18} className="text-indigo-500" />
          <span>Connected Social Accounts</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {socials.map((social) => (
            <Card key={social.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-indigo-400/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl">
                    {social.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{social.platform}</h3>
                      {social.verified && <CheckCircle2 size={13} className="text-indigo-500" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{social.handle}</p>
                  </div>
                </div>
                <StatusBadge status={social.connected ? 'active' : 'inactive'} dot />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Followers</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{social.followers}</span>
                </div>
                <Button 
                  variant={social.connected ? 'outline' : 'primary'} 
                  size="sm"
                  onClick={() => handleToggleSocial(social.id)}
                >
                  {social.connected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 4 — PERSONAL INFORMATION FORM */}
      <section aria-label="Personal Information">
        <Card className="p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Personal Information</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Update your creator personal details and contact settings.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input 
                label="Full Name" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
              />
              <Input 
                label="Username" 
                value={form.username} 
                onChange={(e) => setForm({ ...form, username: e.target.value })} 
                required 
              />
              <Input 
                label="Email Address" 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                required 
              />
              <Input 
                label="Phone Number" 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              />
              <Input 
                label="Location" 
                value={form.location} 
                onChange={(e) => setForm({ ...form, location: e.target.value })} 
              />
              <Input 
                label="Website URL" 
                value={form.website} 
                onChange={(e) => setForm({ ...form, website: e.target.value })} 
              />
              <Select 
                label="Primary Language" 
                value={form.language} 
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              >
                <option value="English (US)">English (US)</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </Select>
              <Select 
                label="Timezone" 
                value={form.timezone} 
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              >
                <option value="Pacific Time (US & Canada)">Pacific Time (US & Canada)</option>
                <option value="Eastern Time (US & Canada)">Eastern Time (US & Canada)</option>
                <option value="UTC / GMT">UTC / GMT</option>
                <option value="Central European Time">Central European Time</option>
              </Select>
              <Input 
                label="Date of Birth" 
                type="date" 
                value={form.dob} 
                onChange={(e) => setForm({ ...form, dob: e.target.value })} 
              />
              <Select 
                label="Gender" 
                value={form.gender} 
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="label-base">Biography / Creator Description</label>
              <textarea 
                rows={3} 
                className="input-base" 
                value={form.bio} 
                onChange={(e) => setForm({ ...form, bio: e.target.value })} 
                placeholder="Tell brands and followers about your channel..." 
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <Button type="button" variant="outline" size="md" onClick={handleCancelForm}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md">
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </section>

      {/* SECTION 5 & 6 — SPECIALIZATION & CONTENT PREFERENCES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 5 — CREATOR SPECIALIZATION */}
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" />
              <span>Creator Specialization Tags</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select the categories that best define your content portfolio.</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {allSpecializations.map((tag) => {
              const isSelected = specializations.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all duration-200 flex items-center gap-1.5 ${
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
        </Card>

        {/* SECTION 6 — CONTENT PREFERENCES */}
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap size={18} className="text-indigo-500" />
              <span>Content Preferences & Types</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select content types you regularly publish.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleToggleContentType(type.id)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2 ${
                  type.selected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{type.icon}</span>
                  {type.selected && <CheckCircle2 size={14} className="text-indigo-500" />}
                </div>
                <span className="text-xs font-bold">{type.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 text-xs space-y-1 text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700">
            <p><strong className="text-slate-700 dark:text-slate-200">Posting Frequency:</strong> {frequency}</p>
            <p><strong className="text-slate-700 dark:text-slate-200">Preferred Platforms:</strong> {prefPlatforms.join(', ')}</p>
          </div>
        </Card>
      </div>

      {/* SECTION 7 — ACCOUNT SETTINGS */}
      <section aria-label="Account Settings">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <ShieldCheck size={18} className="text-indigo-500" />
          <span>Account & Security Settings</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Password</h3>
                <p className="text-xs text-slate-400">Last changed 30 days ago</p>
              </div>
            </div>
            <Button variant="outline" size="sm" fullWidth onClick={() => showToast('Password reset link sent to your email.')}>
              Change Password
            </Button>
          </Card>

          <Card className="p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">2-Factor Auth</h3>
                  <p className="text-xs text-emerald-500 font-semibold">{twoFactor ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            </div>
            <Button 
              variant={twoFactor ? 'outline' : 'primary'} 
              size="sm" 
              fullWidth 
              onClick={() => {
                setTwoFactor(!twoFactor)
                showToast(`2FA ${!twoFactor ? 'Enabled' : 'Disabled'}.`)
              }}
            >
              {twoFactor ? 'Configure 2FA' : 'Enable 2FA'}
            </Button>
          </Card>

          <Card className="p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifications</h3>
                <p className="text-xs text-slate-400">Email & Push Digests</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={emailNotifs ? 'primary' : 'outline'} 
                size="xs" 
                onClick={() => { setEmailNotifs(!emailNotifs); showToast('Email notification preferences saved.'); }}
              >
                Email
              </Button>
              <Button 
                variant={pushNotifs ? 'primary' : 'outline'} 
                size="xs" 
                onClick={() => { setPushNotifs(!pushNotifs); showToast('Push notification preferences saved.'); }}
              >
                Push
              </Button>
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between space-y-4 border-rose-200 dark:border-rose-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-rose-600 dark:text-rose-400">Danger Zone</h3>
                <p className="text-xs text-slate-400">Permanently delete profile</p>
              </div>
            </div>
            <Button 
              variant="danger" 
              size="sm" 
              fullWidth 
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Account
            </Button>
          </Card>
        </div>
      </section>

      {/* SECTION 8 & 9 — RECENT ACTIVITY & ACHIEVEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 8 — RECENT ACTIVITY */}
        <Card className="p-6 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap size={18} className="text-indigo-500" />
              <span>Recent Activity Timeline</span>
            </h2>
          </div>

          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${act.color}`}>
                  <span>{act.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{act.type}</p>
                    <span className="text-[10px] font-semibold text-slate-400">{act.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{act.details}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* SECTION 9 — ACHIEVEMENTS */}
        <Card className="p-6 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award size={18} className="text-indigo-500" />
              <span>Achievements & Badges</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((ach) => (
              <div key={ach.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-700/30 text-center space-y-1.5 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform">
                <span className="text-2xl">{ach.icon}</span>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{ach.title}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{ach.subtitle}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* SECTION 10 — QUICK ACTIONS */}
      <section aria-label="Quick Actions">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-500" />
          <span>Quick Actions & Shortcuts</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((qa, i) => (
            <button
              key={i}
              type="button"
              onClick={() => navigate(qa.link)}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-card-lg hover:-translate-y-1 transition-all duration-200 text-left flex flex-col justify-between space-y-2 group cursor-pointer"
            >
              <span className="text-2xl transition-transform group-hover:scale-110">{qa.icon}</span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                  <span>{qa.title}</span>
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">{qa.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Creator Profile" size="lg">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            <Input label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            <Input label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="label-base">Biography</label>
            <textarea rows={3} className="input-base" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Button type="button" variant="outline" size="md" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="md">Save Profile</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Danger Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Creator Account" size="sm">
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center text-xl">
            ⚠️
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Are you absolutely sure?</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This action cannot be undone. All your creator portfolio details, scheduled posts, and connected accounts will be permanently removed.
          </p>
          <div className="flex items-center gap-3 pt-3">
            <Button variant="outline" size="md" fullWidth onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" size="md" fullWidth onClick={handleDeleteAccount}>Delete Account</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
