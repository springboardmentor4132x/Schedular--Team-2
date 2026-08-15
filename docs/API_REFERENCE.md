# API Reference

All endpoints are prefixed with `/api/v1`. Authentication uses
`Authorization: Bearer <token>` (JWT). Swagger UI is available at
`http://127.0.0.1:8000/docs`.

## Auth — `/auth`

| Method | Path | Description |
|---|---|---|
| GET | `/auth/admin-exists` | Whether an administrator account exists |
| POST | `/auth/register` | Register a new user (all 4 roles) |
| POST | `/auth/login` | Login (OAuth2 form: `username` = email, `password`) → access + refresh token |
| POST | `/auth/refresh` | Exchange refresh token for a new access token |
| GET | `/auth/me` | Current user details |
| PUT | `/auth/me` | Update current user profile |
| POST | `/auth/change-password` | Change password (verifies current password) |
| GET | `/auth/google/login` | Start Google OAuth flow |
| GET | `/auth/google/callback` | Google OAuth callback |

## Posts — `/posts`

| Method | Path | Description |
|---|---|---|
| GET | `/posts/` | List posts (filters: status, search) |
| POST | `/posts/` | Create a post |
| POST | `/posts/schedule` | Schedule a post |
| POST | `/posts/save-draft` | Save a post as draft |
| POST | `/posts/upload-media` | Upload media (MIME/size validated) |
| POST | `/posts/preview` | Generate post preview |
| GET | `/posts/scheduled` | Scheduled posts |
| GET | `/posts/published` | Published posts |
| GET | `/posts/failed` | Failed posts |
| GET | `/posts/calendar` | Publishing calendar data |
| GET | `/posts/queue` | Post queue |
| POST | `/posts/publish/{post_id}` | Publish now |
| POST | `/posts/recurring` | Create a recurring schedule |
| POST | `/posts/retry/{post_id}/{retry_count}` | Retry a failed post |
| GET | `/posts/{post_id}` | Single post |
| PUT | `/posts/{post_id}` | Update post |
| DELETE | `/posts/{post_id}` | Delete post |

## Campaigns — `/campaigns`

| Method | Path | Description |
|---|---|---|
| POST | `/campaigns/` | Create campaign |
| GET | `/campaigns/` | List campaigns |
| POST | `/campaigns/{campaign_id}/assign-post/{post_id}` | Assign post to campaign |
| DELETE | `/campaigns/{campaign_id}/remove-post/{post_id}` | Remove post from campaign |
| GET | `/campaigns/{campaign_id}/timeline` | Campaign timeline |
| GET | `/campaigns/{campaign_id}/progress` | Campaign progress |
| GET | `/campaigns/{campaign_id}/summary` | Campaign summary |
| GET | `/campaigns/{campaign_id}` | Single campaign |
| PUT | `/campaigns/{campaign_id}` | Update campaign |
| DELETE | `/campaigns/{campaign_id}` | Delete campaign |
| GET | `/campaigns/{campaign_id}/analytics` | Campaign analytics |
| GET | `/campaigns/{campaign_id}/performance` | Campaign performance |

## Publishing — `/publish` and `/publishing`

| Method | Path | Description |
|---|---|---|
| GET | `/publish/ready` | Posts ready to publish |
| POST | `/publish/{post_id}` | Publish a post |
| POST | `/publish/retry/{post_id}` | Retry a failed publish |
| POST | `/publish/cancel/{post_id}` | Cancel a queued publish |
| GET | `/publish/history` | Platform publishing history |
| GET | `/publish/logs` | Publishing logs |
| GET | `/publish/queue` | Publishing queue |
| GET | `/publishing/dashboard` | Publishing dashboard stats |
| GET | `/publishing/queue` | Queue items (pagination, filters) |
| PATCH | `/publishing/queue/{queue_id}/reschedule` | Reschedule queue item |
| PATCH | `/publishing/queue/{queue_id}/cancel` | Cancel queue item |
| PATCH | `/publishing/queue/{queue_id}/pause` | Pause queue item |
| PATCH | `/publishing/queue/{queue_id}/resume` | Resume queue item |
| GET | `/publishing/logs` | Publishing logs (filters) |
| GET | `/publishing/failed` | Failed posts |
| POST | `/publishing/failed/{post_id}/retry` | Retry failed post |
| GET | `/publishing/history/{platform}` | Per-platform history |
| GET | `/publishing/monitor` | Queue monitor |

## Analytics — `/analytics`

| Method | Path | Description |
|---|---|---|
| GET | `/analytics/dashboard` | Analytics dashboard overview |
| GET | `/analytics/posts` | Post analytics |
| GET | `/analytics/posts/{post_id}` | Single post analytics |
| GET | `/analytics/posts/top/list` | Top performing posts |
| GET | `/analytics/audience` | Audience analytics |
| GET | `/analytics/campaigns` | Campaign analytics |
| GET | `/analytics/campaigns/{campaign_id}` | Single campaign analytics |
| GET | `/analytics/campaigns/top/list` | Top campaigns |
| GET | `/analytics/platforms` | Platform analytics |
| GET | `/analytics/platforms/compare` | Platform comparison |
| GET | `/analytics/trends` | Performance trends |
| GET | `/analytics/{metric}` | Metric endpoints (engagement, followers, reach, impressions, clicks…) |

## Notifications — `/notifications`

| Method | Path | Description |
|---|---|---|
| GET | `/notifications/` | List notifications (filters: unread, category, search) |
| GET | `/notifications/unread-count` | Unread notification count |
| GET | `/notifications/preferences/settings` | Get notification preferences |
| PUT | `/notifications/preferences/settings` | Update notification preferences |
| GET | `/notifications/team/activity` | Team activity feed |
| GET | `/notifications/{notification_id}` | Single notification |
| POST | `/notifications/read-all` | Mark all as read |
| POST | `/notifications/{notification_id}/read` | Mark one as read |
| DELETE | `/notifications/{notification_id}` | Delete one |
| DELETE | `/notifications/` | Clear all |

## Reports — `/reports`

| Method | Path | Description |
|---|---|---|
| GET | `/reports/` | List generated reports |
| POST | `/reports/generate` | Generate a report (type, filters, format) |
| GET | `/reports/preview/{report_id}` | Report preview data |
| GET | `/reports/download/{report_id}` | Download report file (PDF/Excel) |
| DELETE | `/reports/{report_id}` | Delete a report |

## Admin — `/admin`

| Method | Path | Description |
|---|---|---|
| GET | `/admin/stats` | Platform-wide summary stats |
| GET | `/admin/activity` | Recent platform activity |
| GET | `/admin/analytics/summary` | Platform KPI summary |
| GET | `/admin/analytics/top-posts` | Top performing posts |
| GET | `/admin/analytics/creators` | Creator performance |
| GET | `/admin/analytics/campaigns` | Campaign analytics |
| GET | `/admin/analytics/platforms` | Platform analytics |
| GET | `/admin/analytics/audience` | Audience analytics |
| GET | `/admin/analytics/trends` | Platform trends |
| POST | `/admin/reports/generate` | Generate a platform-wide report |

## Business — `/business`

| Method | Path | Description |
|---|---|---|
| GET | `/business/dashboard` | Business dashboard data |
| GET | `/business/work-requests` | Work requests |
| POST | `/business/work-requests` | Submit a work request |
| GET | `/business/brand-guidelines` | Brand guidelines |
| PUT | `/business/brand-guidelines` | Update brand guidelines |
| GET | `/business/campaigns` | Business campaigns |
| GET | `/business/campaigns/{campaign_id}/progress` | Campaign progress |
| GET | `/business/posts` | Business posts |
| GET | `/business/posts/scheduled` | Scheduled posts |
| GET | `/business/analytics` | Business analytics |
| GET | `/business/marketing-activity` | Marketing activity |
| GET | `/business/assigned-team` | Assigned marketing team |
| GET | `/business/marketing-teams` | Available marketing teams |
| POST | `/business/request-marketing-team` | Request a marketing team |
| GET | `/business/team-requests` | Team requests |
| POST | `/business/team-requests/{request_id}/cancel` | Cancel a team request |
| POST | `/business/remove-marketing-team` | Remove marketing team |

## Marketing — `/marketing`

| Method | Path | Description |
|---|---|---|
| GET | `/marketing/work-requests` | Incoming work requests |
| POST | `/marketing/work-requests/{request_id}/decision` | Approve/reject work request |
| GET | `/marketing/clients` | Client list |
| GET | `/marketing/connection-requests` | Team connection requests |
| POST | `/marketing/connection-requests/{request_id}/decision` | Connection decision |
| GET | `/marketing/dashboard` | Marketing dashboard |
| GET | `/marketing/clients/{client_id}/workspace` | Client workspace |
| POST | `/marketing/clients/{client_id}/posts` | Create post for client |
| PUT | `/marketing/clients/{client_id}/posts/{post_id}` | Update client post |
| POST | `/marketing/clients/{client_id}/campaigns` | Create client campaign |
| GET | `/marketing/analytics` | Marketing analytics |
| GET | `/marketing/reports` | Marketing reports |

## Social Accounts — `/social-accounts`

| Method | Path | Description |
|---|---|---|
| GET | `/social-accounts/` | List connected accounts |
| GET | `/social-accounts/{platform}/connect` | Start OAuth connect (facebook, linkedin, youtube, instagram, twitter, pinterest) |
| GET | `/social-accounts/{platform}/callback` | OAuth callback per platform |
| POST | `/social-accounts/{account_id}/sync` | Sync account data |
| DELETE | `/social-accounts/{account_id}` | Disconnect account |
| POST | `/social-accounts/{platform}/post` | Post to a platform (facebook, linkedin, youtube, instagram, twitter) |
| GET | `/social-accounts/instagram/account` | Instagram account info |
| POST | `/social-accounts/{platform}/sync-analytics/{account_id}` | Sync platform analytics |
| GET | `/social-accounts/facebook/insights` | Facebook insights |
| POST | `/social-accounts/facebook/photo` | Post a photo to Facebook |

## Users (admin) — `/users`

| Method | Path | Description |
|---|---|---|
| GET | `/users/` | List users (admin; filters: role, search) |
| GET | `/users/{user_id}` | Single user (admin) |
| PUT | `/users/{user_id}` | Update user (admin) |
| DELETE | `/users/{user_id}` | Delete user (admin) |

## Workspaces & Settings

| Method | Path | Description |
|---|---|---|
| GET | `/workspaces/` | List workspaces |
| GET | `/settings/` | Get current user's settings |
| PUT | `/settings/` | Update current user's settings |
