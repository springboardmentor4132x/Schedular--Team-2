import React, { useState, useEffect } from 'react'
import { getAudienceAnalytics } from '../../services/analyticsService'
import { KPICard, StatsGrid } from '../../components/analytics'
import AreaChart from '../../components/analytics/Charts/AreaChart'
import BarChart from '../../components/analytics/Charts/BarChart'
import DonutChart from '../../components/analytics/Charts/DonutChart'
import ActiveHeatmap from '../../components/analytics/Charts/ActiveHeatmap'
import ProgressList from '../../components/analytics/Charts/ProgressList'
import { CardSkeleton } from '../../../shared/components/ui/Skeleton'
import { Users, UserPlus, UserMinus, TrendingUp } from 'lucide-react'

export default function AudienceAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAudienceAnalytics().then((res) => {
      setData(res)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  const {
    kpis,
    followersTrend,
    genderDistribution,
    ageDistribution,
    countryDistribution,
    cityDistribution,
    languageDistribution,
    mostActiveHours,
    mostActiveDays
  } = data

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Audience KPI Summary Cards */}
      <StatsGrid columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Followers" value={kpis.totalFollowers} icon={Users} />
        <KPICard label="New Followers" value={kpis.newFollowers} positive={true} icon={UserPlus} />
        <KPICard label="Lost Followers" value={kpis.lostFollowers} positive={false} icon={UserMinus} />
        <KPICard label="Net Growth" value={kpis.netGrowth} positive={true} icon={TrendingUp} />
      </StatsGrid>

      {/* Followers Growth Chart */}
      <AreaChart
        data={followersTrend}
        dataKey="followers"
        xKey="date"
        title="Followers Growth Trend"
        strokeColor="#6366f1"
        height={260}
      />

      {/* Demographics Grid: Gender, Age & Language */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DonutChart data={genderDistribution} title="Gender Distribution" />
        <BarChart
          data={ageDistribution}
          dataKey="percentage"
          xKey="group"
          title="Age Distribution (%)"
          barColor="bg-purple-600 dark:bg-purple-500"
        />
        <DonutChart data={languageDistribution} title="Language Distribution" />
      </div>

      {/* Geographic Breakdown: Country & City */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressList
          title="Country Distribution"
          items={countryDistribution}
          labelKey="country"
          valueKey="percentage"
          extraKey="count"
          iconKey="flag"
        />
        <ProgressList
          title="Top Cities Distribution"
          items={cityDistribution}
          labelKey="city"
          valueKey="percentage"
          extraKey="count"
        />
      </div>

      {/* Active Hours & Days Heatmaps */}
      <div>
        <h2 className="text-base font-bold text-primary mb-3">Audience Activity & Best Posting Schedule</h2>
        <ActiveHeatmap hoursData={mostActiveHours} daysData={mostActiveDays} />
      </div>
    </div>
  )
}
