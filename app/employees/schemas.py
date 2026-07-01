from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date


class EmployeeBase(BaseModel):
    worker_id: str
    employee_name: str
    employee_email: str
    age: Optional[int] = None
    gender: Optional[str] = None
    department: Optional[str] = None
    job_role: Optional[str] = None
    join_date: Optional[date] = None
    years_of_experience: Optional[float] = None
    monthly_salary_usd: Optional[float] = None
    avg_monthly_attendance_percent: Optional[float] = None
    late_arrival_count: Optional[int] = None
    absent_days_last_6_months: Optional[int] = None
    overtime_hours_monthly: Optional[float] = None
    kpi_score: Optional[float] = None
    goal_completion_percent: Optional[float] = None
    task_completion_rate: Optional[float] = None
    manager_feedback_score: Optional[float] = None
    training_hours: Optional[float] = None
    certifications_count: Optional[int] = None
    skill_assessment_score: Optional[float] = None
    leadership_assessment_score: Optional[float] = None
    performance_level: Optional[str] = None
    potential_level: Optional[str] = None
    nine_box: Optional[int] = None


class EmployeeResponse(EmployeeBase):
    id: int

    class Config:
        from_attributes = True


class PredictionInput(BaseModel):
    age: int
    gender: str
    department: str
    job_role: str
    years_of_experience: float
    monthly_salary_usd: float
    avg_monthly_attendance_percent: float
    late_arrival_count: int
    absent_days_last_6_months: int
    overtime_hours_monthly: float
    kpi_score: float
    goal_completion_percent: float
    task_completion_rate: float
    manager_feedback_score: float
    training_hours: float
    certifications_count: int
    skill_assessment_score: float
    leadership_assessment_score: float
