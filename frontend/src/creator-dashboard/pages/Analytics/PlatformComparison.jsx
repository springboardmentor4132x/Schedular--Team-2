import React, { useState, useEffect } from 'react'
import { getPlatformAnalytics } from '../../services/analyticsService'
import BarChart from '../../components/analytics/Charts/BarChart'
import { CardSkeleton } from '../../../shared/components/ui/Skeleton'

export default function PlatformComparison() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPlatformAnalytics().then((res) => {
      setData(res)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  const { platforms } = data

  // Prepare chart series
  const engagementData = platforms.map((p) => ({
    label: p.name,
    value: parseFloat(p.engagementRate) || 0
  }))

  const reachData = platforms.map((p) => ({
    label: p.name,
    value: parseFloat(p.reach) || 0
  }))

  const followersData = platforms.map((p) => ({
    label: p.name,
    value: parseFloat(p.followers) || 0
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 6 Platform Cards */}
      <div>
        <h2 className="text-base font-bold text-primary mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((p) => (
            <div key={p.id} className="card card-hover space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-default pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${p.color}`}>
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-primary">{p.name}</h3>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {p.engagementRate} Engagement Rate
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics Breakdown Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-surface border border-default">
                  <span className="text-secondary font-medium block">Followers</span>
                  <span className="text-sm font-bold text-primary">{p.followers}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-default">
                  <span className="text-secondary font-medium block">Reach</span>
                  <span className="text-sm font-bold text-primary">{p.reach}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-default">
                  <span className="text-secondary font-medium block">Impressions</span>
                  <span className="text-sm font-bold text-primary">{p.impressions}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-default">
                  <span className="text-secondary font-medium block">Engagement</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{p.engagement}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-default">
                  <span className="text-secondary font-medium block">Likes</span>
                  <span className="text-sm font-bold text-primary">{p.likes}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-default">
                  <span className="text-secondary font-medium block">Comments</span>
                  <span className="text-sm font-bold text-primary">{p.comments}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-default">
                  <span className="text-secondary font-medium block">Shares</span>
                  <span className="text-sm font-bold text-primary">{p.shares}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface border border-default">
                  <span className="text-secondary font-medium block">Clicks</span>
                  <span className="text-sm font-bold text-primary">{p.clicks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Comparison Charts */}
      <div className="space-y-6">
        <h2 className="text-base font-bold text-primary">Cross-Platform Comparative Analytics</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart
            data={engagementData}
            dataKey="value"
            xKey="label"
            title="Platform Engagement Rate (%)"
            barColor="bg-indigo-600 dark:bg-indigo-500"
          />
          <BarChart
            data={reachData}
            dataKey="value"
            xKey="label"
            title="Platform Total Reach (in K)"
            barColor="bg-purple-600 dark:bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart
            data={followersData}
            dataKey="value"
            xKey="label"
            title="Platform Total Followers (in K)"
            barColor="bg-sky-600 dark:bg-sky-500"
          />
          <BarChart
            data={engagementData}
            dataKey="value"
            xKey="label"
            title="Platform Growth Rate Comparison"
            barColor="bg-emerald-600 dark:bg-emerald-500"
          />
        </div>
      </div>
    </div>
  )
}
