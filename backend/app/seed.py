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

from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.user import User
from app.models.campaign import Campaign
from app.models.post import Post
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.auth.security import hash_password

MOCK_PASSWORD = "password123"

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


def seed_initial_data():
    """Insert the demo data if the users table is empty."""
    db: Session = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count > 0:
            return

        business_users = [_make_user(db, data, "business") for data in BUSINESS_USERS]
        marketing_teams = [_make_user(db, data, "marketing") for data in MARKETING_TEAMS]
        creators = [_make_user(db, data, "creator") for data in CREATOR_USERS]
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
        total_users = len(business_users) + len(marketing_teams) + len(creators)
        print(
            f"[seed] Inserted {total_users} demo users "
            f"({len(business_users)} business, {len(marketing_teams)} marketing, {len(creators)} creators), "
            f"{campaign_index} test campaigns and posts. No social accounts connected. "
            f"Login password for all: {MOCK_PASSWORD}"
        )
    except Exception as exc:
        db.rollback()
        print(f"[seed] Skipped seeding (error): {exc}")
    finally:
        db.close()
