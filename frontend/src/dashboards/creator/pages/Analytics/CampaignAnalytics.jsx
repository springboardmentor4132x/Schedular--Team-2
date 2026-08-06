import React, { useState, useEffect } from 'react'
import { getCampaignAnalytics } from '../../../../services/analyticsService'
import BarChart from '../../components/analytics/Charts/BarChart'
import { InsightCard } from '../../components/analytics'
import { CardSkeleton } from '../../../../shared/components/ui/Skeleton'
import { Target, Award, AlertCircle, TrendingUp } from 'lucide-react'

export default function CampaignAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCampaignAnalytics().then((res) => {
      setData(res)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
      </div>
    )
  }

  const { campaigns, topCampaigns, lowestCampaigns } = data

  const chartData = campaigns.map((c) => ({
    label: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
    engagement: parseInt(c.engagement.replace(/[^\d]/g, '')) || 0,
    clicks: c.clicks
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top & Lowest Performing Campaign Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Campaigns */}
        <InsightCard title="Top Performing Campaigns" badgeText="High Impact" badgeColor="badge-success" icon={Award}>
          <div className="space-y-2.5">
            {topCampaigns.map((tc, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface border border-default text-xs">
                <span className="font-bold text-primary">{tc.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-secondary">{tc.metric}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{tc.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </InsightCard>

        {/* Lowest Campaigns */}
        <InsightCard title="Lowest Performing Campaigns" badgeText="Optimization Required" badgeColor="badge-warning" icon={AlertCircle}>
          <div className="space-y-2.5">
            {lowestCampaigns.map((lc, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface border border-default text-xs">
                <span className="font-bold text-primary">{lc.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-secondary">{lc.metric}</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{lc.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </InsightCard>
      </div>

      {/* Campaign Comparison Chart */}
      <BarChart
        data={chartData}
        dataKey="engagement"
        xKey="label"
        title="Campaign Total Engagement Comparison"
        barColor="bg-indigo-600 dark:bg-indigo-500"
      />

      {/* Campaign Data Table */}
      <div className="table-container">
        <div className="p-4 border-b border-default">
          <h2 className="text-base font-bold text-primary">All Creator Campaigns Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-inner">
            <thead className="table-head">
              <tr>
                <th className="table-th">Campaign Name</th>
                <th className="table-th">Status</th>
                <th className="table-th">Duration</th>
                <th className="table-th text-center">Posts</th>
                <th className="table-th text-right">Reach</th>
                <th className="table-th text-right">Impressions</th>
                <th className="table-th text-right">Engagement</th>
                <th className="table-th text-right">Clicks</th>
                <th className="table-th text-right">Likes</th>
                <th className="table-th text-right">Eng. Rate</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp) => (
                <tr key={camp.id} className="table-row">
                  <td className="table-td font-bold text-primary">
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-indigo-500" />
                      <span>{camp.name}</span>
                    </div>
                  </td>
                  <td className="table-td whitespace-nowrap">
                    <span
                      className={`badge ${
                        camp.status === 'Active' ? 'badge-success' : 'badge-default'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </td>
                  <td className="table-td whitespace-nowrap text-xs text-secondary">{camp.duration}</td>
                  <td className="table-td text-center font-semibold text-primary">{camp.postsCount}</td>
                  <td className="table-td text-right font-bold text-primary">{camp.reach}</td>
                  <td className="table-td text-right text-secondary">{camp.impressions}</td>
                  <td className="table-td text-right font-bold text-indigo-600 dark:text-indigo-400">
                    {camp.engagement}
                  </td>
                  <td className="table-td text-right text-secondary">{camp.clicks.toLocaleString()}</td>
                  <td className="table-td text-right text-secondary">{camp.likes.toLocaleString()}</td>
                  <td className="table-td text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {camp.engagementRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
