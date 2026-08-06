import React from 'react'
import { Calendar, Layers, Filter, FileText } from 'lucide-react'

/**
 * Reusable AnalyticsFilters component
 */
export default function AnalyticsFilters({
  dateRange = '30d',
  setDateRange,
  selectedPlatform = 'All',
  setSelectedPlatform,
  selectedCampaign = 'All',
  setSelectedCampaign,
  selectedContentType = 'All',
  setSelectedContentType,
  campaigns = [],
  className = ''
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {/* Date Range Selector */}
      {setDateRange && (
        <div className="flex items-center gap-1.5 bg-surface border border-default rounded-xl p-1 text-xs">
          <Calendar size={14} className="text-secondary ml-1" />
          {[
            { id: '7d', label: '7D' },
            { id: '30d', label: '30D' },
            { id: '90d', label: '90D' },
            { id: 'ytd', label: 'YTD' },
            { id: 'all', label: 'All' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDateRange(item.id)}
              className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                dateRange === item.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-secondary hover:text-primary hover:bg-hover'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Platform Selector */}
      {setSelectedPlatform && (
        <div className="flex items-center gap-1.5 bg-surface border border-default rounded-xl px-2.5 py-1 text-xs">
          <Layers size={14} className="text-secondary" />
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-transparent text-primary font-bold focus:outline-none cursor-pointer"
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
      )}

      {/* Campaign Selector */}
      {setSelectedCampaign && (
        <div className="flex items-center gap-1.5 bg-surface border border-default rounded-xl px-2.5 py-1 text-xs">
          <Filter size={14} className="text-secondary" />
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="bg-transparent text-primary font-bold focus:outline-none cursor-pointer"
          >
          <option value="All">All Campaigns</option>
          {campaigns.length > 0 ? (
            campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))
          ) : (
            <>
              <option value="Product Launch 2026">Product Launch 2026</option>
              <option value="Dev Education">Dev Education</option>
              <option value="Thought Leadership">Thought Leadership</option>
              <option value="Daily AI Tips">Daily AI Tips</option>
            </>
          )}
          </select>
        </div>
      )}

      {/* Content Type Selector */}
      {setSelectedContentType && (
        <div className="flex items-center gap-1.5 bg-surface border border-default rounded-xl px-2.5 py-1 text-xs">
          <FileText size={14} className="text-secondary" />
          <select
            value={selectedContentType}
            onChange={(e) => setSelectedContentType(e.target.value)}
            className="bg-transparent text-primary font-bold focus:outline-none cursor-pointer"
          >
            <option value="All">All Content Types</option>
            <option value="Image">Image</option>
            <option value="Video">Video</option>
            <option value="Carousel">Carousel</option>
            <option value="Article">Article</option>
            <option value="Thread">Thread</option>
            <option value="Reel">Reel</option>
          </select>
        </div>
      )}
    </div>
  )
}
