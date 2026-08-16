import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft, ChevronRight,
  Clock, ArrowLeft, Users,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import { useAppState } from '../../../context/AppStateContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { MOCK_CLIENT_POSTS } from '../../../services/mockData'

const PLATFORM_META = {
  instagram:{ icon:FaInstagram, color:'#E1306C', label:'Instagram' },
  facebook: { icon:FaFacebook,  color:'#1877F2', label:'Facebook'  },
  linkedin: { icon:FaLinkedin,  color:'#0A66C2', label:'LinkedIn'  },
  x:        { icon:FaXTwitter,  color:'#374151', label:'X'         },
  youtube:  { icon:FaYoutube,   color:'#FF0000', label:'YouTube'   },
  pinterest:{ icon:FaPinterest, color:'#E60023', label:'Pinterest' },
}
const STATUS_COLORS = {
  scheduled:{ bg:'rgba(30,58,138,.12)',  text:'#1E3A8A' },
  pending:  { bg:'rgba(245,158,11,.12)', text:'#F59E0B' },
  published:{ bg:'rgba(34,197,94,.12)',  text:'#22C55E' },
}
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS_FULL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const DAYS_SHORT=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
function isoDate(y,m,d){return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`}

export default function PublishingCalendar() {
  const navigate = useNavigate()
  const { activeClient } = useClient()
  const now=new Date()
  const [view,       setView]      = useState('month')
  const [year,       setYear]      = useState(now.getFullYear())
  const [month,      setMonth]     = useState(now.getMonth())
  const [selected,   setSelected]  = useState(null)
  const [platform,   setPlatform]  = useState('all')
  const [loading,    setLoading]   = useState(false)

  if (!activeClient) {
    return <div className="p-6"><div className="card">
      <EmptyState icon={Users} title="No client selected" message="Select a client first."
        action={{ label:'View Clients', onClick:()=>navigate('/dashboard/mkt/clients') }} />
    </div></div>
  }

  const [libraryItems, setLibraryItems] = useState([])
  const { getQueueItems } = useAppState()

  useEffect(() => {
    if (!activeClient) { setLibraryItems([]); return }
    // Get posts from shared queue + mock data
    const sharedItems = getQueueItems(activeClient.id)
    const posts = MOCK_CLIENT_POSTS[activeClient.id] ?? { scheduled:[], published:[] }
    const mockItems = [
      ...posts.scheduled.map(p => ({ ...p, status: p.status || 'scheduled' })),
      ...posts.published.map(p => ({ ...p, status: 'published' })),
    ]
    // Merge, deduplicate by id
    const merged = [...sharedItems]
    mockItems.forEach(m => { if (!merged.find(q => q.id === m.id)) merged.push(m) })
    setLibraryItems(merged)
  }, [activeClient, getQueueItems])

  const allPosts = libraryItems
    .filter(item => ['scheduled','published'].includes(item.status))
    .map(item => ({ ...item, status: item.status || 'scheduled' }))

  const filteredPosts = platform==='all' ? allPosts : allPosts.filter(p=>p.platform===platform)

  const prevMonth=()=>{ if(month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1) }
  const nextMonth=()=>{ if(month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1) }

  const firstDay=new Date(year,month,1).getDay()
  const daysInMonth=new Date(year,month+1,0).getDate()
  const todayStr=isoDate(now.getFullYear(),now.getMonth(),now.getDate())

  const cells=[]
  for(let i=0;i<firstDay;i++) cells.push(null)
  for(let d=1;d<=daysInMonth;d++) cells.push(d)

  // Weekly: get Mon–Sun for current week
  const weekStart=new Date()
  weekStart.setDate(weekStart.getDate()-weekStart.getDay())
  const weekDays=Array.from({length:7},(_,i)=>{ const d=new Date(weekStart); d.setDate(d.getDate()+i); return d })

  // Daily: today
  const todayPosts=filteredPosts.filter(p=>p.scheduledAt?.startsWith(todayStr)||p.publishedAt?.startsWith(todayStr))

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <button onClick={()=>navigate('/dashboard/mkt/workspace')}
        className="flex items-center gap-1.5 text-sm font-semibold mb-4 hover:underline" style={{ color:'var(--primary)' }}>
        <ArrowLeft size={15}/> Back to Workspace
      </button>

      <PageHeader
        title="Publishing Calendar"
        subtitle={`Calendar for: ${activeClient.name}`}
        actions={
          <div className="flex gap-2">
            {/* Platform filter */}
            <div className="flex gap-1.5 flex-wrap">
              {['all','instagram','facebook','linkedin','x','youtube','pinterest'].map(p=>{
                const meta=PLATFORM_META[p]; const Icon=meta?.icon; const active=platform===p
                return(
                  <button key={p} onClick={()=>setPlatform(p)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all"
                    style={{ background:active?(meta?`${meta.color}15`:'var(--primary-light)'):'var(--card)', borderColor:active?(meta?.color??'var(--primary)'):'var(--border)', color:active?(meta?.color??'var(--primary)'):'var(--text-muted)' }}>
                    {Icon&&<Icon size={11}/>}{p==='all'?'All':null}
                  </button>
                )
              })}
            </div>
            {/* View tabs */}
            <div className="flex gap-1 p-1 rounded-[var(--r-md)]" style={{ background:'var(--card)', border:'1px solid var(--border)' }}>
              {[['month','Month'],['week','Week'],['day','Day']].map(([v,l])=>(
                <button key={v} onClick={()=>setView(v)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background:view===v?'var(--primary)':'transparent', color:view===v?'#fff':'var(--text-muted)' }}>{l}</button>
              ))}
            </div>
          </div>
        }
      />
      {loading && (
        <div className="card p-6 text-center">
          <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>Loading calendar content…</p>
        </div>
      )}

      {/* Month nav (only for month/week) */}
      {view!=='day'&&(
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color:'var(--text-muted)' }}><ChevronLeft size={16}/></button>
          <h2 className="text-sm font-bold" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>
            {view==='week' ? `Week of ${weekDays[0].toLocaleDateString('en-US',{month:'long',day:'numeric'})}` : `${MONTHS[month]} ${year}`}
          </h2>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color:'var(--text-muted)' }}><ChevronRight size={16}/></button>
        </div>
      )}

      {/* MONTH VIEW */}
      {view==='month'&&(
        <div className="card p-5">
          <div className="grid grid-cols-7 mb-2">
            {DAYS_SHORT.map(d=><div key={d} className="text-center text-xs font-semibold py-1" style={{ color:'var(--text-subtle)' }}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day,i)=>{
              if(!day) return <div key={`e${i}`}/>
              const iso=isoDate(year,month,day)
              const dayPosts=filteredPosts.filter(p=>(p.scheduledAt||p.publishedAt||'').startsWith(iso))
              const isToday=iso===todayStr
              const isSel=selected===iso
              return(
                <motion.button key={iso} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    onClick={()=>{
                      // open selected day detail modal
                      setSelected(isSel?null:iso)
                    }}
                  className="min-h-[72px] p-1.5 rounded-[var(--r-sm)] text-left transition-colors"
                  style={{ background:isSel?'var(--primary-light)':isToday?'rgba(30,58,138,.06)':'var(--card)', border:`1.5px solid ${isSel?'var(--primary)':isToday?'var(--primary)':'var(--border)'}` }}>
                  <span className="text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full mb-1"
                    style={{ background:isToday?'var(--primary)':'transparent', color:isToday?'#fff':'var(--text)' }}>{day}</span>
                  <div className="flex flex-col gap-0.5">
                    {dayPosts.slice(0,2).map(p=>{
                      const meta=PLATFORM_META[p.platform]; const Icon=meta?.icon
                      return(
                        <div key={p.id} className="flex items-center gap-0.5 px-1 py-0.5 rounded" style={{ background:`${meta?.color}20` }}>
                          {Icon&&<Icon size={8} style={{ color:meta.color,flexShrink:0 }}/>}
                          <span className="text-[8px] truncate font-medium" style={{ color:meta?.color }}>{p.title}</span>
                        </div>
                      )
                    })}
                    {dayPosts.length>2&&<span className="text-[8px] pl-1" style={{ color:'var(--text-subtle)' }}>+{dayPosts.length-2}</span>}
                  </div>
                </motion.button>
              )
            })}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t" style={{ borderColor:'var(--border)' }}>
            {Object.entries(PLATFORM_META).map(([k,v])=>{
              const Icon=v.icon
              return(<div key={k} className="flex items-center gap-1.5 text-xs" style={{ color:'var(--text-muted)' }}><Icon size={11} style={{ color:v.color }}/>{v.label}</div>)
            })}
          </div>
          {/* Selected day detail modal */}
          {selected && (() => {
            const dayPosts = filteredPosts.filter(p => (p.scheduledAt || p.publishedAt || '').startsWith(selected))
            if (!dayPosts.length) return null
            return (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
                <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-[var(--r-xl)] border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted uppercase" style={{ color: 'var(--text-muted)' }}>Scheduled posts</p>
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{selected}</h3>
                    </div>
                    <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color: 'var(--text-muted)' }}>Close</button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {dayPosts.map(p => {
                      const meta = PLATFORM_META[p.platform]; const Icon = meta?.icon
                      const s = STATUS_COLORS[p.status ?? 'scheduled']
                      const dt = new Date(p.scheduledAt || p.publishedAt)
                      return (
                        <div key={p.id} className="flex items-center gap-3 p-3 rounded-[var(--r-md)]" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                          {Icon && <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${meta.color}15` }}><Icon size={16} style={{ color: meta.color }} /></div>}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{p.title}</p>
                            <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>{dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · {meta?.label}</p>
                            {p.campaign && <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Campaign: {p.campaign}</p>}
                          </div>
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0" style={{ background: s.bg, color: s.text }}>{p.status}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )
          })()}
        </div>
      )}

      {/* WEEK VIEW */}
      {view==='week'&&(
        <div className="card p-5 overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[600px]">
            {weekDays.map((d,i)=>{
              const iso=isoDate(d.getFullYear(),d.getMonth(),d.getDate())
              const dayPosts=filteredPosts.filter(p=>(p.scheduledAt||p.publishedAt||'').startsWith(iso))
              const isToday=iso===todayStr
              return(
                <div key={i} className="flex flex-col gap-1">
                  <div className="text-center py-2 rounded-t-lg" style={{ background:isToday?'var(--primary)':'var(--bg-alt)' }}>
                    <p className="text-[10px] font-semibold" style={{ color:isToday?'rgba(255,255,255,0.7)':'var(--text-subtle)' }}>{DAYS_SHORT[i]}</p>
                    <p className="text-sm font-bold" style={{ color:isToday?'#fff':'var(--text)' }}>{d.getDate()}</p>
                  </div>
                  <div className="flex flex-col gap-1 min-h-[120px] p-1 rounded-b-lg" style={{ background:'var(--bg-alt)', border:'1px solid var(--border)' }}>
                    {dayPosts.map(p=>{
                      const meta=PLATFORM_META[p.platform]; const Icon=meta?.icon
                      return(
                        <div key={p.id} className="flex items-center gap-1 px-1.5 py-1 rounded text-[9px] font-medium" style={{ background:`${meta?.color}20`, color:meta?.color }}>
                          {Icon&&<Icon size={9} style={{ flexShrink:0 }}/>}
                          <span className="truncate">{p.title}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {view==='day'&&(
        <div className="card p-5">
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", color:'var(--text)' }}>
            {now.toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'numeric', year:'numeric' })}
          </h2>
          {todayPosts.length===0
            ? <EmptyState icon={Clock} title="No posts today" message="Nothing scheduled for today." />
            : (
              <div className="flex flex-col gap-3">
                {todayPosts.map(p=>{
                  const meta=PLATFORM_META[p.platform]; const Icon=meta?.icon
                  const s=STATUS_COLORS[p.status??'scheduled']
                  const dt=new Date(p.scheduledAt||p.publishedAt)
                  return(
                    <div key={p.id} className="flex items-start gap-4 p-4 rounded-[var(--r-md)]" style={{ border:'1px solid var(--border)' }}>
                      <div className="text-center min-w-[48px] flex-shrink-0">
                        <p className="text-sm font-bold" style={{ color:'var(--text)' }}>{dt.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</p>
                      </div>
                      <div className="w-0.5 self-stretch rounded-full flex-shrink-0" style={{ background:meta?.color??'var(--border)' }}/>
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {Icon&&<div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:`${meta.color}15` }}>
                          <Icon size={15} style={{ color:meta.color }}/></div>}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>{p.title}</p>
                          <p className="text-xs" style={{ color:'var(--text-muted)' }}>{meta?.label}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background:s.bg, color:s.text }}>{p.status}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>
      )}
    </div>
  )
}
