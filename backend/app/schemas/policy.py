from pydantic import BaseModel
from typing import List, Optional


class PolicyConfigSchema(BaseModel):
    max_automated_retries: int = 2
    max_customer_reminders: int = 2
    high_value_threshold: float = 50000.0
    stop_after_repeated_failures: bool = True
    stop_after_successful_payment: bool = True
    pause_during_systemic_failure: bool = True
    human_review_low_confidence: bool = True
    confidence_threshold: int = 75
    allowed_actions: List[str] = ["Wait", "Retry", "Payment Link", "Reminder", "Human Review", "Stop"]


class PolicyUpdateSchema(BaseModel):
    max_automated_retries: Optional[int] = None
    max_customer_reminders: Optional[int] = None
    high_value_threshold: Optional[float] = None
    stop_after_repeated_failures: Optional[bool] = None
    stop_after_successful_payment: Optional[bool] = None
    pause_during_systemic_failure: Optional[bool] = None
    human_review_low_confidence: Optional[bool] = None
    confidence_threshold: Optional[int] = None
