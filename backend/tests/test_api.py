"""
Integration tests for FastAPI REST Endpoints
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import Base, engine


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield


def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


def test_overview_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/overview")
        assert response.status_code == 200
        data = response.json()
        assert "revenue_recovered" in data
        assert "revenue_at_risk" in data
        assert "trend_data" in data


def test_cases_list_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/cases")
        assert response.status_code == 200
        cases = response.json()
        assert isinstance(cases, list)


def test_policies_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/policies")
        assert response.status_code == 200
        policies = response.json()
        assert "max_automated_retries" in policies
        assert "high_value_threshold" in policies


def test_audit_logs_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/audit")
        assert response.status_code == 200
        audits = response.json()
        assert isinstance(audits, list)


def test_ml_info_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/ml/info")
        assert response.status_code == 200
        info = response.json()
        assert "model_type" in info
