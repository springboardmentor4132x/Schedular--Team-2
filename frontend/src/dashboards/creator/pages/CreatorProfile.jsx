import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import Card from '../../../shared/components/ui/Card'
import Input from '../../../shared/components/Input'
import StatusBadge from '../../../shared/components/ui/StatusBadge'
import Avatar from '../../../shared/components/ui/Avatar'
import Modal from '../../../shared/components/ui/Modal'
import { CardSkeleton } from '../../../shared/components/ui/Skeleton'
import { timeAgo } from '../../../shared/utils'
import { 
  Edit3, 
  Share2, 
  Download, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Trash2, 
  Lock, 
  Bell, 
  ExternalLink,
  Award,
  Sparkles,
  Zap
} from 'lucide-react'
import { getPlatformIcon, getPlatformLabel, loadMappedPosts } from '../../../services/postAdapter'
import { getCampaigns } from '../../../services/campaignService'
import {
  getMe,
  updateMe,
  getSettings,
  updateSettings,
  fetchSocialAccounts,
  connectSocialAccount,
  disconnectSocialAccount,
} from '../services/creatorService'

const quickActions = [
  { title: 'Create New Post', desc: 'Draft a new Reel, Short, or Thread', icon: '✍️', link: '/dashboard/creator/content-scheduling' },
  { title: 'Schedule Content', desc: 'Set date & time for upcoming posts', icon: '📅', link: '/dashboard/creator/content-scheduling' },
  { title: 'Manage Campaigns', desc: 'Review brand briefs and guidelines', icon: '🚀', link: '/dashboard/creator/campaigns' },
  { title: 'Publishing Calendar', desc: 'View monthly and weekly schedule', icon: '📆', link: '/dashboard/creator/publishing-calendar' },
  { title: 'Analytics', desc: 'Track reach, engagement, and growth', icon: '📊', link: '/dashboard/creator/dashboard' },
  { title: 'Settings', desc: 'Configure notifications and security', icon: '⚙️', link: '/dashboard/creator/settings' },
]

const ACTIVITY_ICONS = { image: '🖼️', video: '🎬', reel: '🎥', carousel: '🎠', text: '📝' }

const ACTIVITY_COLORS = {
  Published: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
  Scheduled: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
  Queued: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
  Draft: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
  Default: 'bg-slate-50 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400',
}

function formatFollowers(n) {
  if (n == null) return '—'
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}

function emptyBlock({ emoji, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
      <span className="text-2xl mb-1.5">{emoji}</span>
      <p className="font-bold text-sm">{title}</p>
      <p className="text-xs mt-1">{subtitle}</p>
    </div>
  )
}

export default function CreatorProfile() {
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState({ name: '', username: '', email: '', phone: '', location: '', website: '', bio: '' })
  const [form, setForm] = useState(profile)
  const [socials, setSocials] = useState([])
  const [stats, setStats] = useState([])
  const [activities, setActivities] = useState([])
  const [achievements, setAchievements] = useState([])
  const [twoFactor, setTwoFactor] = useState(false)
  const [emailNotifs, setEmailNotifs] = useState(false)
  const [pushNotifs, setPushNotifs] = useState(false)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const applyProfile = (me) => {
    const fullName = [me.first_name, me.last_name].filter(Boolean).join(' ')
    const next = {
      name: fullName || me.username || '',
      username: me.username || '',
      email: me.email || '',
      phone: me.phone || '',
      location: me.location || '',
      website: me.website || '',
      bio: me.bio || '',
    }
    setProfile(next)
    setForm(next)
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [me, settings, posts, camps, accounts] = await Promise.all([
          getMe(),
          getSettings().catch(() => null),
          loadMappedPosts().catch(() => []),
          getCampaigns().catch(() => []),
          fetchSocialAccounts().catch(() => []),
        ])
        if (!mounted) return

        if (me) applyProfile(me)
        setSocials(accounts)

        if (settings) {
          setTwoFactor(Boolean(settings.two_factor_auth))
          setEmailNotifs(Boolean(settings.email_notifications))
          setPushNotifs(Boolean(settings.push_notifications))
        }

        const draftCount = posts.filter((p) => p.status === 'Draft').length
        const scheduledCount = posts.filter((p) => ['Scheduled', 'Queued'].includes(p.status)).length
        const publishedCount = posts.filter((p) => p.status === 'Published').length
        const reviewCount = posts.filter((p) => ['In Review', 'Pending Review'].includes(p.status)).length
        const completedCampaigns = camps.filter((c) => (c.status || '').toLowerCase() === 'completed').length

        setStats([
          { label: 'Total Posts', value: posts.length, change: 'in content library', positive: true, icon: '📝', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
          { label: 'Draft Posts', value: draftCount, change: 'awaiting final edits', positive: true, icon: '📄', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
          { label: 'Scheduled Posts', value: scheduledCount, change: 'ready to publish', positive: true, icon: '⏰', color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
          { label: 'Published Posts', value: publishedCount, change: 'live on platforms', positive: true, icon: '✅', color: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400' },
          { label: 'Pending Reviews', value: reviewCount, change: 'under review', positive: false, icon: '⏳', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
          { label: 'Campaigns', value: camps.length, change: 'active enrollments', positive: true, icon: '🚀', color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' },
          { label: 'Campaigns Completed', value: completedCampaigns, change: 'delivered', positive: true, icon: '🏆', color: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400' },
          { label: 'Connected Platforms', value: accounts.length, change: 'social accounts', positive: true, icon: '🔗', color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
        ])

        setActivities(
          [...posts]
            .sort((a, b) => new Date(b.raw.updated_at || b.raw.created_at || 0) - new Date(a.raw.updated_at || a.raw.created_at || 0))
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              type: `Post ${p.status}`,
              time: timeAgo(p.raw.updated_at || p.raw.created_at),
              details: p.title,
              icon: ACTIVITY_ICONS[p.raw.content_type?.toLowerCase()] || '📝',
              color: ACTIVITY_COLORS[p.status] || ACTIVITY_COLORS.Default,
            }))
        )

        const badges = []
        if (posts.length > 0) badges.push({ id: 1, title: 'First Post', subtitle: 'Created your first post', icon: '✍️' })
        if (publishedCount > 0) badges.push({ id: 2, title: 'Published', subtitle: `${publishedCount} post${publishedCount > 1 ? 's' : ''} live`, icon: '✅' })
        if (scheduledCount > 0) badges.push({ id: 3, title: 'Planner', subtitle: `${scheduledCount} post${scheduledCount > 1 ? 's' : ''} scheduled`, icon: '📅' })
        if (camps.length > 0) badges.push({ id: 4, title: 'Campaign Member', subtitle: `Enrolled in ${camps.length} campaign${camps.length > 1 ? 's' : ''}`, icon: '🚀' })
        if (accounts.length > 0) badges.push({ id: 5, title: 'Connected', subtitle: `${accounts.length} platform${accounts.length > 1 ? 's' : ''} linked`, icon: '🔗' })
        if (posts.length >= 5) badges.push({ id: 6, title: 'Content Machine', subtitle: 'Published 5+ posts', icon: '⚡' })
        setAchievements(badges)
      } catch {
        /* keep defaults */
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    const parts = (form.name || '').trim().split(/\s+/)
    const payload = {
      first_name: parts[0] || '',
      last_name: parts.slice(1).join(' '),
      username: form.username,
      phone: form.phone || null,
      location: form.location || null,
      website: form.website || null,
      bio: form.bio || null,
    }
    try {
      const updated = await updateMe(payload)
      applyProfile(updated)
      showToast('Profile information saved successfully!')
      setIsEditModalOpen(false)
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to save profile.')
    }
  }

  const handleCancelForm = () => {
    setForm(profile)
    showToast('Changes discarded.')
  }

  const handleToggleSocial = async (social) => {
    try {
      if (social.status === 'Connected') {
        await disconnectSocialAccount(social.id)
        showToast(`${getPlatformLabel(social.platform)} disconnected.`)
      } else {
        await connectSocialAccount(social.platform)
        showToast(`${getPlatformLabel(social.platform)} connected.`)
      }
      const accounts = await fetchSocialAccounts()
      setSocials(accounts)
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Failed to update account.')
    }
  }

  const handleToggleTwoFactor = async () => {
    const next = !twoFactor
    try {
      await updateSettings({ two_factor_auth: next })
      setTwoFactor(next)
      showToast(`2FA ${next ? 'Enabled' : 'Disabled'}.`)
    } catch {
      showToast('Failed to update 2FA setting.')
    }
  }

  const handleToggleNotif = async (kind) => {
    const field = kind === 'email' ? 'email_notifications' : 'push_notifications'
    const next = kind === 'email' ? !emailNotifs : !pushNotifs
    try {
      await updateSettings({ [field]: next })
      if (kind === 'email') setEmailNotifs(next)
      else setPushNotifs(next)
      showToast('Notification preference saved.')
    } catch {
      showToast('Failed to update notification preference.')
    }
  }

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      showToast('Profile URL copied to clipboard!')
    } else {
      showToast('Share link copied: /dashboard/creator/profile')
    }
  }

  const handleDownloadPortfolio = () => {
    showToast('Portfolio export will be available soon.')
  }

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(false)
    showToast('Account deletion requires administrator assistance.')
  }

  const initials = (profile.name || 'CR')
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
        <div className="card p-5 sm:p-6 h-28 animate-pulse bg-slate-100/60 dark:bg-slate-800/40"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-slide-up">
          <Sparkles size={16} className="text-indigo-400 dark:text-indigo-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <section aria-label="Page header" className="card p-5 sm:p-6 relative overflow-hidden bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-950/40 shadow-card">
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
                <Avatar initials={initials || 'CR'} size="2xl" className="ring-4 ring-indigo-500/20 shadow-lg" />
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
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{profile.name || 'Creator'}</h2>
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    <ShieldCheck size={12} className="text-indigo-500" />
                    Content Creator
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">@{profile.username}</span>
                </div>

                {profile.bio ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-2 leading-relaxed font-medium">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic mt-2">No biography added yet.</p>
                )}

                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-2 flex-wrap">
                  {profile.location && <span className="flex items-center gap-1"><MapPin size={14} className="text-slate-400" />{profile.location}</span>}
                  {profile.email && <span className="flex items-center gap-1"><Mail size={14} className="text-slate-400" />{profile.email}</span>}
                  {profile.phone && <span className="flex items-center gap-1"><Phone size={14} className="text-slate-400" />{profile.phone}</span>}
                  {profile.website && <span className="flex items-center gap-1"><Globe size={14} className="text-slate-400" /><a href={profile.website} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{profile.website}</a></span>}
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
          {stats.map((stat, idx) => (
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
        {socials.length === 0 ? (
          emptyBlock({
            emoji: '🔗',
            title: 'No social accounts connected',
            subtitle: 'Connect accounts to publish and track content.',
          })
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {socials.map((social) => {
              const PlatformIcon = getPlatformIcon(social.platform)
              const connected = social.status === 'Connected'
              return (
                <Card key={social.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-indigo-400/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                        <PlatformIcon size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{getPlatformLabel(social.platform)}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{social.username ? `@${social.username}` : '—'}</p>
                      </div>
                    </div>
                    <StatusBadge status={connected ? 'active' : 'inactive'} dot />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Followers</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{formatFollowers(social.followers_count)}</span>
                    </div>
                    <Button
                      variant={connected ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleSocial(social)}
                    >
                      {connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
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
                readOnly
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

      {/* SECTION 5 & 6 — PREFERENCES (empty until backend support) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" />
              <span>Creator Specialization Tags</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select the categories that best define your content portfolio.</p>
          </div>
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
            <span className="text-2xl mb-1.5">🏷️</span>
            <p className="font-bold text-sm">No specialization tags configured</p>
            <p className="text-xs mt-1">Tag support will be available with profile preferences.</p>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap size={18} className="text-indigo-500" />
              <span>Content Preferences & Types</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select content types you regularly publish.</p>
          </div>
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/30 dark:bg-slate-800/20">
            <span className="text-2xl mb-1.5">🎛️</span>
            <p className="font-bold text-sm">No content preferences saved</p>
            <p className="text-xs mt-1">Content type preferences will appear here once supported.</p>
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
                <p className="text-xs text-slate-400">Managed in Settings</p>
              </div>
            </div>
            <Button variant="outline" size="sm" fullWidth onClick={() => navigate('/dashboard/creator/settings')}>
              Change Password
            </Button>
          </Card>

          <Card className="p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">2-Factor Auth</h3>
                <p className="text-xs text-emerald-500 font-semibold">{twoFactor ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            <Button
              variant={twoFactor ? 'outline' : 'primary'}
              size="sm"
              fullWidth
              onClick={handleToggleTwoFactor}
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
                onClick={() => handleToggleNotif('email')}
              >
                Email
              </Button>
              <Button
                variant={pushNotifs ? 'primary' : 'outline'}
                size="xs"
                onClick={() => handleToggleNotif('push')}
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
        <Card className="p-6 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap size={18} className="text-indigo-500" />
              <span>Recent Activity Timeline</span>
            </h2>
          </div>

          {activities.length === 0 ? (
            emptyBlock({
              emoji: '🧭',
              title: 'No recent activity',
              subtitle: 'Your latest content actions will show up here.',
            })
          ) : (
            <div className="space-y-3">
              {activities.map((act) => (
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
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award size={18} className="text-indigo-500" />
              <span>Achievements & Badges</span>
            </h2>
          </div>

          {achievements.length === 0 ? (
            emptyBlock({
              emoji: '🏅',
              title: 'No achievements yet',
              subtitle: 'Badges unlock as you create and publish content.',
            })
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {achievements.map((ach) => (
                <div key={ach.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-700/30 text-center space-y-1.5 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform">
                  <span className="text-2xl">{ach.icon}</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{ach.title}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">{ach.subtitle}</p>
                </div>
              ))}
            </div>
          )}
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
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} readOnly />
            <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <Input label="Website URL" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
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
            This action cannot be undone. Please contact an administrator to permanently remove your creator account.
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
