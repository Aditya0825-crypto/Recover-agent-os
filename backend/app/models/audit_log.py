from sqlalchemy import Column, String, Float, DateTime, Text, JSON
from datetime import datetime
from backend.app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, index=True) # e.g. AUD-73190
    time = Column(String(32), nullable=False)             # e.g. "09:42:18"
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    what = Column(String(128), nullable=False)            # Action name or decision
    case_id = Column(String(64), nullable=False, index=True)
    why = Column(Text, nullable=False)                    # AI reasoning
    policy = Column(Text, nullable=False)                 # Policy check result
    outcome = Column(String(128), nullable=False)         # Result
    recovered = Column(Float, default=0.0)
    decision_context = Column(JSON, nullable=True)
