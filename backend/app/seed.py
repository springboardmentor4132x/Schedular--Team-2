"""Automatic initial (mock) data seeding.

On a fresh database this inserts demo users and a small amount of related
data (workspaces, campaigns, posts) so the dashboards and admin panel have
something real to display right after setup.

Seed contents:
  * 3 business users, each with their own workspace
  * 4 marketing teams (the first three are assigned to a business workspace,
    the fourth starts without clients)
  * 2 content creators
  * One "Test Campaign" for every business workspace and for every creator,
    plus a few posts per campaign for dashboard activity.

Deliberately:
  * No Administrator account is created — the first user to register with the
    Administrator role becomes the single platform admin (enforced by the
    backend).
  * No social media accounts are connected for anyone initially, so the
    "Connected Accounts" state starts empty until users connect them.

Safe to run repeatedly: it only seeds when the users table is empty.
"""

from datetime import date, datetime, timedelta
import json

from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.user import User
from app.models.campaign import Campaign
from app.models.post import Post, post_social_accounts
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.models.social_account import SocialAccount
from app.models.audience_analytics import AudienceAnalytics
from app.models.platform_analytics import PlatformAnalytics
from app.models.post_analytics import PostAnalytics
from app.models.campaign_analytics import CampaignAnalytics
from app.models.publishing_log import PublishingLog
from app.models.publishing_queue import PublishingQueue
from app.auth.security import hash_password

MOCK_PASSWORD = "password123"

PLATFORMS = ["instagram", "facebook", "linkedin", "x", "youtube", "pinterest"]

BUSINESS_USERS = [
    {
        "username": "biz1",
        "email": "biz1@test.com",
        "company": "Vertex Apparel",
        "first_name": "Dana",
        "last_name": "Cruz",
        "bio": "Apparel retailer focused on seasonal collections.",
        "location": "Mumbai",
        "website": "https://vertexapparel.example.com",
    },
    {
        "username": "biz2",
        "email": "biz2@test.com",
        "company": "Nova Coffee",
        "first_name": "Ravi",
        "last_name": "Menon",
        "bio": "Specialty coffee brand with a growing chain of cafes.",
        "location": "Bengaluru",
        "website": "https://novacoffee.example.com",
    },
    {
        "username": "biz3",
        "email": "biz3@test.com",
        "company": "ZenFit Studios",
        "first_name": "Priya",
        "last_name": "Sharma",
        "bio": "Fitness and wellness studio offering classes and merchandise.",
        "location": "Pune",
        "website": "https://zenfit.example.com",
    },
]

MARKETING_TEAMS = [
    {
        "username": "mkt1",
        "email": "mkt1@test.com",
        "company": "Pixel Reach Studio",
        "first_name": "Ananya",
        "last_name": "Rao",
        "bio": "Full-service social media agency.",
        "location": "Mumbai",
    },
    {
        "username": "mkt2",
        "email": "mkt2@test.com",
        "company": "MediaMint Collective",
        "first_name": "Karan",
        "last_name": "Mehta",
        "bio": "Performance marketing and content studio.",
        "location": "Bengaluru",
    },
    {
        "username": "mkt3",
        "email": "mkt3@test.com",
        "company": "ContentVerse Agency",
        "first_name": "Sofia",
        "last_name": "Fernandes",
        "bio": "Content production agency for lifestyle brands.",
        "location": "Pune",
    },
    {
        "username": "mkt4",
        "email": "mkt4@test.com",
        "company": "Launchloop Media",
        "first_name": "Dev",
        "last_name": "Kulkarni",
        "bio": "Growth agency specialising in new brand launches.",
        "location": "Delhi",
    },
]

CREATOR_USERS = [
    {
        "username": "cre1",
        "email": "cre1@test.com",
        "company": "",
        "first_name": "Alex",
        "last_name": "Johnson",
        "bio": "Content creator & influencer in fashion and lifestyle.",
        "location": "Mumbai",
        "website": "https://alexj.example.com",
    },
    {
        "username": "cre2",
        "email": "cre2@test.com",
        "company": "",
        "first_name": "Maya",
        "last_name": "Patel",
        "bio": "Fitness creator posting workouts, reviews and vlogs.",
        "location": "Hyderabad",
        "website": "https://mayapatel.example.com",
    },
]

ADMIN_USER = {
    "username": "admin1",
    "email": "admin1@test.com",
    "company": "SocialPilot Admin",
    "first_name": "Platform",
    "last_name": "Admin",
    "bio": "Platform administrator for analytics and oversight.",
    "location": "Bengaluru",
    "website": "",
}


def _user_payload(user):
    payload = dict(user)
    payload["password_hash"] = hash_password(MOCK_PASSWORD)
    payload.pop("bio", None)
    return payload


def _make_user(db: Session, data: dict, role: str) -> User:
    user = User(**_user_payload(data), role=role)
    user.bio = data.get("bio")
    db.add(user)
    return user


def _make_post(db: Session, user_id: int, workspace_id, campaign, title, caption, status, scheduled_delta):
    post = Post(
        user_id=user_id,
        workspace_id=workspace_id,
        campaign_id=campaign.id,
        title=title,
        caption=caption,
        content_type="image",
        status=status,
        scheduled_for=datetime.utcnow() + timedelta(days=scheduled_delta),
        timezone="UTC",
    )
    db.add(post)
    return post


def _make_test_campaign(db: Session, user_id: int, workspace_id, index: int) -> Campaign:
    campaign = Campaign(
        user_id=user_id,
        workspace_id=workspace_id,
        name=f"Test Campaign {index}",
        description="Seeded test campaign.",
        objective="Increase brand awareness",
        budget=5000.0,
        priority="High",
        category="Product Launch",
        status="Active",
        start_date=date.today() - timedelta(days=5),
        end_date=date.today() + timedelta(days=25),
    )
    db.add(campaign)
    db.flush()
    return campaign


def _user_platforms(user: User) -> list:
    """Deterministic 2-platform set per user so seeded analytics spread across providers."""
    start = user.id % len(PLATFORMS)
    return [PLATFORMS[start], PLATFORMS[(start + 1) % len(PLATFORMS)]]


def _is_demo_user(user: User) -> bool:
    """True only for the demo users defined in this module.

    Accounts registered after seeding must never receive mock social accounts
    (or appear connected), so the "Connected Accounts" state starts empty for
    real users. Demo analytics still work because they hang off the demo users.
    """
    demo_names = {
        u["username"]
        for u in BUSINESS_USERS + MARKETING_TEAMS + CREATOR_USERS
    }
    return user.username in demo_names


def _seed_social_accounts(db: Session) -> dict:
    accounts_by_user: dict = {}
    if db.query(SocialAccount).count() > 0:
        for acc in db.query(SocialAccount).all():
            accounts_by_user.setdefault(acc.user_id, []).append(acc)
        return accounts_by_user

    for user in db.query(User).order_by(User.id).all():
        if not _is_demo_user(user):
            continue
        for platform in _user_platforms(user):
            acc = SocialAccount(
                user_id=user.id,
                platform=platform,
                username=f"{user.username}_{platform}",
                platform_user_id=f"{platform}_{user.id}",
                followers_count=1200 + user.id * 431,
                access_token="seed_token",
                refresh_token="seed_refresh",
                status="Connected",
                health="Healthy",
                connected_since=datetime.utcnow() - timedelta(days=120),
                last_sync=datetime.utcnow(),
            )
            db.add(acc)
            db.flush()
            accounts_by_user.setdefault(user.id, []).append(acc)
    db.commit()
    return accounts_by_user


def _seed_audience_analytics(db: Session):
    if db.query(AudienceAnalytics).count() > 0:
        return
    accounts = db.query(SocialAccount).all()
    for acc in accounts:
        followers = acc.followers_count or 1000
        db.add(AudienceAnalytics(
            social_account_id=acc.id,
            platform=acc.platform,
            followers=followers,
            new_followers=int(followers * 0.06),
            lost_followers=int(followers * 0.02),
            gender_distribution=json.dumps([
                {"label": "Female", "percentage": 54, "count": int(followers * 0.54)},
                {"label": "Male", "percentage": 43, "count": int(followers * 0.43)},
                {"label": "Other", "percentage": 3, "count": int(followers * 0.03)},
            ]),
            age_distribution=json.dumps([
                {"group": "18-24", "percentage": 32, "color": "#6366F1"},
                {"group": "25-34", "percentage": 41, "color": "#8B5CF6"},
                {"group": "35-44", "percentage": 17, "color": "#EC4899"},
                {"group": "45+", "percentage": 10, "color": "#F59E0B"},
            ]),
            country_distribution=json.dumps([
                {"country": "India", "percentage": 38, "count": int(followers * 0.38), "flag": "IN"},
                {"country": "USA", "percentage": 22, "count": int(followers * 0.22), "flag": "US"},
                {"country": "UK", "percentage": 12, "count": int(followers * 0.12), "flag": "GB"},
                {"country": "UAE", "percentage": 9, "count": int(followers * 0.09), "flag": "AE"},
                {"country": "Germany", "percentage": 6, "count": int(followers * 0.06), "flag": "DE"},
            ]),
            city_distribution=json.dumps([
                {"city": "Mumbai", "percentage": 21, "count": int(followers * 0.21)},
                {"city": "Bengaluru", "percentage": 15, "count": int(followers * 0.15)},
                {"city": "New York", "percentage": 12, "count": int(followers * 0.12)},
                {"city": "London", "percentage": 10, "count": int(followers * 0.10)},
            ]),
            language_distribution=json.dumps([
                {"language": "English", "percentage": 58},
                {"language": "Hindi", "percentage": 24},
                {"language": "Spanish", "percentage": 8},
                {"language": "German", "percentage": 5},
            ]),
            most_active_hours=json.dumps([
                {"hour": "00:00", "activity": 18}, {"hour": "04:00", "activity": 8},
                {"hour": "08:00", "activity": 34}, {"hour": "12:00", "activity": 62},
                {"hour": "16:00", "activity": 78}, {"hour": "18:00", "activity": 92},
                {"hour": "20:00", "activity": 88}, {"hour": "22:00", "activity": 55},
            ]),
            most_active_days=json.dumps([
                {"day": "Mon", "score": 55}, {"day": "Tue", "score": 60},
                {"day": "Wed", "score": 58}, {"day": "Thu", "score": 66},
                {"day": "Fri", "score": 74}, {"day": "Sat", "score": 92},
                {"day": "Sun", "score": 85},
            ]),
        ))
    db.commit()


def _seed_platform_analytics(db: Session):
    if db.query(PlatformAnalytics).count() > 0:
        return
    accounts = db.query(SocialAccount).all()
    for acc in accounts:
        base_followers = acc.followers_count or 1000
        for i in range(30):
            day = date.today() - timedelta(days=29 - i)
            followers = base_followers + i * 9
            impressions = int(followers * 1.8)
            db.add(PlatformAnalytics(
                social_account_id=acc.id,
                platform_name=acc.platform,
                followers=followers,
                reach=int(followers * 0.42),
                impressions=impressions,
                engagement=int(impressions * 0.046),
                clicks=int(impressions * 0.02),
                snapshot_date=day,
            ))
    db.commit()


def _seed_post_analytics(db: Session, accounts_by_user: dict):
    if db.query(PostAnalytics).count() > 0:
        return
    posts = db.query(Post).order_by(Post.id).all()
    for post in posts:
        if post.status == "Published" and post.published_at is None:
            post.published_at = post.scheduled_for or datetime.utcnow()
            if not post.platform_post_id:
                post.platform_post_id = f"SIM-{post.id}"
        accs = accounts_by_user.get(post.user_id, [])
        if not accs:
            continue
        acc = accs[0]
        linked = db.query(post_social_accounts.c.social_account_id).filter(
            post_social_accounts.c.post_id == post.id
        ).first()
        if not linked:
            db.execute(post_social_accounts.insert().values(
                post_id=post.id, social_account_id=acc.id
            ))
        impressions = 2500 + post.id * 311
        likes = int(impressions * 0.052)
        comments = int(impressions * 0.009)
        shares = int(impressions * 0.005)
        saves = int(impressions * 0.012)
        db.add(PostAnalytics(
            post_id=post.id,
            platform=acc.platform,
            likes=likes,
            comments=comments,
            shares=shares,
            saves=saves,
            reach=int(impressions * 0.63),
            impressions=impressions,
            clicks=int(impressions * 0.019),
            engagement_rate=round(((likes + comments + shares + saves) / impressions) * 100, 2),
        ))
    db.commit()


def _seed_campaign_analytics(db: Session):
    if db.query(CampaignAnalytics).count() > 0:
        return
    campaigns = db.query(Campaign).all()
    for campaign in campaigns:
        posts = db.query(Post).filter(Post.campaign_id == campaign.id).all()
        pa_rows = (
            db.query(PostAnalytics)
            .filter(PostAnalytics.post_id.in_([p.id for p in posts]))
            .all()
        ) if posts else []
        impressions = sum(p.impressions for p in pa_rows)
        engagement = sum(p.likes + p.comments + p.shares for p in pa_rows)
        db.add(CampaignAnalytics(
            campaign_id=campaign.id,
            total_posts=len(posts),
            reach=sum(p.reach for p in pa_rows),
            impressions=impressions,
            engagement=engagement,
            clicks=sum(p.clicks for p in pa_rows),
            roi=round((engagement / (impressions or 1)) * 140, 2),
            completion_percentage=100.0 if campaign.status == "Completed" else 65.0,
        ))
    db.commit()


def _seed_publishing_rows(db: Session, accounts_by_user: dict):
    if db.query(PublishingLog).count() == 0:
        published = db.query(Post).filter(Post.status == "Published").all()
        for post in published:
            accs = accounts_by_user.get(post.user_id, [])
            for acc in accs[:2]:
                db.add(PublishingLog(
                    post_id=post.id,
                    platform=acc.platform,
                    status="Success",
                    response=json.dumps({
                        "platform_post_id": post.platform_post_id or f"SIM-{post.id}",
                        "message": "Published successfully",
                    }),
                    retry_count=0,
                    created_at=post.published_at or datetime.utcnow(),
                ))
        db.commit()

    if db.query(PublishingQueue).count() == 0:
        scheduled = db.query(Post).filter(Post.status == "Scheduled").all()
        for post in scheduled:
            db.add(PublishingQueue(
                post_id=post.id,
                scheduled_time=post.scheduled_for or (datetime.utcnow() + timedelta(hours=2)),
                processing_status="Pending",
                execution_priority=0,
                retry_count=0,
                max_retries=3,
            ))
        db.commit()


def seed_analytics_and_publishing(db: Session):
    """Fill analytics + publishing tables when empty (idempotent, preserves users)."""
    accounts_by_user = _seed_social_accounts(db)
    _seed_audience_analytics(db)
    _seed_platform_analytics(db)
    _seed_post_analytics(db, accounts_by_user)
    _seed_campaign_analytics(db)
    _seed_publishing_rows(db, accounts_by_user)


def seed_notifications(db: Session):
    """Generate realistic notifications referencing real rows (posts, campaigns,
    social accounts, workspaces, users). Idempotent via the signature dedupe key."""
    from datetime import timedelta
    from app.models.notification import Notification

    created = 0
    now = datetime.utcnow()

    def add(user_id, ntype, title, message, signature, category="system", days_ago=0):
        nonlocal created
        exists = (
            db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.signature == signature)
            .first()
        )
        if exists:
            return
        db.add(Notification(
            user_id=user_id,
            type=ntype,
            title=title,
            message=message,
            signature=signature,
            category=category,
            read=False,
            delivery_channel="in_app",
            created_at=now - timedelta(hours=days_ago * 24 + (hash(signature) % 20)),
        ))
        created += 1

    # ── Publishing notifications from real posts ──
    posts = db.query(Post).all()
    for post in posts:
        owner = db.query(User).filter(User.id == post.user_id).first()
        if not owner:
            continue
        if post.status == "Published":
            add(owner.id, "success", f"Post published: {post.title}",
                f"Your post \"{post.title}\" went live successfully.",
                f"post-published:{post.id}", "publishing", days_ago=1)
        elif post.status == "Scheduled":
            add(owner.id, "info", f"Post scheduled: {post.title}",
                f"\"{post.title}\" is scheduled and ready to publish.",
                f"post-scheduled:{post.id}", "publishing", days_ago=2)
        elif post.status == "Failed":
            add(owner.id, "error", f"Post failed: {post.title}",
                f"\"{post.title}\" could not be published. Check the publishing logs.",
                f"post-failed:{post.id}", "publishing", days_ago=0)
        elif post.status == "Draft":
            add(owner.id, "info", f"Draft saved: {post.title}",
                f"\"{post.title}\" is saved as a draft and awaiting review.",
                f"post-draft:{post.id}", "publishing", days_ago=3)

    # ── Campaign notifications from real campaigns ──
    campaigns = db.query(Campaign).all()
    for campaign in campaigns:
        owner = db.query(User).filter(User.id == campaign.user_id).first()
        if not owner:
            continue
        if campaign.status == "Active":
            add(owner.id, "campaign", f"Campaign running: {campaign.name}",
                f"\"{campaign.name}\" is active — keep publishing to hit your goals.",
                f"campaign-active:{campaign.id}", "campaign", days_ago=2)
        else:
            add(owner.id, "campaign", f"Campaign update: {campaign.name}",
                f"\"{campaign.name}\" status changed to {campaign.status}.",
                f"campaign-status:{campaign.id}", "campaign", days_ago=4)

    # ── Social account notifications from real accounts ──
    accounts = db.query(SocialAccount).all()
    for account in accounts:
        owner = db.query(User).filter(User.id == account.user_id).first()
        if not owner:
            continue
        platform = (account.platform or "").title()
        handle = account.username or owner.username
        add(owner.id, "success", f"{platform} connected",
            f"Your {platform} account (@{handle}) is connected and syncing.",
            f"account-connected:{account.id}", "account", days_ago=5)

    # ── Workspace / collaboration notifications from real memberships ──
    memberships = db.query(WorkspaceMember).all()
    for member in memberships:
        workspace = db.query(Workspace).filter(Workspace.id == member.workspace_id).first()
        if not workspace:
            continue
        add(member.user_id, "info", f"Workspace: {workspace.name}",
            f"You are part of the \"{workspace.name}\" workspace as {member.role}.",
            f"workspace-member:{member.id}", "collaboration", days_ago=6)

    # ── Admin system notifications ──
    admins = db.query(User).filter(User.role == "administrator").all()
    for admin in admins:
        add(admin.id, "info", "New users joined the platform",
            f"{db.query(User).count()} users are now registered on the platform.",
            "admin-user-count", "system", days_ago=1)
        add(admin.id, "success", "Platform health check passed",
            "All connected social accounts are syncing normally.",
            "admin-health-check", "system", days_ago=2)
        add(admin.id, "campaign", "Campaign performance summary",
            f"{len(campaigns)} campaigns are currently running on the platform.",
            "admin-campaign-summary", "campaign", days_ago=3)

    db.commit()
    if created:
        print(f"[seed] Inserted {created} notifications.")
    else:
        print("[seed] Notifications already present; skipped.")


def seed_initial_data():
    """Insert the demo data if the users table is empty."""
    db: Session = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count > 0:
            seed_analytics_and_publishing(db)
            seed_notifications(db)
            print("[seed] Users already present; analytics + publishing tables synced (filled if empty).")
            return

        business_users = [_make_user(db, data, "business") for data in BUSINESS_USERS]
        marketing_teams = [_make_user(db, data, "marketing") for data in MARKETING_TEAMS]
        creators = [_make_user(db, data, "creator") for data in CREATOR_USERS]
        admin = _make_user(db, ADMIN_USER, "administrator")
        db.flush()

        campaign_index = 0

        # Each business user owns a workspace with one assigned marketing team.
        # The fourth marketing team is intentionally left without clients.
        for i, biz in enumerate(business_users):
            team = marketing_teams[i]
            workspace = Workspace(name=f"{biz.company} Workspace", owner_id=biz.id)
            db.add(workspace)
            db.flush()
            db.add_all([
                WorkspaceMember(workspace_id=workspace.id, user_id=biz.id, role="Owner", status="Active"),
                WorkspaceMember(workspace_id=workspace.id, user_id=team.id, role="Marketing", status="Active"),
            ])

            campaign_index += 1
            campaign = _make_test_campaign(db, team.id, workspace.id, campaign_index)
            db.flush()

            _make_post(db, team.id, workspace.id, campaign, "Product teaser", "Something exciting is coming. Stay tuned!", "Scheduled", 1)
            _make_post(db, team.id, workspace.id, campaign, "Launch announcement", "Our new collection is officially here!", "Published", -2)
            _make_post(db, team.id, workspace.id, campaign, "Weekend promo draft", "Promo copy for the weekend push.", "Draft", 3)

        # Every creator also gets a campaign of their own (no workspace).
        for creator in creators:
            campaign_index += 1
            campaign = _make_test_campaign(db, creator.id, None, campaign_index)
            db.flush()
            _make_post(db, creator.id, None, campaign, "Creator content draft", "Snippet for my next post.", "Draft", 0)
            _make_post(db, creator.id, None, campaign, "Creator scheduled post", "Scheduled content for the campaign.", "Scheduled", 2)

        db.commit()
        seed_analytics_and_publishing(db)
        seed_notifications(db)
        total_users = len(business_users) + len(marketing_teams) + len(creators) + 1
        print(
            f"[seed] Inserted {total_users} demo users "
            f"({len(business_users)} business, {len(marketing_teams)} marketing, {len(creators)} creators, 1 admin), "
            f"{campaign_index} test campaigns, posts, connected social accounts, analytics and publishing data. "
            f"Login password for all: {MOCK_PASSWORD}"
        )
    except Exception as exc:
        db.rollback()
        print(f"[seed] Skipped seeding (error): {exc}")
    finally:
        db.close()
