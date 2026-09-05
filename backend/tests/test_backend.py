"""
Unit tests for RecoveryOS Deterministic Policy Engine and API endpoints
"""

import pytest
from backend.app.models.policy import PolicyConfig
from backend.app.services.policy_engine import PolicyEngine
from backend.app.services.ai_diagnosis import AIDiagnosisService
from backend.app.services.ml_service import ml_service


def test_policy_engine_max_retries():
    policy = PolicyConfig(max_automated_retries=2, stop_after_repeated_failures=True)
    engine = PolicyEngine(policy)

    # First retry should be allowed
    action, checks, reason = engine.evaluate_action(
        proposed_action="RETRY",
        amount=1500.0,
        retry_count=1,
        confidence_score=90.0,
        is_systemic_outage=False,
        failure_reason="Temporary bank failure",
    )
    assert action == "Retry"
    assert checks["retry_limit_not_exceeded"] is True

    # 3rd retry should trigger Stop
    action, checks, reason = engine.evaluate_action(
        proposed_action="RETRY",
        amount=1500.0,
        retry_count=3,
        confidence_score=90.0,
        is_systemic_outage=False,
        failure_reason="Temporary bank failure",
    )
    assert action == "Stop"
    assert checks["retry_limit_not_exceeded"] is False


def test_policy_engine_high_value_threshold():
    policy = PolicyConfig(high_value_threshold=50000.0)
    engine = PolicyEngine(policy)

    # 99,000 INR transaction should escalate to Human Review
    action, checks, reason = engine.evaluate_action(
        proposed_action="RETRY",
        amount=99000.0,
        retry_count=0,
        confidence_score=90.0,
        is_systemic_outage=False,
        failure_reason="UPI limit exceeded",
    )
    assert action == "Human Review"
    assert checks["amount_within_threshold"] is False


def test_policy_engine_systemic_failure_pause():
    policy = PolicyConfig(pause_during_systemic_failure=True)
    engine = PolicyEngine(policy)

    # Systemic outage should force Wait to avoid spamming customers
    action, checks, reason = engine.evaluate_action(
        proposed_action="RETRY",
        amount=2500.0,
        retry_count=0,
        confidence_score=95.0,
        is_systemic_outage=True,
        failure_reason="Temporary bank failure",
    )
    assert action == "Wait"
    assert checks["no_systemic_issue"] is False


def test_ai_diagnosis():
    service = AIDiagnosisService()
    res = service.diagnose_failure("GATEWAY_TIMEOUT", "HDFC", 24999.0, 0, False)
    assert res["diagnosis"] == "Temporary bank failure"
    assert res["confidence"] >= 90


def test_ml_prediction_and_shap():
    feature_dict = {
        "bank_code": "HDFC",
        "payment_method": "Credit Card",
        "error_code": "GATEWAY_TIMEOUT",
        "error_category": "TRANSIENT_SYSTEM",
        "amount": 24999.0,
        "retry_count": 1,
        "customer_past_txns": 12,
        "customer_past_recovery_rate": 0.85,
        "is_systemic_outage": 0,
    }
    pred = ml_service.predict_recovery(feature_dict)
    assert "probability" in pred
    assert "expected" in pred
    assert pred["probability"] > 0
    assert len(pred["top_shap_factors"]) > 0
