from fastapi import APIRouter
from fastapi import Depends
from fastapi import UploadFile
from fastapi import File
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.models.database import SessionLocal
from app.models.doctor import Doctor

from app.utils.jwt_handler import verify_token

from app.utils.security import (
    hash_password,
    verify_password
)

import shutil
import os
import uuid

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)

# ==============================
# DATABASE CONNECTION
# ==============================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==============================
# GET PROFILE
# ==============================

@router.get("/profile")

def get_profile(

    token_data: dict = Depends(verify_token),

    db: Session = Depends(get_db)

):

    doctor = db.query(Doctor).filter(

        Doctor.email == token_data["email"]

    ).first()

    return {

        "full_name": doctor.full_name,

        "email": doctor.email,

        "hospital_name": doctor.hospital_name,

        "phone": doctor.phone,

        "profile_photo": doctor.profile_photo,

        "email_notifications": doctor.email_notifications,

        "high_risk_alerts": doctor.high_risk_alerts,

        "weekly_reports": doctor.weekly_reports
    }


# ==============================
# UPDATE PROFILE
# ==============================

@router.put("/profile/update")

def update_profile(

    data: dict,

    token_data: dict = Depends(verify_token),

    db: Session = Depends(get_db)

):

    doctor = db.query(Doctor).filter(

        Doctor.email == token_data["email"]

    ).first()

    doctor.full_name = data.get(

        "full_name",
        doctor.full_name
    )

    doctor.hospital_name = data.get(

        "hospital_name",
        doctor.hospital_name
    )

    doctor.phone = data.get(

        "phone",
        doctor.phone
    )

    db.commit()

    return {

        "message": "Profile updated successfully"
    }


# ==============================
# CHANGE PASSWORD
# ==============================

@router.put("/change-password")

def change_password(

    data: dict,

    token_data: dict = Depends(verify_token),

    db: Session = Depends(get_db)

):

    doctor = db.query(Doctor).filter(

        Doctor.email == token_data["email"]

    ).first()

    current_password = data.get("current_password")

    new_password = data.get("new_password")

    # Verify old password
    if not verify_password(

        current_password,
        doctor.password
    ):

        raise HTTPException(

            status_code=400,

            detail="Current password incorrect"
        )

    # Hash new password
    doctor.password = hash_password(
        new_password
    )

    db.commit()

    return {

        "message": "Password changed successfully"
    }


# ==============================
# UPDATE NOTIFICATIONS
# ==============================

@router.put("/notifications/update")

def update_notifications(

    data: dict,

    token_data: dict = Depends(verify_token),

    db: Session = Depends(get_db)

):

    doctor = db.query(Doctor).filter(

        Doctor.email == token_data["email"]

    ).first()

    doctor.email_notifications = data.get(

        "email_notifications",
        doctor.email_notifications
    )

    doctor.high_risk_alerts = data.get(

        "high_risk_alerts",
        doctor.high_risk_alerts
    )

    doctor.weekly_reports = data.get(

        "weekly_reports",
        doctor.weekly_reports
    )

    db.commit()

    return {

        "message": "Notification settings updated successfully"
    }


# ==============================
# UPLOAD PROFILE PHOTO
# ==============================

@router.post("/upload-photo")

def upload_profile_photo(

    file: UploadFile = File(...),

    token_data: dict = Depends(verify_token),

    db: Session = Depends(get_db)

):

    doctor = db.query(Doctor).filter(

        Doctor.email == token_data["email"]

    ).first()

    # File validation
    allowed_extensions = [

        "jpg",
        "jpeg",
        "png"
    ]

    file_extension = file.filename.split(".")[-1]

    if file_extension.lower() not in allowed_extensions:

        raise HTTPException(

            status_code=400,

            detail="Only JPG, JPEG, PNG allowed"
        )

    # Unique filename
    unique_filename = (

        str(uuid.uuid4())
        + "."
        + file_extension
    )

    file_path = os.path.join(

        "uploads",
        unique_filename
    )

    # Save file
    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(

            file.file,
            buffer
        )

    # Save in DB
    doctor.profile_photo = file_path

    db.commit()

    return {

        "message": "Profile photo uploaded successfully",

        "profile_photo": file_path
    }

# =========================================================
# UPDATE NOTIFICATION SETTINGS
# =========================================================

@router.put("/settings/notifications")

def update_notifications(

    settings: dict,

    db: Session = Depends(get_db)
):

    email = settings.get("email")

    user = db.query(Doctor).filter(

        Doctor.email == email

    ).first()

    if not user:

        raise HTTPException(

            status_code=404,

            detail="User not found"
        )

    # ==========================================
    # UPDATE SETTINGS
    # ==========================================

    user.email_notifications = settings.get(

        "email_notifications",

        True
    )

    user.high_risk_alerts = settings.get(

        "high_risk_alerts",

        True
    )

    user.weekly_reports = settings.get(

        "weekly_reports",

        False
    )

    db.commit()

    return {

        "message":
            "Notification settings updated"
    }