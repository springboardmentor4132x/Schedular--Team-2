import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import AnalyticsHeader from '../../components/analytics/AnalyticsHeader'
import AnalyticsTabs from '../../components/analytics/AnalyticsTabs'
import { getCampaignAnalytics } from '../../../../services/analyticsService'

export default function AnalyticsLayout() {
  const [dateRange, setDateRange] = useState('30d')
  const [selectedPlatform, setSelectedPlatform] = useState('All')
  const [selectedCampaign, setSelectedCampaign] = useState('All')
  const [selectedContentType, setSelectedContentType] = useState('All')
  const [campaigns, setCampaigns] = useState([])

  useEffect(() => {
    getCampaignAnalytics()
      .then((res) => setCampaigns(res.campaigns || []))
      .catch(() => {})
  }, [])

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
        campaigns={campaigns}
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
            selectedContentType,
            campaigns
          }}
        />
      </div>
    </div>
  )
}
