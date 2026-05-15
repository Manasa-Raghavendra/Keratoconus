from fastapi import Depends, HTTPException
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.doctor import Doctor

# =====================================
# JWT CONFIG
# =====================================

SECRET_KEY = "keratoconus_secret_key"

ALGORITHM = "HS256"

# =====================================
# Bearer Auth
# =====================================

security = HTTPBearer()

# =====================================
# Get Current User
# =====================================

def get_current_user(

    credentials: HTTPAuthorizationCredentials = Depends(security),

    db: Session = Depends(get_db)

):

    token = credentials.credentials

    credentials_exception = HTTPException(

        status_code=401,

        detail="Invalid authentication credentials"
    )

    try:

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[ALGORITHM]
        )

        email = payload.get("email")

        if email is None:

            raise credentials_exception

    except JWTError:

        raise credentials_exception

    # Get User
    user = db.query(Doctor).filter(

        Doctor.email == email

    ).first()

    if user is None:

        raise credentials_exception

    return user