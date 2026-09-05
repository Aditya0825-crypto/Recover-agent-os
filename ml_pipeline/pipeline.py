"""
Unified ML Pipeline Runner
Generates 12K+ synthetic dataset, trains models, verifies SHAP explainer, and exports artifacts.
"""

import os
import pandas as pd
from ml_pipeline.data_generator import generate_synthetic_transactions
from ml_pipeline.train import train_recovery_model
from ml_pipeline.explainer import RecoveryExplainer

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def run_full_ml_pipeline(n_samples: int = 12000):
    print(f"=== [Step 1/3] Synthesizing {n_samples} Realistic Payment Transactions ===")
    df = generate_synthetic_transactions(n_samples)
    os.makedirs(DATA_DIR, exist_ok=True)
    csv_path = os.path.join(DATA_DIR, "synthetic_razorpay_transactions.csv")
    df.to_csv(csv_path, index=False)
    print(f"Saved dataset to {csv_path}")

    print("\n=== [Step 2/3] Training XGBoost & Baseline Models ===")
    xgb_model, preprocessor, metrics = train_recovery_model(df, save_artifacts=True)

    print("\n=== [Step 3/3] Initializing and Verifying SHAP Explainer ===")
    explainer = RecoveryExplainer(xgb_model, preprocessor, metrics["feature_names"])
    sample_row = df.head(1)
    explanation = explainer.explain_instance(sample_row)
    print(f"Sample explanation for Case {sample_row['case_id'].values[0]}:")
    print(f"Base value: {explanation['base_value']}")
    print("Top factors driving prediction:")
    for f in explanation["top_factors"]:
        print(f" - {f['feature']}: {f['shap_value']:+.4f} ({f['impact']})")

    print("\n>>> ML Pipeline Execution Completed Successfully! <<<")
    return df, metrics


if __name__ == "__main__":
    run_full_ml_pipeline(12000)
