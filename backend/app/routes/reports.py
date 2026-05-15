import os
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.models.database import get_db

from app.models.prediction import Prediction

from app.utils.auth_dependency import (
    get_current_user
)

from app.services.pdf_generator import generate_pdf_report

router = APIRouter()


@router.get("/reports")

def get_all_reports(

    current_user = Depends(get_current_user),

    db: Session = Depends(get_db)

):

    reports = db.query(Prediction).order_by(
        Prediction.created_at.desc()
    ).all()

    results = []

    for report in reports:

        results.append({

            "id": report.id,

            "patient_id": report.patient_id,

            "patient_name": report.patient_name,

            "age": report.age,

            "gender": report.gender,

            "eye_type": report.eye_type,

            "uploaded_image": report.uploaded_image,

            "prediction": report.predicted_class,

            "confidence": report.confidence,

            "gradcam_image": report.gradcam_image,

            "doctor_name": report.doctor_name,

            "doctor_email": report.doctor_email,

            "created_at": str(report.created_at)
        })

    return results


# =========================================================
# GET SINGLE REPORT
# =========================================================
@router.get("/reports/{report_id}")

def get_single_report(

    report_id: int,

    current_user = Depends(get_current_user),

    db: Session = Depends(get_db)

):

    report = db.query(Prediction).filter(
        Prediction.id == report_id
    ).first()

    if not report:

        raise HTTPException(

            status_code=404,

            detail="Report not found"
        )

    return {

        "id": report.id,

        "patient_id": report.patient_id,

        "patient_name": report.patient_name,

        "age": report.age,

        "gender": report.gender,

        "eye_type": report.eye_type,

        "uploaded_image": report.uploaded_image,

        "prediction": report.predicted_class,

        "confidence": report.confidence,

        "gradcam_image": report.gradcam_image,

        "doctor_name": report.doctor_name,

        "doctor_email": report.doctor_email,

        "created_at": report.created_at
    }

# =========================================================
# DELETE REPORT
# =========================================================

@router.delete("/reports/{report_id}")

def delete_report(

    report_id: int,

    current_user = Depends(get_current_user),

    db: Session = Depends(get_db)

):

    report = db.query(Prediction).filter(
        Prediction.id == report_id
    ).first()

    if not report:

        raise HTTPException(

            status_code=404,

            detail="Report not found"
        )

    # Delete uploaded image
    if (
        report.uploaded_image and
        os.path.exists(report.uploaded_image)
    ):

        os.remove(report.uploaded_image)

    # Delete GradCAM image
    if (
        report.gradcam_image and
        os.path.exists(report.gradcam_image)
    ):

        os.remove(report.gradcam_image)

    # Delete PDF if exists
    pdf_path = os.path.join(

        "reports",

        f"report_{report.id}.pdf"
    )

    if os.path.exists(pdf_path):

        os.remove(pdf_path)

    # Delete database row
    db.delete(report)

    db.commit()

    return {

        "message":
            "Report deleted successfully"
    }

# =========================================================
# GENERATE PDF REPORT
# =========================================================
@router.get("/reports/{report_id}/pdf")

def generate_pdf(

    report_id: int,

    current_user = Depends(get_current_user),

    db: Session = Depends(get_db)

):

    report = db.query(Prediction).filter(
        Prediction.id == report_id
    ).first()

    if not report:

        raise HTTPException(

            status_code=404,

            detail="Report not found"
        )

    pdf_path = generate_pdf_report(
        report
    )

    return {

    "message": "PDF generated successfully",

    "pdf_path":
        f"pdf_reports/{os.path.basename(pdf_path)}"
}