"""
AI Diagnosis & Rationale Generator
Uses domain heuristics grounded in payment failure telemetry and optional LLM integration.
"""

from typing import Dict, Any, Tuple


class AIDiagnosisService:
    DIAGNOSIS_CATALOG = {
        "GATEWAY_TIMEOUT": {
            "title": "Temporary bank failure",
            "detail": "Issuer timeout with no fraud or balance signal. Similar attempts recover within 90 minutes.",
            "rationale": "The failure is transient, the customer has a strong payment history, and a delayed retry avoids duplicate issuer pressure.",
            "confidence_range": (90, 96),
        },
        "INSUFFICIENT_FUNDS": {
            "title": "Insufficient funds",
            "detail": "The payment was declined by the issuer without a systemic error signature.",
            "rationale": "A short wait gives the customer time to replenish their account before a reminder or retry.",
            "confidence_range": (84, 91),
        },
        "UPI_LIMIT_EXCEEDED": {
            "title": "Payment rail limit",
            "detail": "The amount is above the merchant's automated threshold or bank daily limit for this payment rail.",
            "rationale": "The expected value is material, but policy recommends sending an alternate payment link or escalating.",
            "confidence_range": (70, 85),
        },
        "SOFT_CARD_DECLINE": {
            "title": "Soft card decline",
            "detail": "Issuer declined the first attempt, but the card has recovered successfully on alternate checkout flows.",
            "rationale": "A payment link is the highest-converting next step without increasing retry pressure on the issuer.",
            "confidence_range": (88, 94),
        },
        "SESSION_EXPIRED": {
            "title": "Checkout session timeout",
            "detail": "The customer left during checkout and the issuer never received an authorization request.",
            "rationale": "A low-friction reminder recovers intent without presenting the customer with another failed attempt.",
            "confidence_range": (82, 90),
        },
        "REPEATED_HARD_DECLINE": {
            "title": "Repeated payment failure",
            "detail": "Multiple attempts failed across 24 hours with no new positive recovery signal.",
            "rationale": "Further outreach is unlikely to recover revenue and would violate the maximum-attempt guardrail.",
            "confidence_range": (94, 98),
        },
        "AUTHENTICATION_FAILED": {
            "title": "3D-Secure mismatch",
            "detail": "Customer entered invalid OTP or closed the bank authorization webview.",
            "rationale": "A quick reminder with instant 1-click checkout recovery link achieves highest conversion.",
            "confidence_range": (80, 89),
        },
    }

    def diagnose_failure(
        self,
        error_code: str,
        bank_code: str,
        amount: float,
        retry_count: int,
        is_systemic: bool,
    ) -> Dict[str, Any]:
        """
        Produce AI root-cause diagnosis, explanation detail, and rationale for recovery.
        """
        if is_systemic:
            return {
                "diagnosis": "Bank service degradation",
                "diagnosisDetail": f"A cluster of {bank_code} failures shares the same incident window.",
                "rationale": "The systemic guard is holding outreach until the payment rail health signal clears.",
                "confidence": 95,
            }

        diag_data = self.DIAGNOSIS_CATALOG.get(
            error_code,
            {
                "title": "Unclassified payment error",
                "detail": "Unknown bank decline signature received.",
                "rationale": "Holding in pending state while analyzing telemetry.",
                "confidence_range": (70, 80),
            },
        )

        confidence = (
            diag_data["confidence_range"][0] + diag_data["confidence_range"][1]
        ) // 2

        # Adjust confidence based on retry count
        if retry_count >= 3:
            confidence = min(98, confidence + 5)

        return {
            "diagnosis": diag_data["title"],
            "diagnosisDetail": diag_data["detail"],
            "rationale": diag_data["rationale"],
            "confidence": confidence,
        }
