import React, { useState, useEffect } from 'react'
import { getAdminCampaignAnalytics } from '../../services/adminAnalyticsService'
import { KPICard, StatsGrid, InsightCard } from '../../../creator-dashboard/components/analytics'
import AreaChart from '../../../creator-dashboard/components/analytics/Charts/AreaChart'
import { Target, Users, Eye, Zap, MousePointer, DollarSign, CheckCircle2 } from 'lucide-react'

export default function AdminCampaignAnalytics() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminCampaignAnalytics().then((res) => {
      setCampaigns(res)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading campaign analytics...</div>
  }

  const topCampaign = campaigns[0] || {}

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Campaign Summary Banner */}
      <InsightCard
        type="top"
        title={`Top Performing Campaign: ${topCampaign.name}`}
        description={`Engaged ${topCampaign.creatorCount} creators with ${topCampaign.reach} total reach and an ROI of ${topCampaign.roi}. Completion status: ${topCampaign.completion}%.`}
        actionText="View Detailed Campaign Breakdown"
        onAction={() => alert(`Opening campaign report for ${topCampaign.name}`)}
      />

      {/* Campaign Performance Grid Cards */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Target size={18} className="text-indigo-600 dark:text-indigo-400" />
          Active & Completed Campaigns ({campaigns.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <div key={camp.id} className="card space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{camp.name}</h3>
                  <p className="text-xs text-slate-500">{camp.creatorCount} participating creators</p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    camp.status === 'Completed'
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  }`}
                >
                  {camp.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Completion</span>
                  <span className="text-slate-900 dark:text-slate-100">{camp.completion}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                    style={{ width: `${camp.completion}%` }}
                  />
                </div>
              </div>

              {/* Key Campaign Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <p className="text-slate-400 text-[10px]">Reach</p>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100">{camp.reach}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Impressions</p>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100">{camp.impressions}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Engagement</p>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100">{camp.engagement}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Clicks</p>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100">{camp.clicks}</p>
                </div>
              </div>

              {/* ROI & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400">Estimated ROI</p>
                  <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{camp.roi}</p>
                </div>
                <button
                  onClick={() => alert(`Exporting campaign metrics for ${camp.name}`)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Report
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
