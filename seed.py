"""Seed the database with demo users and employee data from the synthetic CSV."""
import os
import pandas as pd
from datetime import datetime

from app.database.base import Base
from app.database.session import engine, SessionLocal

# Register all models
from app.users.models import User, UserRole
from app.employees.models import Employee
from app.users.extra_models import UploadedDataset, ChatHistory, ModelRegistry, PredictionLog
from app.auth.utils import get_password_hash
from app.synthetic_data.generator import compute_labels_for_df, LABEL_COLUMNS

CSV_PATH = os.path.join("data", "synthetic_employees.csv")

DEMO_USERS = [
    {"full_name": "Admin User", "email": "admin@company.com", "password": "admin123", "role": UserRole.admin},
    {"full_name": "Regular User", "email": "user@company.com", "password": "user123", "role": UserRole.user},
]


def seed_users(db):
    created = 0
    for u in DEMO_USERS:
        if db.query(User).filter(User.email == u["email"]).first():
            continue
        db.add(User(
            full_name=u["full_name"],
            email=u["email"],
            password_hash=get_password_hash(u["password"]),
            role=u["role"],
        ))
        created += 1
    db.commit()
    print(f"Users: {created} created (skipped existing).")


def seed_employees(db):
    if db.query(Employee).count() > 0:
        print("Employees: already populated, skipping.")
        return
    if not os.path.exists(CSV_PATH):
        print(f"Employees: CSV not found at {CSV_PATH}, skipping.")
        return
    df = pd.read_csv(CSV_PATH)
    df["join_date"] = pd.to_datetime(df["join_date"]).dt.date
    # Predict labels if the CSV omits them (new datasets ship without them).
    if any(col not in df.columns for col in LABEL_COLUMNS):
        df = compute_labels_for_df(df)
    records = df.to_dict(orient="records")
    db.bulk_insert_mappings(Employee, records)
    db.commit()
    print(f"Employees: {len(records)} inserted.")


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_users(db)
        seed_employees(db)
        print("\nSeed complete.")
        print("  Admin: admin@company.com / admin123")
        print("  User:  user@company.com / user123")
    finally:
        db.close()


if __name__ == "__main__":
    main()
