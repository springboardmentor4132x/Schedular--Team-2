import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminAnalyticsTabs from '../../components/AdminAnalyticsTabs'
import AnalyticsHeader from '../../../creator/components/analytics/AnalyticsHeader'

export default function AdminAnalyticsLayout() {
  const [dateRange, setDateRange] = useState('30d')
  const [selectedPlatform, setSelectedPlatform] = useState('All')
  const [selectedCampaign, setSelectedCampaign] = useState('All')
  const [selectedContentType, setSelectedContentType] = useState('All')

  return (
    <div className="space-y-6 animate-fade-in">
      <AnalyticsHeader
        title="Admin Analytics"
        subtitle="System-wide performance metrics, creator growth, campaign ROI, and platform analytics"
        badgeText="Admin View"
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        selectedCampaign={selectedCampaign}
        setSelectedCampaign={setSelectedCampaign}
        selectedContentType={selectedContentType}
        setSelectedContentType={setSelectedContentType}
      />

      <AdminAnalyticsTabs />

      <main>
        <Outlet context={{ dateRange, selectedPlatform, selectedCampaign, selectedContentType }} />
      </main>
    </div>
  )
}
