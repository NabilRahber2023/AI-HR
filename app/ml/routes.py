from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies import get_current_user, require_admin
from app.ml.trainer import train_model
from app.ml.predictor import predict_one, predict_employee
from app.ml.metrics import get_latest_metrics
from app.employees.service import get_employee_by_id
from app.employees.schemas import PredictionInput
from app.users.extra_models import PredictionLog

router = APIRouter(prefix="/prediction", tags=["Prediction"])


@router.post("/train")
def train(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    metrics = train_model(db)
    return {"status": "Model trained successfully", "metrics": metrics}


@router.get("/employee/{employee_id}")
def predict_for_employee(employee_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    emp = get_employee_by_id(db, employee_id)
    perf, pot, prediction = predict_employee(emp)
    log = PredictionLog(employee_id=employee_id, prediction=prediction)
    db.add(log)
    db.commit()
    return {
        "employee_id": employee_id,
        "predicted_nine_box": prediction,
        "predicted_performance_level": perf,
        "predicted_potential_level": pot,
        "current_nine_box": emp.nine_box,
    }


@router.post("/custom")
def predict_custom(data: PredictionInput, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    perf, pot, prediction = predict_one(data.model_dump())
    return {
        "predicted_nine_box": prediction,
        "predicted_performance_level": perf,
        "predicted_potential_level": pot,
    }


@router.get("/metrics")
def model_metrics(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    return get_latest_metrics(db)
