import React from 'react'
import { Route, Navigate } from 'react-router-dom'
import AnalyticsLayout from '../pages/Analytics/AnalyticsLayout'
import AnalyticsDashboard from '../pages/Analytics/AnalyticsDashboard'
import ContentAnalytics from '../pages/Analytics/ContentAnalytics'
import AudienceAnalytics from '../pages/Analytics/AudienceAnalytics'
import CampaignAnalytics from '../pages/Analytics/CampaignAnalytics'
import PlatformComparison from '../pages/Analytics/PlatformComparison'
import PerformanceTrends from '../pages/Analytics/PerformanceTrends'

export const analyticsRoutes = (
  <Route path="/creator/analytics" element={<AnalyticsLayout />}>
    <Route index element={<AnalyticsDashboard />} />
    <Route path="content" element={<ContentAnalytics />} />
    <Route path="audience" element={<AudienceAnalytics />} />
    <Route path="campaigns" element={<CampaignAnalytics />} />
    <Route path="platforms" element={<PlatformComparison />} />
    <Route path="performance" element={<PerformanceTrends />} />
  </Route>
)
