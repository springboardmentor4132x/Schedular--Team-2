import React, { useState, useEffect } from 'react'
import { getAdminPerformanceTrends } from '../../services/adminAnalyticsService'
import AreaChart from '../../../creator-dashboard/components/analytics/Charts/AreaChart'
import BarChart from '../../../creator-dashboard/components/analytics/Charts/BarChart'
import { Calendar, TrendingUp } from 'lucide-react'

export default function AdminPerformanceTrends() {
  const [timeframe, setTimeframe] = useState('daily')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminPerformanceTrends(timeframe).then((res) => {
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
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Historical Granularity:</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
          {[
            { id: 'daily', label: 'Daily' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'quarterly', label: 'Quarterly' },
            { id: 'yearly', label: 'Yearly' },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === tf.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts */}
      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading trend analytics...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AreaChart
              data={data}
              dataKey="reach"
              xKey="label"
              title={`${timeframe.toUpperCase()} System Reach Growth`}
              strokeColor="#6366f1"
            />
            <AreaChart
              data={data}
              dataKey="engagement"
              xKey="label"
              title={`${timeframe.toUpperCase()} System Engagement`}
              strokeColor="#10b981"
            />
          </div>

          <BarChart
            data={data}
            dataKey="posts"
            xKey="label"
            title={`${timeframe.toUpperCase()} Content Publishing Volume`}
            barColor="#8b5cf6"
          />
        </div>
      )}
    </div>
  )
}
