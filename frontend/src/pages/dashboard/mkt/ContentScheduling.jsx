import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, List, Search, Plus, Clock,
  CheckCircle2, X, RefreshCw, ArrowLeft, Users,
  GripVertical, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { MOCK_CLIENT_POSTS, MOCK_CLIENT_CAMPAIGNS } from '../../../services/mockData'

const PLATFORM_META = {
  instagram:{ icon:FaInstagram, color:'#E1306C', label:'Instagram' },
  facebook: { icon:FaFacebook,  color:'#1877F2', label:'Facebook'  },
  linkedin: { icon:FaLinkedin,  color:'#0A66C2', label:'LinkedIn'  },
  x:        { icon:FaXTwitter,  color:'#374151', label:'X'         },
  youtube:  { icon:FaYoutube,   color:'#FF0000', label:'YouTube'   },
  pinterest:{ icon:FaPinterest, color:'#E60023', label:'Pinterest' },
}
const STATUS_STYLES = {
  scheduled:{ label:'Scheduled', color:'#1E3A8A', bg:'rgba(30,58,138,.12)'  },
  pending:  { label:'Pending',   color:'#F59E0B', bg:'rgba(245,158,11,.12)' },
}
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
function isoDate(y,m,d){return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`}

export function SchedulingPanel() {
  const navigate = useNavigate()
  const { activeClient } = useClient()
  const [view,setView]=useState('list')
  const [search,setSearch]=useState('')
  const [platform,setPlatform]=useState('all')
  const [year,setYear]=useState(new Date().getFullYear())
  const [month,setMonth]=useState(new Date().getMonth())
  const [showModal,setShowModal]=useState(false)
  const [toast,setToast]=useState(null)
  const [form,setForm]=useState({ title:'', platform:'instagram', date:'', time:'', campaign:'', caption:'', mediaFile:null, mediaPreview:null })
  const [queue,setQueue]=useState([])

  const posts = activeClient ? (MOCK_CLIENT_POSTS[activeClient.id] ?? { scheduled: [] }) : { scheduled: [] }
  const campaigns = activeClient ? (MOCK_CLIENT_CAMPAIGNS[activeClient.id] ?? []) : []

  const filtered = queue.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
    const matchPlatform = platform === 'all' || p.platform === platform
    return matchSearch && matchPlatform
  })

  useEffect(() => {
    if (!activeClient) {
      setQueue([])
      return
    }
    setQueue(MOCK_CLIENT_POSTS[activeClient.id]?.scheduled ?? [])
  }, [activeClient])

  const showToast=(msg,type='success')=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const handleSchedule=()=>{
    if(!form.title||!form.date||!form.time){ showToast('Fill in all required fields.','error'); return }
    const newPost={
      id:`s${Date.now()}`,
      title:form.title,
      platform:form.platform,
      scheduledAt:`${form.date}T${form.time}`,
      status:'scheduled',
      campaign:form.campaign||null,
      caption:form.caption || '',
      media: form.mediaFile ? { type: form.mediaFile.type, name: form.mediaFile.name, preview: form.mediaPreview } : null,
    }
    setQueue(prev=>[...prev,newPost])
    setShowModal(false)
    setForm({ title:'', platform:'instagram', date:'', time:'', campaign:'', caption:'', mediaFile:null, mediaPreview:null })
    showToast('Post scheduled!')
  }

  const removePost=id=>{ setQueue(prev=>prev.filter(p=>p.id!==id)); showToast('Post removed.') }
  const selectMedia=(file)=>{
    if(!file) return
    const preview = URL.createObjectURL(file)
    setForm(p=>({ ...p, mediaFile:file, mediaPreview:preview }))
  }
  const removeMedia=()=> setForm(p=>({ ...p, mediaFile:null, mediaPreview:null }))

  const firstDay=new Date(year,month,1).getDay()
  const daysInMonth=new Date(year,month+1,0).getDate()
  const cells=[]
  for(let i=0;i<firstDay;i++) cells.push(null)
  for(let d=1;d<=daysInMonth;d++) cells.push(d)
  const todayStr=isoDate(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())

  const inputSty={ background:'var(--bg-alt)', borderColor:'var(--border)', color:'var(--text)' }
  const inputCls='w-full h-10 px-4 text-sm rounded-[var(--r-md)] border outline-none'

  return (
    <div className="space-y-5">
      {toast && (
        <AnimatePresence>
          <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-[var(--r-md)] text-sm font-semibold shadow-[var(--shadow-lg)]"
            style={{ background: toast.type==='error' ? 'rgba(239,68,68,.95)' : 'rgba(34,197,94,.95)', color:'#fff' }}>
            {toast.msg}
          </motion.div>
        </AnimatePresence>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-subtle)' }} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search queue…"
            className="w-full h-10 pl-9 pr-4 text-sm rounded-[var(--r-md)] border outline-none" style={inputSty} />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all','instagram','facebook','linkedin','x','youtube','pinterest'].map(p=>{
            const active=platform===p
            return (
              <button key={p} onClick={()=>setPlatform(p)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                style={{
                  background: active ? 'var(--bg-alt)' : 'var(--card)',
                  borderColor: active ? 'var(--primary)' : 'var(--border)',
                  color: active ? 'var(--text)' : 'var(--text-muted)',
                }}>
                {p==='all' ? 'All' : p}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="card p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Queue</p>
            <h2 className="text-lg font-bold" style={{ color:'var(--text)' }}>Scheduled Content</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={()=>setView('list')} className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
              style={{ background:view==='list'?'var(--primary)':'var(--card)', color:view==='list'?'#fff':'var(--text-muted)' }}>
              List
            </button>
            <button onClick={()=>setView('calendar')} className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
              style={{ background:view==='calendar'?'var(--primary)':'var(--card)', color:view==='calendar'?'#fff':'var(--text-muted)' }}>
              Calendar
            </button>
            <button onClick={()=>setShowModal(true)} className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold text-white"
              style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
              <Plus size={15}/> Schedule Post
            </button>
          </div>
        </div>

        {view === 'list' ? (
          filtered.length === 0 ? (
            <div className="card p-6">
              <EmptyState icon={CalendarDays} title="Queue is empty" message="Schedule a post to get started." />
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((post, index) => {
                const meta = PLATFORM_META[post.platform]
                const dt = new Date(post.scheduledAt)
                return (
                  <motion.div key={post.id} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:index*0.03 }}
                    className="card p-4 flex items-center gap-4">
                    <div className="text-[var(--text-subtle)] flex-shrink-0"><GripVertical size={16} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color:'var(--text)' }}>{post.title}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{dt.toLocaleDateString('en-US',{month:'short',day:'numeric'})} · {dt.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}{post.campaign ? ` · ${post.campaign}` : ''}</p>
                    </div>
                    <button onClick={()=>removePost(post.id)} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color:'var(--error)' }}>
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          )
        ) : (
          <div className="card p-5">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center text-xs font-semibold py-1" style={{ color:'var(--text-subtle)' }}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (!day) return <div key={`blank-${idx}`} />
                const iso = isoDate(year, month, day)
                const dayPosts = queue.filter(p => p.scheduledAt.startsWith(iso))
                const isToday = iso === todayStr
                return (
                  <div key={iso} className="min-h-[68px] p-1 rounded-[var(--r-sm)]" style={{ background:isToday?'rgba(30,58,138,.06)':'transparent', border:`1.5px solid ${isToday?'var(--primary)':'var(--border)'}` }}>
                    <div className="text-xs font-semibold mb-1 w-5 h-5 flex items-center justify-center rounded-full" style={{ background:isToday?'var(--primary)':'transparent', color:isToday?'#fff':'var(--text)' }}>{day}</div>
                    {dayPosts.slice(0,2).map(post => {
                      const meta = PLATFORM_META[post.platform]
                      return (
                        <div key={post.id} className="flex items-center gap-1 px-1 py-0.5 rounded mb-0.5" style={{ background:`${meta.color}20` }}>
                          <meta.icon size={9} style={{ color:meta.color, flexShrink:0 }} />
                          <span className="text-[9px] truncate font-medium" style={{ color:meta.color }}>{post.title}</span>
                        </div>
                      )
                    })}
                    {dayPosts.length > 2 && <div className="text-[9px] text-[var(--text-subtle)]">+{dayPosts.length - 2}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ scale:0.95,y:16 }} animate={{ scale:1,y:0 }} exit={{ scale:0.95 }}
              className="w-full max-w-md rounded-[var(--r-xl)] p-6 shadow-[var(--shadow-lg)]"
              style={{ background:'var(--card)', border:'1px solid var(--border)' }}
              onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold" style={{ color:'var(--text)' }}>Schedule Post</h2>
                <button onClick={()=>setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color:'var(--text-muted)' }}><X size={16} /></button>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Post Title *</label>
                  <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Post title" className={inputCls} style={inputSty} />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Platform *</label>
                  <select value={form.platform} onChange={e=>setForm(p=>({...p,platform:e.target.value}))} className={inputCls} style={inputSty}>
                    {Object.entries(PLATFORM_META).map(([id, meta]) => <option key={id} value={id}>{meta.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Date *</label>
                    <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} className={inputCls} style={inputSty} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Time *</label>
                    <input type="time" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} className={inputCls} style={inputSty} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Caption</label>
                  <textarea value={form.caption} onChange={e=>setForm(p=>({...p,caption:e.target.value}))}
                    rows={3} className="w-full px-4 py-3 text-sm rounded-[var(--r-md)] border outline-none resize-none transition-all" style={inputSty}
                    placeholder="Write a caption for this post..." />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color:'var(--text)' }}>Media</label>
                  <div className="rounded-[var(--r-md)] border border-dashed border-slate-500/40 bg-[var(--bg-alt)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-[var(--text-muted)]">Upload image, video or audio</div>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:brightness-110">
                        <input type="file" accept="image/*,video/*,audio/*" className="hidden" onChange={e=>selectMedia(e.target.files?.[0])} />
                        Choose file
                      </label>
                    </div>
                    {form.mediaPreview && (
                      <div className="mt-3 rounded-[var(--r-md)] border border-slate-600/40 bg-slate-950/10 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold" style={{ color:'var(--text)' }}>{form.mediaFile?.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{form.mediaFile?.type}</p>
                          </div>
                          <button type="button" onClick={removeMedia} className="text-sm font-semibold text-blue-500">Remove</button>
                        </div>
                        <div className="mt-3">
                          {form.mediaFile?.type.startsWith('image/') && (
                            <img src={form.mediaPreview} alt="Preview" className="w-full rounded-[var(--r-md)] object-cover" />
                          )}
                          {form.mediaFile?.type.startsWith('video/') && (
                            <video src={form.mediaPreview} controls className="w-full rounded-[var(--r-md)]" />
                          )}
                          {form.mediaFile?.type.startsWith('audio/') && (
                            <audio src={form.mediaPreview} controls className="w-full rounded-[var(--r-md)]" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={()=>setShowModal(false)} className="flex-1 h-10 rounded-[var(--r-md)] border text-sm font-semibold" style={{ background:'var(--card)', borderColor:'var(--border)', color:'var(--text)' }}>Cancel</button>
                  <button onClick={handleSchedule} className="flex-1 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105" style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>Schedule</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ContentScheduling() {
  const navigate = useNavigate()
  const { activeClient } = useClient()

  if (!activeClient) {
    return (
      <div className="p-6">
        <div className="card">
          <EmptyState icon={Users} title="No client selected" message="Select a client first."
            action={{ label:'View Clients', onClick:() => navigate('/dashboard/mkt/clients') }} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <button onClick={() => navigate('/dashboard/mkt/workspace')} className="flex items-center gap-1.5 text-sm font-semibold mb-4 hover:underline" style={{ color:'var(--primary)' }}>
        <ArrowLeft size={15} /> Back to Workspace
      </button>
      <PageHeader
        title="Content Scheduling"
        subtitle={`Scheduling for: ${activeClient.name}`}
      />
      <SchedulingPanel />
    </div>
  )
}
