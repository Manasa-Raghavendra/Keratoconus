from pydantic import BaseModel, EmailStr
from typing import Optional

# Registration Schema
class DoctorRegister(BaseModel):

    full_name: str
    doctor_id: str

    license_number: str
    specialization: str
    hospital_name: str

    email: EmailStr
    phone: str

    password: str

    experience: str
    city: str

    # Optional fields
    role: Optional[str] = "doctor"
    approval_status: Optional[str] = "pending"


# Login Schema
class DoctorLogin(BaseModel):

    email: EmailStr
    password: str