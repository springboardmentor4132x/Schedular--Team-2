import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Building2, CheckCircle2, Palette, Sparkles, Target, Users, X, CheckSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'

const FIELD_STYLE = {
  background: 'var(--bg-alt)',
  borderColor: 'var(--border)',
  color: 'var(--text)',
}

function Section({ title, children, icon: Icon }) {
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(30,58,138,.10)' }}>
          <Icon size={15} style={{ color: 'var(--primary)' }} />
        </div>
        <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{title}</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </motion.section>
  )
}

function Detail({ label, value }) {
  return (
    <div className="rounded-[var(--r-md)] border p-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-alt)' }}>
      <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{value || '—'}</p>
    </div>
  )
}

export default function MarketingBrandGuidelinesPage() {
  const navigate = useNavigate()
  const { activeClient } = useClient()
  const [decision, setDecision] = useState('approved')

  const request = useMemo(() => {
    if (!activeClient) return null
    const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('orbit-client-requests') ?? '[]') : []
    return stored.find(item => item.companyName?.toLowerCase() === activeClient.name?.toLowerCase()) ?? {
      companyName: activeClient.name,
      companyDescription: `${activeClient.name} is a growing business that relies on thoughtful social storytelling and consistent publishing.`,
      industry: activeClient.industry,
      brandVoice: 'Professional, inspiring, and conversational',
      targetAudience: 'B2B decision-makers and digital-savvy consumers',
      preferredLanguage: 'English',
      preferredPlatforms: activeClient.connectedPlatforms || ['instagram', 'facebook'],
      postingFrequency: '3–4x per week',
      preferredPostingTime: 'Morning (6–9 AM)',
      preferredContentTypes: ['Reels', 'Carousels', 'Stories'],
      brandColors: ['#1E3A8A', '#4F46E5'],
      captionStyle: 'Short and punchy',
      hashtagStyle: 'Mix of niche and branded hashtags',
      dos: ['Keep the tone consistent', 'Highlight customer outcomes'],
      donts: ['Avoid over-selling', 'Do not use outdated brand references'],
      additionalInstructions: 'Maintain a helpful and polished tone for all campaigns.',
      campaignRequired: true,
      campaignName: 'Growth Sprint',
      campaignObjective: 'Lead generation and engagement',
      campaignBudget: '$3,500',
      campaignDuration: '45 days',
      expectedNumberOfPosts: '12',
      campaignPlatforms: activeClient.connectedPlatforms || ['instagram', 'facebook'],
      marketingNotes: 'Prefer platform-native creative with strong first-frame hooks.',
      priority: 'High',
      submittedAt: 'Recently submitted',
    }
  }, [activeClient])

  if (!activeClient) {
    return (
      <div className="p-6">
        <div className="card">
          <EmptyState icon={Users} title="No client selected" message="Select a client first." action={{ label: 'View Clients', onClick: () => navigate('/dashboard/mkt/clients') }} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto">
      <button onClick={() => navigate('/dashboard/mkt/clients')} className="flex items-center gap-1.5 text-sm font-semibold mb-4 hover:underline" style={{ color: 'var(--primary)' }}>
        <ArrowLeft size={15} /> Back to Clients
      </button>
      <PageHeader title="Brand Guidelines" subtitle={`Review the latest brand brief for ${activeClient.name}`} />

      <div className="flex flex-wrap gap-2 mb-5">
        {['approved', 'rejected', 'request-changes'].map(option => {
          const label = option === 'request-changes' ? 'Request Changes' : option.charAt(0).toUpperCase() + option.slice(1)
          return (
            <button key={option} onClick={() => setDecision(option)} className="px-3 py-2 rounded-[var(--r-md)] border text-sm font-semibold" style={{ background: decision === option ? 'var(--primary)' : 'var(--card)', borderColor: decision === option ? 'var(--primary)' : 'var(--border)', color: decision === option ? '#fff' : 'var(--text-muted)' }}>
              {label}
            </button>
          )
        })}
      </div>

      <Section title="Company Overview" icon={Building2}>
        <Detail label="Company Description" value={request?.companyDescription} />
        <Detail label="Industry" value={request?.industry} />
        <Detail label="Preferred Language" value={request?.preferredLanguage} />
        <Detail label="Preferred Posting Time" value={request?.preferredPostingTime} />
        <Detail label="Submission Date" value={request?.submittedAt} />
      </Section>

      <Section title="Brand Identity" icon={Palette}>
        <Detail label="Brand Voice" value={request?.brandVoice} />
        <Detail label="Caption Style" value={request?.captionStyle} />
        <Detail label="Hashtag Style" value={request?.hashtagStyle} />
        <Detail label="Brand Colors" value={(request?.brandColors || []).join(', ')} />
      </Section>

      <Section title="Audience & Content" icon={Users}>
        <Detail label="Target Audience" value={request?.targetAudience} />
        <Detail label="Preferred Platforms" value={(request?.preferredPlatforms || []).join(', ')} />
        <Detail label="Posting Frequency" value={request?.postingFrequency} />
        <Detail label="Preferred Content Types" value={(request?.preferredContentTypes || []).join(', ')} />
      </Section>

      <Section title="Campaign Request" icon={Sparkles}>
        <Detail label="Campaign Required" value={request?.campaignRequired ? 'Yes' : 'No'} />
        <Detail label="Campaign Name" value={request?.campaignName} />
        <Detail label="Campaign Objective" value={request?.campaignObjective} />
        <Detail label="Campaign Budget" value={request?.campaignBudget} />
        <Detail label="Campaign Duration" value={request?.campaignDuration} />
        <Detail label="Expected Number of Posts" value={request?.expectedNumberOfPosts} />
        <Detail label="Campaign Platforms" value={(request?.campaignPlatforms || []).join(', ')} />
        <Detail label="Priority" value={request?.priority} />
        <Detail label="Marketing Notes" value={request?.marketingNotes} />
      </Section>

      <Section title="Content Guidance" icon={Target}>
        <Detail label="Do's" value={(request?.dos || []).join(' • ')} />
        <Detail label="Don'ts" value={(request?.donts || []).join(' • ')} />
        <Detail label="Additional Instructions" value={request?.additionalInstructions} />
      </Section>

      <div className="card p-5 mt-5 flex flex-wrap gap-3 justify-end">
        <button className="flex items-center gap-2 px-4 h-10 rounded-[var(--r-md)] border text-sm font-semibold" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          <X size={14} /> Reject
        </button>
        <button className="flex items-center gap-2 px-4 h-10 rounded-[var(--r-md)] border text-sm font-semibold" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          <CheckSquare size={14} /> Request Changes
        </button>
        <button className="flex items-center gap-2 px-4 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
          <CheckCircle2 size={14} /> Approve
        </button>
      </div>
    </div>
  )
}
