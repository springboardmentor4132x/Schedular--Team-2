import { motion } from 'framer-motion'
import {
  Users, FileText, Clock, CheckCircle2,
  Send, Megaphone, TrendingUp, Eye,
  AlertCircle, User, Calendar, Activity,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatCard    from '../../../components/dashboard/StatCard'
import { MOCK_MARKETING_TEAMS, MOCK_CAMPAIGNS, MOCK_SCHEDULED_POSTS, MOCK_PUBLISHED_POSTS } from '../../../services/mockData'

/* ── Mock team data ────────────────────────────────────────────── */
const ASSIGNED_TEAM = MOCK_MARKETING_TEAMS.find(t => t.isAssigned) ?? MOCK_MARKETING_TEAMS[0]

const TEAM_MEMBERS = [
  { name: 'Sarah Chen',  role: 'Manager',          avatar: 'SC', status: 'active'    },
  { name: 'James Park',  role: 'Content Writer',    avatar: 'JP', status: 'active'    },
  { name: 'Priya Nair',  role: 'Social Strategist', avatar: 'PN', status: 'active'    },
  { name: 'Marcus Webb', role: 'Graphic Designer',  avatar: 'MW', status: 'away'      },
]

const PLATFORM_META = {
  instagram: { icon: FaInstagram, color: '#E1306C' },
  facebook:  { icon: FaFacebook,  color: '#1877F2' },
  linkedin:  { icon: FaLinkedin,  color: '#0A66C2' },
  x:         { icon: FaXTwitter,  color: '#374151' },
}

const STATUS_STYLES = {
  draft:            { label: 'Draft',            color: '#64748B', bg: 'rgba(100,116,139,.12)' },
  review:           { label: 'In Review',        color: '#4F46E5', bg: 'rgba(79,70,229,.12)'  },
  pending_approval: { label: 'Pending Approval', color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
  scheduled:        { label: 'Scheduled',        color: '#1E3A8A', bg: 'rgba(30,58,138,.12)'  },
  published:        { label: 'Published',        color: '#22C55E', bg: 'rgba(34,197,94,.12)'  },
  failed:           { label: 'Failed',           color: '#EF4444', bg: 'rgba(239,68,68,.12)'  },
}

/* ── Content assignment mock data ──────────────────────────────── */
const CONTENT_ASSIGNMENTS = [
  { id:1,  title:'Summer Sale Kick-off',       assignedTo:'James Park',  status:'published',        campaign:'Summer Sale 2025',  scheduledDate:'Jul 20, 2025', platform:'instagram' },
  { id:2,  title:'LinkedIn Thought Leadership', assignedTo:'Priya Nair',  status:'published',        campaign:null,               scheduledDate:'Jul 20, 2025', platform:'linkedin'  },
  { id:3,  title:'Product Teaser Video',        assignedTo:'Marcus Webb', status:'scheduled',        campaign:'Product Launch Q3', scheduledDate:'Jul 25, 2025', platform:'instagram' },
  { id:4,  title:'Facebook Campaign Ad',        assignedTo:'James Park',  status:'scheduled',        campaign:'Brand Awareness',  scheduledDate:'Jul 25, 2025', platform:'facebook'  },
  { id:5,  title:'Customer Spotlight',          assignedTo:'James Park',  status:'review',           campaign:null,               scheduledDate:'Jul 28, 2025', platform:'facebook'  },
  { id:6,  title:'X Thread Recap',              assignedTo:'Priya Nair',  status:'draft',            campaign:null,               scheduledDate:'Jul 26, 2025', platform:'x'         },
  { id:7,  title:'Weekly Tips Carousel',        assignedTo:'Marcus Webb', status:'pending_approval', campaign:'Summer Sale 2025',  scheduledDate:'Jul 28, 2025', platform:'instagram' },
  { id:8,  title:'X Contest Post',              assignedTo:'James Park',  status:'published',        campaign:'Brand Awareness',  scheduledDate:'Jul 13, 2025', platform:'x'         },
  { id:9,  title:'Q3 Investor Blog Share',      assignedTo:'Priya Nair',  status:'scheduled',        campaign:null,               scheduledDate:'Jul 24, 2025', platform:'linkedin'  },
  { id:10, title:'Monday Motivation Post',      assignedTo:'James Park',  status:'draft',            campaign:null,               scheduledDate:'Jul 28, 2025', platform:'x'         },
]

/* ── Activity Timeline ─────────────────────────────────────────── */
const TIMELINE = [
  { id:1,  type:'published',  icon:CheckCircle2, iconColor:'#22C55E', iconBg:'rgba(34,197,94,.10)',   text:'Summer Sale Kick-off published to Instagram',      actor:'James Park',  time:'Today 10:02 AM'  },
  { id:2,  type:'published',  icon:CheckCircle2, iconColor:'#22C55E', iconBg:'rgba(34,197,94,.10)',   text:'LinkedIn Thought Post published successfully',      actor:'Priya Nair',  time:'Today 9:05 AM'   },
  { id:3,  type:'review',     icon:Clock,        iconColor:'#4F46E5', iconBg:'rgba(79,70,229,.10)',   text:'Customer Spotlight submitted for review',          actor:'James Park',  time:'Yesterday 4:30 PM'},
  { id:4,  type:'scheduled',  icon:Calendar,     iconColor:'#1E3A8A', iconBg:'rgba(30,58,138,.10)',   text:'Product Teaser Video scheduled for Jul 25',        actor:'Marcus Webb', time:'Yesterday 2:00 PM'},
  { id:5,  type:'approval',   icon:AlertCircle,  iconColor:'#F59E0B', iconBg:'rgba(245,158,11,.10)',  text:'Weekly Tips Carousel awaiting your approval',      actor:'Marcus Webb', time:'Yesterday 11:00 AM'},
  { id:6,  type:'draft',      icon:FileText,     iconColor:'#64748B', iconBg:'rgba(100,116,139,.10)', text:'X Thread Recap draft saved',                       actor:'Priya Nair',  time:'Jul 21, 3:15 PM'  },
  { id:7,  type:'campaign',   icon:Megaphone,    iconColor:'#E1306C', iconBg:'rgba(225,48,108,.10)',  text:'Summer Sale 2025 campaign reached 68% progress',   actor:'Sarah Chen',  time:'Jul 20, 5:00 PM'  },
  { id:8,  type:'published',  icon:CheckCircle2, iconColor:'#22C55E', iconBg:'rgba(34,197,94,.10)',   text:'X Contest Post published to X',                    actor:'James Park',  time:'Jul 13, 10:00 AM' },
]

/* ── Main ──────────────────────────────────────────────────────── */
export default function MarketingActivity() {
  const activeCampaigns    = MOCK_CAMPAIGNS.filter(c => c.status === 'active')
  const completedCampaigns = MOCK_CAMPAIGNS.filter(c => c.status === 'completed')
  const draftPosts         = CONTENT_ASSIGNMENTS.filter(c => c.status === 'draft').length
  const reviewPosts        = CONTENT_ASSIGNMENTS.filter(c => c.status === 'review' || c.status === 'pending_approval').length
  const scheduledPosts     = CONTENT_ASSIGNMENTS.filter(c => c.status === 'scheduled').length
  const publishedPosts     = CONTENT_ASSIGNMENTS.filter(c => c.status === 'published').length

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Marketing Activity"
        subtitle="Monitor all activity from your assigned marketing team. View-only."
      />

      {/* ── Section 1: Team Information ── */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.3 }} className="card p-5 mb-4">
        <h2 className="text-sm font-bold mb-4" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'var(--text)' }}>
          Assigned Marketing Team
        </h2>
        <div className="flex items-start gap-5 flex-wrap">
          {/* Team card */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-base font-bold"
              style={{ background: ASSIGNED_TEAM.logoColor }}>
              {ASSIGNED_TEAM.logo}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color:'var(--text)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                {ASSIGNED_TEAM.name}
              </p>
              <p className="text-xs" style={{ color:'var(--text-muted)' }}>{ASSIGNED_TEAM.location}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background:'#22C55E' }} />
                <span className="text-[10px] font-semibold" style={{ color:'#22C55E' }}>Active</span>
                <span className="text-[10px]" style={{ color:'var(--text-subtle)' }}>· Last activity: 2 min ago</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch hidden sm:block" style={{ background:'var(--border)' }} />

          {/* Team members */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold mb-2" style={{ color:'var(--text-muted)' }}>Team Members</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TEAM_MEMBERS.map(m => (
                <div key={m.name} className="flex items-center gap-2 px-2.5 py-2 rounded-[var(--r-md)]"
                  style={{ background:'var(--bg-alt)', border:'1px solid var(--border)' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                    {m.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color:'var(--text)' }}>{m.name}</p>
                    <p className="text-[10px] truncate" style={{ color:'var(--text-subtle)' }}>{m.role}</p>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: m.status === 'active' ? '#22C55E' : '#F59E0B' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 2: Content Pipeline KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard title="Draft Posts"        value={draftPosts}    icon={FileText}     iconColor="#64748B" iconBg="rgba(100,116,139,.12)" index={0} />
        <StatCard title="Posts Under Review" value={reviewPosts}   icon={Clock}        iconColor="#4F46E5" iconBg="rgba(79,70,229,.10)"  index={1} />
        <StatCard title="Scheduled Posts"    value={scheduledPosts}icon={Calendar}     iconColor="#1E3A8A" iconBg="rgba(30,58,138,.12)"  trend={5} index={2} />
        <StatCard title="Published Posts"    value={publishedPosts} icon={CheckCircle2} iconColor="#22C55E" iconBg="rgba(34,197,94,.12)"  trend={8} index={3} />
      </div>

      {/* ── Section 3: Content Assignment Table ── */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.3, delay:0.1 }} className="card overflow-hidden mb-4">
        <div className="px-5 py-4 border-b" style={{ borderColor:'var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'var(--text)' }}>
            Content Assignment
          </h2>
          <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>All content items and their current status across team members</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background:'var(--bg-alt)', borderBottom:'1px solid var(--border)' }}>
                {['Content Title', 'Assigned To', 'Platform', 'Status', 'Campaign', 'Scheduled Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap"
                    style={{ color:'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONTENT_ASSIGNMENTS.map((item, i) => {
                const pmeta = PLATFORM_META[item.platform]; const PIcon = pmeta?.icon
                const st    = STATUS_STYLES[item.status] ?? STATUS_STYLES.draft
                return (
                  <motion.tr key={item.id}
                    initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i * 0.02 }}
                    className="hover:bg-[var(--bg-alt)] transition-colors"
                    style={{ borderBottom:'1px solid var(--border)' }}>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="font-semibold text-sm truncate" style={{ color:'var(--text)' }}>{item.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                          style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
                          {item.assignedTo.split(' ').map(w => w[0]).join('').slice(0,2)}
                        </div>
                        <span className="text-xs whitespace-nowrap" style={{ color:'var(--text-muted)' }}>{item.assignedTo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {PIcon && (
                        <div className="flex items-center gap-1.5">
                          <PIcon size={13} style={{ color:pmeta.color }} />
                          <span className="text-xs capitalize" style={{ color:'var(--text-muted)' }}>{item.platform}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background:st.bg, color:st.color }}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color:'var(--text-muted)' }}>
                      {item.campaign
                        ? <span className="px-2 py-0.5 rounded-full" style={{ background:'rgba(79,70,229,.10)', color:'#4F46E5' }}>{item.campaign}</span>
                        : <span style={{ color:'var(--text-subtle)' }}>—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color:'var(--text-muted)' }}>
                      {item.scheduledDate}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Section 4 & 5: Campaign Summary + Timeline ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Campaign Summary */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.3, delay:0.15 }} className="card p-5">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'var(--text)' }}>
            Campaign Summary
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-[var(--r-md)] text-center" style={{ background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.20)' }}>
              <p className="text-2xl font-extrabold" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'#22C55E' }}>{activeCampaigns.length}</p>
              <p className="text-[10px] mt-0.5" style={{ color:'var(--text-muted)' }}>Active</p>
            </div>
            <div className="p-3 rounded-[var(--r-md)] text-center" style={{ background:'var(--bg-alt)', border:'1px solid var(--border)' }}>
              <p className="text-2xl font-extrabold" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'#64748B' }}>{completedCampaigns.length}</p>
              <p className="text-[10px] mt-0.5" style={{ color:'var(--text-muted)' }}>Completed</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {activeCampaigns.map(c => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate" style={{ color:'var(--text)' }}>{c.name}</span>
                  <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color:'var(--primary)' }}>{c.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background:'var(--bg-alt)' }}>
                  <div className="h-1.5 rounded-full transition-all"
                    style={{ width:`${c.progress}%`, background:'linear-gradient(90deg,#1E3A8A,#4F46E5)' }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity Timeline */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.3, delay:0.2 }} className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'var(--text)' }}>
            Recent Activity Timeline
          </h2>
          <div className="flex flex-col">
            {TIMELINE.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div key={item.id}
                  initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                  transition={{ duration:0.2, delay:i * 0.04 }}
                  className="flex items-start gap-3 pb-4 relative">
                  {/* Vertical connector */}
                  {i < TIMELINE.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-px" style={{ background:'var(--border)' }} />
                  )}
                  {/* Icon bubble */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                    style={{ background:item.iconBg }}>
                    <Icon size={14} style={{ color:item.iconColor }} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm" style={{ color:'var(--text)' }}>{item.text}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-semibold" style={{ color:'var(--text-muted)' }}>{item.actor}</span>
                      <span style={{ color:'var(--border)' }}>·</span>
                      <span className="text-[11px]" style={{ color:'var(--text-subtle)' }}>{item.time}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
