"""
Deterministic Python Policy Engine
Evaluates merchant policies and guardrails to authorize or override AI actions.
Actions bounded to: WAIT, RETRY, PAYMENT_LINK, REMINDER, HUMAN_REVIEW, STOP.
"""

from typing import Dict, Any, Tuple
from backend.app.models.policy import PolicyConfig


class PolicyEngine:
    ALLOWED_ACTIONS = {"Wait", "Retry", "Payment Link", "Reminder", "Human Review", "Stop"}

    def __init__(self, policy: PolicyConfig = None):
        self.policy = policy or PolicyConfig()

    def evaluate_action(
        self,
        proposed_action: str,
        amount: float,
        retry_count: int,
        confidence_score: float,
        is_systemic_outage: bool,
        failure_reason: str,
    ) -> Tuple[str, Dict[str, bool], str]:
        """
        Evaluates proposed AI action against deterministic merchant guardrails.
        Returns:
            (authorized_action, policy_checks_dict, audit_policy_reason)
        """
        # Safe attribute fallbacks
        max_retries = getattr(self.policy, "max_automated_retries", 2)
        if max_retries is None:
            max_retries = 2

        high_val_thresh = getattr(self.policy, "high_value_threshold", 50000.0)
        if high_val_thresh is None:
            high_val_thresh = 50000.0

        conf_thresh = getattr(self.policy, "confidence_threshold", 75)
        if conf_thresh is None:
            conf_thresh = 75

        pause_systemic = getattr(self.policy, "pause_during_systemic_failure", True)
        if pause_systemic is None:
            pause_systemic = True

        stop_repeated = getattr(self.policy, "stop_after_repeated_failures", True)
        if stop_repeated is None:
            stop_repeated = True

        review_low_conf = getattr(self.policy, "human_review_low_confidence", True)
        if review_low_conf is None:
            review_low_conf = True

        allowed_actions = getattr(self.policy, "allowed_actions", None) or self.ALLOWED_ACTIONS

        # Normalize proposed action
        canonical_action = self._canonicalize_action(proposed_action)

        # Initialize checklist
        checks = {
            "retry_limit_not_exceeded": True,
            "customer_eligible": True,
            "amount_within_threshold": True,
            "no_systemic_issue": True,
            "confidence_acceptable": True,
            "action_permitted": True,
        }

        reasons = []

        # 1. Systemic Issue Protection Guardrail
        if is_systemic_outage and pause_systemic:
            checks["no_systemic_issue"] = False
            reasons.append("Active systemic rail degradation detected; customer outreach held")
            return "Wait", checks, "Systemic failure protection enabled; outreach paused"

        # 2. Maximum Retry Limit Guardrail
        if canonical_action == "Retry":
            if retry_count >= max_retries:
                checks["retry_limit_not_exceeded"] = False
                reasons.append(f"Max retries ({max_retries}) exceeded")
                if stop_repeated:
                    return "Stop", checks, f"Retry limit exceeded ({retry_count} of {max_retries}); case stopped"
                else:
                    return "Human Review", checks, "Retry limit reached; escalated for manual approval"

        # 3. Repeated Failure / Customer Eligibility Guardrail
        if retry_count >= 3:
            checks["customer_eligible"] = False
            if stop_repeated:
                return "Stop", checks, "Customer exceeded 3 failed attempts; outreach stopped to prevent customer fatigue"

        # 4. High-Value Payment Threshold Guardrail
        if amount >= high_val_thresh:
            checks["amount_within_threshold"] = False
            if canonical_action not in ["Human Review", "Stop"]:
                reasons.append(f"Amount ₹{amount:,.0f} exceeds auto threshold ₹{high_val_thresh:,.0f}")
                return "Human Review", checks, f"High-value payment (₹{amount:,.0f} >= ₹{high_val_thresh:,.0f}) requires human authorization"

        # 5. Low Confidence Check Guardrail
        if review_low_conf and confidence_score < conf_thresh:
            checks["confidence_acceptable"] = False
            if canonical_action not in ["Human Review", "Stop"]:
                return "Human Review", checks, f"AI confidence ({confidence_score}%) below threshold ({conf_thresh}%); requires review"

        # 6. Action Permission Verification
        allowed_set = set(allowed_actions)
        if canonical_action not in allowed_set:
            checks["action_permitted"] = False
            return "Human Review", checks, f"Action '{canonical_action}' disabled in merchant settings; routed for review"

        policy_summary = "All merchant policy guardrails passed"
        return canonical_action, checks, policy_summary

    def _canonicalize_action(self, action_str: str) -> str:
        act = action_str.strip().upper().replace(" ", "_")
        mapping = {
            "WAIT": "Wait",
            "RETRY": "Retry",
            "PAYMENT_LINK": "Payment Link",
            "REMINDER": "Reminder",
            "HUMAN_REVIEW": "Human Review",
            "STOP": "Stop",
        }
        return mapping.get(act, "Wait")
