from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class SimulationRequest(BaseModel):
    num_transactions: int = 10000
    include_systemic_outage: bool = True
    reset_existing: bool = True


class SimulationProgress(BaseModel):
    step: int
    total_steps: int
    label: str
    count: int
    revenue_recovered: float
    is_complete: bool


class SimulationSummary(BaseModel):
    total_transactions: int
    at_risk_cases: int
    recoverable_cases: int
    recovery_actions_taken: int
    human_escalations: int
    stopped_cases: int
    total_revenue_recovered: float
    incremental_revenue_lift: float
    systemic_contacts_avoided: int
