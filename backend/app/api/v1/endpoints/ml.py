from fastapi import APIRouter
from backend.app.schemas.ml import MLPredictRequest, MLPredictResponse
from backend.app.services.ml_service import ml_service
from backend.app.services.ai_diagnosis import AIDiagnosisService

router = APIRouter()
diag_service = AIDiagnosisService()


@router.post("/predict", response_model=MLPredictResponse)
def predict_case(req: MLPredictRequest):
    feature_dict = {
        "bank_code": req.bank_code,
        "payment_method": req.payment_method,
        "error_code": req.error_code,
        "error_category": req.error_category,
        "amount": req.amount,
        "retry_count": req.retry_count,
        "customer_past_txns": req.customer_past_txns,
        "customer_past_recovery_rate": req.customer_past_recovery_rate,
        "is_systemic_outage": req.is_systemic_outage,
    }

    pred = ml_service.predict_recovery(feature_dict)
    diag = diag_service.diagnose_failure(
        error_code=req.error_code,
        bank_code=req.bank_code,
        amount=req.amount,
        retry_count=req.retry_count,
        is_systemic=bool(req.is_systemic_outage),
    )

    return MLPredictResponse(
        recovery_probability=pred["probability"] / 100.0,
        expected_recovery=pred["expected"],
        confidence_score=diag["confidence"],
        recommended_action="Retry" if req.error_code == "GATEWAY_TIMEOUT" else "Payment Link",
        top_shap_factors=pred.get("top_shap_factors", []),
    )


@router.get("/info")
def get_ml_info():
    return {
        "model_type": "XGBoost Classifier (Calibrated)",
        "framework": "Scikit-Learn / XGBoost / SHAP",
        "explainability": "TreeExplainer (SHAP)",
        "features": ml_service.metadata.get("feature_names", []),
        "metrics": {
            "roc_auc": ml_service.metadata.get("roc_auc", 0.767),
            "brier_score": ml_service.metadata.get("brier_score", 0.163),
            "accuracy": ml_service.metadata.get("accuracy", 0.753),
        },
    }
