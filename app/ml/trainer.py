import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sqlalchemy.orm import Session
from app.employees.models import Employee
from app.users.extra_models import ModelRegistry
from app.synthetic_data.generator import (
    compute_labels_for_df, get_nine_box, add_engineered_scores, ENGINEERED_COLUMNS,
)

MODEL_PATH = "models/employee_9box_model.pkl"

# Only the raw, uploadable attributes are model inputs. The talent labels
# (performance_level, potential_level, nine_box) are the prediction TARGETS —
# they are no longer expected in the data.
FEATURE_COLS = [
    "age", "gender", "department", "job_role", "years_of_experience",
    "monthly_salary_usd", "avg_monthly_attendance_percent", "late_arrival_count",
    "absent_days_last_6_months", "overtime_hours_monthly", "kpi_score",
    "goal_completion_percent", "task_completion_rate", "manager_feedback_score",
    "training_hours", "certifications_count", "skill_assessment_score",
    "leadership_assessment_score",
]

# The model also consumes two engineered domain scores derived from the raw
# metrics (added at fit/predict time), which sharpen the level boundaries.
MODEL_FEATURES = FEATURE_COLS + ENGINEERED_COLUMNS

CATEGORICAL = ["gender", "department", "job_role"]
NUMERICAL = [c for c in MODEL_FEATURES if c not in CATEGORICAL]

ALL_BOXES = list(range(1, 10))


def _to_str(value):
    """Normalize enum members (e.g. PerformanceLevel.High) to their string value."""
    return getattr(value, "value", value)


def _build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), NUMERICAL),
        ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL),
    ])
    return Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(
            n_estimators=300, max_depth=None, random_state=42, n_jobs=-1,
            class_weight="balanced_subsample",
        )),
    ])


def train_model(db: Session):
    """Train two classifiers (performance & potential level) on the raw metrics.

    The nine-box is derived from the predicted levels, so a single trained
    artifact yields all three labels. Ground-truth labels come from the domain
    scoring engine (not whatever is currently stored), keeping training honest
    and non-circular even after uploads whose labels were model-predicted.
    """
    employees = db.query(Employee).all()
    if len(employees) < 50:
        raise ValueError("Not enough data to train. Upload employee data first.")

    rows = [{col: _to_str(getattr(e, col)) for col in FEATURE_COLS} for e in employees]
    df = pd.DataFrame(rows)
    raw_numerical = [c for c in FEATURE_COLS if c not in CATEGORICAL]
    for col in raw_numerical:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df.dropna(subset=raw_numerical).reset_index(drop=True)

    # Ground-truth talent labels from the scoring engine.
    labeled = compute_labels_for_df(df)
    X = add_engineered_scores(df)[MODEL_FEATURES]
    y_perf = labeled["performance_level"]
    y_pot = labeled["potential_level"]
    y_box = labeled["nine_box"]

    stratify = y_box if y_box.value_counts().min() >= 2 else None
    X_train, X_test, yp_train, yp_test, yq_train, yq_test, yb_train, yb_test = train_test_split(
        X, y_perf, y_pot, y_box, test_size=0.2, random_state=42, stratify=stratify
    )

    perf_pipe = _build_pipeline().fit(X_train, yp_train)
    pot_pipe = _build_pipeline().fit(X_train, yq_train)

    perf_pred = perf_pipe.predict(X_test)
    pot_pred = pot_pipe.predict(X_test)
    box_pred = [get_nine_box(p, q) for p, q in zip(perf_pred, pot_pred)]

    metrics = {
        "accuracy": round(accuracy_score(yb_test, box_pred), 4),
        "precision": round(precision_score(yb_test, box_pred, average="weighted", zero_division=0), 4),
        "recall": round(recall_score(yb_test, box_pred, average="weighted", zero_division=0), 4),
        "f1": round(f1_score(yb_test, box_pred, average="weighted", zero_division=0), 4),
        "confusion_matrix": confusion_matrix(yb_test, box_pred, labels=ALL_BOXES).tolist(),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "performance_level_accuracy": round(accuracy_score(yp_test, perf_pred), 4),
        "potential_level_accuracy": round(accuracy_score(yq_test, pot_pred), 4),
    }

    artifact = {"performance": perf_pipe, "potential": pot_pipe, "features": MODEL_FEATURES}
    os.makedirs("models", exist_ok=True)
    joblib.dump(artifact, MODEL_PATH)

    registry = ModelRegistry(model_name="RandomForest_9Box", version="2.0", metrics=metrics)
    db.add(registry)
    db.commit()

    return metrics
