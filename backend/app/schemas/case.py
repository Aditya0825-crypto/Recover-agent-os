from pydantic import BaseModel
from typing import Optional, List, Any, Dict


class RecoveryCaseBase(BaseModel):
    id: str
    customer: str
    email: str
    amount: float
    reason: str
    probability: int
    expected: float
    action: str  # "Wait" | "Retry" | "Payment Link" | "Reminder" | "Human Review" | "Stop"
    priority: str  # "High" | "Medium" | "Low"
    status: str  # "Recovered" | "Pending" | "Human Review" | "Recoverable" | "Stopped"
    lastAction: str
    created: str
    method: str
    retryCount: int
    confidence: int
    diagnosis: str
    diagnosisDetail: str
    rationale: str
    recoveredAmount: Optional[float] = None
    shap_factors: Optional[List[Dict[str, Any]]] = None
    policy_checks: Optional[Dict[str, bool]] = None


class RecoveryCaseResponse(RecoveryCaseBase):
    pass


class CaseActionRequest(BaseModel):
    action: str  # e.g. "Approve Retry", "Send Link", "Stop", "Escalate"
    notes: Optional[str] = None
