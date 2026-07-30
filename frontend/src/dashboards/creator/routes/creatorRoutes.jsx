import { Route, Navigate } from 'react-router-dom'
import CreatorLayout from '../layouts/CreatorLayout'
import CreatorDashboard from '../pages/CreatorDashboard'
import MyPosts from '../pages/MyPosts'
import CreatePost from '../pages/CreatePost'
import ContentScheduling from '../pages/ContentScheduling'
import PublishingCalendar from '../pages/PublishingCalendar'
import CreatorProfile from '../pages/CreatorProfile'
import CreatorSettings from '../pages/CreatorSettings'
import CreatorPlaceholder from '../pages/CreatorPlaceholder'

export const creatorRoutes = (
  <Route element={<CreatorLayout />}>
    <Route path="/dashboard/creator"            element={<Navigate to="/dashboard/creator/dashboard" replace />} />
    <Route path="/dashboard/creator/dashboard"  element={<CreatorDashboard />} />
    <Route path="/dashboard/creator/my-posts"   element={<MyPosts />} />
    <Route path="/dashboard/creator/posts"      element={<Navigate to="/dashboard/creator/my-posts" replace />} />
    <Route path="/dashboard/creator/create-post" element={<CreatePost />} />
    <Route path="/dashboard/creator/content-scheduling" element={<ContentScheduling />} />
    <Route path="/dashboard/creator/scheduling" element={<Navigate to="/dashboard/creator/content-scheduling" replace />} />
    <Route path="/dashboard/creator/publishing-calendar" element={<PublishingCalendar />} />
    <Route path="/dashboard/creator/calendar"   element={<Navigate to="/dashboard/creator/publishing-calendar" replace />} />
    <Route path="/dashboard/creator/campaigns"  element={<CreatorPlaceholder title="Campaigns" description="Manage sponsored brand promotions, tracking client requests, briefs, guidelines, and asset hand-ins." />} />
    <Route path="/dashboard/creator/notifications" element={<CreatorPlaceholder title="Notifications" description="Manage all notifications, direct reviewer feedback comments, and follower activities." />} />
    <Route path="/dashboard/creator/profile"    element={<CreatorProfile />} />
    <Route path="/dashboard/creator/settings"   element={<CreatorSettings />} />
  </Route>
)
