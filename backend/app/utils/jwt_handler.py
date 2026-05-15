from jose import jwt, JWTError
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer

from datetime import datetime, timedelta


# =========================
# SECRET CONFIG
# =========================

SECRET_KEY = "keratoconus_secret_key"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# =========================
# OAUTH2
# =========================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)


# =========================
# CREATE ACCESS TOKEN
# =========================

def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    encoded_jwt = jwt.encode(

        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# =========================
# VERIFY TOKEN
# =========================

def verify_token(

    token: str = Depends(oauth2_scheme)

):

    try:

        payload = jwt.decode(

            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("email")

        role = payload.get("role")

        if email is None:

            raise HTTPException(

                status_code=401,
                detail="Invalid authentication credentials"
            )

        return {

            "email": email,
            "role": role
        }

    except JWTError:

        raise HTTPException(

            status_code=401,
            detail="Invalid authentication credentials"
        )