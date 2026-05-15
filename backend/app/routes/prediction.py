from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Form

from sqlalchemy.orm import Session

from datetime import datetime

import shutil
import os
import uuid

from app.models.database import get_db

from app.models.prediction import Prediction

from app.utils.auth_dependency import (
    get_current_user
)

from app.utils.logger import create_log

from app.utils.image_validator import (
    is_pentacam_image
)

from app.services.predictor import (
    predict_image
)

from app.services.gradcam import (
    generate_gradcam
)

# =========================================================
# CREATE ROUTER
# =========================================================

router = APIRouter()


# =========================================================
# AI PREDICTION ROUTE
# =========================================================

@router.post("/predict")
def predict_keratoconus(

    patient_id: str = Form(...),

    patient_name: str = Form(...),

    age: str = Form(...),

    gender: str = Form(...),

    eye_type: str = Form(...),

    file: UploadFile = File(...),

    current_user = Depends(get_current_user),

    db: Session = Depends(get_db)

):

    # =====================================================
    # ALLOWED FILE TYPES
    # =====================================================

    allowed_extensions = [
        "jpg",
        "jpeg",
        "png"
    ]

    file_extension = file.filename.split(".")[-1]

    if file_extension.lower() not in allowed_extensions:

        raise HTTPException(

            status_code=400,

            detail="Only JPG, JPEG, PNG files allowed"
        )

    # =====================================================
    # GENERATE UNIQUE FILE NAME
    # =====================================================

    unique_filename = (

        str(uuid.uuid4())
        + "."
        + file_extension
    )

    file_path = os.path.join(

        "uploads",

        unique_filename
    )

    # =====================================================
    # SAVE IMAGE
    # =====================================================

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(

            file.file,

            buffer
        )

    # =====================================================
    # VALIDATE PENTACAM IMAGE
    # =====================================================

    valid_image = is_pentacam_image(file_path)

    if not valid_image:

        # Remove invalid uploaded image
        os.remove(file_path)

        raise HTTPException(

            status_code=400,

            detail="Invalid image. Please upload a valid Pentacam corneal map."
        )

    # =====================================================
    # RUN AI MODEL
    # =====================================================

    result = predict_image(file_path)

    # =====================================================
    # CONFIDENCE VALIDATION
    # =====================================================

    confidence = float(result["confidence"])

    if confidence < 30:

        os.remove(file_path)

        raise HTTPException(

            status_code=400,

            detail="Uploaded image is not a valid Pentacam map."
        )

    # =====================================================
    # GENERATE REAL GRADCAM
    # =====================================================

    gradcam_path = generate_gradcam(file_path)

    # =====================================================
    # SAVE TO DATABASE
    # =====================================================

    new_prediction = Prediction(

        patient_id=patient_id,

        patient_name=patient_name,

        age=age,

        gender=gender,

        eye_type=eye_type,

        uploaded_image=file_path,

        predicted_class=result["predicted_class"],

        confidence=result["confidence"],

        gradcam_image=gradcam_path,

        doctor_name=current_user.full_name,

        doctor_email=current_user.email,

        created_at=datetime.utcnow()
    )

    db.add(new_prediction)

    db.commit()

    db.refresh(new_prediction)

    # =====================================================
    # CREATE AUDIT LOG
    # =====================================================

    create_log(

        db,

        "SUCCESS",

        f"Prediction completed for patient: {patient_name}"
    )

    # =====================================================
    # HIGH RISK LOG
    # =====================================================

    if result["predicted_class"].lower() != "normal":

        create_log(

            db,

            "WARNING",

            f"High-risk prediction detected for patient: {patient_name}"
        )

    # =====================================================
    # API RESPONSE
    # =====================================================

    return {

        "message": "Prediction successful",

        "prediction_id": new_prediction.id,

        "uploaded_by": current_user.full_name,

        "patient_name": patient_name,

        "created_at": str(new_prediction.created_at),

        "prediction": result,

        "uploaded_image": file_path,

        "gradcam_image": gradcam_path
    }