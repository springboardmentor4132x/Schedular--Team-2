import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../shared/components/Button'
import Card from '../../../shared/components/ui/Card'
import { WidgetSkeleton } from '../../../shared/components/ui/Skeleton'
import { getCampaignById, getCampaignTimeline } from '../../../services/campaignService'
import { campaignStatusBadge, formatCampaignDate } from '../constants/campaigns'
import { ArrowLeft, CalendarDays, Flag, Rocket, Sparkles, ArrowUpRight } from 'lucide-react'

function eventKind(eventText) {
  const text = String(eventText).toLowerCase()
  if (text.includes('created')) return { Icon: Sparkles, color: 'bg-indigo-500', label: 'Created' }
  if (text.includes('published')) return { Icon: Rocket, color: 'bg-emerald-500', label: 'Published' }
  return { Icon: CalendarDays, color: 'bg-sky-500', label: 'Scheduled' }
}

export default function CampaignTimeline() {
  const navigate = useNavigate()
  const { id } = useParams()
  const campaignId = Number(id)

  const [campaign, setCampaign] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const camp = await getCampaignById(campaignId).catch(() => null)
        if (!mounted) return
        if (!camp) {
          setToastMessage('Campaign not found.')
          setTimeout(() => navigate('/dashboard/creator/campaigns'), 1000)
          return
        }
        setCampaign(camp)
        const tl = await getCampaignTimeline(campaignId).catch(() => null)
        if (!mounted) return
        setTimeline(tl?.timeline || [])
      } catch {
        if (mounted) setToastMessage('Failed to load timeline.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [campaignId, navigate])

  const grouped = useMemo(() => {
    const sorted = [...timeline].sort((a, b) => {
      if (a.date === 'unscheduled') return 1
      if (b.date === 'unscheduled') return -1
      return new Date(a.date) - new Date(b.date)
    })
    const groups = []
    for (const event of sorted) {
      const key = event.date === 'unscheduled' ? 'Unscheduled' : event.date
      let group = groups.find((g) => g.date === key)
      if (!group) {
        group = { date: key, events: [] }
        groups.push(group)
      }
      group.events.push(event)
    }
    return groups
  }, [timeline])

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1000px] mx-auto pb-12">
        <div className="card p-5 sm:p-6 h-28 animate-pulse bg-slate-100/60 dark:bg-slate-800/40"></div>
        <WidgetSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto animate-fade-in pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-slide-up">
          <Flag size={16} className="text-indigo-400 dark:text-indigo-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <section aria-label="Page header" className="card p-5 sm:p-6 relative overflow-hidden bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-950/40 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/creator/campaigns/${campaignId}`)} className="px-0 text-slate-500 mb-2">
              <ArrowLeft size={14} />
              Back to Campaign
            </Button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Campaign Timeline</h1>
              {campaign && <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${campaignStatusBadge(campaign.status)}`}>{campaign.status}</span>}
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">
              {campaign ? `Important activities for "${campaign.name}".` : 'Campaign activities.'}
            </p>
          </div>
          <Button variant="outline" size="md" onClick={() => navigate(`/dashboard/creator/campaigns/${campaignId}/analytics`)}>
            <ArrowUpRight size={16} />
            Analytics
          </Button>
        </div>
      </section>

      {/* Timeline */}
      <Card className="p-5 sm:p-6">
        {grouped.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
              <CalendarDays size={24} />
            </div>
            <p className="font-bold text-slate-900 dark:text-slate-100">No timeline events yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Assign posts to this campaign and their scheduled publishing dates will appear here.
            </p>
            <Button variant="primary" size="sm" onClick={() => navigate(`/dashboard/creator/campaigns/${campaignId}/assign-posts`)}>
              Assign Posts
            </Button>
          </div>
        ) : (
          <ol className="relative space-y-8 pl-2">
            <span className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true"></span>
            {grouped.map((group, gi) => (
              <li key={gi} className="relative pl-10">
                <span className="absolute left-0 top-1.5 w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                  <CalendarDays size={13} className="text-indigo-500" />
                </span>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">
                  {group.date === 'Unscheduled' ? 'Unscheduled' : formatCampaignDate(group.date)}
                </h3>
                <div className="space-y-2">
                  {group.events.map((event, ei) => {
                    const { Icon, color, label } = eventKind(event.event)
                    return (
                      <div key={ei} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 ${color}`}>
                          <Icon size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{event.event}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {group.date === 'Unscheduled' ? 'No publishing date set' : `Scheduled for ${formatCampaignDate(group.date)}`}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex-shrink-0">
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  )
}
