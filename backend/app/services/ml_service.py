"""
ML Inference Service for RecoveryOS
Loads serialized XGBoost model, ColumnTransformer, and SHAP explainer for live scoring.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List

from ml_pipeline.features import ALL_FEATURE_COLUMNS
from ml_pipeline.explainer import RecoveryExplainer

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "ml_pipeline", "models")


class MLInferenceService:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.explainer = None
        self.metadata = {}
        self._load()

    def _load(self):
        model_path = os.path.join(MODEL_DIR, "recovery_xgb_model.joblib")
        preprocessor_path = os.path.join(MODEL_DIR, "preprocessor.joblib")
        meta_path = os.path.join(MODEL_DIR, "model_metadata.json")

        if os.path.exists(model_path) and os.path.exists(preprocessor_path):
            self.model = joblib.load(model_path)
            self.preprocessor = joblib.load(preprocessor_path)
            if os.path.exists(meta_path):
                with open(meta_path, "r") as f:
                    self.metadata = json.load(f)
            
            self.explainer = RecoveryExplainer(
                model=self.model,
                preprocessor=self.preprocessor,
                feature_names=self.metadata.get("feature_names", []),
            )
            print(f"ML Service: Model and SHAP Explainer successfully loaded from {MODEL_DIR}")
        else:
            print(f"ML Service: Model artifacts not found at {MODEL_DIR}. Running with fallback scoring.")

    def predict_recovery(self, feature_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run inference for a single payment failure record.
        Returns probability (0.0 to 1.0), expected recovery value, and SHAP explanations.
        """
        df = pd.DataFrame([feature_dict])
        amount = float(feature_dict.get("amount", 0.0))

        if self.model is not None and self.preprocessor is not None:
            try:
                X_trans = self.preprocessor.transform(df[ALL_FEATURE_COLUMNS])
                prob = float(self.model.predict_proba(X_trans)[0][1])
            except Exception as e:
                print(f"Inference error: {e}, using heuristic fallback.")
                prob = 0.75
        else:
            # Fallback heuristic
            prob = 0.75

        prob = float(np.clip(prob, 0.05, 0.98))
        prob_pct = int(round(prob * 100))
        expected_val = round(amount * (prob_pct / 100.0), 2)

        # Get SHAP explanation
        shap_explanation = None
        if self.explainer is not None:
            try:
                shap_explanation = self.explainer.explain_instance(df)
            except Exception as e:
                print(f"SHAP explanation error: {e}")

        top_factors = (
            shap_explanation["top_factors"] if shap_explanation else []
        )

        return {
            "probability": prob_pct,
            "expected": expected_val,
            "top_shap_factors": top_factors,
        }


ml_service = MLInferenceService()
