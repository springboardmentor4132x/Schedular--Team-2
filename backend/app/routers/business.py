from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.models.campaign import Campaign
from app.models.post import Post
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.models.notification import Notification
from app.models.work_request import WorkRequest
from app.models.team_request import TeamRequest
from app.schemas.work_request import WorkRequestCreate, WorkRequestResponse
from app.services import post_service, campaign_service
import json
from app.auth.dependencies import get_current_user
from typing import List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from fastapi import HTTPException

router = APIRouter(
    prefix="/business",
    tags=["Business User"]
)

def require_business(current_user: User):
    if current_user.role != "business":
        raise HTTPException(status_code=403, detail="Business user access is required")

def get_business_user_workspace(db: Session, user_id: int):
    """Get the workspace owned by the business user"""
    return db.query(Workspace).filter(Workspace.owner_id == user_id).first()

def _request_response(request: WorkRequest):
    return {"id": request.id, "workspace_id": request.workspace_id, "business_user_id": request.business_user_id, "status": request.status.lower(), "details": json.loads(request.details or "{}"), "decision_note": request.decision_note, "created_at": request.created_at, "updated_at": request.updated_at}

@router.get("/work-requests", response_model=List[WorkRequestResponse])
def get_work_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    require_business(current_user)
    workspace = get_business_user_workspace(db, current_user.id)
    if not workspace: return []
    return [_request_response(item) for item in db.query(WorkRequest).filter(WorkRequest.workspace_id == workspace.id).order_by(WorkRequest.created_at.desc()).all()]

@router.post("/work-requests", response_model=WorkRequestResponse)
def submit_work_request(payload: WorkRequestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    require_business(current_user)
    workspace = get_business_user_workspace(db, current_user.id)
    if not workspace: raise HTTPException(status_code=404, detail="Business workspace not found")
    request = WorkRequest(workspace_id=workspace.id, business_user_id=current_user.id, status="Pending", details=json.dumps(payload.details))
    db.add(request); db.flush()
    marketing_members = db.query(WorkspaceMember).join(User).filter(WorkspaceMember.workspace_id == workspace.id, WorkspaceMember.status == "Active", User.role == "marketing").all()
    if not marketing_members:
        raise HTTPException(status_code=400, detail="Assign a marketing team before submitting a work request")
    business_name = current_user.company or current_user.username
    for member in marketing_members:
        db.add(Notification(user_id=member.user_id, type="info", title="New business work request", message=f"{business_name} submitted brand guidelines and a work request.", signature=f"work-request:{request.id}:{member.user_id}"))
    db.commit(); db.refresh(request)
    return _request_response(request)

def get_workspace_member_ids(db: Session, workspace_id: int):
    """Get all user IDs that are members of the workspace"""
    members = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace_id).all()
    return [m.user_id for m in members]


def _workspace_posts_query(db: Session, workspace: Workspace):
    """All posts belonging to a workspace, by workspace_id or via its campaigns.

    Uses workspace_id (set by the marketing flow) rather than membership rows,
    which can be incomplete (e.g. seed data with no marketing member row).
    """
    campaign_ids = [c[0] for c in db.query(Campaign.id).filter(Campaign.workspace_id == workspace.id)]
    if campaign_ids:
        return db.query(Post).filter(
            or_(Post.workspace_id == workspace.id, Post.campaign_id.in_(campaign_ids))
        )
    return db.query(Post).filter(Post.workspace_id == workspace.id)

@router.get("/brand-guidelines")
def get_brand_guidelines(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return the business user's latest brand guidelines stored in the database."""
    require_business(current_user)
    workspace = get_business_user_workspace(db, current_user.id)
    if not workspace:
        return None
    latest = db.query(WorkRequest).filter(
        WorkRequest.workspace_id == workspace.id
    ).order_by(WorkRequest.created_at.desc()).first()
    if not latest:
        return None
    return _request_response(latest)

@router.put("/brand-guidelines", response_model=WorkRequestResponse)
def save_brand_guidelines(payload: WorkRequestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Persist the business user's brand guidelines without notifying the marketing team.

    Updates the latest saved request so the most recent guidelines are always
    what the marketing team sees. An approved request is left untouched and a
    fresh draft is created instead.
    """
    require_business(current_user)
    workspace = get_business_user_workspace(db, current_user.id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Business workspace not found")

    latest = db.query(WorkRequest).filter(
        WorkRequest.workspace_id == workspace.id
    ).order_by(WorkRequest.created_at.desc()).first()

    if latest and latest.status != "Approved":
        latest.details = json.dumps(payload.details)
        db.commit()
        db.refresh(latest)
        return _request_response(latest)

    request = WorkRequest(
        workspace_id=workspace.id,
        business_user_id=current_user.id,
        status="Pending",
        details=json.dumps(payload.details),
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return _request_response(request)

@router.get("/dashboard")
def get_business_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get dashboard stats for business user"""
    require_business(current_user)
    workspace = get_business_user_workspace(db, current_user.id)
    
    if not workspace:
        return {
            "connected_accounts": 0,
            "active_campaigns": 0,
            "scheduled_posts": 0,
            "published_posts": 0,
            "upcoming_posts": [],
            "active_campaigns_list": [],
            "analytics": {"weekly": [], "platform_split": []}
        }
    
    member_ids = get_workspace_member_ids(db, workspace.id)
    member_ids.append(current_user.id)  # Include business user
    
    # Connected accounts
    from app.models.social_account import SocialAccount
    connected_accounts = db.query(SocialAccount).filter(
        SocialAccount.user_id.in_(member_ids),
        SocialAccount.status == "Connected"
    ).count()
    
    # Active campaigns
    active_campaigns = db.query(Campaign).filter(
        Campaign.workspace_id == workspace.id,
        Campaign.status == "Active"
    ).count()
    
    workspace_posts = _workspace_posts_query(db, workspace)

    # Scheduled posts (workspace-wide)
    scheduled_posts = workspace_posts.filter(Post.status == "Scheduled").count()
    
    # Published posts
    published_posts = workspace_posts.filter(Post.status == "Published").count()
    
    # Upcoming scheduled posts
    upcoming = workspace_posts.filter(
        Post.status == "Scheduled",
        Post.scheduled_for >= datetime.now(timezone.utc)
    ).order_by(Post.scheduled_for.asc()).limit(4).all()
    
    upcoming_posts = []
    for post in upcoming:
        campaign = db.query(Campaign).filter(Campaign.id == post.campaign_id).first() if post.campaign_id else None
        upcoming_posts.append({
            "id": post.id,
            "title": post.title or f"Post {post.id}",
            "platform": post.social_accounts[0].platform if post.social_accounts else None,
            "scheduledAt": post.scheduled_for.isoformat() if post.scheduled_for else None,
            "status": post.status,
            "campaign": campaign.name if campaign else None
        })
    
    # Active campaigns with progress
    active_campaigns_list = db.query(Campaign).filter(
        Campaign.workspace_id == workspace.id,
        Campaign.status == "Active"
    ).all()
    
    campaigns_data = []
    for campaign in active_campaigns_list:
        posts = db.query(Post).filter(Post.campaign_id == campaign.id).all()
        total = len(posts)
        published = sum(1 for p in posts if p.status == "Published")
        progress = int((published / total) * 100) if total else 0
        campaigns_data.append({
            "id": campaign.id,
            "name": campaign.name,
            "budget": campaign.budget,
            "progress": progress,
            "start": campaign.start_date.isoformat() if campaign.start_date else None,
            "end": campaign.end_date.isoformat() if campaign.end_date else None,
            "status": campaign.status
        })
    
    # Analytics are derived from stored publishing data until platform APIs
    # provide reach/impression metrics in the publishing module.
    member_posts = workspace_posts.all()
    platform_counts = {}
    for post in member_posts:
        for account in post.social_accounts:
            platform_counts[account.platform] = platform_counts.get(account.platform, 0) + 1
    analytics = {
        "weekly": _bucket_post_counts(member_posts, 7),
        "platformSplit": [{"name": name.title(), "value": count} for name, count in platform_counts.items()],
    }
    
    return {
        "connected_accounts": connected_accounts,
        "active_campaigns": active_campaigns,
        "scheduled_posts": scheduled_posts,
        "published_posts": published_posts,
        "upcoming_posts": upcoming_posts,
        "active_campaigns_list": campaigns_data,
        "analytics": analytics
    }

@router.get("/campaigns")
def get_workspace_campaigns(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Workspace-wide campaigns so list pages match the dashboard counts.

    Campaigns are created by the assigned marketing team, so they are scoped
    by workspace membership rather than the business user's ownership.
    """
    require_business(current_user)
    workspace = get_business_user_workspace(db, current_user.id)
    if not workspace:
        return []
    campaigns = db.query(Campaign).filter(
        Campaign.workspace_id == workspace.id
    ).order_by(Campaign.created_at.desc()).all()
    return [campaign_service._campaign_response(c) for c in campaigns]


@router.get("/campaigns/{campaign_id}/progress")
def get_workspace_campaign_progress(campaign_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Campaign progress without the ownership check, scoped to the workspace."""
    require_business(current_user)
    workspace = get_business_user_workspace(db, current_user.id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Business workspace not found")
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.workspace_id == workspace.id,
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    posts = db.query(Post).filter(Post.campaign_id == campaign.id).all()
    total = len(posts)
    published = sum(1 for p in posts if p.status == "Published")
    scheduled = sum(1 for p in posts if p.status in ("Scheduled", "Queued"))
    drafts = sum(1 for p in posts if p.status == "Draft")
    completion = int((published / total) * 100) if total else 0
    return {
        "message": "Campaign progress retrieved successfully",
        "campaign_id": campaign_id,
        "progress": {
            "total_posts": total,
            "published": published,
            "scheduled": scheduled,
            "drafts": drafts,
            "completion_percentage": completion,
        },
    }


@router.get("/posts")
def get_workspace_posts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """All posts created by the workspace's members (business + marketing)."""
    require_business(current_user)
    workspace = get_business_user_workspace(db, current_user.id)
    if not workspace:
        return []
    workspace_posts = _workspace_posts_query(db, workspace)
    posts = workspace_posts.order_by(Post.created_at.desc()).all()
    return [post_service._post_response(p) for p in posts]


@router.get("/posts/scheduled")
def get_workspace_scheduled_posts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Scheduled/queued posts across the workspace, matching dashboard counts."""
    require_business(current_user)
    workspace = get_business_user_workspace(db, current_user.id)
    if not workspace:
        return []
    workspace_posts = _workspace_posts_query(db, workspace)
    posts = workspace_posts.filter(
        Post.status.in_(("Scheduled", "Queued")),
    ).order_by(Post.scheduled_for.asc()).all()
    return [post_service._post_response(p) for p in posts]

def _bucket_post_counts(posts, days: int):
    """Group posts into labelled time buckets for the last ``days`` days.

    Uses 1-day buckets up to 30 days and 1-week buckets for longer ranges so
    the charts stay readable.
    """
    now = datetime.now(timezone.utc)
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    buckets = []
    if days <= 30:
        for i in range(days - 1, -1, -1):
            start = now - timedelta(days=i, hours=now.hour, minutes=now.minute, seconds=now.second, microseconds=now.microsecond)
            end = start + timedelta(days=1)
            count = sum(1 for p in posts if start <= (p.created_at or now) < end)
            buckets.append({"label": day_names[start.weekday()], "posts": count})
        return buckets
    weeks = max(days // 7, 1)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    for i in range(weeks - 1, -1, -1):
        start = today_start - timedelta(days=(i + 1) * 7)
        end = today_start - timedelta(days=i * 7)
        count = sum(1 for p in posts if (p.created_at or now) >= start and (p.created_at or now) < end)
        buckets.append({"label": f"W{weeks - i}", "posts": count})
    return buckets


def _monthly_post_counts(posts):
    """Group posts into labelled monthly buckets for the last six months."""
    now = datetime.now(timezone.utc)
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    buckets = []
    for i in range(5, -1, -1):
        year, month = now.year, now.month - i
        while month <= 0:
            month += 12
            year -= 1
        count = sum(1 for p in posts if p.created_at and (p.created_at.year, p.created_at.month) == (year, month))
        buckets.append({"label": month_names[month - 1], "posts": count})
    return buckets


def _platform_split(posts):
    """Count posts per connected platform."""
    counts = {}
    for post in posts:
        for account in post.social_accounts:
            platform = account.platform
            counts[platform] = counts.get(platform, 0) + 1
    return [{"name": name.title(), "value": count} for name, count in counts.items()]


@router.get("/analytics")
def get_business_analytics(days: int = 30, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get DB-derived analytics for the business user."""
    require_business(current_user)
    workspace = get_business_user_workspace(db, current_user.id)

    empty = {
        "kpis": {"publishedPosts": 0, "scheduledPosts": 0, "drafts": 0, "activeCampaigns": 0, "connectedAccounts": 0, "totalPosts": 0},
        "series": [], "monthly": [], "platformSplit": [], "topPosts": [],
    }
    if not workspace:
        return empty

    member_ids = get_workspace_member_ids(db, workspace.id)
    member_ids.append(current_user.id)

    from app.models.social_account import SocialAccount
    connected_accounts = db.query(SocialAccount).filter(
        SocialAccount.user_id.in_(member_ids),
        SocialAccount.status == "Connected",
    ).count()
    active_campaigns = db.query(Campaign).filter(
        Campaign.workspace_id == workspace.id,
        Campaign.status == "Active",
    ).count()

    posts = db.query(Post).filter(Post.user_id.in_(member_ids)).all()
    published = sum(1 for p in posts if p.status == "Published")
    scheduled = sum(1 for p in posts if p.status == "Scheduled")
    drafts = sum(1 for p in posts if p.status == "Draft")

    recent = sorted(posts, key=lambda p: p.created_at or datetime.min.replace(tzinfo=timezone.utc), reverse=True)[:8]
    top_posts = [{
        "id": p.id,
        "title": p.title or f"Post {p.id}",
        "platform": p.social_accounts[0].platform if p.social_accounts else "instagram",
        "date": p.created_at.strftime("%b %d, %Y") if p.created_at else "—",
        "status": p.status,
    } for p in recent]

    return {
        "kpis": {
            "publishedPosts": published,
            "scheduledPosts": scheduled,
            "drafts": drafts,
            "activeCampaigns": active_campaigns,
            "connectedAccounts": connected_accounts,
            "totalPosts": len(posts),
        },
        "series": _bucket_post_counts(posts, max(min(days, 90), 1)),
        "monthly": _monthly_post_counts(posts),
        "platformSplit": _platform_split(posts),
        "topPosts": top_posts,
    }


@router.get("/marketing-activity")
def get_marketing_activity(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get marketing team activity for business user"""
    require_business(current_user)
    workspace = get_business_user_workspace(db, current_user.id)
    
    if not workspace:
        return {
            "assigned_team": None,
            "content_assignments": [],
            "timeline": [],
            "campaign_summary": {"active": 0, "completed": 0}
        }
    
    # Get assigned marketing team (workspace members with marketing role)
    members = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace.id
    ).all()
    
    member_users = []
    for member in members:
        user = db.query(User).filter(User.id == member.user_id).first()
        if user:
            member_users.append(user)
    
    # Content assignments (posts created by marketing team members)
    member_ids = [m.user_id for m in members]
    
    posts = db.query(Post).filter(
        Post.user_id.in_(member_ids)
    ).order_by(Post.created_at.desc()).limit(20).all()
    
    content_assignments = []
    for post in posts:
        author = db.query(User).filter(User.id == post.user_id).first()
        campaign = db.query(Campaign).filter(Campaign.id == post.campaign_id).first() if post.campaign_id else None
        content_assignments.append({
            "id": post.id,
            "title": post.title or f"Post {post.id}",
            "assignedTo": f"{author.first_name} {author.last_name}" if author else "Unknown",
            "status": post.status.lower().replace(" ", "_"),
            "campaign": campaign.name if campaign else None,
            "scheduledDate": post.scheduled_for.strftime("%b %d, %Y") if post.scheduled_for else "Not scheduled",
            "platform": post.social_accounts[0].platform if post.social_accounts else "instagram"
        })
    
    # Timeline (recent activity)
    timeline = []
    for post in posts[:8]:
        author = db.query(User).filter(User.id == post.user_id).first()
        if post.status == "Published":
            timeline.append({
                "id": post.id,
                "type": "published",
                "text": f"{post.title or 'Post'} published to {post.social_accounts[0].platform if post.social_accounts else 'Instagram'}",
                "actor": f"{author.first_name} {author.last_name}" if author else "Team",
                "time": "Recent"
            })
        elif post.status == "Scheduled":
            timeline.append({
                "id": post.id,
                "type": "scheduled",
                "text": f"{post.title or 'Post'} scheduled for {post.scheduled_for.strftime('%b %d') if post.scheduled_for else 'TBD'}",
                "actor": f"{author.first_name} {author.last_name}" if author else "Team",
                "time": "Recent"
            })
    
    # Campaign summary
    active_campaigns = db.query(Campaign).filter(
        Campaign.workspace_id == workspace.id,
        Campaign.status == "Active"
    ).count()
    completed_campaigns = db.query(Campaign).filter(
        Campaign.workspace_id == workspace.id,
        Campaign.status == "Completed"
    ).count()
    
    return {
        "assigned_team": {
            "name": "Marketing Team",
            "members": [f"{u.first_name} {u.last_name}" for u in member_users]
        },
        "content_assignments": content_assignments,
        "timeline": timeline,
        "campaign_summary": {
            "active": active_campaigns,
            "completed": completed_campaigns
        }
    }

@router.get("/assigned-team")
def get_assigned_team(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the assigned marketing team for business user"""
    require_business(current_user)
    workspace = get_business_user_workspace(db, current_user.id)
    
    if not workspace:
        return {"team": None}
    
    members = get_active_marketing_members(db, workspace.id)
    
    team_members = []
    for member in members:
        user = db.query(User).filter(User.id == member.user_id).first()
        if user:
            team_members.append({
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}",
                "role": member.role,
                "email": user.email
            })
    
    return {
        "team": {
            "workspace_id": workspace.id,
            "workspace_name": workspace.name,
            "members": team_members
        }
    }


def get_active_marketing_members(db: Session, workspace_id: int):
    """Return the active marketing-role members of a workspace.

    A marketing-role user represents a marketing team in the current model.
    The same team can be an active member of any number of business workspaces,
    but each business workspace may have at most one active marketing team.
    """
    return db.query(WorkspaceMember).join(User).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.status == "Active",
        User.role == "marketing",
    ).all()


def _team_response(db: Session, workspace: Workspace):
    members_out = []
    for m in db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace.id).all():
        user = db.query(User).filter(User.id == m.user_id).first()
        if user:
            members_out.append({
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}",
                "role": m.role,
                "email": user.email,
            })
    return {"team": {"workspace_id": workspace.id, "workspace_name": workspace.name, "members": members_out}}


def _team_request_response(request: TeamRequest):
    team_name = request.marketing_user.company or f"{request.marketing_user.first_name or ''} {request.marketing_user.last_name or ''}".strip() or request.marketing_user.username
    return {
        "id": request.id,
        "team_id": request.marketing_user_id,
        "team_name": team_name,
        "status": request.status.lower(),
        "decision_note": request.decision_note,
        "created_at": request.created_at,
        "updated_at": request.updated_at,
    }


@router.get("/marketing-teams")
def list_marketing_teams(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Directory of every marketing team with its request status for this business.

    A business user connects to exactly one marketing team, and only after the
    team approves a request. A marketing team can manage any number of business
    users. request_status is 'approved' | 'pending' | 'rejected' | 'none'.
    """
    require_business(current_user)
    workspace = get_business_user_workspace(db, current_user.id)
    teams = db.query(User).filter(User.role == "marketing").order_by(User.company, User.first_name).all()
    pending = db.query(TeamRequest).filter(
        TeamRequest.business_user_id == current_user.id,
        TeamRequest.status == "Pending",
    ).first()
    result = []
    for team in teams:
        memberships = db.query(WorkspaceMember).filter(
            WorkspaceMember.user_id == team.id,
            WorkspaceMember.status == "Active",
        ).all()
        approved = bool(workspace and any(member.workspace_id == workspace.id for member in memberships))
        if approved:
            request_status = "approved"
        elif pending and pending.marketing_user_id == team.id:
            request_status = "pending"
        elif db.query(TeamRequest).filter(
            TeamRequest.business_user_id == current_user.id,
            TeamRequest.marketing_user_id == team.id,
            TeamRequest.status == "Rejected",
        ).first():
            request_status = "rejected"
        else:
            request_status = "none"
        result.append({
            "id": team.id,
            "name": team.company or f"{team.first_name or ''} {team.last_name or ''}".strip() or team.username,
            "contact_name": f"{team.first_name or ''} {team.last_name or ''}".strip() or team.username,
            "email": team.email,
            "bio": team.bio,
            "assigned": approved,
            "request_status": request_status,
            "request_id": pending.id if (pending and pending.marketing_user_id == team.id) else None,
            "client_count": len({member.workspace_id for member in memberships}),
        })
    return {"teams": result}


class RequestTeamPayload(BaseModel):
    team_id: int


@router.post("/request-marketing-team")
def request_marketing_team(payload: RequestTeamPayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Submit a request to connect a marketing team.

    The business user cannot directly assign a team. The requested team must
    approve the request before the relationship is established.
    """
    require_business(current_user)
    workspace = get_business_user_workspace(db, current_user.id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found for business user")

    candidate = db.query(User).filter(User.id == payload.team_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Marketing team was not found")
    if candidate.role != "marketing":
        raise HTTPException(status_code=400, detail="Only marketing users can be requested as a marketing team")

    if get_active_marketing_members(db, workspace.id):
        raise HTTPException(
            status_code=400,
            detail="A marketing team is already managing your business. Remove the current team before requesting a different one.",
        )

    existing_pending = db.query(TeamRequest).filter(
        TeamRequest.business_user_id == current_user.id,
        TeamRequest.status == "Pending",
    ).first()
    if existing_pending:
        raise HTTPException(
            status_code=400,
            detail="You already have a pending request. Wait for the marketing team to respond or cancel it first.",
        )

    request = TeamRequest(business_user_id=current_user.id, marketing_user_id=candidate.id, status="Pending")
    db.add(request)
    db.flush()

    business_name = current_user.company or f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.username
    db.add(Notification(
        user_id=candidate.id,
        type="info",
        title="New business connection request",
        message=f"{business_name} requested your team to manage their social media. Review the request to approve or reject it.",
        signature=f"team-request:{request.id}:{candidate.id}",
    ))
    db.commit()
    db.refresh(request)
    return _team_request_response(request)


@router.get("/team-requests")
def list_team_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List the marketing team connection requests made by the business user."""
    require_business(current_user)
    requests = db.query(TeamRequest).filter(
        TeamRequest.business_user_id == current_user.id,
    ).order_by(TeamRequest.created_at.desc()).all()
    return [_team_request_response(item) for item in requests]


@router.post("/team-requests/{request_id}/cancel")
def cancel_team_request(request_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Cancel a pending marketing team connection request."""
    require_business(current_user)
    request = db.query(TeamRequest).filter(
        TeamRequest.id == request_id,
        TeamRequest.business_user_id == current_user.id,
    ).first()
    if not request:
        raise HTTPException(status_code=404, detail="Connection request not found")
    if request.status != "Pending":
        raise HTTPException(status_code=400, detail="Only pending requests can be cancelled")
    request.status = "Cancelled"
    db.commit()
    db.refresh(request)
    return _team_request_response(request)


class RemoveTeamPayload(BaseModel):
    member_ids: List[int] | None = None


@router.post("/remove-marketing-team")
def remove_marketing_team(payload: RemoveTeamPayload | None = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Remove the marketing team from the business user's workspace. If no member_ids provided, remove all marketing-role members."""
    require_business(current_user)
    workspace = get_business_user_workspace(db, current_user.id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found for business user")

    member_ids = payload.member_ids if payload and payload.member_ids else None
    if member_ids:
        for uid in member_ids:
            member = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == workspace.id, WorkspaceMember.user_id == uid).first()
            if member:
                db.delete(member)
                db.commit()
    else:
        # remove all active marketing-role members (the assigned marketing team)
        members = db.query(WorkspaceMember).join(User).filter(
            WorkspaceMember.workspace_id == workspace.id,
            WorkspaceMember.role.ilike('%marketing%'),
            User.role == "marketing",
        ).all()
        for m in members:
            db.delete(m)
        db.commit()

    return _team_response(db, workspace)
