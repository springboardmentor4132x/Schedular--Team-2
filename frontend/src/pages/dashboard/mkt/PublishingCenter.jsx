import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, RefreshCw, Trash2, CheckCircle2,
  XCircle, Clock, AlertTriangle, Plus,
  ArrowLeft, Users, Zap,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { contentApi } from '../../../services/contentApi'

const PLATFORM_META = {
  instagram:{ icon:FaInstagram, color:'#E1306C' },
  facebook: { icon:FaFacebook,  color:'#1877F2' },
  linkedin: { icon:FaLinkedin,  color:'#0A66C2' },
  x:        { icon:FaXTwitter,  color:'#374151' },
}

const STATUS_STYLES = {
  scheduled:        { icon:Clock,         color:'#1E3A8A', bg:'rgba(30,58,138,.12)',   label:'Scheduled'        },
  ready:            { icon:Zap,           color:'#22C55E', bg:'rgba(34,197,94,.12)',   label:'Ready'            },
  publishing:       { icon:RefreshCw,     color:'#F59E0B', bg:'rgba(245,158,11,.12)',  label:'Publishing'       },
  published:        { icon:CheckCircle2,  color:'#22C55E', bg:'rgba(34,197,94,.12)',   label:'Published'        },
  failed:           { icon:XCircle,       color:'#EF4444', bg:'rgba(239,68,68,.12)',   label:'Failed'           },
  pending_approval: { icon:AlertTriangle, color:'#F59E0B', bg:'rgba(245,158,11,.12)',  label:'Pending Approval' },
  cancelled:        { icon:XCircle,       color:'#64748B', bg:'rgba(100,116,139,.12)', label:'Cancelled'        },
}

const FILTERS=['all','scheduled','ready','published','failed','pending_approval','cancelled']

export function PublishingPanel() {
  const { activeClient } = useClient()
  const [queue,  setQueue]  = useState([])
  const [filter, setFilter] = useState('all')
  const [toast,  setToast]  = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!activeClient) return
    let mounted = true
    setLoading(true)
    contentApi.getLibraryByClient(activeClient.id)
      .then(items => { if (mounted) setQueue(items.filter(item => ['scheduled','ready','published','failed','pending_approval','cancelled'].includes(item.status))) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [activeClient])

  const filtered = filter === 'all' ? queue : queue.filter(q => q.status === filter)

  const showToast=(msg,type='success')=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3000) }
  const retryItem   = id => { setQueue(prev=>prev.map(q=>q.id===id?{...q,status:'scheduled',error:null}:q)); showToast('Retrying...') }
  const publishNow  = id => { setQueue(prev=>prev.map(q=>q.id===id?{...q,status:'published'}:q)); showToast('Published!') }
  const removeItem  = id => { setQueue(prev=>prev.filter(q=>q.id!==id)); showToast('Removed.') }
  const approveItem = id => { setQueue(prev=>prev.map(q=>q.id===id?{...q,status:'ready'}:q)); showToast('Approved!') }

  return (
    <>
      {toast&&(
        <AnimatePresence><motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-[var(--r-md)] text-sm font-semibold shadow-[var(--shadow-lg)]"
          style={{ background:toast.type==='error'?'rgba(239,68,68,.95)':'rgba(34,197,94,.95)', color:'#fff' }}>
          {toast.msg}
        </motion.div></AnimatePresence>
      )}

      {/* Info banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-md)] mb-5 text-xs font-medium"
        style={{ background:'rgba(30,58,138,.08)', border:'1px solid rgba(30,58,138,.20)', color:'#1E3A8A' }}>
        <Zap size={14} className="flex-shrink-0"/>
        Actual publishing to Facebook, Instagram, LinkedIn, X, YouTube and Pinterest will be handled by the backend API. Publishing Center shows status and queues.
      </div>

      {/* Summary placeholder - parent may render summaries */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        <div className="card p-3 text-center">No data</div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {FILTERS.map(s=>{
          const st=STATUS_STYLES[s]; const active=filter===s
          return(
            <button key={s} onClick={()=>setFilter(s)}
              className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
              style={{
                background:  active?(st?.bg??'var(--primary-light)'):'var(--card)',
                borderColor: active?(st?.color??'var(--primary)'):'var(--border)',
                color:       active?(st?.color??'var(--primary)'):'var(--text-muted)',
              }}>
              {s==='all'?'All':s==='pending_approval'?'Pending Approval':s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {filtered.map((item,i)=>{
            const meta=PLATFORM_META[item.platform]; const PIcon=meta?.icon
            const st=STATUS_STYLES[item.status]??STATUS_STYLES.scheduled; const SIcon=st.icon
            const dt=item.scheduledAt?new Date(item.scheduledAt):item.publishedAt?new Date(item.publishedAt):null
            return(
              <motion.div key={item.id}
                initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
                exit={{ opacity:0,x:-20 }} transition={{ duration:0.18,delay:i*0.03 }}
                className="card p-4 flex items-center gap-3"
                style={{
                  borderLeft: item.status==='failed'?'3px solid #EF4444':item.status==='ready'?'3px solid #22C55E':item.status==='pending_approval'?'3px solid #F59E0B':'3px solid transparent',
                }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                  style={{ background:'linear-gradient(135deg,var(--primary),var(--secondary))' }}>{i+1}</div>
                {PIcon&&<div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:`${meta.color}15` }}>
                  <PIcon size={15} style={{ color:meta.color }}/></div>}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color:'var(--text)' }}>{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {dt&&<span className="text-xs" style={{ color:'var(--text-subtle)' }}>{dt.toLocaleDateString('en-US',{month:'short',day:'numeric'})} · {dt.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</span>}
                    {item.error&&<span className="text-xs font-medium" style={{ color:'#EF4444' }}>{item.error}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <SIcon size={13} style={{ color:st.color }}/>
                  <span className="text-xs font-semibold hidden sm:block" style={{ color:st.color }}>{st.label}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {item.status==='ready'&&(
                    <button onClick={()=>publishNow(item.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={{ background:'rgba(34,197,94,.12)', color:'#22C55E', border:'1px solid rgba(34,197,94,.25)' }}>
                      <Send size={11}/> Publish Now
                    </button>
                  )}
                  {item.status==='pending_approval'&&(
                    <button onClick={()=>approveItem(item.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={{ background:'rgba(34,197,94,.12)', color:'#22C55E', border:'1px solid rgba(34,197,94,.25)' }}>
                      <CheckCircle2 size={11}/> Approve
                    </button>
                  )}
                  {item.status==='failed'&&(
                    <button onClick={()=>retryItem(item.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{ background:'rgba(245,158,11,.12)', color:'#F59E0B', border:'1px solid rgba(245,158,11,.25)' }}>
                      <RefreshCw size={11}/> Retry
                    </button>
                  )}
                  <button onClick={()=>removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color:'var(--error)' }}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </>
  )
}

export default function PublishingCenter() {
  const navigate = useNavigate()
  const { activeClient } = useClient()

  if (!activeClient) {
    return <div className="p-6"><div className="card">
      <EmptyState icon={Users} title="No client selected" message="Select a client first."
        action={{ label:'View Clients', onClick:() => navigate('/dashboard/mkt/clients') }} />
    </div></div>
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <button onClick={() => navigate('/dashboard/mkt/workspace')}
        className="flex items-center gap-1.5 text-sm font-semibold mb-4 hover:underline" style={{ color:'var(--primary)' }}>
        <ArrowLeft size={15}/> Back to Workspace
      </button>

      <PageHeader
        title="Publishing Center"
        subtitle={`Managing publishing for: ${activeClient.name}`}
        actions={
          <button onClick={() => navigate('/dashboard/mkt/content')}
            className="flex items-center gap-2 px-4 h-9 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105"
            style={{ background:'linear-gradient(135deg,#1E3A8A,#4F46E5)' }}>
            <Plus size={15}/> Add Content
          </button>
        }
      />

      <PublishingPanel />
    </div>
  )
}
