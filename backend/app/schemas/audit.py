from pydantic import BaseModel
from typing import Optional, Dict, Any


class AuditEventSchema(BaseModel):
    id: str
    time: str
    what: str
    caseId: str
    why: str
    policy: str
    outcome: str
    recovered: float
    decision_context: Optional[Dict[str, Any]] = None
