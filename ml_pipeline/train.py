"""
ML Training Pipeline for RecoveryOS
Trains XGBoost model for Recovery Probability Prediction and evaluates performance metrics.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, brier_score_loss, accuracy_score, precision_score, recall_score, classification_report
from xgboost import XGBClassifier
from sklearn.linear_model import LogisticRegression

from ml_pipeline.features import build_preprocessor, ALL_FEATURE_COLUMNS, CATEGORICAL_FEATURES, NUMERICAL_FEATURES
from ml_pipeline.data_generator import generate_synthetic_transactions


MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")


def train_recovery_model(data_df: pd.DataFrame = None, save_artifacts: bool = True):
    """Train XGBoost model on synthetic/historical payment data and save artifacts."""
    if data_df is None:
        print("Generating 12,000 synthetic transactions for ML training...")
        data_df = generate_synthetic_transactions(12000)

    X = data_df[ALL_FEATURE_COLUMNS]
    y = data_df["ground_truth_recovered"]

    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"Training dataset size: {len(X_train)}, Testing dataset size: {len(X_test)}")

    # Fit feature preprocessor
    preprocessor = build_preprocessor()
    X_train_transformed = preprocessor.fit_transform(X_train)
    X_test_transformed = preprocessor.transform(X_test)

    # Get feature names after one-hot encoding
    cat_encoder = preprocessor.named_transformers_["cat"]
    encoded_cat_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
    feature_names = encoded_cat_names + NUMERICAL_FEATURES

    # Train XGBoost Classifier
    xgb_model = XGBClassifier(
        n_estimators=150,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        eval_metric="logloss",
        random_state=42,
    )
    xgb_model.fit(X_train_transformed, y_train)

    # Train Baseline Model (Simple Logistic Regression mimicking standard naive retry logic)
    baseline_model = LogisticRegression(max_iter=500, random_state=42)
    baseline_model.fit(X_train_transformed, y_train)

    # Evaluate Primary Model
    y_pred_proba = xgb_model.predict_proba(X_test_transformed)[:, 1]
    y_pred = (y_pred_proba >= 0.50).astype(int)

    auc = roc_auc_score(y_test, y_pred_proba)
    brier = brier_score_loss(y_test, y_pred_proba)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)

    # Baseline evaluation
    baseline_proba = baseline_model.predict_proba(X_test_transformed)[:, 1]
    baseline_auc = roc_auc_score(y_test, baseline_proba)

    metrics = {
        "roc_auc": round(float(auc), 4),
        "brier_score": round(float(brier), 4),
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "baseline_auc": round(float(baseline_auc), 4),
        "n_train_samples": len(X_train),
        "n_test_samples": len(X_test),
        "feature_names": feature_names,
    }

    print("\n================ ML Model Evaluation ================")
    print(f"ROC-AUC Score:      {metrics['roc_auc']:.4f} (Baseline: {metrics['baseline_auc']:.4f})")
    print(f"Brier Score (Calib): {metrics['brier_score']:.4f}")
    print(f"Accuracy:           {metrics['accuracy'] * 100:.2f}%")
    print(f"Precision:          {metrics['precision'] * 100:.2f}%")
    print(f"Recall:             {metrics['recall'] * 100:.2f}%")
    print("====================================================\n")

    if save_artifacts:
        os.makedirs(MODEL_DIR, exist_ok=True)
        
        # Save XGBoost model
        joblib.dump(xgb_model, os.path.join(MODEL_DIR, "recovery_xgb_model.joblib"))
        # Save preprocessor
        joblib.dump(preprocessor, os.path.join(MODEL_DIR, "preprocessor.joblib"))
        # Save baseline model
        joblib.dump(baseline_model, os.path.join(MODEL_DIR, "baseline_model.joblib"))
        # Save metadata and feature names
        with open(os.path.join(MODEL_DIR, "model_metadata.json"), "w") as f:
            json.dump(metrics, f, indent=2)

        print(f"Artifacts successfully saved to {MODEL_DIR}")

    return xgb_model, preprocessor, metrics


if __name__ == "__main__":
    train_recovery_model()
