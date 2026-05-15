from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.models.database import SessionLocal

from app.models.doctor import Doctor
from app.models.prediction import Prediction
from app.models.audit_log import AuditLog

from app.utils.logger import create_log

import os

# =========================================================
# ROUTER
# =========================================================

router = APIRouter(

    prefix="/admin",

    tags=["Admin"]
)

# =========================================================
# DATABASE DEPENDENCY
# =========================================================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()

# =========================================================
# GET ALL DOCTORS
# =========================================================

@router.get("/doctors")
def get_all_doctors(

    db: Session = Depends(get_db)
):

    doctors = db.query(Doctor).all()

    return doctors

# =========================================================
# APPROVE DOCTOR
# =========================================================

@router.put("/approve-doctor/{doctor_id}")
def approve_doctor(

    doctor_id: int,

    db: Session = Depends(get_db)
):

    doctor = db.query(Doctor).filter(

        Doctor.id == doctor_id

    ).first()

    if not doctor:

        raise HTTPException(

            status_code=404,

            detail="Doctor not found"
        )

    doctor.approval_status = "approved"

    db.commit()

    # Audit Log
    create_log(

        db,

        "SUCCESS",

        f"Doctor approved: {doctor.full_name}"
    )

    return {

        "message":
            "Doctor approved successfully"
    }

# =========================================================
# REJECT DOCTOR
# =========================================================

@router.put("/reject-doctor/{doctor_id}")
def reject_doctor(

    doctor_id: int,

    db: Session = Depends(get_db)
):

    doctor = db.query(Doctor).filter(

        Doctor.id == doctor_id

    ).first()

    if not doctor:

        raise HTTPException(

            status_code=404,

            detail="Doctor not found"
        )

    doctor.approval_status = "rejected"

    db.commit()

    # Audit Log
    create_log(

        db,

        "WARNING",

        f"Doctor rejected: {doctor.full_name}"
    )

    return {

        "message":
            "Doctor rejected successfully"
    }

# =========================================================
# GET AUDIT LOGS
# =========================================================

@router.get("/logs")
def get_logs(

    db: Session = Depends(get_db)
):

    logs = db.query(AuditLog).order_by(

        AuditLog.id.desc()

    ).all()

    return logs

# =========================================================
# ADMIN DASHBOARD STATS
# =========================================================

@router.get("/stats")
def get_admin_stats(

    db: Session = Depends(get_db)
):

    total_doctors = db.query(
        Doctor
    ).count()

    pending_doctors = db.query(
        Doctor
    ).filter(

        Doctor.approval_status == "pending"

    ).count()

    total_predictions = db.query(
        Prediction
    ).count()

    normal_cases = db.query(
        Prediction
    ).filter(

        Prediction.predicted_class == "Normal"

    ).count()

    suspect_cases = db.query(
        Prediction
    ).filter(

        Prediction.predicted_class == "Suspect"

    ).count()

    keratoconus_cases = db.query(
        Prediction
    ).filter(

        Prediction.predicted_class == "Keratoconus"

    ).count()

    dataset_size = 0

    if os.path.exists("uploads"):

        dataset_size = len(
            os.listdir("uploads")
        )

    return {

        "total_doctors":
            total_doctors,

        "pending_doctors":
            pending_doctors,

        "total_predictions":
            total_predictions,

        "normal_cases":
            normal_cases,

        "suspect_cases":
            suspect_cases,

        "keratoconus_cases":
            keratoconus_cases,

        "dataset_size":
            dataset_size,

        "accuracy":
            52.3
    }