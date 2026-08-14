import React from 'react'
import { Filter, Calendar, Layers, Target, FileCode } from 'lucide-react'

export default function ReportFilters({ filters, onChange }) {
  return (
    <div className="card p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <Filter size={15} className="text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Report Filters
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Selector */}
        <div className="space-y-1">
          <label className="label-base text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar size={12} />
            <span>Date Range</span>
          </label>
          <select
            value={filters.dateRange || '30d'}
            onChange={(e) => onChange({ ...filters, dateRange: e.target.value })}
            className="input-base select-base text-xs py-1.5"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date (YTD)</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Platform Selector */}
        <div className="space-y-1">
          <label className="label-base text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Layers size={12} />
            <span>Platform</span>
          </label>
          <select
            value={filters.platform || 'All'}
            onChange={(e) => onChange({ ...filters, platform: e.target.value })}
            className="input-base select-base text-xs py-1.5"
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

        {/* Campaign Selector */}
        <div className="space-y-1">
          <label className="label-base text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Target size={12} />
            <span>Campaign</span>
          </label>
          <select
            value={filters.campaign || 'All'}
            onChange={(e) => onChange({ ...filters, campaign: e.target.value })}
            className="input-base select-base text-xs py-1.5"
          >
            <option value="All">All Campaigns</option>
            <option value="Product Launch 2026">Product Launch 2026</option>
            <option value="Dev Education Wave">Dev Education Wave</option>
            <option value="Thought Leadership Q1">Thought Leadership Q1</option>
            <option value="Daily AI Tips Series">Daily AI Tips Series</option>
          </select>
        </div>

        {/* Content Type Selector */}
        <div className="space-y-1">
          <label className="label-base text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <FileCode size={12} />
            <span>Content Type</span>
          </label>
          <select
            value={filters.contentType || 'All'}
            onChange={(e) => onChange({ ...filters, contentType: e.target.value })}
            className="input-base select-base text-xs py-1.5"
          >
            <option value="All">All Formats</option>
            <option value="Carousel">Carousel</option>
            <option value="Video">Video / Reel</option>
            <option value="Article">Article / Post</option>
            <option value="Thread">Thread</option>
          </select>
        </div>
      </div>
    </div>
  )
}
