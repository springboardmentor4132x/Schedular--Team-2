import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sun, Moon, Monitor, Bell, Lock, Globe,
  Shield, Trash2, Download, ChevronRight,
  CheckCircle2, Save,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/dashboard/PageHeader'

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

function Toggle({ label, sub, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0"
      style={{ borderColor:'var(--border)' }}>
      <div>
        <p className="text-sm font-medium" style={{ color:'var(--text)' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color:'var(--text-subtle)' }}>{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0"
        style={{ background: checked ? 'var(--primary)' : 'var(--border)' }}
        aria-pressed={checked}
        aria-label={label}
      >
        <span className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
          style={{ left: checked ? '1.5rem' : '0.25rem' }} />
      </button>
    </div>
  )
}

const LANGUAGES = ['English (US)','English (UK)','Español','Français','Deutsch','हिन्दी','日本語']
const THEMES = [
  { id:'light',  label:'Light',  icon:Sun  },
  { id:'dark',   label:'Dark',   icon:Moon },
  { id:'system', label:'System', icon:Monitor },
]

export default function Settings({ isDark, onToggleTheme }) {
  const { user, logout } = useAuth()

  const [theme,    setTheme]    = useState(isDark ? 'dark' : 'light')
  const [lang,     setLang]     = useState('English (US)')
  const [saved,    setSaved]    = useState(false)

  /* Notification toggles */
  const [notifs, setNotifs] = useState({
    publishSuccess: true,
    publishFailed:  true,
    campaignAlert:  true,
    weeklyDigest:   false,
    systemUpdates:  true,
    teamActivity:   false,
  })
  const toggleNotif = k => setNotifs(p => ({ ...p, [k]:!p[k] }))

  /* Privacy toggles */
  const [privacy, setPrivacy] = useState({
    analyticsTracking: true,
    usageReports:      false,
  })
  const togglePrivacy = k => setPrivacy(p => ({ ...p, [k]:!p[k] }))

  const handleThemeChange = id => {
    setTheme(id)
    if (id === 'light' && isDark)  onToggleTheme?.()
    if (id === 'dark'  && !isDark) onToggleTheme?.()
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-4 sm:p-6 max-w-[800px] mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Manage your account preferences."
        actions={
          <button onClick={handleSave}
            className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold text-white transition-all hover:brightness-105"
            style={{ background:'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
            {saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save</>}
          </button>
        }
      />

      <div className="flex flex-col gap-5">

        {/* Appearance */}
        <Section title="Appearance">
          <p className="text-xs mb-4" style={{ color:'var(--text-muted)' }}>Choose your preferred interface theme.</p>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {THEMES.map(t => {
              const Icon = t.icon; const active = theme === t.id
              return (
                <button key={t.id} onClick={() => handleThemeChange(t.id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-[var(--r-md)] border-2 transition-all"
                  style={{
                    background:  active ? 'var(--primary-light)' : 'var(--bg-alt)',
                    borderColor: active ? 'var(--primary)'       : 'var(--border)',
                  }}>
                  <Icon size={20} style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <span className="text-xs font-semibold" style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {t.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Language */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>
              <Globe size={12} className="inline mr-1.5" /> Language
            </label>
            <select value={lang} onChange={e => setLang(e.target.value)}
              className="w-full sm:w-64 h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none"
              style={{ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }}>
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <Toggle label="Publishing Success"    sub="Get notified when posts publish."                  checked={notifs.publishSuccess} onChange={() => toggleNotif('publishSuccess')} />
          <Toggle label="Publishing Failed"     sub="Get notified when posts fail to publish."          checked={notifs.publishFailed}  onChange={() => toggleNotif('publishFailed')}  />
          <Toggle label="Campaign Alerts"       sub="Budget alerts and campaign milestones."            checked={notifs.campaignAlert}  onChange={() => toggleNotif('campaignAlert')}  />
          <Toggle label="Weekly Digest"         sub="Summary email every Monday."                       checked={notifs.weeklyDigest}   onChange={() => toggleNotif('weeklyDigest')}   />
          <Toggle label="System Updates"        sub="Product news and feature announcements."           checked={notifs.systemUpdates}  onChange={() => toggleNotif('systemUpdates')}  />
          <Toggle label="Team Activity"         sub="When teammates publish or edit posts."             checked={notifs.teamActivity}   onChange={() => toggleNotif('teamActivity')}   />
        </Section>

        {/* Privacy */}
        <Section title="Privacy">
          <Toggle label="Analytics & Tracking"  sub="Help improve OrbitSocial by sharing usage data."  checked={privacy.analyticsTracking} onChange={() => togglePrivacy('analyticsTracking')} />
          <Toggle label="Usage Reports"          sub="Share anonymous usage stats with our team."       checked={privacy.usageReports}      onChange={() => togglePrivacy('usageReports')}      />
        </Section>

        {/* Security */}
        <Section title="Security">
          {[
            { icon:Lock,     label:'Change Password',           sub:'Recommended every 90 days.' },
            { icon:Shield,   label:'Two-Factor Authentication', sub:'Add an extra layer of security.' },
            { icon:Download, label:'Export My Data',            sub:'Download all your account data.' },
          ].map(item => {
            const Icon = item.icon
            return (
              <button key={item.label}
                className="flex items-center justify-between w-full py-3 border-b last:border-0 text-left hover:bg-[var(--bg-alt)] transition-colors px-2 rounded-lg"
                style={{ borderColor:'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <Icon size={16} style={{ color:'var(--text-muted)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color:'var(--text)' }}>{item.label}</p>
                    <p className="text-xs" style={{ color:'var(--text-subtle)' }}>{item.sub}</p>
                  </div>
                </div>
                <ChevronRight size={15} style={{ color:'var(--text-subtle)' }} />
              </button>
            )
          })}
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone">
          <div className="p-4 rounded-[var(--r-md)]"
            style={{ background:'rgba(220,38,38,.05)', border:'1px solid rgba(220,38,38,.20)' }}>
            <p className="text-sm font-semibold mb-1" style={{ color:'var(--error)' }}>Delete Account</p>
            <p className="text-xs mb-3" style={{ color:'var(--text-muted)' }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold border transition-all hover:shadow-[var(--shadow-sm)]"
              style={{ background:'var(--card)', borderColor:'rgba(220,38,38,.30)', color:'var(--error)' }}>
              <Trash2 size={14} /> Delete my account
            </button>
          </div>
        </Section>

      </div>
    </div>
  )
}
