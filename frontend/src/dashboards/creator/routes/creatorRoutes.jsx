import { Route, Navigate } from 'react-router-dom'

import CreatorLayout from '../layouts/CreatorLayout'
import CreatorDashboard from '../pages/CreatorDashboard'
import MyPosts from '../pages/MyPosts'
import ContentScheduling from '../pages/ContentScheduling'
import PublishingCalendar from '../pages/PublishingCalendar'
import CreatorProfile from '../pages/CreatorProfile'
import CreatorSettings from '../pages/CreatorSettings'
import SocialAccounts from '../pages/SocialAccounts'
import CampaignDashboard from '../pages/CampaignDashboard'
import CreateCampaign from '../pages/CreateCampaign'
import CampaignDetails from '../pages/CampaignDetails'
import CampaignAssignPosts from '../pages/CampaignAssignPosts'
import CampaignTimeline from '../pages/CampaignTimeline'
import CampaignAnalytics from '../pages/CampaignAnalytics'
import Notifications from '../../shared/pages/Notifications'

export const creatorRoutes = (
  <Route element={<CreatorLayout />}>

    <Route
      path="/dashboard/creator"
      element={<Navigate to="/dashboard/creator/dashboard" replace />}
    />

    <Route
      path="/dashboard/creator/dashboard"
      element={<CreatorDashboard />}
    />

    <Route
      path="/dashboard/creator/my-posts"
      element={<MyPosts />}
    />

    <Route
      path="/dashboard/creator/posts"
      element={<Navigate to="/dashboard/creator/my-posts" replace />}
    />

    <Route
      path="/dashboard/creator/create-post"
      element={<Navigate to="/dashboard/creator/content-scheduling" replace />}
    />

    <Route
      path="/dashboard/creator/content-scheduling"
      element={<ContentScheduling />}
    />

    <Route
      path="/dashboard/creator/scheduling"
      element={<Navigate to="/dashboard/creator/content-scheduling" replace />}
    />

    <Route
      path="/dashboard/creator/publishing-calendar"
      element={<PublishingCalendar />}
    />

    <Route
      path="/dashboard/creator/calendar"
      element={<Navigate to="/dashboard/creator/publishing-calendar" replace />}
    />

    <Route
      path="/dashboard/creator/campaigns/new"
      element={<CreateCampaign />}
    />

    <Route
      path="/dashboard/creator/campaigns/:id/assign-posts"
      element={<CampaignAssignPosts />}
    />

    <Route
      path="/dashboard/creator/campaigns/:id/timeline"
      element={<CampaignTimeline />}
    />

    <Route
      path="/dashboard/creator/campaigns/:id/analytics"
      element={<CampaignAnalytics />}
    />

    <Route
      path="/dashboard/creator/campaigns/:id"
      element={<CampaignDetails />}
    />

    <Route
      path="/dashboard/creator/campaigns"
      element={<CampaignDashboard />}
    />

    <Route
      path="/dashboard/creator/social-accounts"
      element={<SocialAccounts />}
    />

    <Route
      path="/dashboard/creator/notifications"
      element={<Notifications />}
    />

    <Route
      path="/dashboard/creator/profile"
      element={<CreatorProfile />}
    />

    <Route
      path="/dashboard/creator/settings"
      element={<CreatorSettings />}
    />

  </Route>
)