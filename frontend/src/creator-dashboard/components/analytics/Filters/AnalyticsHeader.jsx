import React, { useState } from 'react'
import { Calendar, Download, Filter, Sparkles } from 'lucide-react'

export default function AnalyticsHeader({
  dateRange,
  setDateRange,
  selectedPlatform,
  setSelectedPlatform,
  selectedCampaign,
  setSelectedCampaign,
  selectedContentType,
  setSelectedContentType,
  onExport
}) {
  const [exportToast, setExportToast] = useState(false)

  const handleExportClick = () => {
    setExportToast(true)
    if (onExport) onExport()
    setTimeout(() => setExportToast(false), 3000)
  }

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="card relative overflow-hidden bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-transparent border border-default p-5 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-primary">Creator Analytics</h1>
              <span className="badge badge-primary flex items-center gap-1">
                <Sparkles size={12} /> Creator Mode
              </span>
            </div>
            <p className="text-secondary text-sm mt-1">
              Performance metrics, audience insights & campaign performance for your personal accounts.
            </p>
          </div>
          <button
            onClick={handleExportClick}
            className="btn btn-primary btn-md flex items-center gap-2 self-start md:self-auto"
          >
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card py-3.5 px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider">
            <Filter size={14} className="text-indigo-500" />
            <span>Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Date Range */}
            <div className="relative min-w-[130px]">
              <select
                value={dateRange}
                onChange={(e) => setDateRange && setDateRange(e.target.value)}
                className="select-base text-xs h-9 min-h-9 py-0 pl-3 pr-7 font-semibold"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="ytd">Year to Date</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Platform */}
            <div className="relative min-w-[130px]">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform && setSelectedPlatform(e.target.value)}
                className="select-base text-xs h-9 min-h-9 py-0 pl-3 pr-7 font-semibold"
              >
                <option value="All">All Platforms</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="X">X (Twitter)</option>
                <option value="Pinterest">Pinterest</option>
                <option value="Facebook">Facebook</option>
              </select>
            </div>

            {/* Campaign */}
            <div className="relative min-w-[150px]">
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign && setSelectedCampaign(e.target.value)}
                className="select-base text-xs h-9 min-h-9 py-0 pl-3 pr-7 font-semibold"
              >
                <option value="All">All Campaigns</option>
                <option value="Product Launch 2026">Product Launch 2026</option>
                <option value="Dev Education">Dev Education</option>
                <option value="Thought Leadership">Thought Leadership</option>
                <option value="Daily AI Tips">Daily AI Tips</option>
              </select>
            </div>

            {/* Content Type */}
            {setSelectedContentType && (
              <div className="relative min-w-[130px]">
                <select
                  value={selectedContentType}
                  onChange={(e) => setSelectedContentType(e.target.value)}
                  className="select-base text-xs h-9 min-h-9 py-0 pl-3 pr-7 font-semibold"
                >
                  <option value="All">All Content Types</option>
                  <option value="Video">Video</option>
                  <option value="Carousel">Carousel</option>
                  <option value="Image">Image</option>
                  <option value="Article">Article</option>
                  <option value="Thread">Thread</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Toast Notification */}
      {exportToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold animate-slide-in">
          <Download size={16} className="text-emerald-400 dark:text-emerald-600" />
          <span>Generating Analytics PDF/CSV Report... Download will start shortly.</span>
        </div>
      )}
    </div>
  )
}
