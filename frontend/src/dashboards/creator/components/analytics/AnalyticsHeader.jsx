import React from 'react'
import { Download, Sparkles, BarChart2 } from 'lucide-react'
import AnalyticsFilters from './AnalyticsFilters'

/**
 * Reusable AnalyticsHeader component matching Creator Dashboard hero styling
 */
export default function AnalyticsHeader({
  title = 'Creator Analytics',
  subtitle = 'Track performance, audience growth, campaign ROI, and platform comparisons',
  badgeText = 'Creator Mode',
  dateRange,
  setDateRange,
  selectedPlatform,
  setSelectedPlatform,
  selectedCampaign,
  setSelectedCampaign,
  selectedContentType,
  setSelectedContentType,
  campaigns = [],
  onExport,
  className = ''
}) {
  const handleExport = () => {
    if (onExport) {
      onExport()
    } else {
      alert('Exporting Analytics CSV Report...')
    }
  }

  return (
    <header className={`card relative overflow-hidden bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-5 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
        {/* Title & Subtitle */}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{title}</h1>
            {badgeText && (
              <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                <Sparkles size={12} />
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs md:text-sm font-medium">{subtitle}</p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Embedded Filters Toolbar */}
      <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800">
        <AnalyticsFilters
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          selectedCampaign={selectedCampaign}
          setSelectedCampaign={setSelectedCampaign}
          selectedContentType={selectedContentType}
          setSelectedContentType={setSelectedContentType}
          campaigns={campaigns}
        />
      </div>
    </header>
  )
}
