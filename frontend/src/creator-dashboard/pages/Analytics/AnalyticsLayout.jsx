import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AnalyticsHeader from '../../components/analytics/AnalyticsHeader'
import AnalyticsTabs from '../../components/analytics/AnalyticsTabs'

export default function AnalyticsLayout() {
  const [dateRange, setDateRange] = useState('30d')
  const [selectedPlatform, setSelectedPlatform] = useState('All')
  const [selectedCampaign, setSelectedCampaign] = useState('All')
  const [selectedContentType, setSelectedContentType] = useState('All')

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Banner & Global Filter Toolbar */}
      <AnalyticsHeader
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        selectedCampaign={selectedCampaign}
        setSelectedCampaign={setSelectedCampaign}
        selectedContentType={selectedContentType}
        setSelectedContentType={setSelectedContentType}
      />

      {/* Analytics Sub-Navigation Tabs */}
      <AnalyticsTabs />

      {/* Sub-Page Content */}
      <div className="min-h-[500px]">
        <Outlet
          context={{
            dateRange,
            selectedPlatform,
            selectedCampaign,
            selectedContentType
          }}
        />
      </div>
    </div>
  )
}
