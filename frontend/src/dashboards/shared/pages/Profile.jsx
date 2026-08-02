import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Globe, Clock, Save,
  Plus, CheckCircle2, Shield, CreditCard, Trash2, Loader2,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube } from 'react-icons/fa6'
import { useAuth } from '../../../context/AuthContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import Toast from '../../../components/Toast'
import ProfileImageUpload from '../../../components/ProfileImageUpload'
import { getStoredProfileImage, removeProfileImage, uploadProfileImage } from '../../../services/profileImageService'
import { getCurrentUser, updateCurrentUser } from '../../../services/authService'
import {
  fetchSocialAccounts,
  connectSocialAccount,
  disconnectSocialAccount,
} from '../../../services/socialAccountsService'

const TIMEZONES = [
  'UTC−08:00 Pacific Time','UTC−05:00 Eastern Time',
  'UTC+00:00 London','UTC+05:30 Mumbai','UTC+08:00 Singapore','UTC+09:00 Tokyo',
]
const INDUSTRIES = [
  'Technology','E-Commerce','Retail','Healthcare',
  'Finance','Media & Entertainment','Education','Other',
]
const SOCIAL_PLATFORMS = [
  { id:'instagram', label:'Instagram', icon:FaInstagram, color:'#E1306C' },
  { id:'facebook',  label:'Facebook',  icon:FaFacebook,  color:'#1877F2' },
  { id:'linkedin',  label:'LinkedIn',  icon:FaLinkedin,  color:'#0A66C2' },
  { id:'twitter',   label:'X',         icon:FaXTwitter,  color:'#000000' },
  { id:'youtube',   label:'YouTube',   icon:FaYoutube,   color:'#FF0000' },
]

function Section({ title, children }) {
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.25 }}
      className="card p-6">
      <h2 className="text-sm font-bold mb-5 pb-3 border-b"
        style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)', borderColor:'var(--border)' }}>
        {title}
      </h2>
      {children}
    </motion.div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold" style={{ color:'var(--text)' }}>{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none transition-all focus:border-[var(--primary)]"
const inputSty = { background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }

export default function Profile() {
  const { user, role, updateAvatar, removeAvatar } = useAuth()
  const isMarketing = role === 'marketing'
  const isBusiness = role === 'business'

  const [form, setForm] = useState({
    company:     '',
    industry:    '',
    description: '',
    website:     '',
    timezone:    '',
    email:       user?.email ?? '',
    phone:       '',
    teamName:    '',
    teamSize:    '',
  })
  const [accounts, setAccounts] = useState([])
  const [accountLoading, setAccountLoading] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [saved,   setSaved]    = useState(false)
  const [toast, setToast] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const me = await getCurrentUser()
        if (!active) return
        setForm({
          company:     me?.company || '',
          industry:    '',
          description: me?.bio || '',
          website:     me?.website || '',
          timezone:    '',
          email:       me?.email || user?.email || '',
          phone:       me?.phone || '',
          teamName:    me?.company || `${me?.first_name || ''} ${me?.last_name || ''}`.trim() || '',
          teamSize:    '',
        })
      } catch {
        if (active) setForm(prev => ({ ...prev, email: user?.email || prev.email }))
      }

      if (isBusiness) {
        setAccountLoading(true)
        try {
          const data = await fetchSocialAccounts()
          if (active) setAccounts(data || [])
        } catch { /* keep empty list */ } finally {
          if (active) setAccountLoading(false)
        }
      }
    }

    load()
    return () => { active = false }
  }, [user?.email, isBusiness])

  const update = (k, v) => setForm(p => ({ ...p, [k]:v }))

  const connectedByPlatform = useMemo(() => {
    const map = {}
    for (const account of accounts) {
      const key = String(account.platform).toLowerCase()
      if (!map[key]) map[key] = []
      map[key].push(account)
    }
    return map
  }, [accounts])

  const handleConnect = (platformId) => {
    if (busyId) return
    connectSocialAccount(platformId)
  }

  const handleDisconnect = async (accountId) => {
    if (busyId) return
    setBusyId(accountId)
    try {
      await disconnectSocialAccount(accountId)
      showToast('Account disconnected successfully.', 'success')
      const data = await fetchSocialAccounts()
      setAccounts(data || [])
    } catch {
      showToast('Failed to disconnect account.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ type, message })
    window.setTimeout(() => setToast(null), 3200)
  }

  const handleSave = async () => {
    const payload = {
      company: isMarketing ? form.teamName : form.company,
      website: form.website,
      phone: form.phone,
      bio: form.description,
    }
    try {
      await updateCurrentUser(payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      showToast('Profile updated successfully.', 'success')
    } catch {
      showToast('Failed to save profile.', 'error')
    }
  }

  const handleUpload = async (preview, selectedFile) => {
    try {
      setUploading(true)
      const imageUrl = await uploadProfileImage(preview || selectedFile)
      updateAvatar(imageUrl)
      setAvatarUrl(imageUrl)
      showToast('Profile picture updated successfully.', 'success')
      return true
    } catch {
      showToast('Upload failed.', 'error')
      return false
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    try {
      setUploading(true)
      await removeProfileImage()
      removeAvatar()
      setAvatarUrl(null)
      showToast('Profile picture removed.', 'success')
    } catch {
      showToast('Upload failed.', 'error')
    } finally {
      setUploading(false)
    }
  }

  const avatarDisplay = useMemo(() => avatarUrl || getStoredProfileImage() || user?.avatar || null, [avatarUrl, user?.avatar])

  return (
    <div className="p-4 sm:p-6 max-w-[900px] mx-auto">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <PageHeader
        title={isMarketing ? 'Team Profile' : isBusiness ? 'Business Profile' : 'My Profile'}
        subtitle={isMarketing
          ? 'Manage your team information and personal settings.'
          : isBusiness
            ? 'Manage your company information and connected accounts.'
            : 'Manage your account information and preferences.'}
        actions={
          <button onClick={handleSave}
            className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold text-white transition-all hover:brightness-105"
            style={{ background:'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
            {saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
          </button>
        }
      />

      <div className="flex flex-col gap-5">

        {/* Company / Team identity */}
        <Section title={isMarketing ? 'Team Identity' : 'Company Identity'}>
          <div className="mb-5 rounded-[24px] border p-4" style={{ borderColor:'var(--border)', background:'var(--bg-alt)' }}>
            <ProfileImageUpload currentImage={avatarDisplay} onUpload={handleUpload} onRemove={handleRemove} loading={uploading} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {isMarketing ? (
              <>
                <Field label="Team Name">
                  <input value={form.teamName} onChange={e => update('teamName', e.target.value)} className={inputCls} style={inputSty} />
                </Field>
                <Field label="Team Size">
                  <input value={form.teamSize} onChange={e => update('teamSize', e.target.value)} type="number" className={inputCls} style={inputSty} />
                </Field>
              </>
            ) : (
              <>
                <Field label="Company Name">
                  <input value={form.company} onChange={e => update('company', e.target.value)} className={inputCls} style={inputSty} />
                </Field>
                <Field label="Industry">
                  <select value={form.industry} onChange={e => update('industry', e.target.value)} className={inputCls} style={inputSty}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </Field>
              </>
            )}
            <Field label="Website">
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-subtle)' }} />
                <input value={form.website} onChange={e => update('website', e.target.value)}
                  className={`${inputCls} pl-9`} style={inputSty} placeholder="https://yourcompany.com" />
              </div>
            </Field>
            <Field label="Timezone">
              <div className="relative">
                <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-subtle)' }} />
                <select value={form.timezone} onChange={e => update('timezone', e.target.value)}
                  className={`${inputCls} pl-9`} style={inputSty}>
                  <option value="">Select timezone</option>
                  {TIMEZONES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </Field>
            <div className="sm:col-span-2">
              <Field label={isMarketing ? 'Team Description' : 'Business Description'}>
                <textarea value={form.description} onChange={e => update('description', e.target.value)}
                  rows={3} className="w-full px-4 py-3 text-sm rounded-[var(--r-md)] border outline-none resize-none transition-all"
                  style={inputSty} />
              </Field>
            </div>
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contact Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email Address">
              <input value={form.email} type="email" disabled className={`${inputCls} opacity-60 cursor-not-allowed`} style={inputSty} />
              <p className="text-[10px]" style={{ color:'var(--text-subtle)' }}>Email cannot be changed here.</p>
            </Field>
            <Field label="Phone Number">
              <input value={form.phone} onChange={e => update('phone', e.target.value)} type="tel" className={inputCls} style={inputSty} />
            </Field>
          </div>
        </Section>

        {/* Connected social accounts — Business only (Marketing uses ConnectedAccounts page) */}
        {isBusiness && (
        <Section title="Connected Social Accounts">
          <p className="text-xs mb-4" style={{ color:'var(--text-muted)' }}>
            Connect your social accounts to enable direct publishing from OrbitSocial.
          </p>
          {accountLoading ? (
            <div className="flex items-center gap-2 text-sm" style={{ color:'var(--text-muted)' }}>
              <Loader2 size={15} className="animate-spin" /> Loading connected accounts…
            </div>
          ) : (
          <div className="flex flex-col gap-3">
            {SOCIAL_PLATFORMS.map(s => {
              const Icon = s.icon
              const connected = connectedByPlatform[s.id]
              const account = connected?.[0]
              const busy = busyId === account?.id
              return (
                <div key={s.id}
                  className="flex items-center justify-between p-3 rounded-[var(--r-md)]"
                  style={{ background:'var(--bg-alt)', border:'1px solid var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background:`${s.color}15` }}>
                      <Icon size={18} style={{ color:s.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>{s.label}</p>
                      <p className="text-xs" style={{ color: account ? '#22C55E' : 'var(--text-subtle)' }}>
                        {account
                          ? `● Connected${account.username ? ` · @${account.username.replace(/^@/, '')}` : ''}`
                          : '○ Not connected'}
                      </p>
                    </div>
                  </div>
                  {account ? (
                    <button onClick={() => handleDisconnect(account.id)} disabled={busy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                      style={{
                        background: 'rgba(220,38,38,.08)',
                        borderColor: 'rgba(220,38,38,.25)',
                        color: 'var(--error)',
                      }}>
                      {busy ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />} Disconnect
                    </button>
                  ) : (
                    <button onClick={() => handleConnect(s.id)} disabled={busyId != null}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                      style={{
                        background: 'var(--primary-light)',
                        borderColor: 'var(--primary)',
                        color: 'var(--primary)',
                      }}>
                      <Plus size={11} /> Connect
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          )}
        </Section>
        )}

        {/* Subscription — Business only */}
        {isBusiness && (
        <Section title="Subscription">
          <div className="flex items-center justify-between p-4 rounded-[var(--r-md)]"
            style={{ background:'var(--primary-light)', border:'1px solid rgba(15,30,58,.15)' }}>
            <div className="flex items-center gap-3">
              <CreditCard size={20} style={{ color:'var(--primary)' }} />
              <div>
                <p className="text-sm font-bold" style={{ color:'var(--text)' }}>Business Plan</p>
                <p className="text-xs" style={{ color:'var(--text-muted)' }}>$49/month</p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:shadow-[var(--shadow-sm)]"
              style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
              Manage Plan
            </button>
          </div>
        </Section>
        )}

        {/* Security */}
        <Section title="Security">
          <div className="flex flex-col gap-3">
            {[
              { label:'Change Password',           sub:'Last changed 30 days ago',  btn:'Update' },
              { label:'Two-Factor Authentication', sub:'Currently disabled',         btn:'Enable 2FA' },
              { label:'Active Sessions',           sub:'1 active session',           btn:'Manage' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-[var(--r-md)]"
                style={{ background:'var(--bg-alt)', border:'1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <Shield size={16} style={{ color:'var(--text-muted)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color:'var(--text)' }}>{item.label}</p>
                    <p className="text-xs" style={{ color:'var(--text-subtle)' }}>{item.sub}</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:shadow-[var(--shadow-sm)] transition-all"
                  style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--primary)' }}>
                  {item.btn}
                </button>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  )
}
