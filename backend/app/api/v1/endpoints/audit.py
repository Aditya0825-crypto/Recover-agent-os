from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models.audit_log import AuditLog
from backend.app.schemas.audit import AuditEventSchema

router = APIRouter()


@router.get("", response_model=List[AuditEventSchema])
def list_audit_logs(
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (AuditLog.id.ilike(search_pattern))
            | (AuditLog.case_id.ilike(search_pattern))
            | (AuditLog.what.ilike(search_pattern))
            | (AuditLog.why.ilike(search_pattern))
        )

    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

    results = []
    for l in logs:
        results.append(
            AuditEventSchema(
                id=l.id,
                time=l.time,
                what=l.what,
                caseId=l.case_id,
                why=l.why,
                policy=l.policy,
                outcome=l.outcome,
                recovered=l.recovered,
                decision_context=l.decision_context,
            )
        )
    return results
