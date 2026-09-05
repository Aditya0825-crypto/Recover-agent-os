from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, Text, JSON
from datetime import datetime
from backend.app.core.database import Base


class RecoveryCase(Base):
    __tablename__ = "recovery_cases"

    id = Column(String(64), primary_key=True, index=True) # e.g. RC-20418
    transaction_id = Column(String(64), index=True)
    customer = Column(String(128), nullable=False)
    email = Column(String(128), nullable=False)
    amount = Column(Float, nullable=False)
    reason = Column(String(128), nullable=False)
    
    probability = Column(Integer, nullable=False)  # 0 to 100
    expected = Column(Float, nullable=False)       # Amount * (prob / 100)
    action = Column(String(32), nullable=False)     # Wait, Retry, Payment Link, Reminder, Human Review, Stop
    priority = Column(String(16), nullable=False)   # High, Medium, Low
    status = Column(String(32), nullable=False, index=True) # Recovered, Pending, Human Review, Recoverable, Stopped
    
    last_action = Column(String(128), nullable=False)
    created = Column(String(64), nullable=False)    # e.g. "9 min ago" or formatted date
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    method = Column(String(128), nullable=False)
    retry_count = Column(Integer, default=0)
    confidence = Column(Integer, default=90)
    diagnosis = Column(String(128), nullable=False)
    diagnosis_detail = Column(Text, nullable=True)
    rationale = Column(Text, nullable=True)
    recovered_amount = Column(Float, nullable=True)
    
    # SHAP Explanations and Policy Evaluation Results
    shap_factors = Column(JSON, nullable=True)
    policy_checks = Column(JSON, nullable=True)
    
    # Baseline comparison
    baseline_recovered = Column(Boolean, default=False)
    recoveryos_recovered = Column(Boolean, default=False)
