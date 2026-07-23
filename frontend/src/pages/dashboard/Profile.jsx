import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Globe, Clock, Camera, Save,
  Plus, CheckCircle2, Shield, CreditCard, Trash2,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube } from 'react-icons/fa6'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/dashboard/PageHeader'

const TIMEZONES = [
  'UTC−08:00 Pacific Time','UTC−05:00 Eastern Time',
  'UTC+00:00 London','UTC+05:30 Mumbai','UTC+08:00 Singapore','UTC+09:00 Tokyo',
]
const INDUSTRIES = [
  'Technology','E-Commerce','Retail','Healthcare',
  'Finance','Media & Entertainment','Education','Other',
]
const SOCIAL_PLATFORMS = [
  { id:'instagram', label:'Instagram', icon:FaInstagram, color:'#E1306C', connected:true  },
  { id:'facebook',  label:'Facebook',  icon:FaFacebook,  color:'#1877F2', connected:true  },
  { id:'linkedin',  label:'LinkedIn',  icon:FaLinkedin,  color:'#0A66C2', connected:true  },
  { id:'x',         label:'X',         icon:FaXTwitter,  color:'#000000', connected:false },
  { id:'youtube',   label:'YouTube',   icon:FaYoutube,   color:'#FF0000', connected:false },
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
  const { user, role } = useAuth()
  const isMarketing = role === 'marketing'

  const [form, setForm] = useState({
    company:     isMarketing ? 'Marketing Department' : 'OrbitSocial Inc.',
    industry:    'Technology',
    description: isMarketing
      ? 'We manage social media publishing workflows, content approval, and campaign execution.'
      : 'We help businesses grow their social media presence through intelligent scheduling and analytics.',
    website:     'https://orbitsocial.app',
    timezone:    'UTC+05:30 Mumbai',
    email:       user?.email ?? (isMarketing ? 'marketing@demo.com' : 'business@demo.com'),
    phone:       '+1 (555) 000-0000',
    // Marketing-specific
    teamName:    'Social Media Team',
    teamSize:    '4',
  })
  const [socials, setSocials]  = useState(SOCIAL_PLATFORMS)
  const [saved,   setSaved]    = useState(false)

  const update = (k, v) => setForm(p => ({ ...p, [k]:v }))

  const toggleConnect = id =>
    setSocials(prev => prev.map(s => s.id === id ? { ...s, connected:!s.connected } : s))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-4 sm:p-6 max-w-[900px] mx-auto">
      <PageHeader
        title={isMarketing ? 'Team Profile' : 'Business Profile'}
        subtitle={isMarketing
          ? 'Manage your team information and personal settings.'
          : 'Manage your company information and connected accounts.'}
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
          <div className="flex items-center gap-5 mb-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-[var(--shadow-md)]"
                style={{ background:'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                {isMarketing ? 'M' : 'O'}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-[var(--shadow-sm)]"
                style={{ background:'var(--primary)' }}>
                <Camera size={13} />
              </button>
            </div>
            <div>
              <p className="text-base font-bold" style={{ color:'var(--text)' }}>
                {isMarketing ? form.teamName : form.company}
              </p>
              <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>
                {isMarketing ? 'Marketing Team' : 'Click the camera icon to update your logo.'}
              </p>
            </div>
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
              <input value={form.email} onChange={e => update('email', e.target.value)} type="email" className={inputCls} style={inputSty} />
            </Field>
            <Field label="Phone Number">
              <input value={form.phone} onChange={e => update('phone', e.target.value)} type="tel" className={inputCls} style={inputSty} />
            </Field>
          </div>
        </Section>

        {/* Connected social accounts — Business only (Marketing uses ConnectedAccounts page) */}
        {!isMarketing && (
        <Section title="Connected Social Accounts">
          <p className="text-xs mb-4" style={{ color:'var(--text-muted)' }}>
            Connect your social accounts to enable direct publishing from OrbitSocial.
          </p>
          <div className="flex flex-col gap-3">
            {socials.map(s => {
              const Icon = s.icon
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
                      <p className="text-xs" style={{ color: s.connected ? '#22C55E' : 'var(--text-subtle)' }}>
                        {s.connected ? '● Connected' : '○ Not connected'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => toggleConnect(s.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                    style={{
                      background:  s.connected ? 'rgba(220,38,38,.08)'  : 'var(--primary-light)',
                      borderColor: s.connected ? 'rgba(220,38,38,.25)'  : 'var(--primary)',
                      color:       s.connected ? 'var(--error)'         : 'var(--primary)',
                    }}>
                    {s.connected ? <><Trash2 size={11} /> Disconnect</> : <><Plus size={11} /> Connect</>}
                  </button>
                </div>
              )
            })}
          </div>
        </Section>
        )}

        {/* Subscription — Business only */}
        {!isMarketing && (
        <Section title="Subscription">
          <div className="flex items-center justify-between p-4 rounded-[var(--r-md)]"
            style={{ background:'var(--primary-light)', border:'1px solid rgba(15,30,58,.15)' }}>
            <div className="flex items-center gap-3">
              <CreditCard size={20} style={{ color:'var(--primary)' }} />
              <div>
                <p className="text-sm font-bold" style={{ color:'var(--text)' }}>Business Plan</p>
                <p className="text-xs" style={{ color:'var(--text-muted)' }}>$49/month · Renews Aug 1, 2025</p>
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
