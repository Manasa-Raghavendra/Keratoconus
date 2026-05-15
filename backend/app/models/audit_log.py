from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.models.database import Base


class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    log_type = Column(String)

    message = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )