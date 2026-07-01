import pandas as pd
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.employees.models import Employee
from app.employees.validators import clean_dataframe
from app.ml.predictor import predict_labels_for_df
from app.users.extra_models import UploadedDataset, PredictionLog


def get_all_employees(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Employee).offset(skip).limit(limit).all()


def get_employee_by_id(db: Session, employee_id: int):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


def search_employees(db: Session, query: str):
    return db.query(Employee).filter(
        (Employee.worker_id.ilike(f"%{query}%")) |
        (Employee.employee_name.ilike(f"%{query}%"))
    ).limit(20).all()


def process_csv_upload(db: Session, df: pd.DataFrame, filename: str, user_id: int):
    if df is None or df.empty:
        raise HTTPException(status_code=422, detail={"validation_errors": ["The uploaded file is empty"]})

    df, warnings = clean_dataframe(df)

    # Only a missing-column failure is fatal; everything else is repaired.
    if warnings and any(w.startswith("Missing required columns") for w in warnings):
        raise HTTPException(status_code=422, detail={"validation_errors": warnings})

    if df.empty:
        raise HTTPException(
            status_code=422,
            detail={"validation_errors": ["No valid rows found after cleaning"] + warnings},
        )

    # Predict the talent labels (performance_level, potential_level, nine_box)
    # for every uploaded record. Uses the trained ML model when available,
    # otherwise the scoring engine so a fresh system still works.
    df, label_source = predict_labels_for_df(df)

    # The uploaded CSV becomes the new source of truth: clear the existing
    # workforce so every dashboard (department performance, performance-level
    # distribution, 9-box, etc.) reflects exactly the data just uploaded.
    # Clear dependent rows first — prediction_logs has a foreign key to
    # employees.id, and Postgres (unlike SQLite) enforces it, so deleting
    # employees while logs reference them raises a ForeignKeyViolation.
    db.query(PredictionLog).delete()
    db.query(Employee).delete()

    records = []
    failed = 0
    for _, row in df.iterrows():
        try:
            records.append(Employee(
                worker_id=str(row["worker_id"]),
                employee_name=str(row["employee_name"]),
                employee_email=str(row["employee_email"]),
                age=int(row["age"]),
                gender=str(row["gender"]),
                department=str(row["department"]),
                job_role=str(row["job_role"]),
                join_date=row["join_date"],  # already a python date or None
                years_of_experience=float(row["years_of_experience"]),
                monthly_salary_usd=float(row["monthly_salary_usd"]),
                avg_monthly_attendance_percent=float(row["avg_monthly_attendance_percent"]),
                late_arrival_count=int(row["late_arrival_count"]),
                absent_days_last_6_months=int(row["absent_days_last_6_months"]),
                overtime_hours_monthly=float(row["overtime_hours_monthly"]),
                kpi_score=float(row["kpi_score"]),
                goal_completion_percent=float(row["goal_completion_percent"]),
                task_completion_rate=float(row["task_completion_rate"]),
                manager_feedback_score=float(row["manager_feedback_score"]),
                training_hours=float(row["training_hours"]),
                certifications_count=int(row["certifications_count"]),
                skill_assessment_score=float(row["skill_assessment_score"]),
                leadership_assessment_score=float(row["leadership_assessment_score"]),
                performance_level=str(row["performance_level"]),
                potential_level=str(row["potential_level"]),
                nine_box=int(row["nine_box"]),
            ))
        except (ValueError, TypeError):
            failed += 1

    try:
        db.bulk_save_objects(records)
        dataset_log = UploadedDataset(filename=filename, uploaded_by=user_id)
        db.add(dataset_log)
        db.commit()
    except Exception as exc:  # pragma: no cover - surface DB issues cleanly
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save records: {exc}")

    if failed:
        warnings.append(f"{failed} row(s) could not be inserted and were skipped")

    return {
        "inserted": len(records),
        "skipped": failed,
        "total_in_file": int(len(df)),
        "label_source": label_source,
        "errors": warnings,
    }
