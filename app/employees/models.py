from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Enum
from sqlalchemy.sql import func
import enum
from app.database.base import Base


class PerformanceLevel(str, enum.Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"


class PotentialLevel(str, enum.Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(String(50), unique=True, index=True, nullable=False)
    employee_name = Column(String(255), nullable=False)
    employee_email = Column(String(255), nullable=False)
    age = Column(Integer)
    gender = Column(String(10))
    department = Column(String(100))
    job_role = Column(String(100))
    join_date = Column(Date)
    years_of_experience = Column(Float)
    monthly_salary_usd = Column(Float)
    avg_monthly_attendance_percent = Column(Float)
    late_arrival_count = Column(Integer)
    absent_days_last_6_months = Column(Integer)
    overtime_hours_monthly = Column(Float)
    kpi_score = Column(Float)
    goal_completion_percent = Column(Float)
    task_completion_rate = Column(Float)
    manager_feedback_score = Column(Float)
    training_hours = Column(Float)
    certifications_count = Column(Integer)
    skill_assessment_score = Column(Float)
    leadership_assessment_score = Column(Float)
    performance_level = Column(Enum(PerformanceLevel))
    potential_level = Column(Enum(PotentialLevel))
    nine_box = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
