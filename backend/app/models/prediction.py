from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import DateTime

from datetime import datetime

from app.models.database import Base


class Prediction(Base):

    __tablename__ = "predictions"

    # =====================================================
    # PRIMARY KEY
    # =====================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # =====================================================
    # PATIENT DETAILS
    # =====================================================

    patient_id = Column(String)

    patient_name = Column(String)

    age = Column(String)

    gender = Column(String)

    eye_type = Column(String)

    # =====================================================
    # IMAGE PATHS
    # =====================================================

    uploaded_image = Column(String)

    gradcam_image = Column(String)

    # =====================================================
    # AI PREDICTION
    # =====================================================

    predicted_class = Column(String)

    confidence = Column(Float)

    # =====================================================
    # DOCTOR DETAILS
    # =====================================================

    doctor_name = Column(String)

    doctor_email = Column(String)

    # =====================================================
    # TIMESTAMP
    # =====================================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )