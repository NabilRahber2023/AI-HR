from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies import get_current_user
from app.recommendation.engine import get_recommendations

router = APIRouter(prefix="/recommendation", tags=["Recommendations"])


@router.get("/{employee_id}")
def recommend(employee_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_recommendations(db, employee_id)
