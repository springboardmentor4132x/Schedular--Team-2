# Database

PostgreSQL relational store accessed through SQLAlchemy 2.0 (pg8000 driver).
Schema changes are managed with **Alembic** migrations in `backend/alembic/`.

## Tables

### Users & auth
| Table | Purpose |
|---|---|
| `users` | Platform users (id, name, email, phone, password_hash, role, bio, company, location, website, avatar_url, created_at, last_login) |
| `user_settings` | Per-user settings/preferences |
| `support_tickets` | User support tickets |

### Content & publishing
| Table | Purpose |
|---|---|
| `posts` | Posts (title, caption, content_type, status, scheduled_for, media, platform links, published_at) |
| `post_social_accounts` | Posts ↔ connected social accounts (many-to-many) |
| `publishing_queue` | Queued publishing jobs (scheduled_time, processing_status, retry_count, max_retries) |
| `publishing_logs` | Log of every publishing attempt (status, api_response, failure_reason, platform_post_id) |

### Campaigns
| Table | Purpose |
|---|---|
| `campaigns` | Campaigns (name, description, status, start/end dates, user_id) |
| `campaign_posts` | Campaign ↔ posts relationship |

### Social accounts
| Table | Purpose |
|---|---|
| `social_accounts` | Connected platform accounts (platform, username, tokens, user_id) |

### Analytics
| Table | Purpose |
|---|---|
| `post_analytics` | Per-post metrics (reach, impressions, engagement, clicks, likes, comments, shares) |
| `campaign_analytics` | Per-campaign aggregated metrics |
| `platform_analytics` | Per-platform aggregated metrics |
| `audience_analytics` | Audience demographics/growth metrics |

### Notifications
| Table | Purpose |
|---|---|
| `notifications` | Notifications (user_id, type, title, message, read, signature, category, read_at, delivery_channel, created_at) |
| `notification_preferences` | Per-user preference toggles (publishing, campaign, account, collaboration, system, in_app, email, email_frequency) |

### Reports
| Table | Purpose |
|---|---|
| `generated_reports` | Generated reports (name, type, campaign_id, filters, format, status, file location, download_count) |

### Collaboration
| Table | Purpose |
|---|---|
| `workspaces` | Workspaces owned by business users |
| `workspace_members` | Workspace membership (Owner, Marketing, …) |
| `team_requests` | Business ↔ marketing team connection requests |
| `work_requests` | Business briefs submitted to marketing teams (status, decision_note, reviewed_by_id) |

## Key relationships

```
users 1───N posts 1───N publishing_logs
users 1───N campaigns 1───N posts (campaign_posts)
users 1───N social_accounts N───N posts (post_social_accounts)
users 1───1 user_settings
users 1───N notifications 1───1 notification_preferences
users 1───N generated_reports
users 1───N workspaces 1───N workspace_members
business workspace ──N── marketing team (team_requests / workspace_members)
users 1───N post_analytics / campaign_analytics / platform_analytics / audience_analytics
```

## Conventions

- Status strings stored uppercase: `Draft, Scheduled, Queued, Publishing, Published, Failed, Cancelled`.
- Queue statuses: `Pending, Processing, Completed, Failed, Cancelled`.
- All timestamps are timezone-aware `DateTime(timezone=True)`.
- Notifications use a `signature` column as a dedupe key so event-driven creation never duplicates.

## Migrations

```bash
cd backend
alembic upgrade head              # apply pending migrations
alembic revision -m "description" # create a new migration
```
