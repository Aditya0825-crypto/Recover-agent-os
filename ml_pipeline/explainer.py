"""
SHAP Explainability Module for RecoveryOS ML Models
Provides local (case-level) and global feature attribution explanations.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
import shap
from typing import List, Dict, Any

from ml_pipeline.features import ALL_FEATURE_COLUMNS


MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")


class RecoveryExplainer:
    def __init__(self, model=None, preprocessor=None, feature_names=None):
        self.model = model
        self.preprocessor = preprocessor
        self.feature_names = feature_names
        self.explainer = None
        
        if self.model is None or self.preprocessor is None:
            self._load_artifacts()
            
        if self.model is not None:
            self.explainer = shap.TreeExplainer(self.model)

    def _load_artifacts(self):
        model_path = os.path.join(MODEL_DIR, "recovery_xgb_model.joblib")
        preprocessor_path = os.path.join(MODEL_DIR, "preprocessor.joblib")
        meta_path = os.path.join(MODEL_DIR, "model_metadata.json")

        if os.path.exists(model_path) and os.path.exists(preprocessor_path):
            self.model = joblib.load(model_path)
            self.preprocessor = joblib.load(preprocessor_path)
            
            if os.path.exists(meta_path):
                with open(meta_path, "r") as f:
                    meta = json.load(f)
                    self.feature_names = meta.get("feature_names", [])

    def explain_instance(self, single_row_df: pd.DataFrame, top_k: int = 5) -> Dict[str, Any]:
        """
        Compute SHAP explanation for a single transaction case.
        Returns top positive and negative contributing factors.
        """
        if self.explainer is None:
            self._load_artifacts()
            if self.model is not None:
                self.explainer = shap.TreeExplainer(self.model)
            else:
                return {"factors": [], "base_value": 0.5}

        # Preprocess features
        X_trans = self.preprocessor.transform(single_row_df[ALL_FEATURE_COLUMNS])
        
        # Calculate SHAP values
        shap_values = self.explainer.shap_values(X_trans)
        
        if isinstance(shap_values, list):
            # For multi-output or binary classification in some shap versions
            sv = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
        elif len(shap_values.shape) == 2:
            sv = shap_values[0]
        else:
            sv = shap_values

        base_val = float(self.explainer.expected_value) if hasattr(self.explainer, "expected_value") else 0.5
        if isinstance(base_val, (list, np.ndarray)):
            base_val = float(base_val[-1])

        # Map SHAP values to readable feature names
        factor_list = []
        for name, val in zip(self.feature_names, sv):
            clean_name = self._beautify_feature_name(name)
            factor_list.append({
                "feature": clean_name,
                "raw_feature": name,
                "shap_value": round(float(val), 4),
                "impact": "positive" if val > 0 else "negative",
                "magnitude": abs(round(float(val), 4)),
            })

        # Sort by impact magnitude
        factor_list.sort(key=lambda x: x["magnitude"], reverse=True)
        top_factors = factor_list[:top_k]

        return {
            "base_value": round(base_val, 4),
            "top_factors": top_factors,
            "all_factors": factor_list,
        }

    def _beautify_feature_name(self, raw_name: str) -> str:
        """Convert machine-encoded feature names into human-friendly explanations."""
        replacements = {
            "cat__bank_code_HDFC": "HDFC Bank rail",
            "cat__bank_code_ICICI": "ICICI Bank rail",
            "cat__bank_code_SBI": "SBI Bank rail",
            "cat__bank_code_AXIS": "Axis Bank rail",
            "cat__bank_code_KOTAK": "Kotak Bank rail",
            "cat__payment_method_UPI": "UPI Payment method",
            "cat__payment_method_Credit Card": "Credit Card rail",
            "cat__payment_method_Debit Card": "Debit Card rail",
            "cat__payment_method_NetBanking": "NetBanking rail",
            "cat__error_code_GATEWAY_TIMEOUT": "Transient bank gateway timeout",
            "cat__error_code_INSUFFICIENT_FUNDS": "Insufficient account balance",
            "cat__error_code_UPI_LIMIT_EXCEEDED": "Rail transaction limit exceeded",
            "cat__error_code_SOFT_CARD_DECLINE": "Soft issuer card decline",
            "cat__error_code_SESSION_EXPIRED": "Checkout session timeout",
            "cat__error_code_REPEATED_HARD_DECLINE": "Repeated failed attempts",
            "cat__error_code_AUTHENTICATION_FAILED": "3DS / OTP Authentication failure",
            "amount": "Transaction amount",
            "retry_count": "Previous retry attempts count",
            "customer_past_txns": "Customer lifetime transaction history",
            "customer_past_recovery_rate": "Customer historical recovery rate",
            "is_systemic_outage": "Systemic rail degradation event",
        }
        for k, v in replacements.items():
            if raw_name.startswith(k) or raw_name == k:
                return v
        return raw_name.replace("cat__", "").replace("num__", "").replace("_", " ").title()
