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
    <Route path="/creator"                      element={<Navigate to="/creator/dashboard" replace />} />
    <Route path="/creator/dashboard"            element={<CreatorDashboard />} />
    <Route path="/creator/my-posts"             element={<MyPosts />} />
    <Route path="/creator/posts"                element={<Navigate to="/creator/my-posts" replace />} />
    <Route path="/creator/create-post"          element={<CreatePost />} />
    <Route path="/creator/content-scheduling"   element={<ContentScheduling />} />
    <Route path="/creator/scheduling"           element={<Navigate to="/creator/content-scheduling" replace />} />
    <Route path="/creator/publishing-calendar"   element={<PublishingCalendar />} />
    <Route path="/creator/calendar"             element={<Navigate to="/creator/publishing-calendar" replace />} />
    <Route path="/creator/campaigns"            element={<CreatorPlaceholder title="Campaigns" description="Manage sponsored brand promotions, tracking client requests, briefs, guidelines, and asset hand-ins." />} />
    <Route path="/creator/notifications"        element={<CreatorPlaceholder title="Notifications" description="Manage all notifications, direct reviewer feedback comments, and follower activities." />} />
    <Route path="/creator/profile"              element={<CreatorProfile />} />
    <Route path="/creator/settings"             element={<CreatorSettings />} />
  </Route>
)
