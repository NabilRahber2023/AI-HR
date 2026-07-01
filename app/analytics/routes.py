from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies import require_admin
from app.analytics.service import (
    get_summary, get_salary_distribution, get_department_performance,
    get_ninebox_distribution, get_gender_distribution, get_performance_distribution
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
def summary(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    return get_summary(db)


@router.get("/salary-distribution")
def salary_dist(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    return get_salary_distribution(db)


@router.get("/department-performance")
def dept_perf(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    return get_department_performance(db)


@router.get("/9box-distribution")
def ninebox_dist(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    return get_ninebox_distribution(db)


@router.get("/gender-distribution")
def gender_dist(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    return get_gender_distribution(db)


@router.get("/performance-distribution")
def perf_dist(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    return get_performance_distribution(db)
