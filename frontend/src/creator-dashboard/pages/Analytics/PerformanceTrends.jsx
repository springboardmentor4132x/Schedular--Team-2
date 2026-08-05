import React, { useState, useEffect } from 'react'
import { getPerformanceTrends } from '../../services/analyticsService'
import AreaChart from '../../components/analytics/Charts/AreaChart'
import BarChart from '../../components/analytics/Charts/BarChart'
import { CardSkeleton } from '../../../shared/components/ui/Skeleton'
import { Calendar } from 'lucide-react'

export default function PerformanceTrends() {
  const [timeframe, setTimeframe] = useState('daily') // daily, weekly, monthly, quarterly, yearly
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getPerformanceTrends(timeframe).then((res) => {
      setData(res)
      setLoading(false)
    })
  }, [timeframe])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Timeframe Filter Bar */}
      <div className="card py-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-primary">Timeframe Granularity</h2>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-surface border border-default p-1 rounded-xl">
          {[
            { id: 'daily', label: 'Daily' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'quarterly', label: 'Quarterly' },
            { id: 'yearly', label: 'Yearly' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeframe(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                timeframe === item.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-hover'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AreaChart
              data={data}
              dataKey="engagement"
              xKey="date"
              title={`Engagement Trend (${timeframe.toUpperCase()})`}
              strokeColor="#6366f1"
              height={260}
            />
            <AreaChart
              data={data}
              dataKey="reach"
              xKey="date"
              title={`Reach Trend (${timeframe.toUpperCase()})`}
              strokeColor="#8b5cf6"
              height={260}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AreaChart
              data={data}
              dataKey="impressions"
              xKey="date"
              title={`Impression Trend (${timeframe.toUpperCase()})`}
              strokeColor="#06b6d4"
              height={260}
            />
            <AreaChart
              data={data}
              dataKey="clicks"
              xKey="date"
              title={`Click Trend (${timeframe.toUpperCase()})`}
              strokeColor="#f59e0b"
              height={260}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AreaChart
              data={data}
              dataKey="followers"
              xKey="date"
              title={`Followers Growth (${timeframe.toUpperCase()})`}
              strokeColor="#10b981"
              height={260}
            />
            <BarChart
              data={data}
              dataKey="posts"
              xKey="date"
              title={`Publishing Activity Timeline & Frequency (${timeframe.toUpperCase()})`}
              barColor="bg-indigo-600 dark:bg-indigo-500"
              height={260}
            />
          </div>
        </div>
      )}
    </div>
  )
}
