from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.services.analytics import AnalyticsService
from backend.app.schemas.analytics import AnalyticsOverviewResponse

router = APIRouter()


@router.get("", response_model=AnalyticsOverviewResponse)
def get_analytics(db: Session = Depends(get_db)):
    service = AnalyticsService(db)
    return service.get_overview_metrics()
