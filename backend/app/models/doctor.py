from sqlalchemy import Column, Integer, String, Boolean
from app.models.database import Base



class Doctor(Base):

    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String)

    doctor_id = Column(
        String,
        unique=True
    )

    license_number = Column(String)

    specialization = Column(String)

    hospital_name = Column(String)

    email = Column(
        String,
        unique=True
    )

    phone = Column(String)

    password = Column(String)

    experience = Column(String)

    city = Column(String)

    role = Column(
        String,
        default="doctor"
    )

    approval_status = Column(
        String,
        default="pending"
    )


    
    # =========================
    # EMAIL VERIFICATION
    # =========================

    email_verified = Column(

        Boolean,

        default=False
    )

    otp_code = Column(

        String,

        nullable=True
    )


    # =========================
    # PROFILE SETTINGS
    # =========================

    profile_photo = Column(
        String,
        nullable=True
    )

    # =========================
    # NOTIFICATION SETTINGS
    # =========================

    email_notifications = Column(
        Boolean,
        default=True
    )

    high_risk_alerts = Column(
        Boolean,
        default=True
    )

    weekly_reports = Column(
        Boolean,
        default=False
    )