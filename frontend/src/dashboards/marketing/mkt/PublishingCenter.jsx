import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, RefreshCw, Trash2, CheckCircle2,
  XCircle, Clock, Plus, Ban, FileText,
  ArrowLeft, Users,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../../context/ClientContext'
import { publishPost, deletePost, cancelPost } from '../../../services/postService'
import { retryPublishing } from '../../../services/publishingService'
import PageHeader from '../../../components/dashboard/PageHeader'
import EmptyState from '../../../components/dashboard/EmptyState'
import { contentApi } from '../../../services/contentApi'


const PLATFORM_META = {
  instagram:{ icon:FaInstagram, color:'#E1306C' },
  facebook: { icon:FaFacebook,  color:'#1877F2' },
  linkedin: { icon:FaLinkedin,  color:'#0A66C2' },
  x:        { icon:FaXTwitter,  color:'#374151' },
  youtube:  { icon:FaYoutube,   color:'#FF0000' },
  pinterest:{ icon:FaPinterest, color:'#E60023' },
}

// date/month (DD/MM) and 12-hour time, independent of browser locale.
const fmtDayMonth = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
const fmtTime = (d) => {
  let h = d.getHours()
  const ap = h >= 12 ? 'pm' : 'am'
  h = h % 12 || 12
  return `${String(h).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${ap}`
}

const STATUS_STYLES = {
  draft:            { icon:FileText,      color:'#64748B', bg:'rgba(100,116,139,.12)', label:'Draft'            },
  scheduled:        { icon:Clock,         color:'#1E3A8A', bg:'rgba(30,58,138,.12)',   label:'Scheduled'        },
  publishing:       { icon:RefreshCw,     color:'#F59E0B', bg:'rgba(245,158,11,.12)',  label:'Publishing'       },
  published:        { icon:CheckCircle2,  color:'#22C55E', bg:'rgba(34,197,94,.12)',   label:'Published'        },
  failed:           { icon:XCircle,       color:'#EF4444', bg:'rgba(239,68,68,.12)',   label:'Failed'           },
  cancelled:        { icon:XCircle,       color:'#64748B', bg:'rgba(100,116,139,.12)', label:'Cancelled'        },
}

const FILTERS=['all','draft','scheduled','published','failed','cancelled']
const QUEUE_STATUSES=['draft','scheduled','publishing','published','failed','cancelled']

export function PublishingPanel() {
  const { activeClient } = useClient()
  const [queue,  setQueue]  = useState([])
  const [filter, setFilter] = useState('all')
  const [toast,  setToast]  = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!activeClient) return
    let mounted = true
    contentApi.getLibraryByClient(activeClient.id)
      .then(items => { if (mounted) setQueue(items.filter(item => QUEUE_STATUSES.includes(item.status))) })
      .catch(() => { if (mounted) setQueue([]) })
    return () => { mounted = false }
  }, [activeClient])

  const filtered = filter === 'all' ? queue : queue.filter(q => q.status === filter)

  const summary=[
    { label:'Drafts',     value:queue.filter(q=>q.status==='draft').length,       color:'#64748B' },
    { label:'Scheduled',  value:queue.filter(q=>q.status==='scheduled').length,   color:'#1E3A8A' },
    { label:'Published',  value:queue.filter(q=>q.status==='published').length,   color:'#22C55E' },
    { label:'Failed',     value:queue.filter(q=>q.status==='failed').length,      color:'#EF4444' },
    { label:'Cancelled',  value:queue.filter(q=>q.status==='cancelled').length,   color:'#64748B' },
  ]

  const showToast=(msg,type='success')=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3000) }
  const reloadQueue = () => {
    if (!activeClient) return
    contentApi.getLibraryByClient(activeClient.id)
      .then(items => setQueue(items.filter(item => QUEUE_STATUSES.includes(item.status))))
      .catch(() => setQueue([]))
  }
  const retryItem = async (id) => {
    try {
      const res = await retryPublishing(id)
      if (res && res.success) {
        showToast('Post requeued — it will be published again.', 'success')
        reloadQueue()
      } else {
        showToast(res?.message || 'Retry failed.', 'error')
      }
    } catch (error) {
      showToast(error.response?.data?.detail || 'Retry failed.', 'error')
    }
  }
  const publishNow = async (id) => {
    try {
      const res = await publishPost(id);
      const ok = res?.status === 'Published'
      showToast(ok ? 'Published!' : (res?.message || 'Publish failed!'), ok ? 'success' : 'error');
      reloadQueue();
    } catch (error) {
      console.error(error);
      showToast('Publish failed!', 'error');
      reloadQueue();
    }
  };
  const askDelete = item => setConfirmDelete(item)
  const askCancel = item => setConfirmCancel(item)
  const confirmCancelItem = async () => {
    if (!confirmCancel || cancelling) return
    setCancelling(true)
    try {
      await cancelPost(confirmCancel.id)
      showToast('Scheduled publishing cancelled.')
      reloadQueue()
    } catch (error) {
      showToast(error.response?.data?.detail || 'Failed to cancel post.', 'error')
    } finally {
      setCancelling(false)
      setConfirmCancel(null)
    }
  }
  const confirmRemoveItem = async () => {
    if (!confirmDelete || deleting) return
    setDeleting(true)
    try {
      await deletePost(confirmDelete.id)
      setQueue(prev => prev.filter(q => q.id !== confirmDelete.id))
      showToast('Post deleted.')
    } catch (error) {
      showToast(error.response?.data?.detail || 'Failed to delete post.', 'error')
    } finally {
      setDeleting(false)
      setConfirmDelete(null)
    }
  }
  return (
    <>
      {toast&&(
        <AnimatePresence><motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-[var(--r-md)] text-sm font-semibold shadow-[var(--shadow-lg)]"
          style={{ background:toast.type==='error'?'rgba(239,68,68,.95)':'rgba(34,197,94,.95)', color:'#fff' }}>
          {toast.msg}
        </motion.div></AnimatePresence>
      )}

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {summary.map(s=>(
          <div key={s.label} className="card p-4 text-center">
            <p className="text-xl font-extrabold" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:s.color }}>{s.value}</p>
            <p className="text-[10px] mt-0.5" style={{ color:'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
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
              {s==='all'?'All':s.charAt(0).toUpperCase()+s.slice(1)}
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
                className="card p-4 sm:p-5 flex items-center gap-3"
                style={{
                  borderLeft: item.status==='failed'?'3px solid #EF4444':'3px solid transparent',
                }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                  style={{ background:'linear-gradient(135deg,var(--primary),var(--secondary))' }}>{i+1}</div>
                {PIcon&&<div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:`${meta.color}15` }}>
                  <PIcon size={15} style={{ color:meta.color }}/></div>}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color:'var(--text)' }}>{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {dt&&<span className="text-xs" style={{ color:'var(--text-subtle)' }}>{fmtDayMonth(dt)} · {fmtTime(dt)}</span>}
                    {item.status==='failed'&&(item.failureReason||item.error)&&(
                      <span className="text-xs font-medium break-all" style={{ color:'#EF4444' }}>⚠ {item.failureReason||item.error}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <SIcon size={13} style={{ color:st.color }}/>
                  <span className="text-xs font-semibold hidden sm:block" style={{ color:st.color }}>{st.label}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {['scheduled','draft'].includes(item.status)&&(
                    <>
                      <button onClick={()=>publishNow(item.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                        style={{ background:'rgba(34,197,94,.12)', color:'#22C55E', border:'1px solid rgba(34,197,94,.25)' }}>
                        <Send size={11}/> Publish Now
                      </button>
                      {item.status==='scheduled'&&(
                        <button onClick={()=>askCancel(item)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                          style={{ background:'rgba(245,158,11,.12)', color:'#F59E0B', border:'1px solid rgba(245,158,11,.25)' }}>
                          <Ban size={11}/> Cancel
                        </button>
                      )}
                    </>
                  )}
                  {item.status==='failed'&&(
                    <button onClick={()=>retryItem(item.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{ background:'rgba(245,158,11,.12)', color:'#F59E0B', border:'1px solid rgba(245,158,11,.25)' }}>
                      <RefreshCw size={11}/> Retry
                    </button>
                  )}
                  <button onClick={()=>askDelete(item)} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color:'var(--error)' }} title="Delete post">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Cancel confirmation */}
      {createPortal(
        confirmCancel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div className="w-full max-w-sm rounded-[var(--r-xl)] p-6 shadow-[var(--shadow-lg)] my-auto" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Cancel this scheduled post?</h3>
                <button onClick={() => setConfirmCancel(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color: 'var(--text-muted)' }}>
                  <XCircle size={16} />
                </button>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                "{confirmCancel.title}" will no longer be published automatically. The post stays in your library and can be rescheduled later.
              </p>
              <div className="flex gap-3 pt-5">
                <button onClick={() => setConfirmCancel(null)} disabled={cancelling} className="flex-1 h-10 rounded-[var(--r-md)] border text-sm font-semibold" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  Keep Scheduled
                </button>
                <button onClick={confirmCancelItem} disabled={cancelling}
                  className="flex-1 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105"
                  style={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)' }}>
                  {cancelling ? 'Cancelling...' : 'Cancel Post'}
                </button>
              </div>
            </div>
          </div>
        ),
        document.body
      )}

      {/* Delete confirmation */}
      {createPortal(
        confirmDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div className="w-full max-w-sm rounded-[var(--r-xl)] p-6 shadow-[var(--shadow-lg)] my-auto" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Delete this post?</h3>
                <button onClick={() => setConfirmDelete(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-alt)]" style={{ color: 'var(--text-muted)' }}>
                  <XCircle size={16} />
                </button>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                "{confirmDelete.title}" will be permanently deleted from the publishing queue. This cannot be undone.
              </p>
              <div className="flex gap-3 pt-5">
                <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="flex-1 h-10 rounded-[var(--r-md)] border text-sm font-semibold" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  Cancel
                </button>
                <button onClick={confirmRemoveItem} disabled={deleting}
                  className="flex-1 h-10 rounded-[var(--r-md)] text-sm font-semibold text-white hover:brightness-105"
                  style={{ background: 'linear-gradient(135deg,#DC2626,#EF4444)' }}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ),
        document.body
      )}
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
