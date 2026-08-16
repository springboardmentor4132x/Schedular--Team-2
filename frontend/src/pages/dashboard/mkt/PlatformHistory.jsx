import { useEffect, useState } from 'react'
import PageHeader from '../../../components/dashboard/PageHeader'
import { useClient } from '../../../context/ClientContext'
import { clientPublishingApi } from '../../../services/mockData'
import EmptyState from '../../../components/dashboard/EmptyState'
import { Users } from 'lucide-react'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from 'react-icons/fa6'

const PLATFORMS = [
  { id:'facebook', label:'Facebook', icon:FaFacebook },
  { id:'instagram', label:'Instagram', icon:FaInstagram },
  { id:'linkedin', label:'LinkedIn', icon:FaLinkedin },
  { id:'x', label:'X', icon:FaXTwitter },
  { id:'youtube', label:'YouTube', icon:FaYoutube },
  { id:'pinterest', label:'Pinterest', icon:FaPinterest },
]

export default function PlatformHistory() {
  const { activeClient } = useClient()
  const [tab, setTab] = useState('facebook')
  const [items, setItems] = useState([])

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!activeClient) return setItems([])
      const data = await clientPublishingApi.getPlatformHistory(activeClient.id, tab)
      if (mounted) setItems(data)
    }
    load()
    return () => { mounted = false }
  }, [activeClient, tab])

  if (!activeClient) return (<div className="p-6"><div className="card"><EmptyState icon={Users} title="No client selected" message="Select a client to view platform history." action={{ label: 'View Clients', onClick: () => {} }} /></div></div>)

  return (
    <div className="p-4 sm:p-6 max-w-[1100px] mx-auto">
      <PageHeader title="Platform Publishing History" subtitle={`History for ${activeClient.name}`} />
      <div className="flex gap-2 mb-4">
        {PLATFORMS.map(p=> (
          <button key={p.id} onClick={()=>setTab(p.id)} className={`px-3 py-1 rounded-full ${tab===p.id?'bg-[var(--card)] border':'border'}`}>{p.label}</button>
        ))}
      </div>

      <div className="space-y-2">
        {items.length===0 && <div className="card p-4">No posts for {tab}.</div>}
        {items.map(i=> (
          <div key={i.id} className="card p-3 flex justify-between items-center">
            <div>
              <div className="text-sm font-semibold">{i.title || i.platform}</div>
              <div className="text-xs text-[var(--text-subtle)]">{i.publishedAt ? new Date(i.publishedAt).toLocaleString() : '—'} · Status: {i.status}</div>
            </div>
            <div className="text-xs">{i.platformPostId || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
