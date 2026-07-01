import pandas as pd
import re
from typing import Tuple, List

# The label columns (performance_level, potential_level, nine_box) are NOT
# required in uploads — the system predicts them from the raw metrics
# (see app.ml.predictor.predict_labels_for_df, called by the upload service).
REQUIRED_COLUMNS = [
    "worker_id", "employee_name", "employee_email", "age", "gender",
    "department", "job_role", "join_date", "years_of_experience",
    "monthly_salary_usd", "avg_monthly_attendance_percent", "late_arrival_count",
    "absent_days_last_6_months", "overtime_hours_monthly", "kpi_score",
    "goal_completion_percent", "task_completion_rate", "manager_feedback_score",
    "training_hours", "certifications_count", "skill_assessment_score",
    "leadership_assessment_score",
]

# Columns coerced to numbers; integers vs floats handled separately.
INT_COLS = ["age", "late_arrival_count", "absent_days_last_6_months", "certifications_count"]
FLOAT_COLS = [
    "years_of_experience", "monthly_salary_usd", "avg_monthly_attendance_percent",
    "overtime_hours_monthly", "kpi_score", "goal_completion_percent",
    "task_completion_rate", "manager_feedback_score", "training_hours",
    "skill_assessment_score", "leadership_assessment_score",
]
STR_COLS = ["worker_id", "employee_name", "employee_email", "gender", "department", "job_role"]


def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(pattern, str(email)))


def clean_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
    """Coerce an arbitrary CSV into clean, insertable rows and predict labels.

    Hard-fails only when required columns are missing. Everything else is
    repaired in place (type coercion, date parsing), and the talent labels
    (performance_level, potential_level, nine_box) are always computed from the
    raw metrics, with non-blocking warnings describing what was adjusted.
    """
    warnings: List[str] = []

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        return df, [f"Missing required columns: {missing}"]

    # Keep only the required raw columns, in a stable order, and work on a copy.
    df = df[REQUIRED_COLUMNS].copy()

    # --- String columns: trim whitespace ---
    for col in STR_COLS:
        df[col] = df[col].astype(str).str.strip()

    # --- Numeric coercion ---
    for col in FLOAT_COLS + INT_COLS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # --- Date parsing -> python date objects (None when unparseable) ---
    parsed_dates = pd.to_datetime(df["join_date"], errors="coerce")
    df["join_date"] = [d.date() if pd.notna(d) else None for d in parsed_dates]

    # --- Drop rows that lack an identity ---
    before = len(df)
    df = df[df["worker_id"].notna() & (df["worker_id"].str.lower() != "nan") & (df["worker_id"] != "")]
    dropped = before - len(df)
    if dropped:
        warnings.append(f"{dropped} row(s) skipped (missing worker_id)")

    # --- Drop duplicate worker_ids within the file (keep first) ---
    dupes = int(df["worker_id"].duplicated().sum())
    if dupes:
        df = df.drop_duplicates(subset="worker_id", keep="first")
        warnings.append(f"{dupes} duplicate worker_id(s) collapsed to first occurrence")

    # --- Fill missing numeric values with safe defaults ---
    numeric_filled = 0
    for col in FLOAT_COLS + INT_COLS:
        n = int(df[col].isna().sum())
        if n:
            df[col] = df[col].fillna(0)
            numeric_filled += n
    if numeric_filled:
        warnings.append(f"{numeric_filled} missing numeric value(s) defaulted to 0")

    # Integer columns to int
    for col in INT_COLS:
        df[col] = df[col].round().astype(int)

    # NOTE: talent labels (performance_level, potential_level, nine_box) are
    # predicted by the upload service after cleaning, not here.

    # --- Email sanity (non-blocking) ---
    invalid_emails = int((~df["employee_email"].apply(validate_email)).sum())
    if invalid_emails:
        warnings.append(f"{invalid_emails} row(s) have unusual email formats (kept as-is)")

    return df.reset_index(drop=True), warnings


# Backwards-compatible name used elsewhere.
def validate_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
    return clean_dataframe(df)
