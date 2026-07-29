import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Save, CheckCircle2, Eye, X, Plus, Building2, Palette,
  Users, Settings2, Megaphone, ShieldCheck, Upload, Info, RefreshCw,
  ArrowLeft
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import PageHeader from '../../components/dashboard/PageHeader'

const STORAGE_KEY = 'orbit-client-requirements'
const REQUEST_STORAGE_KEY = 'orbit-client-requests'
const INDUSTRIES = ['Technology','E-Commerce','Retail','Healthcare','Finance','Media & Entertainment','Education','Food & Beverage','Fashion','Real Estate','Other']
const BRAND_VOICES = ['Professional','Friendly','Luxury','Casual','Humorous','Custom']
const LANGUAGES = ['English','Spanish','French','German','Hindi','Arabic','Portuguese','Japanese','Mandarin']
const CONTENT_TYPES = ['Images','Videos','Reels','Stories','Carousels','Shorts']
const POST_FREQUENCY = ['Daily','Weekly','Monthly']
const DAYS_OF_WEEK = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const GOALS = ['Brand Awareness','Sales','Lead Generation','Product Promotion','Engagement']
const PRIORITIES = ['High','Medium','Low']
const PLATFORM_OPTIONS = [
  { id:'instagram', label:'Instagram', icon:FaInstagram, color:'#E1306C' },
  { id:'facebook',  label:'Facebook',  icon:FaFacebook,  color:'#1877F2' },
  { id:'linkedin',  label:'LinkedIn',  icon:FaLinkedin,  color:'#0A66C2' },
  { id:'x',         label:'X',         icon:FaXTwitter,  color:'#374151' },
  { id:'youtube',   label:'YouTube',   icon:FaYoutube,   color:'#FF0000' },
  { id:'pinterest', label:'Pinterest', icon:FaPinterest, color:'#E60023' },
]

const inputCls = 'w-full px-4 py-2.5 text-sm rounded-[var(--r-md)] border outline-none transition-all focus:border-[var(--primary)]'
const inputSty = { background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }

function createInitialState() {
  return {
    companyName: '',
    companyDescription: '',
    industry: '',
    companyWebsite: '',
    companyLogo: null,
    brandVoice: '',
    brandPersonality: '',
    brandColors: [],
    brandKitFile: null,
    preferredFonts: '',
    ageGroup: '',
    location: '',
    interests: '',
    languages: [],
    preferredPlatforms: [],
    preferredContentTypes: [],
    postingFrequency: '',
    expectedPostsPerWeek: '',
    expectedPostsPerMonth: '',
    preferredPostingDays: [],
    preferredPostingTime: '',
    contentGoals: [],
    captionStyle: '',
    hashtagPreferences: '',
    ctaStyle: '',
    referencePages: '',
    competitorLinks: '',
    additionalInstructions: '',
    requiresCampaign: true,
    campaignName: '',
    campaignObjective: '',
    campaignBudget: '',
    preferredStartDate: '',
    preferredEndDate: '',
    expectedCampaignPosts: '',
    preferredCampaignPlatforms: [],
    campaignPriority: 'High',
    campaignNotes: '',
    normalContentPosting: false,
    approvalBeforePublishing: true,
    allowDirectPublishing: false,
    notifyBeforePublishing: true,
  }
}

function Section({ icon: Icon, title, color, bg, children, index = 0 }) {
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.25, delay:index * 0.05 }} className="card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor:'var(--border)', background:'var(--bg-alt)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:bg }}>
          <Icon size={16} style={{ color }} />
        </div>
        <h2 className="text-sm font-bold" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'var(--text)' }}>{title}</h2>
      </div>
      <div className="p-5 flex flex-col gap-4">{children}</div>
    </motion.div>
  )
}

function Field({ label, required = false, children }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>
        {label}{required && <span style={{ color:'#EF4444' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

function Chips({ options, selected, onToggle, activeColor = '#1E3A8A' }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const isActive = selected.includes(opt)
        return (
          <button key={opt} type="button" onClick={() => onToggle(opt)} className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all" style={{
            background: isActive ? `${activeColor}15` : 'var(--card)',
            borderColor: isActive ? activeColor : 'var(--border)',
            color: isActive ? activeColor : 'var(--text-muted)',
          }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function PlatformChips({ selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PLATFORM_OPTIONS.map(p => {
        const Icon = p.icon
        const isActive = selected.includes(p.id)
        return (
          <button key={p.id} type="button" onClick={() => onToggle(p.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all" style={{
            background: isActive ? `${p.color}15` : 'var(--card)',
            borderColor: isActive ? p.color : 'var(--border)',
            color: isActive ? p.color : 'var(--text-muted)',
          }}>
            <Icon size={12} />{p.label}
          </button>
        )
      })}
    </div>
  )
}

function FileBox({ label, accept, file, onChange }) {
  return (
    <label className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-md)] border-2 border-dashed cursor-pointer transition-all hover:border-[var(--primary)] hover:bg-[var(--primary-light)]" style={{ borderColor:'var(--border)', background:'var(--bg-alt)' }}>
      <Upload size={16} style={{ color:'var(--text-subtle)', flexShrink:0 }} />
      <span className="text-xs" style={{ color:'var(--text-muted)' }}>
        {file ? <span className="font-semibold" style={{ color:'var(--text)' }}>{file.name}</span> : `Upload ${label}`}
      </span>
      <input type="file" accept={accept} className="sr-only" onChange={e => onChange(e.target.files?.[0] ?? null)} />
    </label>
  )
}

function ColorPicker({ colors, onChange }) {
  const ref = useRef()
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {colors.map((color, index) => (
        <div key={`${color}-${index}`} className="relative group">
          <div className="w-9 h-9 rounded-lg border-2 cursor-pointer hover:scale-110 transition-transform" style={{ background:color, borderColor:'var(--border)' }} title={color} />
          <button type="button" onClick={() => onChange(colors.filter((_, i) => i !== index))} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full hidden group-hover:flex items-center justify-center text-white" style={{ background:'#EF4444', fontSize:8 }}>
            <X size={8} />
          </button>
        </div>
      ))}
      <input ref={ref} type="color" className="sr-only" onChange={e => { if (!colors.includes(e.target.value)) onChange([...colors, e.target.value]) }} />
      <button type="button" onClick={() => ref.current?.click()} className="w-9 h-9 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors hover:border-[var(--primary)]" style={{ borderColor:'var(--border)', color:'var(--text-muted)' }}>
        <Plus size={14} />
      </button>
    </div>
  )
}

function YesNo({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {['Yes','No'].map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt === 'Yes')} className="flex-1 h-9 rounded-[var(--r-md)] border text-sm font-semibold transition-all" style={{
          background: (value && opt === 'Yes') || (!value && opt === 'No') ? 'linear-gradient(135deg,#1E3A8A,#4F46E5)' : 'var(--card)',
          borderColor: (value && opt === 'Yes') || (!value && opt === 'No') ? 'transparent' : 'var(--border)',
          color: (value && opt === 'Yes') || (!value && opt === 'No') ? '#fff' : 'var(--text-muted)',
        }}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    draft: { label: 'Draft', color: '#64748B', bg: 'rgba(100,116,139,.12)' },
    pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
    approved: { label: 'Approved', color: '#22C55E', bg: 'rgba(34,197,94,.12)' },
    rejected: { label: 'Rejected', color: '#EF4444', bg: 'rgba(239,68,68,.12)' },
  }
  const current = styles[status] ?? styles.draft
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: current.bg, color: current.color }}>
      {current.label}
    </span>
  )
}

export default function ClientRequirements() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(createInitialState)
  const [requestStatus, setRequestStatus] = useState('draft')
  const [message, setMessage] = useState('')
  const [rejectionReason, setRejectionReason] = useState('Please revise your brand colors and campaign budget before we can proceed.')
  const [loadedRequestId, setLoadedRequestId] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    let parsed = null
    if (saved) {
      try {
        parsed = JSON.parse(saved)
        if (parsed?.formData) setFormData(parsed.formData)
        if (parsed?.requestStatus) setRequestStatus(parsed.requestStatus)
        if (parsed?.rejectionReason) setRejectionReason(parsed.rejectionReason)
        if (parsed?.message) setMessage(parsed.message)
      } catch {
        // ignore malformed storage
      }
    }

    // If there is no local draft, attempt to preload the latest rejected or pending submission
    if (!parsed || !parsed.formData) {
      try {
        const existingRequests = JSON.parse(localStorage.getItem(REQUEST_STORAGE_KEY) ?? '[]')
        if (existingRequests && existingRequests.length) {
          // prefer rejected to show feedback; otherwise pick the most recent
          const rejected = existingRequests.filter(r => r.status === 'rejected')
          const pick = (rejected.length ? rejected : existingRequests).slice(-1)[0]
          if (pick) {
            // map stored request fields into form state shape
            const mapped = { ...createInitialState(), ...pick }
            setFormData(mapped)
            setRequestStatus(pick.status || 'pending')
            if (pick.rejectionReason) setRejectionReason(pick.rejectionReason)
            if (pick.id) setLoadedRequestId(pick.id)
          }
        }
      } catch {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData, requestStatus, rejectionReason, message }))
  }, [formData, message, rejectionReason, requestStatus])

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))
  const toggleListValue = (field, value) => setFormData(prev => ({
    ...prev,
    [field]: prev[field].includes(value) ? prev[field].filter(item => item !== value) : [...prev[field], value],
  }))

  const handleSaveDraft = () => {
    setRequestStatus('draft')
    setMessage('Draft saved locally. You can continue editing and submit when ready.')
  }

  const handleSubmit = () => {
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const normalizedName = (formData.companyName || 'new-client').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
    const submission = {
      id: normalizedName || `request-${Date.now()}`,
      companyName: formData.companyName || 'Untitled Company',
      companyDescription: formData.companyDescription,
      industry: formData.industry,
      companyWebsite: formData.companyWebsite,
      brandVoice: formData.brandVoice,
      brandPersonality: formData.brandPersonality,
      brandColors: formData.brandColors,
      preferredFonts: formData.preferredFonts,
      ageGroup: formData.ageGroup,
      location: formData.location,
      interests: formData.interests,
      languages: formData.languages,
      preferredPlatforms: formData.preferredPlatforms,
      preferredContentTypes: formData.preferredContentTypes,
      postingFrequency: formData.postingFrequency,
      expectedPostsPerWeek: formData.expectedPostsPerWeek,
      expectedPostsPerMonth: formData.expectedPostsPerMonth,
      preferredPostingDays: formData.preferredPostingDays,
      preferredPostingTime: formData.preferredPostingTime,
      contentGoals: formData.contentGoals,
      captionStyle: formData.captionStyle,
      hashtagPreferences: formData.hashtagPreferences,
      ctaStyle: formData.ctaStyle,
      referencePages: formData.referencePages,
      competitorLinks: formData.competitorLinks,
      additionalInstructions: formData.additionalInstructions,
      requiresCampaign: formData.requiresCampaign,
      campaignName: formData.campaignName,
      campaignObjective: formData.campaignObjective,
      campaignBudget: formData.campaignBudget,
      preferredStartDate: formData.preferredStartDate,
      preferredEndDate: formData.preferredEndDate,
      expectedCampaignPosts: formData.expectedCampaignPosts,
      preferredCampaignPlatforms: formData.preferredCampaignPlatforms,
      campaignPriority: formData.campaignPriority,
      campaignNotes: formData.campaignNotes,
      approvalBeforePublishing: formData.approvalBeforePublishing,
      allowDirectPublishing: formData.allowDirectPublishing,
      notifyBeforePublishing: formData.notifyBeforePublishing,
      submissionDate: date,
      status: 'pending',
      reviewedAt: null,
      rejectionReason: '',
    }

    const existing = JSON.parse(localStorage.getItem(REQUEST_STORAGE_KEY) ?? '[]')
    const updated = existing.filter(item => item.id !== submission.id)
    updated.push(submission)
    localStorage.setItem(REQUEST_STORAGE_KEY, JSON.stringify(updated))

    setRequestStatus('pending')
    setMessage('Your client requirements have been submitted to the assigned Marketing Team for review.')
  }

  const summary = useMemo(() => ({
    platforms: formData.preferredPlatforms.length,
    goals: formData.contentGoals.length,
    campaign: formData.requiresCampaign ? 'Campaign required' : 'Normal posting',
  }), [formData.contentGoals.length, formData.preferredPlatforms.length, formData.requiresCampaign])

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Client Requirements"
        subtitle="Create a work request for your assigned marketing team and track its review status."
        actions={(
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/dashboard/marketing-teams')} className="flex items-center gap-2 px-3 h-9 rounded-[var(--r-md)] border text-sm font-semibold" style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
              <ArrowLeft size={14} /> Back
            </button>
            <StatusBadge status={requestStatus} />
          </div>
        )}
      />

      <div className="card p-4 mb-5" style={{ background:'rgba(30,58,138,.06)', border:'1px solid rgba(30,58,138,.16)' }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>Request status</p>
            <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{message || 'Draft your request, then submit it to the assigned marketing team.'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['draft','pending','approved','rejected'].map(status => (
              <button key={status} type="button" onClick={() => setRequestStatus(status)} className="px-3 py-1.5 rounded-full text-xs font-semibold border" style={{ background: requestStatus === status ? 'var(--primary)' : 'var(--card)', borderColor: requestStatus === status ? 'var(--primary)' : 'var(--border)', color: requestStatus === status ? '#fff' : 'var(--text-muted)' }}>
                {status === 'pending' ? 'Pending Approval' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="card p-4">
          <p className="text-[10px] font-semibold uppercase" style={{ color:'var(--text-muted)' }}>Core Details</p>
          <p className="text-lg font-bold mt-1" style={{ color:'var(--text)' }}>{formData.companyName || 'New request'}</p>
          <p className="text-xs mt-2" style={{ color:'var(--text-muted)' }}>{formData.industry || 'Add company context for the team.'}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold uppercase" style={{ color:'var(--text-muted)' }}>Selected Platforms</p>
          <p className="text-lg font-bold mt-1" style={{ color:'var(--text)' }}>{summary.platforms}</p>
          <p className="text-xs mt-2" style={{ color:'var(--text-muted)' }}>Platforms chosen for content delivery.</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold uppercase" style={{ color:'var(--text-muted)' }}>Campaign Plan</p>
          <p className="text-lg font-bold mt-1" style={{ color:'var(--text)' }}>{summary.campaign}</p>
          <p className="text-xs mt-2" style={{ color:'var(--text-muted)' }}>{summary.goals} content goals selected.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Section icon={Building2} title="SECTION 1 · COMPANY INFORMATION" color="#1E3A8A" bg="rgba(30,58,138,.12)" index={0}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company Name" required>
              <input value={formData.companyName} onChange={e => updateField('companyName', e.target.value)} placeholder="Orbit Social" className={inputCls} style={inputSty} />
            </Field>
            <Field label="Industry">
              <select value={formData.industry} onChange={e => updateField('industry', e.target.value)} className={inputCls} style={inputSty}>
                <option value="">Select industry</option>
                {INDUSTRIES.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Company Description">
            <textarea value={formData.companyDescription} onChange={e => updateField('companyDescription', e.target.value)} rows={4} placeholder="Describe your company, products, and what you need from the marketing team." className={inputCls} style={inputSty} />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company Website">
              <input value={formData.companyWebsite} onChange={e => updateField('companyWebsite', e.target.value)} placeholder="https://example.com" className={inputCls} style={inputSty} />
            </Field>
            <Field label="Company Logo">
              <FileBox label="company logo" accept="image/*" file={formData.companyLogo} onChange={file => updateField('companyLogo', file)} />
            </Field>
          </div>
        </Section>

        <Section icon={Palette} title="SECTION 2 · BRAND GUIDELINES" color="#E1306C" bg="rgba(225,48,108,.12)" index={1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Brand Voice">
              <input value={formData.brandVoice} onChange={e => updateField('brandVoice', e.target.value)} placeholder="Professional, bold, friendly" className={inputCls} style={inputSty} />
            </Field>
            <Field label="Brand Personality">
              <input value={formData.brandPersonality} onChange={e => updateField('brandPersonality', e.target.value)} placeholder="Confident, innovative, helpful" className={inputCls} style={inputSty} />
            </Field>
          </div>
          <Field label="Brand Colors">
            <ColorPicker colors={formData.brandColors} onChange={value => updateField('brandColors', value)} />
          </Field>
          <Field label="Brand Kit Upload">
            <FileBox label="brand kit" accept="image/*,.pdf,.zip" file={formData.brandKitFile} onChange={file => updateField('brandKitFile', file)} />
          </Field>
          <Field label="Preferred Fonts">
            <input value={formData.preferredFonts} onChange={e => updateField('preferredFonts', e.target.value)} placeholder="Inter, Sora, Playfair Display" className={inputCls} style={inputSty} />
          </Field>
        </Section>

        <Section icon={Users} title="SECTION 3 · TARGET AUDIENCE" color="#7C3AED" bg="rgba(124,58,237,.12)" index={2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Age Group">
              <input value={formData.ageGroup} onChange={e => updateField('ageGroup', e.target.value)} placeholder="18-34" className={inputCls} style={inputSty} />
            </Field>
            <Field label="Location">
              <input value={formData.location} onChange={e => updateField('location', e.target.value)} placeholder="United States, Canada" className={inputCls} style={inputSty} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Interests">
              <input value={formData.interests} onChange={e => updateField('interests', e.target.value)} placeholder="Technology, wellness, design" className={inputCls} style={inputSty} />
            </Field>
            <Field label="Languages">
              <Chips options={LANGUAGES} selected={formData.languages} onToggle={value => toggleListValue('languages', value)} activeColor="#4F46E5" />
            </Field>
          </div>
        </Section>

        <Section icon={Megaphone} title="SECTION 4 · CONTENT REQUIREMENTS" color="#0A66C2" bg="rgba(10,102,194,.12)" index={3}>
          <Field label="Preferred Platforms">
            <PlatformChips selected={formData.preferredPlatforms} onToggle={value => toggleListValue('preferredPlatforms', value)} />
          </Field>
          <Field label="Preferred Content Types">
            <Chips options={CONTENT_TYPES} selected={formData.preferredContentTypes} onToggle={value => toggleListValue('preferredContentTypes', value)} />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Posting Frequency">
              <div className="flex flex-wrap gap-2">
                {POST_FREQUENCY.map(option => (
                  <button key={option} type="button" onClick={() => updateField('postingFrequency', option)} className="px-3 py-1.5 rounded-full border text-xs font-semibold" style={{ background: formData.postingFrequency === option ? 'rgba(30,58,138,.12)' : 'var(--card)', borderColor: formData.postingFrequency === option ? '#1E3A8A' : 'var(--border)', color: formData.postingFrequency === option ? '#1E3A8A' : 'var(--text-muted)' }}>
                    {option}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Preferred Posting Days">
              <Chips options={DAYS_OF_WEEK} selected={formData.preferredPostingDays} onToggle={value => toggleListValue('preferredPostingDays', value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Expected Posts Per Week">
              <input value={formData.expectedPostsPerWeek} onChange={e => updateField('expectedPostsPerWeek', e.target.value)} placeholder="3" className={inputCls} style={inputSty} />
            </Field>
            <Field label="Expected Posts Per Month">
              <input value={formData.expectedPostsPerMonth} onChange={e => updateField('expectedPostsPerMonth', e.target.value)} placeholder="12" className={inputCls} style={inputSty} />
            </Field>
          </div>
          <Field label="Preferred Posting Time">
            <input value={formData.preferredPostingTime} onChange={e => updateField('preferredPostingTime', e.target.value)} placeholder="Morning (6-9 AM)" className={inputCls} style={inputSty} />
          </Field>
          <Field label="Content Goals">
            <Chips options={GOALS} selected={formData.contentGoals} onToggle={value => toggleListValue('contentGoals', value)} activeColor="#22C55E" />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Caption Style">
              <input value={formData.captionStyle} onChange={e => updateField('captionStyle', e.target.value)} placeholder="Short and punchy" className={inputCls} style={inputSty} />
            </Field>
            <Field label="Hashtag Preferences">
              <input value={formData.hashtagPreferences} onChange={e => updateField('hashtagPreferences', e.target.value)} placeholder="Brand hashtag only" className={inputCls} style={inputSty} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="CTA Style">
              <input value={formData.ctaStyle} onChange={e => updateField('ctaStyle', e.target.value)} placeholder="Learn more" className={inputCls} style={inputSty} />
            </Field>
            <Field label="Reference Pages">
              <textarea value={formData.referencePages} onChange={e => updateField('referencePages', e.target.value)} rows={3} placeholder="https://example.com/brand, https://example.com/landing" className={inputCls} style={inputSty} />
            </Field>
          </div>
          <Field label="Competitor Links">
            <textarea value={formData.competitorLinks} onChange={e => updateField('competitorLinks', e.target.value)} rows={3} placeholder="Competitor links or inspiration pages" className={inputCls} style={inputSty} />
          </Field>
          <Field label="Additional Instructions">
            <textarea value={formData.additionalInstructions} onChange={e => updateField('additionalInstructions', e.target.value)} rows={4} placeholder="Share anything else the team should know." className={inputCls} style={inputSty} />
          </Field>
        </Section>

        <Section icon={ShieldCheck} title="SECTION 5 · CAMPAIGN REQUIREMENTS" color="#F59E0B" bg="rgba(245,158,11,.12)" index={4}>
          <Field label="How would you like this scheduled?">
            <div className="flex flex-wrap gap-2">
              {['Campaign', 'Normal Content'].map(option => {
                const isActive = (formData.requiresCampaign && option === 'Campaign') || (!formData.requiresCampaign && option === 'Normal Content')
                return (
                  <button key={option} type="button" onClick={() => updateField('requiresCampaign', option === 'Campaign')} className="px-3 py-1.5 rounded-full border text-xs font-semibold" style={{ background: isActive ? 'rgba(30,58,138,.12)' : 'var(--card)', borderColor: isActive ? '#1E3A8A' : 'var(--border)', color: isActive ? '#1E3A8A' : 'var(--text-muted)' }}>
                    {option}
                  </button>
                )
              })}
            </div>
          </Field>

          <Field label="Campaign Budget (optional)">
            <input value={formData.campaignBudget} onChange={e => updateField('campaignBudget', e.target.value)} placeholder="$2,500" className={inputCls} style={inputSty} />
          </Field>

          {formData.requiresCampaign ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Campaign Name">
                <input value={formData.campaignName} onChange={e => updateField('campaignName', e.target.value)} placeholder="Summer Launch" className={inputCls} style={inputSty} />
              </Field>
              <Field label="Campaign Objective">
                <input value={formData.campaignObjective} onChange={e => updateField('campaignObjective', e.target.value)} placeholder="Brand Awareness" className={inputCls} style={inputSty} />
              </Field>
              <Field label="Preferred Start Date">
                <input type="date" value={formData.preferredStartDate} onChange={e => updateField('preferredStartDate', e.target.value)} className={inputCls} style={inputSty} />
              </Field>
              <Field label="Preferred End Date">
                <input type="date" value={formData.preferredEndDate} onChange={e => updateField('preferredEndDate', e.target.value)} className={inputCls} style={inputSty} />
              </Field>
              <Field label="Expected Campaign Posts">
                <input value={formData.expectedCampaignPosts} onChange={e => updateField('expectedCampaignPosts', e.target.value)} placeholder="8" className={inputCls} style={inputSty} />
              </Field>
              <Field label="Preferred Campaign Platforms">
                <PlatformChips selected={formData.preferredCampaignPlatforms} onToggle={value => toggleListValue('preferredCampaignPlatforms', value)} />
              </Field>
              <Field label="Campaign Priority">
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map(option => (
                    <button key={option} type="button" onClick={() => updateField('campaignPriority', option)} className="px-3 py-1.5 rounded-full border text-xs font-semibold" style={{ background: formData.campaignPriority === option ? 'rgba(30,58,138,.12)' : 'var(--card)', borderColor: formData.campaignPriority === option ? '#1E3A8A' : 'var(--border)', color: formData.campaignPriority === option ? '#1E3A8A' : 'var(--text-muted)' }}>
                      {option}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Campaign Notes">
                <textarea value={formData.campaignNotes} onChange={e => updateField('campaignNotes', e.target.value)} rows={4} placeholder="Specific goals, audience, or creative notes for the campaign" className={inputCls} style={inputSty} />
              </Field>
            </div>
          ) : (
            <div className="rounded-[var(--r-md)] border p-4" style={{ background:'var(--bg-alt)', borderColor:'var(--border)' }}>
              <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>Normal Content Posting</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Field label="Expected Posts Per Week">
                  <input value={formData.expectedPostsPerWeek} onChange={e => updateField('expectedPostsPerWeek', e.target.value)} placeholder="3" className={inputCls} style={inputSty} />
                </Field>
                <Field label="Expected Posts Per Month">
                  <input value={formData.expectedPostsPerMonth} onChange={e => updateField('expectedPostsPerMonth', e.target.value)} placeholder="12" className={inputCls} style={inputSty} />
                </Field>
              </div>
              <Field label="Preferred Platforms">
                <PlatformChips selected={formData.preferredPlatforms} onToggle={value => toggleListValue('preferredPlatforms', value)} />
              </Field>
            </div>
          )}
        </Section>

        <Section icon={Info} title="SECTION 6 · APPROVAL PREFERENCES" color="#22C55E" bg="rgba(34,197,94,.12)" index={5}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Require approval before publishing?">
              <YesNo value={formData.approvalBeforePublishing} onChange={value => updateField('approvalBeforePublishing', value)} />
            </Field>
            <Field label="Allow direct publishing?">
              <YesNo value={formData.allowDirectPublishing} onChange={value => updateField('allowDirectPublishing', value)} />
            </Field>
            <Field label="Notify before publishing?">
              <YesNo value={formData.notifyBeforePublishing} onChange={value => updateField('notifyBeforePublishing', value)} />
            </Field>
          </div>
        </Section>

        {requestStatus === 'rejected' && (
          <div className="card p-4" style={{ border:'1px solid rgba(239,68,68,.24)', background:'rgba(239,68,68,.08)' }}>
            <div className="flex items-start gap-2">
              <Info size={16} style={{ color:'#EF4444', flexShrink:0, marginTop:1 }} />
              <div>
                <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>Rejection reason from the marketing team</p>
                <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>{rejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button type="button" onClick={handleSaveDraft} className="flex items-center justify-center gap-2 h-11 px-4 rounded-[var(--r-md)] border text-sm font-semibold" style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>
            <Save size={15} /> Save Draft
          </button>
          <button type="button" onClick={handleSubmit} className="flex items-center justify-center gap-2 h-11 px-4 rounded-[var(--r-md)] text-sm font-semibold text-white" style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
            <CheckCircle2 size={15} /> Submit Request
          </button>
        </div>
      </div>
    </div>
  )
}
