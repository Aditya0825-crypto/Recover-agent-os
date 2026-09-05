from sqlalchemy import Column, String, Float, Integer, Boolean, JSON
from backend.app.core.database import Base


class PolicyConfig(Base):
    __tablename__ = "policy_configs"

    id = Column(String(64), primary_key=True, default="default_merchant_policy")
    max_automated_retries = Column(Integer, default=2)
    max_customer_reminders = Column(Integer, default=2)
    high_value_threshold = Column(Float, default=50000.0)
    stop_after_repeated_failures = Column(Boolean, default=True)
    stop_after_successful_payment = Column(Boolean, default=True)
    pause_during_systemic_failure = Column(Boolean, default=True)
    human_review_low_confidence = Column(Boolean, default=True)
    confidence_threshold = Column(Integer, default=75)
    
    # Allowed actions
    allowed_actions = Column(JSON, default=lambda: ["Wait", "Retry", "Payment Link", "Reminder", "Human Review", "Stop"])
