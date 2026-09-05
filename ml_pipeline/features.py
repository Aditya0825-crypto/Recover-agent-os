"""
Feature Engineering & Transformation Pipeline for RecoveryOS ML
"""

import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline


CATEGORICAL_FEATURES = [
    "bank_code",
    "payment_method",
    "error_code",
    "error_category",
]

NUMERICAL_FEATURES = [
    "amount",
    "retry_count",
    "customer_past_txns",
    "customer_past_recovery_rate",
    "is_systemic_outage",
]

ALL_FEATURE_COLUMNS = CATEGORICAL_FEATURES + NUMERICAL_FEATURES


def build_preprocessor() -> ColumnTransformer:
    """Build a Scikit-Learn ColumnTransformer for categorical and numerical features."""
    categorical_transformer = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    numerical_transformer = StandardScaler()

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
            ("num", numerical_transformer, NUMERICAL_FEATURES),
        ],
        remainder="drop",
    )
    return preprocessor


def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """Extract and validate required feature columns from dataframe."""
    missing = [c for c in ALL_FEATURE_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required feature columns: {missing}")
    return df[ALL_FEATURE_COLUMNS].copy()
