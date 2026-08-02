import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Save, CheckCircle2, Upload, Plus, X,
  Building2, Palette, Users, Settings2,
  Target, PenSquare, ThumbsUp, ThumbsDown, Link,
  BookOpen,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import PageHeader from '../../../components/dashboard/PageHeader'
import {
  fetchBrandGuidelines,
  saveBrandGuidelines,
  submitWorkRequest,
} from '../services/businessService'

const inputCls = 'w-full px-4 py-2.5 text-sm rounded-[var(--r-md)] border outline-none transition-all focus:border-[var(--primary)]'
const inputSty = { background: 'var(--bg-alt)', borderColor: 'var(--border)', color: 'var(--text)' }
const labelCls = 'text-xs font-semibold mb-1.5 block'
const labelSty = { color: 'var(--text)' }

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: FaInstagram, color: '#E1306C' },
  { id: 'facebook',  label: 'Facebook',  icon: FaFacebook,  color: '#1877F2' },
  { id: 'linkedin',  label: 'LinkedIn',  icon: FaLinkedin,  color: '#0A66C2' },
  { id: 'x',         label: 'X',         icon: FaXTwitter,  color: '#374151' },
  { id: 'youtube',   label: 'YouTube',   icon: FaYoutube,   color: '#FF0000' },
  { id: 'pinterest', label: 'Pinterest', icon: FaPinterest, color: '#E60023' },
]
const CONTENT_TYPES = ['Photos', 'Videos', 'Reels', 'Stories', 'Carousels', 'Infographics', 'Text Posts', 'Threads']
const LANGUAGES     = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Arabic', 'Portuguese', 'Japanese']
const FREQUENCIES   = ['Daily', '3–4x per week', '1–2x per week', 'Weekly', 'Bi-weekly', 'Monthly']
const TIMES         = ['Morning (6–9 AM)', 'Mid-morning (9–12 PM)', 'Afternoon (12–3 PM)', 'Evening (5–8 PM)', 'Night (8–11 PM)']
const AGE_GROUPS    = ['13–17', '18–24', '25–34', '35–44', '45–54', '55+']
const VOICE_OPTIONS = ['Professional', 'Friendly', 'Witty', 'Inspirational', 'Educational', 'Bold', 'Casual', 'Authoritative']
const CAPTION_STYLES = ['Short & punchy', 'Long-form storytelling', 'Question-based', 'Quote-led', 'Data-driven', 'Conversational']
const HASHTAG_PREFS  = ['Niche hashtags', 'Trending hashtags', 'Brand hashtag only', 'Mix of sizes', 'No hashtags']
const CTA_STYLES     = ['Link in bio', 'DM us', 'Comment below', 'Swipe up', 'Shop now', 'Learn more', 'Sign up']

function Section({ icon: Icon, title, color = '#1E3A8A', bg = 'rgba(30,58,138,.10)', children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }} className="card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
          <Icon size={16} style={{ color }} />
        </div>
        <h2 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text)' }}>{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  )
}

function Field({ label, children, half = false }) {
  return (
    <div className={half ? '' : ''}>
      <label className={labelCls} style={labelSty}>{label}</label>
      {children}
    </div>
  )
}

function MultiSelect({ options, selected, onToggle, colorMap = {} }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const on = selected.includes(opt)
        const color = colorMap[opt] ?? 'var(--primary)'
        const bg    = colorMap[opt] ? `${colorMap[opt]}15` : 'var(--primary-light)'
        return (
          <button key={opt} type="button" onClick={() => onToggle(opt)}
            className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
            style={{ background: on ? bg : 'var(--card)', borderColor: on ? color : 'var(--border)', color: on ? color : 'var(--text-muted)' }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function ListEditor({ items, onAdd, onRemove, placeholder }) {
  const [val, setVal] = useState('')
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input value={val} onChange={e => setVal(e.target.value)}
          placeholder={placeholder} className={`${inputCls} flex-1`} style={inputSty}
          onKeyDown={e => { if (e.key === 'Enter' && val.trim()) { onAdd(val.trim()); setVal('') } }} />
        <button type="button" onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal('') } }}
          className="w-9 h-9 rounded-[var(--r-md)] flex items-center justify-center text-white flex-shrink-0"
          style={{ background: 'var(--primary)' }}>
          <Plus size={14} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            {item}
            <button type="button" onClick={() => onRemove(i)} className="hover:text-[var(--error)]" style={{ color: 'var(--text-subtle)' }}>
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

function ColorPicker({ colors, onChange }) {
  const ref = useRef()
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {colors.map((c, i) => (
        <div key={i} className="relative group">
          <div className="w-9 h-9 rounded-lg border-2 cursor-pointer transition-all hover:scale-110"
            style={{ background: c, borderColor: 'var(--border)' }} title={c} />
          <button type="button" onClick={() => onChange(colors.filter((_, idx) => idx !== i))}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full items-center justify-center text-white hidden group-hover:flex"
            style={{ background: '#EF4444', fontSize: 8 }}>
            <X size={8} />
          </button>
        </div>
      ))}
      <input ref={ref} type="color" className="sr-only" onChange={e => { if (!colors.includes(e.target.value)) onChange([...colors, e.target.value]) }} />
      <button type="button" onClick={() => ref.current?.click()}
        className="w-9 h-9 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors hover:border-[var(--primary)]"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        <Plus size={14} />
      </button>
    </div>
  )
}

function FileUploadBox({ label, accept, file, onChange }) {
  return (
    <div>
      <label className={labelCls} style={labelSty}>{label}</label>
      <label className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-md)] border-2 border-dashed cursor-pointer transition-all hover:border-[var(--primary)] hover:bg-[var(--primary-light)]"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
        <Upload size={16} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {file ? <span className="font-semibold" style={{ color: 'var(--text)' }}>{file.name}</span> : `Click to upload ${label.toLowerCase()}`}
        </span>
        <input type="file" accept={accept} className="sr-only" onChange={e => onChange(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  )
}

export default function BrandGuidelines() {
  const [saved, setSaved] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  // Company Info
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [industry, setIndustry] = useState('Technology')

  // Brand Identity
  const [brandVoice,  setBrandVoice]     = useState([])
  const [brandColors, setBrandColors]    = useState(['#1E3A8A', '#4F46E5'])
  const [logoFile,    setLogoFile]       = useState(null)
  const [brandKit,    setBrandKit]       = useState(null)

  // Target Audience
  const [ageGroups,   setAgeGroups]      = useState([])
  const [locations,   setLocations]      = useState([])
  const [interests,   setInterests]      = useState([])

  // Content Preferences
  const [platforms,   setPlatforms]      = useState([])
  const [contentTypes,setContentTypes]   = useState([])
  const [languages,   setLanguages]      = useState(['English'])
  const [frequency,   setFrequency]      = useState('')
  const [postingTime, setPostingTime]    = useState('')

  // Content Goals (multi-select checkboxes)
  const [goals, setGoals] = useState({
    brandAwareness: false, productPromotion: false,
    sales: false, leadGeneration: false, customerEngagement: false,
  })

  // Writing Preferences
  const [captionStyle, setCaptionStyle]  = useState('')
  const [hashtagPref,  setHashtagPref]   = useState('')
  const [ctaStyle,     setCtaStyle]      = useState('')

  // Dos & Don'ts
  const [dos,   setDos]   = useState([])
  const [donts, setDonts] = useState([])

  // Reference Links
  const [competitors,  setCompetitors]  = useState([])
  const [inspirations, setInspirations] = useState([])

  // Additional
  const [additional, setAdditional] = useState('')

  // Campaign request
  const [campaignName, setCampaignName] = useState('')
  const [campaignObjective, setCampaignObjective] = useState('')
  const [campaignBudget, setCampaignBudget] = useState('')
  const [campaignDuration, setCampaignDuration] = useState('')
  const [expectedPosts, setExpectedPosts] = useState('')
  const [campaignPlatforms, setCampaignPlatforms] = useState([])
  const [priority, setPriority] = useState('High')
  const [marketingNotes, setMarketingNotes] = useState('')

  const toggle = (arr, setArr, val) => setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  const addToList    = (setArr, val) => setArr(prev => [...prev, val])
  const removeFromList = (setArr, i) => setArr(prev => prev.filter((_, idx) => idx !== i))

  const splitList = v => Array.isArray(v) ? v : (typeof v === 'string' && v.trim() ? v.split(/,\s*/) : [])

  const fileMeta = file =>
    file && typeof file === 'object' && file.name
      ? { name: file.name, size: file.size ?? null, type: file.type ?? null }
      : null

  const buildDetails = () => ({
    source: 'brand-guidelines',
    companyName: companyName || 'Untitled Company',
    companyDescription: description,
    industry,
    companyWebsite: '',
    brandVoice: brandVoice.join(', '),
    brandPersonality: brandVoice.join(', '),
    brandColors,
    preferredFonts: 'Inter / Sans-serif',
    ageGroup: ageGroups.join(', '),
    location: locations.join(', '),
    interests: interests.join(', '),
    languages,
    preferredPlatforms: platforms,
    preferredContentTypes: contentTypes,
    postingFrequency: frequency,
    expectedPostsPerWeek: expectedPosts,
    expectedPostsPerMonth: '',
    preferredPostingDays: [],
    preferredPostingTime: postingTime,
    contentGoals: Object.entries(goals).filter(([, checked]) => checked).map(([key]) => key),
    captionStyle,
    hashtagPreferences: hashtagPref,
    ctaStyle,
    referencePages: competitors,
    competitorLinks: inspirations,
    additionalInstructions: additional,
    dos,
    donts,
    requiresCampaign: Boolean(campaignName || campaignObjective || campaignBudget || campaignDuration || expectedPosts || campaignPlatforms.length || marketingNotes),
    campaignName,
    campaignObjective,
    campaignBudget,
    campaignDuration,
    preferredStartDate: '',
    preferredEndDate: '',
    expectedCampaignPosts: expectedPosts,
    preferredCampaignPlatforms: campaignPlatforms,
    campaignPriority: priority,
    campaignNotes: marketingNotes,
    approvalBeforePublishing: true,
    allowDirectPublishing: false,
    notifyBeforePublishing: true,
    logoFile: fileMeta(logoFile),
    brandKit: fileMeta(brandKit),
    submittedAt: new Date().toISOString(),
  })

  const applyDetails = useCallback((d = {}) => {
    if (d.companyName !== undefined) setCompanyName(d.companyName)
    if (d.companyDescription !== undefined) setDescription(d.companyDescription)
    if (d.industry !== undefined) setIndustry(d.industry)
    if (d.brandVoice !== undefined) setBrandVoice(splitList(d.brandVoice))
    if (d.brandColors !== undefined) setBrandColors(d.brandColors)
    if (d.ageGroup !== undefined) setAgeGroups(splitList(d.ageGroup))
    if (d.location !== undefined) setLocations(splitList(d.location))
    if (d.interests !== undefined) setInterests(splitList(d.interests))
    if (d.languages !== undefined) setLanguages(Array.isArray(d.languages) && d.languages.length ? d.languages : ['English'])
    if (d.preferredPlatforms !== undefined) setPlatforms(d.preferredPlatforms)
    if (d.preferredContentTypes !== undefined) setContentTypes(d.preferredContentTypes)
    if (d.postingFrequency !== undefined) setFrequency(d.postingFrequency)
    if (d.preferredPostingTime !== undefined) setPostingTime(d.preferredPostingTime)
    if (d.contentGoals !== undefined) {
      setGoals(prev => {
        const next = { ...prev }
        d.contentGoals.forEach(key => { next[key] = true })
        return next
      })
    }
    if (d.captionStyle !== undefined) setCaptionStyle(d.captionStyle)
    if (d.hashtagPreferences !== undefined) setHashtagPref(d.hashtagPreferences)
    if (d.ctaStyle !== undefined) setCtaStyle(d.ctaStyle)
    if (d.dos !== undefined) setDos(d.dos)
    if (d.donts !== undefined) setDonts(d.donts)
    if (d.referencePages !== undefined) setCompetitors(d.referencePages)
    if (d.competitorLinks !== undefined) setInspirations(d.competitorLinks)
    if (d.additionalInstructions !== undefined) setAdditional(d.additionalInstructions)
    if (d.campaignName !== undefined) setCampaignName(d.campaignName)
    if (d.campaignObjective !== undefined) setCampaignObjective(d.campaignObjective)
    if (d.campaignBudget !== undefined) setCampaignBudget(d.campaignBudget)
    if (d.campaignDuration !== undefined) setCampaignDuration(d.campaignDuration)
    if (d.expectedCampaignPosts !== undefined) setExpectedPosts(d.expectedCampaignPosts)
    if (d.preferredCampaignPlatforms !== undefined) setCampaignPlatforms(d.preferredCampaignPlatforms)
    if (d.campaignPriority !== undefined) setPriority(d.campaignPriority)
    if (d.campaignNotes !== undefined) setMarketingNotes(d.campaignNotes)
    if (d.logoFile?.name) setLogoFile(d.logoFile)
    if (d.brandKit?.name) setBrandKit(d.brandKit)
  }, [])

  useEffect(() => {
    let active = true
    fetchBrandGuidelines()
      .then(data => { if (active && data?.details) applyDetails(data.details) })
      .catch(() => {})
    return () => { active = false }
  }, [applyDetails])

  const handleSave = async () => {
    setRequestSubmitted(false)
    try {
      await saveBrandGuidelines(buildDetails())
      setRequestMessage('Brand guidelines saved to the database and are ready to share with your marketing team.')
    } catch (error) {
      setRequestMessage(error.response?.data?.detail || 'Could not save brand guidelines.')
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleSubmitRequest = async () => {
    try {
      await submitWorkRequest(buildDetails())
      setRequestSubmitted(true)
      setSaved(true)
      setRequestMessage('Brand guidelines submitted to your assigned marketing team. They can review it from their Brand Guidelines workspace.')
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      setRequestSubmitted(false)
      setRequestMessage(error.response?.data?.detail || 'Could not submit the brand guidelines. Assign a marketing team first.')
    }
  }

  const INDUSTRIES = ['Technology', 'E-Commerce', 'Retail', 'Healthcare', 'Finance', 'Media & Entertainment', 'Education', 'Food & Beverage', 'Fashion', 'Other']

  return (
    <div className="p-4 sm:p-6 max-w-[900px] mx-auto">
      <PageHeader
        title="Brand Guidelines"
        subtitle="Define how your brand should be represented on social media."
        actions={
          <button onClick={handleSave}
            className="flex items-center gap-2 px-5 h-9 rounded-[var(--r-md)] text-sm font-semibold text-white transition-all hover:brightness-105"
            style={{ background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
            {saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save & Update</>}
          </button>
        }
      />

      {requestMessage && (
        <div className="mb-6 rounded-[var(--r-md)] border px-4 py-3 text-sm font-medium" style={{ background: requestSubmitted ? 'rgba(34,197,94,.10)' : 'rgba(79,70,229,.08)', borderColor: requestSubmitted ? 'rgba(34,197,94,.20)' : 'rgba(79,70,229,.20)', color: requestSubmitted ? '#15803D' : '#4F46E5' }}>
          {requestMessage}
        </div>
      )}

      <div className="flex flex-col gap-5">

        {/* 1 — Company Information */}
        <Section icon={Building2} title="Company Information" color="#1E3A8A" bg="rgba(30,58,138,.10)">
          <div className="flex flex-col gap-4">
            <Field label="Company Name">
              <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Enter your company name" className={inputCls} style={inputSty} />
            </Field>
            <Field label="Company Description">
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={3} placeholder="Describe your company, mission, and what makes you unique…"
                className="w-full px-4 py-3 text-sm rounded-[var(--r-md)] border outline-none resize-none"
                style={inputSty} />
            </Field>
            <Field label="Industry">
              <select value={industry} onChange={e => setIndustry(e.target.value)} className={inputCls} style={inputSty}>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* 2 — Brand Identity */}
        <Section icon={Palette} title="Brand Identity" color="#4F46E5" bg="rgba(79,70,229,.10)">
          <div className="flex flex-col gap-4">
            <Field label="Brand Voice — Select all that apply">
              <MultiSelect options={VOICE_OPTIONS} selected={brandVoice} onToggle={v => toggle(brandVoice, setBrandVoice, v)} />
            </Field>
            <Field label="Brand Colors">
              <ColorPicker colors={brandColors} onChange={setBrandColors} />
              <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-subtle)' }}>Click + to add a color · Hover a color to remove it</p>
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <FileUploadBox label="Logo Upload" accept="image/*" file={logoFile} onChange={setLogoFile} />
              <FileUploadBox label="Brand Kit Upload" accept=".pdf,.zip,.ai,.psd,image/*" file={brandKit} onChange={setBrandKit} />
            </div>
          </div>
        </Section>

        {/* 3 — Target Audience */}
        <Section icon={Users} title="Target Audience" color="#22C55E" bg="rgba(34,197,94,.10)">
          <div className="flex flex-col gap-4">
            <Field label="Age Groups">
              <MultiSelect options={AGE_GROUPS} selected={ageGroups} onToggle={v => toggle(ageGroups, setAgeGroups, v)} />
            </Field>
            <Field label="Locations (press Enter or click + to add)">
              <ListEditor items={locations} onAdd={v => addToList(setLocations, v)} onRemove={i => removeFromList(setLocations, i)} placeholder="e.g. United States, UK, India" />
            </Field>
            <Field label="Interests (press Enter or click + to add)">
              <ListEditor items={interests} onAdd={v => addToList(setInterests, v)} onRemove={i => removeFromList(setInterests, i)} placeholder="e.g. Technology, Fitness, Fashion" />
            </Field>
          </div>
        </Section>

        {/* 4 — Content Preferences */}
        <Section icon={Settings2} title="Content Preferences" color="#F59E0B" bg="rgba(245,158,11,.10)">
          <div className="flex flex-col gap-4">
            <Field label="Preferred Platforms">
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => {
                  const Icon = p.icon; const on = platforms.includes(p.id)
                  return (
                    <button key={p.id} type="button" onClick={() => toggle(platforms, setPlatforms, p.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                      style={{ background: on ? `${p.color}15` : 'var(--card)', borderColor: on ? p.color : 'var(--border)', color: on ? p.color : 'var(--text-muted)' }}>
                      <Icon size={12} />{p.label}
                    </button>
                  )
                })}
              </div>
            </Field>
            <Field label="Preferred Content Types">
              <MultiSelect options={CONTENT_TYPES} selected={contentTypes} onToggle={v => toggle(contentTypes, setContentTypes, v)} />
            </Field>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Preferred Languages">
                <select value={languages[0]} onChange={e => setLanguages([e.target.value])} className={inputCls} style={inputSty}>
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Posting Frequency">
                <select value={frequency} onChange={e => setFrequency(e.target.value)} className={inputCls} style={inputSty}>
                  <option value="">Select…</option>
                  {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Preferred Posting Time">
                <select value={postingTime} onChange={e => setPostingTime(e.target.value)} className={inputCls} style={inputSty}>
                  <option value="">Select…</option>
                  {TIMES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
          </div>
        </Section>

        {/* 5 — Content Goals */}
        <Section icon={Target} title="Content Goals" color="#E1306C" bg="rgba(225,48,108,.10)">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { key: 'brandAwareness',     label: 'Brand Awareness'     },
              { key: 'productPromotion',   label: 'Product Promotion'   },
              { key: 'sales',              label: 'Sales'               },
              { key: 'leadGeneration',     label: 'Lead Generation'     },
              { key: 'customerEngagement', label: 'Customer Engagement' },
            ].map(g => (
              <label key={g.key} className="flex items-center gap-3 p-3 rounded-[var(--r-md)] cursor-pointer transition-all hover:bg-[var(--bg-alt)]"
                style={{ background: goals[g.key] ? 'rgba(30,58,138,.08)' : 'var(--card)', border: `1px solid ${goals[g.key] ? '#1E3A8A' : 'var(--border)'}` }}>
                <input type="checkbox" checked={goals[g.key]} onChange={e => setGoals(prev => ({ ...prev, [g.key]: e.target.checked }))}
                  className="w-4 h-4 rounded flex-shrink-0" style={{ accentColor: '#1E3A8A' }} />
                <span className="text-sm font-medium" style={{ color: goals[g.key] ? '#1E3A8A' : 'var(--text)' }}>{g.label}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* 6 — Writing Preferences */}
        <Section icon={PenSquare} title="Writing Preferences" color="#0A66C2" bg="rgba(10,102,194,.10)">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Caption Style">
              <select value={captionStyle} onChange={e => setCaptionStyle(e.target.value)} className={inputCls} style={inputSty}>
                <option value="">Select…</option>
                {CAPTION_STYLES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Hashtag Preferences">
              <select value={hashtagPref} onChange={e => setHashtagPref(e.target.value)} className={inputCls} style={inputSty}>
                <option value="">Select…</option>
                {HASHTAG_PREFS.map(h => <option key={h}>{h}</option>)}
              </select>
            </Field>
            <Field label="CTA Style">
              <select value={ctaStyle} onChange={e => setCtaStyle(e.target.value)} className={inputCls} style={inputSty}>
                <option value="">Select…</option>
                {CTA_STYLES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* 7 — Do's */}
        <Section icon={ThumbsUp} title="Do's" color="#22C55E" bg="rgba(34,197,94,.10)">
          <ListEditor items={dos} onAdd={v => addToList(setDos, v)} onRemove={i => removeFromList(setDos, i)} placeholder="e.g. Use positive language, Always credit sources…" />
        </Section>

        {/* 8 — Don'ts */}
        <Section icon={ThumbsDown} title="Don'ts" color="#EF4444" bg="rgba(239,68,68,.10)">
          <ListEditor items={donts} onAdd={v => addToList(setDonts, v)} onRemove={i => removeFromList(setDonts, i)} placeholder="e.g. Avoid political topics, Don't use competitor names…" />
        </Section>

        {/* 9 — Reference Links */}
        <Section icon={Link} title="Reference Links" color="#374151" bg="rgba(55,65,81,.10)">
          <div className="flex flex-col gap-4">
            <Field label="Competitor Pages">
              <ListEditor items={competitors} onAdd={v => addToList(setCompetitors, v)} onRemove={i => removeFromList(setCompetitors, i)} placeholder="https://competitor.com/social-page" />
            </Field>
            <Field label="Inspiration Links">
              <ListEditor items={inspirations} onAdd={v => addToList(setInspirations, v)} onRemove={i => removeFromList(setInspirations, i)} placeholder="https://brand-you-love.com/instagram" />
            </Field>
          </div>
        </Section>

        {/* 10 — Campaign Request */}
        <Section icon={Target} title="Campaign Request" color="#E1306C" bg="rgba(225,48,108,.10)">
          <div className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Campaign Name">
                <input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="e.g. Summer Launch" className={inputCls} style={inputSty} />
              </Field>
              <Field label="Campaign Objective">
                <input value={campaignObjective} onChange={e => setCampaignObjective(e.target.value)} placeholder="e.g. Brand awareness and leads" className={inputCls} style={inputSty} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Budget">
                <input value={campaignBudget} onChange={e => setCampaignBudget(e.target.value)} placeholder="$3,500" className={inputCls} style={inputSty} />
              </Field>
              <Field label="Duration">
                <input value={campaignDuration} onChange={e => setCampaignDuration(e.target.value)} placeholder="45 days" className={inputCls} style={inputSty} />
              </Field>
              <Field label="Expected Posts">
                <input value={expectedPosts} onChange={e => setExpectedPosts(e.target.value)} placeholder="12" className={inputCls} style={inputSty} />
              </Field>
            </div>
            <Field label="Campaign Platforms">
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => {
                  const Icon = p.icon
                  const on = campaignPlatforms.includes(p.id)
                  return (
                    <button key={p.id} type="button" onClick={() => toggle(campaignPlatforms, setCampaignPlatforms, p.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all" style={{ background: on ? `${p.color}15` : 'var(--card)', borderColor: on ? p.color : 'var(--border)', color: on ? p.color : 'var(--text-muted)' }}>
                      <Icon size={12} />{p.label}
                    </button>
                  )
                })}
              </div>
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Priority">
                <select value={priority} onChange={e => setPriority(e.target.value)} className={inputCls} style={inputSty}>
                  {['High', 'Medium', 'Low'].map(option => <option key={option}>{option}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Marketing Notes">
              <textarea value={marketingNotes} onChange={e => setMarketingNotes(e.target.value)} rows={3} placeholder="Share your goals, important milestones, or notes for the team…" className="w-full px-4 py-3 text-sm rounded-[var(--r-md)] border outline-none resize-none" style={inputSty} />
            </Field>
          </div>
        </Section>

        {/* 11 — Additional Instructions */}
        <Section icon={BookOpen} title="Additional Instructions" color="#1E3A8A" bg="rgba(30,58,138,.10)">
          <textarea value={additional} onChange={e => setAdditional(e.target.value)}
            rows={4} placeholder="Any additional instructions, guidelines or preferences for your marketing team…"
            className="w-full px-4 py-3 text-sm rounded-[var(--r-md)] border outline-none resize-none"
            style={inputSty} />
        </Section>

        {/* Save / submit buttons (bottom) */}
        <div className="flex flex-wrap justify-end gap-3 pb-4">
          <button onClick={handleSave}
            className="flex items-center gap-2 px-6 h-11 rounded-[var(--r-md)] text-sm font-semibold text-white transition-all hover:brightness-105"
            style={{ background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
            {saved ? <><CheckCircle2 size={16} /> Saved Successfully!</> : <><Save size={16} /> Save & Update</>}
          </button>
          <button onClick={handleSubmitRequest}
            className="flex items-center gap-2 px-6 h-11 rounded-[var(--r-md)] text-sm font-semibold text-white transition-all hover:brightness-105"
            style={{ background: 'linear-gradient(135deg,#E1306C,#F43F5E)' }}>
            <Upload size={16} /> Submit to Marketing Team
          </button>
        </div>
      </div>
    </div>
  )
}
