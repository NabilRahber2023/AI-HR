import joblib
import pandas as pd
from typing import Tuple
from app.ml.trainer import MODEL_PATH, FEATURE_COLS, _to_str
from app.synthetic_data.generator import compute_labels_for_df, get_nine_box, add_engineered_scores

_model = None


def load_model():
    """Load the trained artifact: {performance, potential, features} or None."""
    global _model
    try:
        _model = joblib.load(MODEL_PATH)
    except (FileNotFoundError, OSError):
        _model = None
    return _model


def _is_valid_model(model) -> bool:
    return isinstance(model, dict) and "performance" in model and "potential" in model


def predict_labels_for_df(df: pd.DataFrame) -> Tuple[pd.DataFrame, str]:
    """Add performance_level, potential_level and nine_box to a frame of raw metrics.

    Uses the trained ML model when available; otherwise falls back to the
    scoring engine so uploads still work before the model has been trained.
    Returns (df_with_labels, source) where source is "ml-model" or "scoring-engine".
    """
    model = load_model()
    if not _is_valid_model(model):
        return compute_labels_for_df(df), "scoring-engine"

    features = model.get("features", FEATURE_COLS)
    X = add_engineered_scores(df)[features]
    perf = model["performance"].predict(X)
    pot = model["potential"].predict(X)

    out = df.copy()
    out["performance_level"] = [str(p) for p in perf]
    out["potential_level"] = [str(q) for q in pot]
    out["nine_box"] = [int(get_nine_box(str(p), str(q))) for p, q in zip(perf, pot)]
    return out, "ml-model"


def predict_one(data: dict) -> Tuple[str, str, int]:
    """Predict (performance_level, potential_level, nine_box) for one raw record."""
    df = pd.DataFrame([{col: data.get(col) for col in FEATURE_COLS}])
    labeled, _ = predict_labels_for_df(df)
    r = labeled.iloc[0]
    return str(r["performance_level"]), str(r["potential_level"]), int(r["nine_box"])


def predict_nine_box(data: dict) -> int:
    return predict_one(data)[2]


def predict_employee(employee) -> Tuple[str, str, int]:
    data = {col: _to_str(getattr(employee, col, None)) for col in FEATURE_COLS}
    return predict_one(data)
