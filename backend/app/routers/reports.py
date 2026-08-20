import os
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.report import ReportGenerateRequest, GeneratedReportResponse
from app.services import report_service

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/", response_model=List[GeneratedReportResponse])
def get_all_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return report_service.get_all_reports(db, current_user.id)


@router.post("/generate")
def generate_report(
    request: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        report, preview_data = report_service.generate_report(db, current_user.id, request)
        return {
            "message": "Report generated successfully.",
            "report_id": report.id,
            "report_name": report.report_name,
            "export_format": report.export_format,
            "status": report.status,
            "generated_at": report.generated_at,
            "preview": preview_data,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


@router.get("/preview/{report_id}")
def preview_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = report_service.get_report_by_id(db, current_user.id, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    import json
    return {
        "report_id": report.id,
        "report_name": report.report_name,
        "report_type": report.report_type,
        "export_format": report.export_format,
        "generated_at": report.generated_at,
        "filters": json.loads(report.selected_filters) if report.selected_filters else {},
    }


@router.get("/download/{report_id}")
def download_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = report_service.get_report_by_id(db, current_user.id, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    if not report.file_location or not os.path.exists(report.file_location):
        raise HTTPException(status_code=404, detail="Report file not found on server.")

    report.download_count += 1
    db.commit()

    media_type = "application/pdf" if report.export_format == "pdf" else \
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    return FileResponse(
        path=report.file_location,
        media_type=media_type,
        filename=os.path.basename(report.file_location),
    )


@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = report_service.delete_report(db, current_user.id, report_id)
    if not success:
        raise HTTPException(status_code=404, detail="Report not found.")
    return {"message": "Report deleted successfully."}