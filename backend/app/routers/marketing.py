"""Database-backed client workspace APIs for marketing team members."""
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.models.post import Post
from app.models.campaign import Campaign
from app.models.social_account import SocialAccount
from app.models.notification import Notification
from app.models.work_request import WorkRequest
from app.models.team_request import TeamRequest
from app.schemas.work_request import WorkRequestDecision
import json
from app.schemas.post import PostCreate, PostUpdate
from app.schemas.campaign import CampaignCreate
from app.services import post_service, campaign_service

router = APIRouter(prefix="/marketing", tags=["Marketing workspace"])

def _require_marketing(user: User):
    if user.role != "marketing":
        raise HTTPException(status_code=403, detail="Marketing team access is required")

def _workspace_for_client(db: Session, marketing_id: int, client_id: int) -> Workspace:
    workspace = db.query(Workspace).filter(Workspace.owner_id == client_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Client workspace not found")
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace.id,
        WorkspaceMember.user_id == marketing_id,
        WorkspaceMember.status == "Active",
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="You are not assigned to this client")
    return workspace

def _client_summary(db: Session, workspace: Workspace):
    owner = workspace.owner
    posts = db.query(Post).filter(Post.workspace_id == workspace.id).all()
    campaigns = db.query(Campaign).filter(Campaign.workspace_id == workspace.id).all()
    accounts = db.query(SocialAccount).filter(SocialAccount.user_id == owner.id, SocialAccount.status == "Connected").all()
    initials = ''.join(part[0] for part in (owner.company or owner.first_name or owner.username).split()[:2]).upper()
    colors = ["#1E3A8A", "#4F46E5", "#E1306C", "#0A66C2", "#7C3AED"]
    return {
        "id": owner.id, "workspaceId": workspace.id, "name": owner.company or f"{owner.first_name or ''} {owner.last_name or ''}".strip() or owner.username,
        "industry": owner.bio or "Unspecified", "location": owner.location or "Remote", "website": owner.website or "—", "email": owner.email,
        "logo": initials or "CL", "logoColor": colors[owner.id % len(colors)], "status": "active",
        "connectedPlatforms": [a.platform for a in accounts], "activeCampaigns": sum(c.status == "Active" for c in campaigns),
        "scheduledPosts": sum(p.status in ("Scheduled", "Queued") for p in posts), "draftPosts": sum(p.status == "Draft" for p in posts),
        "publishedPosts": sum(p.status == "Published" for p in posts), "lastActivity": max((p.updated_at or p.created_at for p in posts), default=workspace.created_at).isoformat() if (posts or workspace.created_at) else None,
    }

def _post_item(post: Post):
    return {"id": post.id, "title": post.title or "Untitled post", "caption": post.caption or "", "platform": post.social_accounts[0].platform if post.social_accounts else "instagram", "platforms": [a.platform for a in post.social_accounts], "campaign": post.campaign.name if post.campaign else None, "campaignId": post.campaign_id, "status": post.status.lower().replace(" ", "_"), "scheduledAt": post.scheduled_for.isoformat() if post.scheduled_for else None, "publishedAt": post.updated_at.isoformat() if post.status == "Published" and post.updated_at else None, "mediaUrl": post.media_file_path, "contentType": post.content_type, "createdAt": post.created_at.isoformat() if post.created_at else None, "failureReason": post.failure_reason}

def _request_item(item: WorkRequest):
    return {"id": item.id, "clientId": item.business_user_id, "workspaceId": item.workspace_id, "status": item.status.lower(), "details": json.loads(item.details or "{}"), "decisionNote": item.decision_note, "createdAt": item.created_at, "updatedAt": item.updated_at}

@router.get("/work-requests")
def work_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_marketing(current_user)
    rows = db.query(WorkRequest).join(WorkspaceMember, WorkspaceMember.workspace_id == WorkRequest.workspace_id).filter(WorkspaceMember.user_id == current_user.id, WorkspaceMember.status == "Active").order_by(WorkRequest.created_at.desc()).all()
    return [_request_item(item) for item in rows]

@router.post("/work-requests/{request_id}/decision")
def decide_work_request(request_id: int, payload: WorkRequestDecision, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_marketing(current_user)
    decision = payload.status.strip().lower()
    if decision not in {"approved", "rejected"}: raise HTTPException(status_code=400, detail="Status must be approved or rejected")
    item = db.query(WorkRequest).filter(WorkRequest.id == request_id).first()
    if not item: raise HTTPException(status_code=404, detail="Work request not found")
    _workspace_for_client(db, current_user.id, item.business_user_id)
    item.status = decision.title(); item.decision_note = payload.decision_note; item.reviewed_by_id = current_user.id
    db.add(Notification(user_id=item.business_user_id, type="success" if decision == "approved" else "error", title=f"Work request {decision}", message=payload.decision_note or f"Your marketing team {decision} the request.", signature=f"work-request-decision:{item.id}:{decision}"))
    db.commit(); db.refresh(item)
    return _request_item(item)

@router.get("/clients")
def clients(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_marketing(current_user)
    rows = db.query(Workspace).join(WorkspaceMember).filter(WorkspaceMember.user_id == current_user.id, WorkspaceMember.status == "Active").all()
    return [_client_summary(db, w) for w in rows if w.owner.role == "business"]


def _connection_request_item(item: TeamRequest):
    business = item.business_user
    return {
        "id": item.id,
        "businessUserId": item.business_user_id,
        "companyName": business.company or f"{business.first_name or ''} {business.last_name or ''}".strip() or business.username,
        "contactName": f"{business.first_name or ''} {business.last_name or ''}".strip() or business.username,
        "email": business.email,
        "industry": business.bio or "Unspecified",
        "status": item.status.lower(),
        "decisionNote": item.decision_note,
        "createdAt": item.created_at,
        "updatedAt": item.updated_at,
    }


@router.get("/connection-requests")
def connection_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Connection requests from business users asking this team to manage them."""
    _require_marketing(current_user)
    rows = db.query(TeamRequest).filter(
        TeamRequest.marketing_user_id == current_user.id,
    ).order_by(TeamRequest.created_at.desc()).all()
    return [_connection_request_item(item) for item in rows]


class ConnectionDecision(BaseModel):
    status: str
    decision_note: str | None = None


@router.post("/connection-requests/{request_id}/decision")
def decide_connection_request(request_id: int, payload: ConnectionDecision, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Approve or reject a business user's request to connect this marketing team."""
    _require_marketing(current_user)
    decision = payload.status.strip().lower()
    if decision not in {"approved", "rejected"}:
        raise HTTPException(status_code=400, detail="Status must be approved or rejected")

    item = db.query(TeamRequest).filter(
        TeamRequest.id == request_id,
        TeamRequest.marketing_user_id == current_user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Connection request not found")
    if item.status != "Pending":
        raise HTTPException(status_code=400, detail="This request has already been decided")

    business = item.business_user
    business_name = business.company or f"{business.first_name or ''} {business.last_name or ''}".strip() or business.username

    if decision == "approved":
        workspace = db.query(Workspace).filter(Workspace.owner_id == business.id).first()
        if not workspace:
            raise HTTPException(status_code=404, detail="Business workspace not found")
        existing = db.query(WorkspaceMember).join(User).filter(
            WorkspaceMember.workspace_id == workspace.id,
            WorkspaceMember.status == "Active",
            User.role == "marketing",
        ).first()
        if existing and existing.user_id != current_user.id:
            raise HTTPException(status_code=400, detail="This business is already managed by another marketing team")
        if not existing:
            db.add(WorkspaceMember(workspace_id=workspace.id, user_id=current_user.id, role="Marketing", status="Active"))
        item.status = "Approved"
        item.decision_note = payload.decision_note or "Approved"
        db.add(Notification(
            user_id=business.id,
            type="success",
            title="Marketing team connected",
            message=f"{current_user.company or 'Your marketing team'} approved your request and will now manage your social media.",
            signature=f"team-request-decision:{item.id}:approved",
        ))
    else:
        item.status = "Rejected"
        item.decision_note = payload.decision_note or "Rejected"
        db.add(Notification(
            user_id=business.id,
            type="error",
            title="Marketing team request rejected",
            message=f"{current_user.company or 'The marketing team'} rejected your connection request. {item.decision_note or ''}".strip(),
            signature=f"team-request-decision:{item.id}:rejected",
        ))

    db.commit()
    db.refresh(item)
    return _connection_request_item(item)

@router.get("/dashboard")
def dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    client_rows = clients(current_user, db)
    workspace_ids = [c["workspaceId"] for c in client_rows]
    posts = db.query(Post).filter(Post.workspace_id.in_(workspace_ids)).order_by(Post.created_at.desc()).limit(8).all() if workspace_ids else []
    return {"clients": client_rows, "stats": {"assignedClients": len(client_rows), "activeCampaigns": sum(c["activeCampaigns"] for c in client_rows), "scheduledPosts": sum(c["scheduledPosts"] for c in client_rows), "draftPosts": sum(c["draftPosts"] for c in client_rows), "publishedPosts": sum(c["publishedPosts"] for c in client_rows)}, "activity": [_post_item(p) for p in posts]}

@router.get("/clients/{client_id}/workspace")
def workspace(client_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_marketing(current_user); w = _workspace_for_client(db, current_user.id, client_id)
    return {"client": _client_summary(db, w), "posts": [_post_item(p) for p in db.query(Post).filter(Post.workspace_id == w.id).order_by(Post.created_at.desc()).all()], "campaigns": [campaign_service._campaign_response(c) for c in db.query(Campaign).filter(Campaign.workspace_id == w.id).all()]}

@router.post("/clients/{client_id}/posts")
def create_client_post(client_id: int, payload: PostCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_marketing(current_user); w = _workspace_for_client(db, current_user.id, client_id)
    payload.workspace_id = w.id
    if payload.campaign_id:
        campaign = db.query(Campaign).filter(Campaign.id == payload.campaign_id, Campaign.workspace_id == w.id).first()
        if not campaign: raise HTTPException(status_code=400, detail="Campaign does not belong to this client")
    account_ids = None
    platforms = [p for p in (payload.platforms or []) if p]
    if platforms:
        # Multi-platform publishing: link every connected account the client
        # owner has for the requested platforms.
        accounts = db.query(SocialAccount).filter(
            SocialAccount.user_id == w.owner_id,
            SocialAccount.platform.in_(platforms),
            SocialAccount.status == "Connected",
        ).all()
        if accounts:
            payload.social_account_ids = [acc.id for acc in accounts]
            account_ids = [acc.id for acc in accounts]
        else:
            raise HTTPException(
                status_code=400,
                detail="None of the selected platforms are connected for this client.",
            )
    elif payload.platform:
        account = db.query(SocialAccount).filter(
            SocialAccount.user_id == w.owner_id,
            SocialAccount.platform == payload.platform,
            SocialAccount.status == "Connected",
        ).first()
        if account:
            payload.social_account_ids = [account.id]
            account_ids = [account.id]
    post = post_service.create_post(db, current_user.id, payload, status=payload.status or "Draft", account_ids=account_ids)
    return post

@router.put("/clients/{client_id}/posts/{post_id}")
def update_client_post(client_id: int, post_id: int, payload: PostUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_marketing(current_user); w = _workspace_for_client(db, current_user.id, client_id)
    post = db.query(Post).filter(Post.id == post_id, Post.workspace_id == w.id).first()
    if not post: raise HTTPException(status_code=404, detail="Post not found")
    # Marketing members may only modify content they created.
    if post.user_id != current_user.id: raise HTTPException(status_code=403, detail="Only the post creator can modify it")
    return post_service.update_post(db, current_user.id, post_id, payload)

@router.post("/clients/{client_id}/campaigns")
def create_client_campaign(client_id: int, payload: CampaignCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_marketing(current_user); w = _workspace_for_client(db, current_user.id, client_id)
    payload.workspace_id = w.id
    return campaign_service.create_campaign(db, current_user.id, payload)


def _marketing_workspaces(db: Session, marketing_id: int):
    rows = db.query(Workspace).join(WorkspaceMember).filter(
        WorkspaceMember.user_id == marketing_id,
        WorkspaceMember.status == "Active",
    ).all()
    return [w for w in rows if w.owner.role == "business"]


def _bucket_post_counts(posts, days: int):
    """Group posts into labelled time buckets for the last ``days`` days."""
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
    counts = {}
    for post in posts:
        for account in post.social_accounts:
            platform = account.platform
            counts[platform] = counts.get(platform, 0) + 1
    return [{"name": name.title(), "value": count} for name, count in counts.items()]


def _client_short_name(user: User):
    return user.company or f"{user.first_name or ''} {user.last_name or ''}".strip() or user.username


@router.get("/analytics")
def analytics(client_id: int | None = None, days: int = 30, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """DB-derived analytics for the marketing team's client workspace(s)."""
    _require_marketing(current_user)
    if client_id:
        w = _workspace_for_client(db, current_user.id, client_id)
        workspaces = [w]
    else:
        workspaces = _marketing_workspaces(db, current_user.id)

    workspace_ids = [w.id for w in workspaces]
    posts = db.query(Post).filter(Post.workspace_id.in_(workspace_ids)).all() if workspace_ids else []
    campaigns = db.query(Campaign).filter(Campaign.workspace_id.in_(workspace_ids)).all() if workspace_ids else []
    work_requests = db.query(WorkRequest).filter(WorkRequest.workspace_id.in_(workspace_ids)).all() if workspace_ids else []

    published = sum(1 for p in posts if p.status == "Published")
    scheduled = sum(1 for p in posts if p.status == "Scheduled")
    drafts = sum(1 for p in posts if p.status == "Draft")
    active_campaigns = sum(1 for c in campaigns if c.status == "Active")
    pending_requests = sum(1 for r in work_requests if r.status.lower() == "pending")

    # Publishing status breakdown — how content is distributed across lifecycle states.
    status_counts = {"Published": 0, "Scheduled": 0, "Failed": 0, "Cancelled": 0, "Draft": 0}
    for post in posts:
        status = "Scheduled" if post.status in ("Scheduled", "Queued") else post.status
        if status in status_counts:
            status_counts[status] += 1
    status_colors = {
        "Published": "#22C55E",
        "Scheduled": "#1E3A8A",
        "Failed": "#EF4444",
        "Cancelled": "#64748B",
        "Draft": "#F59E0B",
    }
    publishing_status = [{"name": name, "value": count, "color": status_colors[name]} for name, count in status_counts.items() if count > 0]

    client_rows = []
    for w in workspaces:
        owner = w.owner
        w_posts = [p for p in posts if p.workspace_id == w.id]
        w_requests = [r for r in work_requests if r.workspace_id == w.id]
        initials = ''.join(part[0] for part in _client_short_name(owner).split()[:2]).upper()
        client_rows.append({
            "id": owner.id,
            "name": _client_short_name(owner),
            "logo": initials or "CL",
            "submitted": len(w_posts),
            "approved": sum(1 for r in w_requests if r.status.lower() == "approved"),
            "published": sum(1 for p in w_posts if p.status == "Published"),
        })

    return {
        "kpis": {
            "publishedPosts": published,
            "scheduledPosts": scheduled,
            "drafts": drafts,
            "activeCampaigns": active_campaigns,
            "pendingRequests": pending_requests,
            "assignedClients": len(workspaces),
        },
        "series": _bucket_post_counts(posts, max(min(days, 90), 1)),
        "monthly": _monthly_post_counts(posts),
        "platformSplit": _platform_split(posts),
        "publishingStatus": publishing_status,
        "clients": client_rows,
    }


@router.get("/reports")
def reports(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """DB-derived report summaries across the marketing team's client workspaces."""
    _require_marketing(current_user)
    workspaces = _marketing_workspaces(db, current_user.id)
    workspace_ids = [w.id for w in workspaces]
    posts = db.query(Post).filter(Post.workspace_id.in_(workspace_ids)).all() if workspace_ids else []
    campaigns = db.query(Campaign).filter(Campaign.workspace_id.in_(workspace_ids)).all() if workspace_ids else []

    def _post_counts(post_list):
        return {
            "posts": len(post_list),
            "publishedPosts": sum(1 for p in post_list if p.status == "Published"),
            "scheduledPosts": sum(1 for p in post_list if p.status == "Scheduled"),
            "drafts": sum(1 for p in post_list if p.status == "Draft"),
        }

    today = datetime.now(timezone.utc)
    period = today.strftime("%B %Y")
    generated = today.strftime("%Y-%m-%d")
    report_items = [{
        "id": "monthly-summary",
        "title": f"{period} — All Clients Report",
        "type": "monthly",
        "client": "All Clients",
        "period": "Current month",
        "generatedAt": generated,
        "campaigns": len(campaigns),
        **_post_counts(posts),
        "status": "ready",
    }]

    for w in workspaces:
        owner = w.owner
        name = _client_short_name(owner)
        w_posts = [p for p in posts if p.workspace_id == w.id]
        w_campaigns = [c for c in campaigns if c.workspace_id == w.id]
        report_items.append({
            "id": f"client-{owner.id}",
            "title": f"{name} — Monthly Report",
            "type": "client",
            "client": name,
            "period": "Current month",
            "generatedAt": generated,
            "campaigns": len(w_campaigns),
            **_post_counts(w_posts),
            "status": "ready",
        })

    for campaign in campaigns:
        owner = campaign.workspace.owner if campaign.workspace else None
        name = _client_short_name(owner) if owner else "Client"
        c_posts = [p for p in posts if p.campaign_id == campaign.id]
        start = campaign.start_date.strftime("%b %d") if campaign.start_date else "Start"
        end = campaign.end_date.strftime("%b %d, %Y") if campaign.end_date else "End"
        report_items.append({
            "id": f"campaign-{campaign.id}",
            "title": f"{campaign.name} — Campaign Report",
            "type": "campaign",
            "client": name,
            "period": f"{start} – {end}",
            "generatedAt": generated,
            "campaigns": 1,
            **_post_counts(c_posts),
            "status": "ready",
        })

    return {"reports": report_items, "trend": _monthly_post_counts(posts)}
