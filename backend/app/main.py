from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.core.config import settings
from backend.app.core.database import Base, engine, SessionLocal
from backend.app.api.v1.router import api_router
from backend.app.models.recovery_case import RecoveryCase
from backend.app.services.simulation import SimulationService


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Ensure database tables exist
    Base.metadata.create_all(bind=engine)
    
    # 2. Check if DB has initial demonstration cases, if not, run quick seed
    db = SessionLocal()
    try:
        case_count = db.query(RecoveryCase).count()
        if case_count == 0:
            print("Database empty: Auto-seeding initial 1,000 synthetic transaction recovery cases...")
            sim = SimulationService(db)
            sim.run_simulation(num_transactions=1000, reset_existing=False)
            print("Initial recovery data successfully seeded!")
    except Exception as e:
        print(f"Startup initialization notice: {e}")
    finally:
        db.close()
        
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME, "version": settings.VERSION}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
