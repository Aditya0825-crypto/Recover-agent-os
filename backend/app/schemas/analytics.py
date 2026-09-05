from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class TrendPoint(BaseModel):
    day: str
    recovered: float
    baseline: float


class BreakdownItem(BaseModel):
    name: str
    value: float
    color: Optional[str] = None


class FailurePerformanceItem(BaseModel):
    label: str
    rate: str
    value: str
    tone: str


class OperatingHealth(BaseModel):
    recovery_rate: str
    recovery_rate_detail: str
    avg_time_to_recovery: str
    avg_time_detail: str
    human_escalation_rate: str
    escalation_detail: str
    stopped_cases: int
    stopped_detail: str


class AnalyticsOverviewResponse(BaseModel):
    revenue_recovered: float
    revenue_at_risk: float
    expected_recovery: float
    recovery_rate: str
    incremental_recovery: float
    trend_data: List[TrendPoint]
    failure_data: List[BreakdownItem]
    outcome_data: List[BreakdownItem]
    operating_health: OperatingHealth
    failure_performance: List[FailurePerformanceItem]
