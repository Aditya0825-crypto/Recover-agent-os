"""
Synthetic Razorpay-like Transaction Generator
Generates 10,000+ realistic payment failure and recovery records.
"""

import random
import uuid
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# Seed for reproducibility
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

BANKS = [
    {"name": "HDFC Bank", "code": "HDFC", "failure_weight": 0.30},
    {"name": "ICICI Bank", "code": "ICICI", "failure_weight": 0.22},
    {"name": "State Bank of India", "code": "SBI", "failure_weight": 0.20},
    {"name": "Axis Bank", "code": "AXIS", "failure_weight": 0.16},
    {"name": "Kotak Mahindra Bank", "code": "KOTAK", "failure_weight": 0.12},
]

PAYMENT_METHODS = [
    {"type": "UPI", "subtypes": ["Google Pay", "PhonePe", "Paytm UPI", "BHIM"], "weight": 0.55},
    {"type": "Credit Card", "subtypes": ["Visa", "Mastercard", "RuPay"], "weight": 0.25},
    {"type": "Debit Card", "subtypes": ["Visa", "Mastercard", "RuPay"], "weight": 0.12},
    {"type": "NetBanking", "subtypes": ["Corporate NetBanking", "Retail NetBanking"], "weight": 0.08},
]

ERROR_TAXONOMY = {
    "GATEWAY_TIMEOUT": {
        "reason": "Temporary bank failure",
        "description": "Issuer timeout with no fraud or balance signal. Transient network latency at bank switch.",
        "base_recoverability": 0.88,
        "recommended_action": "RETRY",
        "category": "TRANSIENT_SYSTEM",
    },
    "INSUFFICIENT_FUNDS": {
        "reason": "Insufficient funds",
        "description": "Payment declined due to inadequate account balance. Customer needs window to replenish.",
        "base_recoverability": 0.65,
        "recommended_action": "WAIT",
        "category": "CUSTOMER_ACCOUNT",
    },
    "UPI_LIMIT_EXCEEDED": {
        "reason": "UPI limit exceeded",
        "description": "Payment amount exceeds daily or per-transaction UPI rail limit set by NPCI/bank.",
        "base_recoverability": 0.58,
        "recommended_action": "PAYMENT_LINK",
        "category": "RAIL_LIMIT",
    },
    "SOFT_CARD_DECLINE": {
        "reason": "Card declined",
        "description": "Soft issuer decline (risk check or temporary velocity limit). Alternative checkout flow succeeds.",
        "base_recoverability": 0.78,
        "recommended_action": "PAYMENT_LINK",
        "category": "CARD_ISSUER",
    },
    "SESSION_EXPIRED": {
        "reason": "Session timeout",
        "description": "Customer dropped off checkout screen before completing 2FA / OTP step.",
        "base_recoverability": 0.82,
        "recommended_action": "REMINDER",
        "category": "CUSTOMER_FRICTION",
    },
    "REPEATED_HARD_DECLINE": {
        "reason": "Repeated failure",
        "description": "Multiple sequential authorization attempts failed across 24h with zero positive recovery signal.",
        "base_recoverability": 0.15,
        "recommended_action": "STOP",
        "category": "TERMINAL_FAILURE",
    },
    "AUTHENTICATION_FAILED": {
        "reason": "Authentication failed",
        "description": "Incorrect OTP or 3D-Secure authentication mismatch.",
        "base_recoverability": 0.72,
        "recommended_action": "REMINDER",
        "category": "CUSTOMER_FRICTION",
    },
}

FIRST_NAMES = ["Asha", "Kabir", "Meera", "Devan", "Ravi", "Nikhil", "Sana", "Pooja", "Vikram", "Ananya", "Rahul", "Priya", "Arjun", "Neha", "Rohit", "Sneha", "Karan", "Divya", "Siddharth", "Ritu"]
LAST_NAMES = ["Verma", "Malhotra", "Nair", "Iyer", "Chandran", "Rao", "Khan", "Sharma", "Mehta", "Patel", "Gupta", "Deshmukh", "Choudhury", "Bose", "Reddy", "Kulkarni", "Joshi", "Bhat", "Menon", "Singh"]


def generate_synthetic_transactions(num_records: int = 12000) -> pd.DataFrame:
    """Generate 10k+ synthetic Razorpay transactions with realistic distributions."""
    records = []
    base_time = datetime.now() - timedelta(days=30)
    
    # Pre-define a systemic outage period on HDFC
    systemic_start = base_time + timedelta(days=22, hours=14, minutes=10)
    systemic_end = systemic_start + timedelta(minutes=45)

    for i in range(num_records):
        txn_id = f"txn_{uuid.uuid4().hex[:12]}"
        case_id = f"RC-{10000 + i}"
        
        # Customer details
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        customer_name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()[:1]}@acme.in"
        
        # Payment Method
        method_obj = random.choices(PAYMENT_METHODS, weights=[m["weight"] for m in PAYMENT_METHODS])[0]
        method_type = method_obj["type"]
        subtype = random.choice(method_obj["subtypes"])
        
        # Bank
        bank_obj = random.choices(BANKS, weights=[b["failure_weight"] for b in BANKS])[0]
        bank_name = bank_obj["name"]
        bank_code = bank_obj["code"]
        
        # Method string representation
        card_last4 = f"{random.randint(1000, 9999)}"
        if "Card" in method_type:
            method_str = f"{bank_code} · {subtype} •••• {card_last4}"
        elif method_type == "UPI":
            method_str = f"{bank_code} · UPI ({subtype})"
        else:
            method_str = f"{bank_code} · NetBanking"
            
        # Timestamp
        offset_seconds = random.randint(0, 30 * 86400)
        timestamp = base_time + timedelta(seconds=offset_seconds)
        
        # Check if during systemic outage window
        is_systemic = False
        if bank_code == "HDFC" and systemic_start <= timestamp <= systemic_end:
            is_systemic = True
            error_key = "GATEWAY_TIMEOUT"
        else:
            # Error distribution
            error_keys = list(ERROR_TAXONOMY.keys())
            error_weights = [0.28, 0.22, 0.12, 0.18, 0.10, 0.05, 0.05]
            error_key = random.choices(error_keys, weights=error_weights)[0]
            
        error_info = ERROR_TAXONOMY[error_key]
        
        # Transaction Amount (Realistic INR distribution)
        if error_key == "UPI_LIMIT_EXCEEDED":
            amount = round(random.uniform(50000, 125000), -2)
        elif method_type == "Credit Card":
            amount = round(random.choice([2499, 4999, 8450, 12999, 24999, 39999, 49990, 85000]), 2)
        elif method_type == "UPI":
            amount = round(random.choice([499, 999, 1249, 2499, 4320, 6799, 14999, 24999]), 2)
        else:
            amount = round(random.uniform(1500, 45000), -1)
            
        # Retry count before RecoveryOS intervened
        if error_key == "REPEATED_HARD_DECLINE":
            retry_count = random.choice([3, 4])
        else:
            retry_count = random.choices([0, 1, 2], weights=[0.60, 0.30, 0.10])[0]
            
        # Customer historical lifetime value & recovery rate
        customer_past_txns = random.randint(1, 25)
        customer_past_recovery_rate = np.clip(random.gauss(0.75, 0.15), 0.1, 1.0)
        
        # Calculate ground truth recovery probability with realistic signal dependencies
        base_p = error_info["base_recoverability"]
        
        # Factors influencing recovery probability
        # 1. Bank reliability adjustments
        bank_mod = 0.05 if bank_code in ["HDFC", "ICICI"] else (-0.04 if bank_code == "SBI" else 0.0)
        # 2. Amount friction (higher amounts are slightly harder unless high customer LTV)
        amount_mod = -0.10 if amount > 50000 else (0.05 if amount < 3000 else 0.0)
        # 3. Retry penalty
        retry_mod = -0.15 * retry_count
        # 4. Customer history boost
        cust_mod = (customer_past_recovery_rate - 0.5) * 0.2
        # 5. Systemic outage factor
        systemic_mod = -0.35 if is_systemic else 0.0
        
        # Combined probability
        recovery_prob = np.clip(base_p + bank_mod + amount_mod + retry_mod + cust_mod + systemic_mod, 0.05, 0.98)
        confidence = np.clip(random.gauss(88, 6), 65, 99)
        
        # Recovery outcome simulation (ground truth whether payment recovered)
        # If RecoveryOS intelligent policy applied vs baseline naive retry:
        recovered_baseline = (random.random() < (recovery_prob * 0.55)) # Naive retry recovery rate ~41%
        recovered_recoveryos = (random.random() < recovery_prob)         # Intelligent action recovery rate ~68-75%
        
        # Best action according to AI
        if is_systemic:
            ai_action = "WAIT"
        elif retry_count >= 3 or error_key == "REPEATED_HARD_DECLINE":
            ai_action = "STOP"
        elif amount > 50000:
            ai_action = "HUMAN_REVIEW"
        elif error_key in ["GATEWAY_TIMEOUT"]:
            ai_action = "RETRY"
        elif error_key in ["SOFT_CARD_DECLINE", "UPI_LIMIT_EXCEEDED"]:
            ai_action = "PAYMENT_LINK"
        elif error_key in ["SESSION_EXPIRED", "AUTHENTICATION_FAILED"]:
            ai_action = "REMINDER"
        elif error_key == "INSUFFICIENT_FUNDS":
            ai_action = "WAIT"
        else:
            ai_action = "WAIT"
            
        # Priority mapping
        expected_recovery_val = round(amount * recovery_prob, 2)
        if expected_recovery_val > 15000 or recovery_prob > 0.80:
            priority = "High"
        elif expected_recovery_val > 3000 or recovery_prob > 0.50:
            priority = "Medium"
        else:
            priority = "Low"
            
        # Case Status
        if recovered_recoveryos:
            status = "Recovered"
            last_action = "Payment recovered"
            recovered_amount = amount
        elif ai_action == "STOP":
            status = "Stopped"
            last_action = "Outreach stopped"
            recovered_amount = 0.0
        elif ai_action == "HUMAN_REVIEW":
            status = "Human Review"
            last_action = "Escalated to finance"
            recovered_amount = 0.0
        elif ai_action in ["WAIT"]:
            status = "Pending"
            last_action = "Systemic guard applied" if is_systemic else "Waiting 90 minutes"
            recovered_amount = 0.0
        else:
            status = "Recoverable"
            last_action = f"{ai_action.replace('_', ' ').title()} generated"
            recovered_amount = 0.0

        records.append({
            "case_id": case_id,
            "transaction_id": txn_id,
            "customer_name": customer_name,
            "customer_email": email,
            "amount": amount,
            "bank_name": bank_name,
            "bank_code": bank_code,
            "payment_method": method_type,
            "payment_subtype": subtype,
            "method_string": method_str,
            "error_code": error_key,
            "error_category": error_info["category"],
            "failure_reason": error_info["reason"],
            "failure_description": error_info["description"],
            "retry_count": retry_count,
            "customer_past_txns": customer_past_txns,
            "customer_past_recovery_rate": round(customer_past_recovery_rate, 3),
            "is_systemic_outage": int(is_systemic),
            "timestamp": timestamp.isoformat(),
            "confidence_score": round(confidence, 1),
            "recovery_probability": round(recovery_prob, 4),
            "expected_recovery": expected_recovery_val,
            "ai_action": ai_action,
            "priority": priority,
            "status": status,
            "last_action": last_action,
            "recovered_amount": recovered_amount,
            "recovered_baseline": int(recovered_baseline),
            "recovered_recoveryos": int(recovered_recoveryos),
            "ground_truth_recovered": int(recovered_recoveryos),
        })

    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    df = generate_synthetic_transactions(12000)
    print(f"Generated {len(df)} transactions.")
    print("Class distribution (Recovered vs Not):")
    print(df["ground_truth_recovered"].value_counts(normalize=True))
    print("\nActions distribution:")
    print(df["ai_action"].value_counts())
