"""
Celery Background Tasks for RecoveryOS
"""

from backend.app.core.celery_app import celery_app
from backend.app.core.database import SessionLocal
from backend.app.services.simulation import SimulationService


@celery_app.task(name="tasks.run_background_simulation")
def run_background_simulation(num_transactions: int = 10000, reset_existing: bool = True):
    db = SessionLocal()
    try:
        service = SimulationService(db)
        result = service.run_simulation(
            num_transactions=num_transactions,
            reset_existing=reset_existing,
        )
        return result
    finally:
        db.close()
