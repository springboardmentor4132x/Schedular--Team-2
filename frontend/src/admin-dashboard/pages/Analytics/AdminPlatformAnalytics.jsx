import React, { useState, useEffect } from 'react'
import { getAdminPlatformAnalytics } from '../../services/adminAnalyticsService'
import { ComparisonCard } from '../../../creator-dashboard/components/analytics'
import BarChart from '../../../creator-dashboard/components/analytics/Charts/BarChart'
import { Layers, TrendingUp, Users, Eye, MousePointer } from 'lucide-react'

export default function AdminPlatformAnalytics() {
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminPlatformAnalytics().then((res) => {
      setPlatforms(res)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading platform comparison metrics...</div>
  }

  const chartData = platforms.map((p) => ({
    name: p.platform,
    reach: parseInt(p.reach),
    engagement: parseFloat(p.engagement)
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Platform Cards Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-indigo-600 dark:text-indigo-400" />
          Connected Platform Breakdown ({platforms.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((p) => (
            <div key={p.platform} className="card space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  {p.platform}
                </h3>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  {p.growth}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400">Followers</p>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{p.followers}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400">Total Reach</p>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{p.reach}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400">Avg Engagement</p>
                  <p className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm mt-0.5">{p.engagement}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400">Est. CTR</p>
                  <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">3.4%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparative Bar Chart */}
      <section className="card space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
          Cross-Platform Reach & Engagement Benchmarking
        </h2>
        <BarChart
          data={chartData}
          dataKey="reach"
          xKey="name"
          title="Platform Reach Comparison"
          barColor="#6366f1"
        />
      </section>
    </div>
  )
}
