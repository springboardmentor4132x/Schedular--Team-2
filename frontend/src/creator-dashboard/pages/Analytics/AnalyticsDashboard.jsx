import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getDashboardSummary } from '../../services/analyticsService'
import { KPICard, StatsGrid, InsightCard } from '../../components/analytics'
import AreaChart from '../../components/analytics/Charts/AreaChart'
import BarChart from '../../components/analytics/Charts/BarChart'
import { CardSkeleton } from '../../../shared/components/ui/Skeleton'
import {
  FileText,
  Calendar,
  Eye,
  Users,
  Heart,
  MessageSquare,
  Share2,
  MousePointer,
  UserPlus,
  TrendingUp,
  Award,
  AlertCircle,
  Clock,
  Zap,
  Layers
} from 'lucide-react'

export default function AnalyticsDashboard() {
  const { dateRange, selectedPlatform, selectedCampaign } = useOutletContext() || {}
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardSummary({ dateRange, selectedPlatform, selectedCampaign }).then((res) => {
      setData(res)
      setLoading(false)
    })
  }, [dateRange, selectedPlatform, selectedCampaign])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 11 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  const { kpis, insights, timeSeries, recentActivity } = data

  const kpiItems = [
    { key: 'totalPublished', icon: FileText, ...kpis.totalPublished },
    { key: 'totalScheduled', icon: Calendar, ...kpis.totalScheduled },
    { key: 'totalImpressions', icon: Eye, ...kpis.totalImpressions },
    { key: 'totalReach', icon: Users, ...kpis.totalReach },
    { key: 'totalEngagement', icon: Zap, ...kpis.totalEngagement },
    { key: 'totalLikes', icon: Heart, ...kpis.totalLikes },
    { key: 'totalComments', icon: MessageSquare, ...kpis.totalComments },
    { key: 'totalShares', icon: Share2, ...kpis.totalShares },
    { key: 'totalClicks', icon: MousePointer, ...kpis.totalClicks },
    { key: 'totalFollowers', icon: UserPlus, ...kpis.totalFollowers },
    { key: 'overallEngagementRate', icon: TrendingUp, ...kpis.overallEngagementRate }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 11 Summary KPI Cards */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-primary">Key Performance Indicators</h2>
        <StatsGrid columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {kpiItems.map((item) => (
            <KPICard
              key={item.key}
              label={item.label}
              value={item.value}
              change={item.change}
              positive={item.positive}
              icon={item.icon}
            />
          ))}
        </StatsGrid>
      </section>

      {/* Main Trends Charts Grid */}
      <section className="space-y-6">
        <h2 className="text-base font-bold text-primary">Performance Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AreaChart
            data={timeSeries}
            dataKey="engagement"
            xKey="date"
            title="Engagement Trend"
            strokeColor="#6366f1"
          />
          <AreaChart
            data={timeSeries}
            dataKey="reach"
            xKey="date"
            title="Reach Trend"
            strokeColor="#8b5cf6"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AreaChart
              data={timeSeries}
              dataKey="impressions"
              xKey="date"
              title="Impressions Trend"
              strokeColor="#06b6d4"
            />
          </div>
          <div>
            <AreaChart
              data={timeSeries}
              dataKey="followers"
              xKey="date"
              title="Followers Growth"
              strokeColor="#10b981"
            />
          </div>
        </div>

        {/* Publishing Activity Timeline */}
        <BarChart
          data={timeSeries}
          dataKey="posts"
          xKey="date"
          title="Publishing Activity Timeline (Posts Published per Day)"
          barColor="bg-indigo-600 dark:bg-indigo-500"
        />
      </section>

      {/* Insights Section */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-primary">Performance Insights & Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {/* Top Performing Post */}
          <InsightCard title="Top Performing Post" badgeText="Best ER" badgeColor="badge-success" icon={Award}>
            <div className="h-full flex flex-col justify-between space-y-3">
              <p className="font-bold text-primary text-sm leading-snug">{insights.topPost.title}</p>
              <div className="flex items-center justify-between text-xs text-secondary pt-2.5 border-t border-default mt-auto">
                <span>Reach: <strong className="text-primary">{insights.topPost.reach}</strong></span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">ER: {insights.topPost.engagementRate}</span>
              </div>
            </div>
          </InsightCard>

          {/* Lowest Performing Post */}
          <InsightCard title="Lowest Performing Post" badgeText="Needs Improvement" badgeColor="badge-warning" icon={AlertCircle}>
            <div className="h-full flex flex-col justify-between space-y-3">
              <p className="font-bold text-primary text-sm leading-snug">{insights.lowestPost.title}</p>
              <div className="flex items-center justify-between text-xs text-secondary pt-2.5 border-t border-default mt-auto">
                <span>Reach: <strong className="text-primary">{insights.lowestPost.reach}</strong></span>
                <span className="font-bold text-rose-600 dark:text-rose-400">ER: {insights.lowestPost.engagementRate}</span>
              </div>
            </div>
          </InsightCard>

          {/* Best Platform */}
          <InsightCard title="Top Performing Platform" badgeText="Highest Reach" badgeColor="badge-primary" icon={Layers}>
            <div className="h-full flex flex-col justify-between space-y-3">
              <div>
                <p className="font-extrabold text-2xl text-indigo-600 dark:text-indigo-400">{insights.bestPlatform.name}</p>
                <p className="text-xs text-secondary mt-1">Growth rate {insights.bestPlatform.growth}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-secondary pt-2.5 border-t border-default mt-auto">
                <span>Total Followers: <strong className="text-primary">{insights.bestPlatform.totalFollowers}</strong></span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Avg ER: {insights.bestPlatform.engagementRate}</span>
              </div>
            </div>
          </InsightCard>

          {/* Best Posting Time */}
          <InsightCard title="Optimal Posting Window" badgeText="Recommended" badgeColor="badge-secondary" icon={Clock}>
            <div className="h-full flex flex-col justify-between space-y-3">
              <div>
                <p className="font-bold text-primary text-base">{insights.bestPostingTime.timeSlot}</p>
                <p className="text-xs text-secondary mt-1">{insights.bestPostingTime.bestDays}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-secondary pt-2.5 border-t border-default mt-auto">
                <span>Expected Boost</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{insights.bestPostingTime.avgEngagementBoost} ER</span>
              </div>
            </div>
          </InsightCard>
        </div>
      </section>

      {/* Recent Publishing Activity Stream */}
      <section className="card space-y-4">
        <div className="border-b border-default pb-3">
          <h2 className="text-base font-bold text-primary">Recent Publishing Activity Stream</h2>
        </div>
        <div className="space-y-2">
          {recentActivity.map((act) => (
            <div key={act.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl hover:bg-hover transition-colors">
              <div className="flex items-center gap-3">
                <span className="badge badge-primary shrink-0">{act.platform}</span>
                <div>
                  <p className="text-sm font-bold text-primary">{act.title}</p>
                  <p className="text-xs text-secondary">{act.action} · {act.time}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 self-end sm:self-auto shrink-0">
                {act.metrics}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
