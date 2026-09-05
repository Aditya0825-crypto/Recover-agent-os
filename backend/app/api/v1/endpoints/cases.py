from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models.recovery_case import RecoveryCase
from backend.app.schemas.case import RecoveryCaseResponse, CaseActionRequest
from backend.app.models.audit_log import AuditLog
from datetime import datetime

router = APIRouter()


@router.get("", response_model=List[RecoveryCaseResponse])
def list_cases(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(RecoveryCase)

    if status and status != "All":
        query = query.filter(RecoveryCase.status == status)

    if priority and priority != "All":
        query = query.filter(RecoveryCase.priority == priority)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (RecoveryCase.id.ilike(search_pattern))
            | (RecoveryCase.customer.ilike(search_pattern))
            | (RecoveryCase.reason.ilike(search_pattern))
        )

    # Order by expected recovery descending
    cases = query.order_by(RecoveryCase.expected.desc()).limit(limit).all()

    # Convert to response schema
    results = []
    for c in cases:
        results.append(
            RecoveryCaseResponse(
                id=c.id,
                customer=c.customer,
                email=c.email,
                amount=c.amount,
                reason=c.reason,
                probability=c.probability,
                expected=c.expected,
                action=c.action,
                priority=c.priority,
                status=c.status,
                lastAction=c.last_action,
                created=c.created,
                method=c.method,
                retryCount=c.retry_count,
                confidence=c.confidence,
                diagnosis=c.diagnosis,
                diagnosisDetail=c.diagnosis_detail or "",
                rationale=c.rationale or "",
                recoveredAmount=c.recovered_amount,
                shap_factors=c.shap_factors,
                policy_checks=c.policy_checks,
            )
        )
    return results


@router.get("/{case_id}", response_model=RecoveryCaseResponse)
def get_case_detail(case_id: str, db: Session = Depends(get_db)):
    c = db.query(RecoveryCase).filter(RecoveryCase.id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    return RecoveryCaseResponse(
        id=c.id,
        customer=c.customer,
        email=c.email,
        amount=c.amount,
        reason=c.reason,
        probability=c.probability,
        expected=c.expected,
        action=c.action,
        priority=c.priority,
        status=c.status,
        lastAction=c.last_action,
        created=c.created,
        method=c.method,
        retryCount=c.retry_count,
        confidence=c.confidence,
        diagnosis=c.diagnosis,
        diagnosisDetail=c.diagnosis_detail or "",
        rationale=c.rationale or "",
        recoveredAmount=c.recovered_amount,
        shap_factors=c.shap_factors,
        policy_checks=c.policy_checks,
    )


@router.post("/{case_id}/action")
def execute_case_action(
    case_id: str,
    action_req: CaseActionRequest,
    db: Session = Depends(get_db),
):
    c = db.query(RecoveryCase).filter(RecoveryCase.id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    # Update case status based on action
    if "Approve" in action_req.action or "Retry" in action_req.action:
        c.status = "Recovered"
        c.last_action = "Manual retry successful"
        c.recovered_amount = c.amount
    elif "Stop" in action_req.action:
        c.status = "Stopped"
        c.last_action = "Outreach stopped manually"
    else:
        c.last_action = f"Executed {action_req.action}"

    # Log to audit trail
    audit_id = f"AUD-{int(datetime.utcnow().timestamp())}"
    audit = AuditLog(
        id=audit_id,
        time=datetime.utcnow().strftime("%H:%M:%S"),
        what=f"Manual action: {action_req.action}",
        case_id=c.id,
        why=action_req.notes or "Manual operator intervention",
        policy="Operator override authorized",
        outcome=c.last_action,
        recovered=c.recovered_amount or 0.0,
    )
    db.add(audit)
    db.commit()
    db.refresh(c)

    return {"status": "success", "case_id": c.id, "current_status": c.status, "last_action": c.last_action}
