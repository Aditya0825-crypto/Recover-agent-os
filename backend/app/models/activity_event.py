from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime
from backend.app.core.database import Base


class ActivityEvent(Base):
    __tablename__ = "activity_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    label = Column(String(128), nullable=False) # e.g. "Payment recovered"
    detail = Column(String(256), nullable=False) # e.g. "RC-20418 · ₹24,999"
    tone = Column(String(32), default="brand")   # mint, brand, amber, sky, violet, rose
    case_id = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
