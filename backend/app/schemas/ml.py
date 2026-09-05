from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class MLPredictRequest(BaseModel):
    bank_code: str
    payment_method: str
    error_code: str
    error_category: str
    amount: float
    retry_count: int = 0
    customer_past_txns: int = 5
    customer_past_recovery_rate: float = 0.75
    is_systemic_outage: int = 0


class SHAPFactor(BaseModel):
    feature: str
    raw_feature: str
    shap_value: float
    impact: str
    magnitude: float


class MLPredictResponse(BaseModel):
    recovery_probability: float
    expected_recovery: float
    confidence_score: float
    recommended_action: str
    top_shap_factors: List[SHAPFactor]
