from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.doctor import Doctor

from app.schemas.doctor_schema import (
    DoctorRegister,
    DoctorLogin
)

from app.utils.security import (
    hash_password,
    verify_password
)

from app.utils.jwt_handler import (
    create_access_token
)

from app.utils.logger import (
    create_log
)

from app.services.email_service import (
    generate_otp,
    send_verification_email
)

router = APIRouter()

# =========================================================
# TEMP OTP STORAGE
# =========================================================

OTP_STORAGE = {}

VERIFIED_EMAILS = set()


# =========================================================
# SEND OTP
# =========================================================
@router.post("/send-otp")
def send_otp(email: str):

    otp = generate_otp()

    OTP_STORAGE[email] = otp

    try:

        send_verification_email(

            email,

            otp
        )

    except Exception as e:

        print("EMAIL ERROR:", e)

        raise HTTPException(

            status_code=500,

            detail="Failed to send OTP email"
        )

    return {

        "message": "OTP sent successfully"
    }


# =========================================================
# VERIFY OTP
# =========================================================
@router.post("/verify-otp")
def verify_otp(

    email: str,

    otp: str
):

    stored_otp = OTP_STORAGE.get(email)

    if not stored_otp:

        raise HTTPException(

            status_code=400,

            detail="OTP expired or not found"
        )

    if stored_otp != otp:

        raise HTTPException(

            status_code=400,

            detail="Invalid OTP"
        )

    # =====================================================
    # MARK EMAIL VERIFIED
    # =====================================================

    VERIFIED_EMAILS.add(email)

    # REMOVE OTP
    del OTP_STORAGE[email]

    return {

        "message": "Email verified successfully"
    }


# =========================================================
# DOCTOR REGISTRATION
# =========================================================
@router.post("/register")
def register_doctor(

    doctor: DoctorRegister,

    db: Session = Depends(get_db)
):

    # =====================================================
    # EMAIL MUST BE VERIFIED FIRST
    # =====================================================

    if doctor.email not in VERIFIED_EMAILS:

        raise HTTPException(

            status_code=403,

            detail="Please verify email first"
        )

    # =====================================================
    # CHECK EMAIL EXISTS
    # =====================================================

    existing_email = db.query(Doctor).filter(

        Doctor.email == doctor.email

    ).first()

    if existing_email:

        raise HTTPException(

            status_code=400,

            detail="Email already registered"
        )

    # =====================================================
    # CHECK DOCTOR ID EXISTS
    # =====================================================

    existing_doctor = db.query(Doctor).filter(

        Doctor.doctor_id == doctor.doctor_id

    ).first()

    if existing_doctor:

        raise HTTPException(

            status_code=400,

            detail="Doctor ID already exists"
        )

    # =====================================================
    # HASH PASSWORD
    # =====================================================

    hashed_password = hash_password(
        doctor.password
    )

    # =====================================================
    # CREATE DOCTOR OBJECT
    # =====================================================

    new_doctor = Doctor(

        full_name=doctor.full_name,

        doctor_id=doctor.doctor_id,

        license_number=doctor.license_number,

        specialization=doctor.specialization,

        hospital_name=doctor.hospital_name,

        email=doctor.email,

        phone=doctor.phone,

        password=hashed_password,

        experience=doctor.experience,

        city=doctor.city,

        role="doctor",

        approval_status="pending",

        email_verified=True
    )

    # =====================================================
    # SAVE TO DATABASE
    # =====================================================

    db.add(new_doctor)

    db.commit()

    db.refresh(new_doctor)

    # =====================================================
    # REMOVE VERIFIED EMAIL
    # =====================================================

    VERIFIED_EMAILS.remove(doctor.email)

    # =====================================================
    # CREATE AUDIT LOG
    # =====================================================

    create_log(

        db,

        "INFO",

        f"New doctor registration: {new_doctor.full_name}"
    )

    return {

        "message":
            "Doctor registered successfully",

        "approval_status":
            "pending"
    }


# =========================================================
# LOGIN API
# =========================================================

@router.post("/login")
def login_doctor(

    doctor: DoctorLogin,

    db: Session = Depends(get_db)
):

    # =====================================================
    # FIND USER
    # =====================================================

    user = db.query(Doctor).filter(

        Doctor.email == doctor.email

    ).first()

    # =====================================================
    # USER NOT FOUND
    # =====================================================

    if not user:

        raise HTTPException(

            status_code=401,

            detail="Invalid email or password"
        )

    # =====================================================
    # VERIFY PASSWORD
    # =====================================================

    if not verify_password(

        doctor.password,

        user.password
    ):

        raise HTTPException(

            status_code=401,

            detail="Invalid email or password"
        )

    # =====================================================
    # EMAIL VERIFICATION CHECK
    # =====================================================

    if not user.email_verified:

        raise HTTPException(

            status_code=403,

            detail="Please verify your email first"
        )

    # =====================================================
    # ADMIN APPROVAL CHECK
    # =====================================================

    if (

        user.role == "doctor"

        and user.approval_status != "approved"
    ):

        raise HTTPException(

            status_code=403,

            detail="Awaiting admin approval"
        )

    # =====================================================
    # CREATE AUDIT LOG
    # =====================================================

    create_log(

        db,

        "INFO",

        f"User login: {user.email}"
    )

    # =====================================================
    # GENERATE JWT TOKEN
    # =====================================================

    token = create_access_token(

        {

            "email": user.email,

            "role": user.role
        }
    )

    # =====================================================
    # RETURN RESPONSE
    # =====================================================

    return {

        "message":
            "Login successful",

        "access_token":
            token,

        "token_type":
            "bearer",

        "role":
            user.role,

        "full_name":
            user.full_name,

        "approval_status":
            user.approval_status
    }


# =========================================================
# FORGOT PASSWORD - SEND OTP
# =========================================================

@router.post("/forgot-password")
def forgot_password(

    email: str,

    db: Session = Depends(get_db)
):

    user = db.query(Doctor).filter(

        Doctor.email == email

    ).first()

    if not user:

        raise HTTPException(

            status_code=404,

            detail="Email not found"
        )

    otp = generate_otp()

    OTP_STORAGE[email] = otp

    send_verification_email(

        email,

        otp
    )

    return {

        "message":
            "Password reset OTP sent"
    }


# =========================================================
# RESET PASSWORD
# =========================================================

@router.post("/reset-password")
def reset_password(

    email: str,

    otp: str,

    new_password: str,

    db: Session = Depends(get_db)
):

    user = db.query(Doctor).filter(

        Doctor.email == email

    ).first()

    if not user:

        raise HTTPException(

            status_code=404,

            detail="User not found"
        )

    stored_otp = OTP_STORAGE.get(email)

    if not stored_otp:

        raise HTTPException(

            status_code=400,

            detail="OTP expired"
        )

    if stored_otp != otp:

        raise HTTPException(

            status_code=400,

            detail="Invalid OTP"
        )

    # =====================================================
    # UPDATE PASSWORD
    # =====================================================

    user.password = hash_password(

        new_password
    )

    db.commit()

    # =====================================================
    # REMOVE OTP
    # =====================================================

    del OTP_STORAGE[email]

    return {

        "message":
            "Password reset successful"
    } 

from fastapi import UploadFile, File
import shutil
import os

# =========================================================
# UPLOAD PROFILE PHOTO
# =========================================================

@router.post("/upload-profile-photo")

def upload_profile_photo(

    email: str,

    file: UploadFile = File(...),

    db: Session = Depends(get_db)
):

    # ==========================================
    # FIND USER
    # ==========================================

    user = db.query(Doctor).filter(

        Doctor.email == email

    ).first()

    if not user:

        raise HTTPException(

            status_code=404,

            detail="User not found"
        )

    # ==========================================
    # CREATE UPLOADS FOLDER
    # ==========================================

    os.makedirs(

        "uploads",

        exist_ok=True
    )

    # ==========================================
    # SAVE FILE
    # ==========================================

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(

            file.file,

            buffer
        )

    # ==========================================
    # SAVE TO DATABASE
    # ==========================================

    user.profile_photo = file_path

    db.commit()

    return {

        "message":
            "Photo uploaded successfully",

        "photo_url":
            f"http://127.0.0.1:8000/{file_path}"
    }