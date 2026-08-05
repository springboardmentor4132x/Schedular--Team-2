import React, { useState, useEffect } from 'react'
import { getAdminAudienceAnalytics } from '../../services/adminAnalyticsService'
import { PieChart, Globe, Clock, Calendar, Users } from 'lucide-react'

export default function AdminAudienceAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminAudienceAnalytics().then((res) => {
      setData(res)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading system audience demographics...</div>
  }

  const { age, gender, countries, languages, activeHoursPeak, activeDaysPeak } = data

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Active Peak Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Peak Active Hours</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{activeHoursPeak}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Highest system engagement velocity</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Peak Active Days</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{activeDaysPeak}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Optimal publishing window</p>
          </div>
        </div>
      </div>

      {/* Demographics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Age Breakdown */}
        <div className="card space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <PieChart size={16} className="text-indigo-600 dark:text-indigo-400" />
            Age Distribution
          </h3>
          <div className="space-y-3">
            {age.map((item) => (
              <div key={item.range} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">{item.range} years</span>
                  <span className="text-slate-900 dark:text-slate-100">{item.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Breakdown */}
        <div className="card space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
            Gender Distribution
          </h3>
          <div className="space-y-3">
            {gender.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                  <span className="text-slate-900 dark:text-slate-100">{item.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Languages */}
        <div className="card space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Globe size={16} className="text-indigo-600 dark:text-indigo-400" />
            Top Languages
          </h3>
          <div className="space-y-3">
            {languages.map((item) => (
              <div key={item.language} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">{item.language}</span>
                  <span className="text-slate-900 dark:text-slate-100">{item.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Countries Breakdown */}
      <div className="card space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
          <Globe size={18} className="text-indigo-600 dark:text-indigo-400" />
          Top Geographic Markets (Countries & Cities)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {countries.map((c) => (
            <div key={c.country} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">{c.country}</p>
                <p className="text-[10px] text-slate-400">{c.count} audience</p>
              </div>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                {c.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
