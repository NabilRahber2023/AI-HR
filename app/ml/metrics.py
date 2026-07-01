from sqlalchemy.orm import Session
from app.users.extra_models import ModelRegistry


def get_latest_metrics(db: Session):
    record = db.query(ModelRegistry).order_by(ModelRegistry.id.desc()).first()
    if not record:
        return {"detail": "No model has been trained yet"}
    return {
        "model_name": record.model_name,
        "version": record.version,
        "metrics": record.metrics,
        "trained_at": record.created_at,
    }
