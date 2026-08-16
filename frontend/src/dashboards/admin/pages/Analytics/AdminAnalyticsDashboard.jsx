import { useState, useEffect } from 'react'
import { getAdminAnalyticsSummary } from '../../../../services/adminAnalyticsService'
import { KPICard, StatsGrid } from '../../../creator/components/analytics'
import AreaChart from '../../../creator/components/analytics/Charts/AreaChart'
import BarChart from '../../../creator/components/analytics/Charts/BarChart'
import { CardSkeleton } from '../../../../shared/components/ui/Skeleton'
import {
  Users,
  Target,
  FileText,
  Calendar,
  Eye,
  Zap,
  TrendingUp,
  UserPlus,
  BarChart3
} from 'lucide-react'

export default function AdminAnalyticsDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminAnalyticsSummary().then((res) => {
      setData(res)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  const { kpis, timeSeries } = data

  const kpiItems = [
    { key: 'totalCreators', icon: Users, ...kpis.totalCreators },
    { key: 'totalCampaigns', icon: Target, ...kpis.totalCampaigns },
    { key: 'totalPublished', icon: FileText, ...kpis.totalPublished },
    { key: 'totalScheduled', icon: Calendar, ...kpis.totalScheduled },
    { key: 'totalReach', icon: Users, ...kpis.totalReach },
    { key: 'totalImpressions', icon: Eye, ...kpis.totalImpressions },
    { key: 'totalEngagement', icon: Zap, ...kpis.totalEngagement },
    { key: 'totalFollowers', icon: UserPlus, ...kpis.totalFollowers },
    { key: 'overallEngagementRate', icon: TrendingUp, ...kpis.overallEngagementRate },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 9 System-Wide KPI Cards */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <BarChart3 size={18} className="text-indigo-600 dark:text-indigo-400" />
          System Key Performance Indicators
        </h2>
        <StatsGrid columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

      {/* Main Charts Grid */}
      <section className="space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          System Overview & Growth Trends
        </h2>
        
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
            title="System Reach Growth"
            strokeColor="#10b981"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BarChart
              data={timeSeries}
              dataKey="posts"
              xKey="date"
              title="Publishing Volume Trend"
              barColor="bg-purple-600 dark:bg-purple-500"
            />
          </div>
          <div>
            <BarChart
              data={timeSeries}
              dataKey="creators"
              xKey="date"
              title="Creator Growth Rate"
              barColor="bg-amber-500"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
