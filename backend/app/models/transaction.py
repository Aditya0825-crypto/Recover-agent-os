from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, Text
from datetime import datetime
from backend.app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(64), primary_key=True, index=True)
    merchant_id = Column(String(64), default="rzp_live_nimbus", index=True)
    customer_name = Column(String(128), nullable=False)
    customer_email = Column(String(128), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(8), default="INR")
    payment_method = Column(String(64), nullable=False)
    payment_subtype = Column(String(64), nullable=True)
    method_string = Column(String(128), nullable=False)
    bank_name = Column(String(64), nullable=False)
    bank_code = Column(String(16), nullable=False, index=True)
    
    error_code = Column(String(64), nullable=False, index=True)
    error_category = Column(String(64), nullable=False)
    failure_reason = Column(String(128), nullable=False)
    failure_description = Column(Text, nullable=True)
    
    retry_count = Column(Integer, default=0)
    customer_past_txns = Column(Integer, default=1)
    customer_past_recovery_rate = Column(Float, default=0.75)
    is_systemic_outage = Column(Boolean, default=False)
    
    status = Column(String(32), default="FAILED", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
