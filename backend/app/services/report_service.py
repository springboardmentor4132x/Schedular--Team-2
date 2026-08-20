import json
import os
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.generated_report import GeneratedReport
from app.models.post import Post
from app.models.post_analytics import PostAnalytics
from app.models.campaign import Campaign
from app.models.campaign_analytics import CampaignAnalytics
from app.models.audience_analytics import AudienceAnalytics
from app.models.social_account import SocialAccount
from app.models.publishing_log import PublishingLog
from app.core.config import settings

REPORTS_DIR = os.path.join(settings.MEDIA_DIR, "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)


# ---------------------------------------------------------
# Data collectors per report type
# ---------------------------------------------------------

def _collect_engagement_data(db: Session, user_id: int, filters: dict) -> dict:
    query = db.query(PostAnalytics).join(Post, Post.id == PostAnalytics.post_id).filter(
        Post.user_id == user_id
    )
    if filters.get("platform"):
        query = query.filter(PostAnalytics.platform == filters["platform"])
    if filters.get("campaign_id"):
        query = query.filter(Post.campaign_id == filters["campaign_id"])

    analytics = query.all()
    total_likes = sum(a.likes for a in analytics)
    total_comments = sum(a.comments for a in analytics)
    total_shares = sum(a.shares for a in analytics)
    total_reach = sum(a.reach for a in analytics)
    total_impressions = sum(a.impressions for a in analytics)
    total_clicks = sum(a.clicks for a in analytics)
    avg_engagement = round(sum(a.engagement_rate for a in analytics) / len(analytics), 2) if analytics else 0.0

    top_posts = sorted(analytics, key=lambda a: a.engagement_rate, reverse=True)[:5]

    return {
        "summary": {
            "total_posts_analyzed": len(analytics),
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_shares": total_shares,
            "total_reach": total_reach,
            "total_impressions": total_impressions,
            "total_clicks": total_clicks,
            "average_engagement_rate": avg_engagement,
        },
        "top_posts": [
            {
                "post_id": a.post_id,
                "platform": a.platform,
                "likes": a.likes,
                "comments": a.comments,
                "engagement_rate": a.engagement_rate,
            }
            for a in top_posts
        ],
    }


def _collect_campaign_data(db: Session, user_id: int, filters: dict) -> dict:
    query = db.query(CampaignAnalytics, Campaign).join(
        Campaign, Campaign.id == CampaignAnalytics.campaign_id
    ).filter(Campaign.user_id == user_id)

    if filters.get("campaign_id"):
        query = query.filter(Campaign.id == filters["campaign_id"])

    rows = query.all()
    campaigns = []
    for ca, campaign in rows:
        engagement_rate = round((ca.engagement / ca.impressions) * 100, 2) if ca.impressions > 0 else 0.0
        campaigns.append({
            "campaign_name": campaign.name,
            "status": campaign.status,
            "total_posts": ca.total_posts,
            "reach": ca.reach,
            "impressions": ca.impressions,
            "engagement": ca.engagement,
            "clicks": ca.clicks,
            "roi": ca.roi,
            "completion_percentage": ca.completion_percentage,
            "engagement_rate": engagement_rate,
        })

    return {"campaigns": campaigns, "total_campaigns": len(campaigns)}


def _collect_audience_data(db: Session, user_id: int, filters: dict) -> dict:
    query = db.query(AudienceAnalytics).join(
        SocialAccount, SocialAccount.id == AudienceAnalytics.social_account_id
    ).filter(SocialAccount.user_id == user_id)

    if filters.get("platform"):
        query = query.filter(AudienceAnalytics.platform == filters["platform"])

    audience = query.all()
    return {
        "platforms": [
            {
                "platform": a.platform,
                "followers": a.followers,
                "new_followers": a.new_followers,
                "lost_followers": a.lost_followers,
                "net_growth": a.new_followers - a.lost_followers,
                "gender_distribution": a.gender_distribution,
                "age_distribution": a.age_distribution,
                "country_distribution": a.country_distribution,
            }
            for a in audience
        ]
    }


def _collect_publishing_data(db: Session, user_id: int, filters: dict) -> dict:
    posts = db.query(Post).filter(Post.user_id == user_id).all()
    total = len(posts)
    published = sum(1 for p in posts if p.status == "Published")
    failed = sum(1 for p in posts if p.status == "Failed")
    cancelled = sum(1 for p in posts if p.status == "Cancelled")
    scheduled = sum(1 for p in posts if p.status == "Scheduled")

    logs = db.query(PublishingLog).join(
        Post, Post.id == PublishingLog.post_id
    ).filter(Post.user_id == user_id).all()

    return {
        "summary": {
            "total_posts": total,
            "published": published,
            "failed": failed,
            "cancelled": cancelled,
            "scheduled": scheduled,
            "success_rate": round((published / total) * 100, 2) if total > 0 else 0.0,
            "total_publishing_attempts": len(logs),
        }
    }


def _collect_platform_comparison_data(db: Session, user_id: int, filters: dict) -> dict:
    accounts = db.query(SocialAccount).filter(SocialAccount.user_id == user_id).all()
    platforms = []
    for acc in accounts:
        stats = db.query(
            func.coalesce(func.sum(PostAnalytics.reach), 0),
            func.coalesce(func.sum(PostAnalytics.impressions), 0),
            func.coalesce(func.sum(PostAnalytics.likes), 0),
            func.coalesce(func.sum(PostAnalytics.comments), 0),
            func.coalesce(func.sum(PostAnalytics.shares), 0),
            func.coalesce(func.sum(PostAnalytics.clicks), 0),
        ).filter(PostAnalytics.platform == acc.platform).join(
            Post, Post.id == PostAnalytics.post_id
        ).filter(Post.user_id == user_id).first()

        reach, impressions, likes, comments, shares, clicks = stats
        platforms.append({
            "platform": acc.platform,
            "followers": acc.followers_count or 0,
            "reach": reach,
            "impressions": impressions,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "clicks": clicks,
            "engagement": likes + comments + shares,
        })
    return {"platforms": platforms}


# ---------------------------------------------------------
# PDF Generator
# ---------------------------------------------------------

def _generate_pdf(report_name: str, report_type: str, data: dict, file_path: str):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        )

        doc = SimpleDocTemplate(file_path, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
        styles = getSampleStyleSheet()
        story = []

        # Title
        story.append(Paragraph(report_name, styles["Title"]))
        story.append(Paragraph(
            f"Generated: {datetime.now(timezone.utc).strftime('%B %d, %Y %H:%M UTC')}",
            styles["Normal"]
        ))
        story.append(Spacer(1, 0.5*cm))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
        story.append(Spacer(1, 0.5*cm))

        # Summary section
        if "summary" in data:
            story.append(Paragraph("Summary", styles["Heading2"]))
            summary = data["summary"]
            table_data = [[str(k).replace("_", " ").title(), str(v)] for k, v in summary.items()]
            table = Table(table_data, colWidths=[8*cm, 8*cm])
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightblue),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.lightyellow]),
            ]))
            story.append(table)
            story.append(Spacer(1, 0.5*cm))

        # Top posts
        if "top_posts" in data and data["top_posts"]:
            story.append(Paragraph("Top Performing Posts", styles["Heading2"]))
            headers = ["Post ID", "Platform", "Likes", "Comments", "Engagement Rate"]
            rows = [headers] + [
                [str(p["post_id"]), p["platform"], str(p["likes"]),
                 str(p["comments"]), f'{p["engagement_rate"]}%']
                for p in data["top_posts"]
            ]
            table = Table(rows, colWidths=[3*cm, 3*cm, 3*cm, 3*cm, 4*cm])
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ]))
            story.append(table)

        # Campaigns
        if "campaigns" in data and data["campaigns"]:
            story.append(Spacer(1, 0.5*cm))
            story.append(Paragraph("Campaign Performance", styles["Heading2"]))
            headers = ["Campaign", "Status", "Posts", "Reach", "Engagement", "ROI"]
            rows = [headers] + [
                [c["campaign_name"][:20], c["status"], str(c["total_posts"]),
                 str(c["reach"]), str(c["engagement"]), f'{c["roi"]}']
                for c in data["campaigns"]
            ]
            table = Table(rows, colWidths=[4*cm, 3*cm, 2*cm, 3*cm, 3*cm, 2*cm])
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ]))
            story.append(table)

        # Platform comparison
        if "platforms" in data and data["platforms"]:
            story.append(Spacer(1, 0.5*cm))
            story.append(Paragraph("Platform Comparison", styles["Heading2"]))
            headers = ["Platform", "Followers", "Reach", "Impressions", "Engagement", "Clicks"]
            rows = [headers] + [
                [p["platform"].title(), str(p["followers"]), str(p["reach"]),
                 str(p["impressions"]), str(p["engagement"]), str(p["clicks"])]
                for p in data["platforms"]
            ]
            table = Table(rows, colWidths=[3*cm, 3*cm, 3*cm, 3*cm, 3*cm, 2*cm])
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ]))
            story.append(table)

        story.append(Spacer(1, 1*cm))
        story.append(Paragraph("Generated by SocialPilot Analytics", styles["Normal"]))
        doc.build(story)
        return True

    except ImportError:
        # If reportlab not installed, create a simple text file
        with open(file_path, "w") as f:
            f.write(f"Report: {report_name}\n")
            f.write(f"Type: {report_type}\n")
            f.write(f"Generated: {datetime.now(timezone.utc)}\n\n")
            f.write(json.dumps(data, indent=2, default=str))
        return True


# ---------------------------------------------------------
# Excel Generator
# ---------------------------------------------------------

def _generate_excel(report_name: str, report_type: str, data: dict, file_path: str):
    try:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Summary"

        # Header styling
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="003366", end_color="003366", fill_type="solid")

        ws.append([report_name])
        ws["A1"].font = Font(bold=True, size=14)
        ws.append([f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}"])
        ws.append([])

        # Summary sheet
        if "summary" in data:
            ws.append(["Metric", "Value"])
            for cell in ws[ws.max_row]:
                cell.font = header_font
                cell.fill = header_fill
            for key, value in data["summary"].items():
                ws.append([key.replace("_", " ").title(), value])

        # Add top posts sheet if available
        if "top_posts" in data and data["top_posts"]:
            ws2 = wb.create_sheet("Top Posts")
            headers = ["Post ID", "Platform", "Likes", "Comments", "Engagement Rate"]
            ws2.append(headers)
            for cell in ws2[1]:
                cell.font = header_font
                cell.fill = header_fill
            for post in data["top_posts"]:
                ws2.append([
                    post["post_id"], post["platform"],
                    post["likes"], post["comments"],
                    f'{post["engagement_rate"]}%'
                ])

        # Campaigns sheet
        if "campaigns" in data and data["campaigns"]:
            ws3 = wb.create_sheet("Campaigns")
            headers = ["Campaign", "Status", "Total Posts", "Reach", "Impressions",
                       "Engagement", "Clicks", "ROI", "Completion %"]
            ws3.append(headers)
            for cell in ws3[1]:
                cell.font = header_font
                cell.fill = header_fill
            for c in data["campaigns"]:
                ws3.append([
                    c["campaign_name"], c["status"], c["total_posts"],
                    c["reach"], c["impressions"], c["engagement"],
                    c["clicks"], c["roi"], c["completion_percentage"]
                ])

        # Platform comparison sheet
        if "platforms" in data and data["platforms"]:
            ws4 = wb.create_sheet("Platform Comparison")
            headers = ["Platform", "Followers", "Reach", "Impressions",
                       "Likes", "Comments", "Shares", "Clicks", "Engagement"]
            ws4.append(headers)
            for cell in ws4[1]:
                cell.font = header_font
                cell.fill = header_fill
            for p in data["platforms"]:
                ws4.append([
                    p["platform"].title(), p["followers"], p["reach"],
                    p["impressions"], p["likes"], p["comments"],
                    p["shares"], p["clicks"], p["engagement"]
                ])

        wb.save(file_path)
        return True

    except ImportError:
        return False


# ---------------------------------------------------------
# Main report generation
# ---------------------------------------------------------

def generate_report(db: Session, user_id: int, request) -> GeneratedReport:
    report_type = request.report_type
    export_format = request.export_format.lower()
    filters = {
        "platform": request.platform,
        "campaign_id": request.campaign_id,
        "content_type": request.content_type,
        "start_date": request.start_date,
        "end_date": request.end_date,
    }

    # Collect data based on report type
    collector_map = {
        "engagement": _collect_engagement_data,
        "campaign": _collect_campaign_data,
        "audience": _collect_audience_data,
        "publishing": _collect_publishing_data,
        "platform_comparison": _collect_platform_comparison_data,
    }

    collect_fn = collector_map.get(report_type)
    if not collect_fn:
        raise ValueError(f"Unknown report type: {report_type}")

    data = collect_fn(db, user_id, filters)
    report_name = request.report_name or f"{report_type.replace('_', ' ').title()} Report"

    # Generate file
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"{report_type}_{user_id}_{timestamp}.{export_format}"
    file_path = os.path.join(REPORTS_DIR, filename)

    if export_format == "pdf":
        extension = "pdf"
    elif export_format in ("excel", "xlsx"):
        extension = "xlsx"
    else:
        raise ValueError("Unsupported export format. Use pdf or excel.")

    filename = f"{report_type}_{user_id}_{timestamp}.{extension}"
    file_path = os.path.join(REPORTS_DIR, filename)

    if export_format == "pdf":
        success = _generate_pdf(report_name, report_type, data, file_path)
    else:
        success = _generate_excel(report_name, report_type, data, file_path)

    if not success:
        raise ValueError("Failed to generate report file.")
    # Save record
    report = GeneratedReport(
        user_id=user_id,
        campaign_id=request.campaign_id,
        report_name=report_name,
        report_type=report_type,
        selected_filters=json.dumps(filters),
        export_format=export_format,
        status="completed",
        file_location=file_path,
        download_count=0,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report, data


def get_all_reports(db: Session, user_id: int):
    return db.query(GeneratedReport).filter(
        GeneratedReport.user_id == user_id
    ).order_by(GeneratedReport.generated_at.desc()).all()


def get_report_by_id(db: Session, user_id: int, report_id: int):
    report = db.query(GeneratedReport).filter(
        GeneratedReport.id == report_id,
        GeneratedReport.user_id == user_id,
    ).first()
    return report


def delete_report(db: Session, user_id: int, report_id: int):
    report = get_report_by_id(db, user_id, report_id)
    if not report:
        return False
    if report.file_location and os.path.exists(report.file_location):
        try:
            os.remove(report.file_location)
        except Exception:
            pass
    db.delete(report)
    db.commit()
    return True