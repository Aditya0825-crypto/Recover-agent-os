from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.services.simulation import SimulationService
from backend.app.schemas.simulation import SimulationRequest, SimulationSummary

router = APIRouter()


@router.post("/run", response_model=SimulationSummary)
def run_simulation_pipeline(
    req: SimulationRequest = SimulationRequest(),
    db: Session = Depends(get_db),
):
    sim_service = SimulationService(db)
    summary = sim_service.run_simulation(
        num_transactions=req.num_transactions,
        reset_existing=req.reset_existing,
    )
    return summary
