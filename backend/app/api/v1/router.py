from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    overview,
    cases,
    activity,
    analytics,
    policies,
    audit,
    simulation,
    ml,
)

api_router = APIRouter()

api_router.include_router(overview.router, prefix="/overview", tags=["Overview"])
api_router.include_router(cases.router, prefix="/cases", tags=["Cases"])
api_router.include_router(activity.router, prefix="/activity", tags=["Activity"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(policies.router, prefix="/policies", tags=["Policies"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["Simulation"])
api_router.include_router(ml.router, prefix="/ml", tags=["ML"])
