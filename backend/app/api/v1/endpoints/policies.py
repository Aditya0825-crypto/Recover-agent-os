from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.policy import PolicyConfig
from backend.app.schemas.policy import PolicyConfigSchema, PolicyUpdateSchema

router = APIRouter()


@router.get("", response_model=PolicyConfigSchema)
def get_policies(db: Session = Depends(get_db)):
    policy = db.query(PolicyConfig).first()
    if not policy:
        policy = PolicyConfig()
        db.add(policy)
        db.commit()
        db.refresh(policy)

    return PolicyConfigSchema(
        max_automated_retries=policy.max_automated_retries,
        max_customer_reminders=policy.max_customer_reminders,
        high_value_threshold=policy.high_value_threshold,
        stop_after_repeated_failures=policy.stop_after_repeated_failures,
        stop_after_successful_payment=policy.stop_after_successful_payment,
        pause_during_systemic_failure=policy.pause_during_systemic_failure,
        human_review_low_confidence=policy.human_review_low_confidence,
        confidence_threshold=policy.confidence_threshold,
        allowed_actions=policy.allowed_actions or ["Wait", "Retry", "Payment Link", "Reminder", "Human Review", "Stop"],
    )


@router.put("", response_model=PolicyConfigSchema)
def update_policies(update_data: PolicyUpdateSchema, db: Session = Depends(get_db)):
    policy = db.query(PolicyConfig).first()
    if not policy:
        policy = PolicyConfig()
        db.add(policy)

    for field, val in update_data.dict(exclude_unset=True).items():
        setattr(policy, field, val)

    db.commit()
    db.refresh(policy)

    return PolicyConfigSchema(
        max_automated_retries=policy.max_automated_retries,
        max_customer_reminders=policy.max_customer_reminders,
        high_value_threshold=policy.high_value_threshold,
        stop_after_repeated_failures=policy.stop_after_repeated_failures,
        stop_after_successful_payment=policy.stop_after_successful_payment,
        pause_during_systemic_failure=policy.pause_during_systemic_failure,
        human_review_low_confidence=policy.human_review_low_confidence,
        confidence_threshold=policy.confidence_threshold,
        allowed_actions=policy.allowed_actions or ["Wait", "Retry", "Payment Link", "Reminder", "Human Review", "Stop"],
    )
