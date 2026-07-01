import io
import pandas as pd
from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies import get_current_user, require_admin
from app.employees.service import get_all_employees, get_employee_by_id, search_employees, process_csv_upload
from app.employees.schemas import EmployeeResponse
from typing import List

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    result = process_csv_upload(db, df, file.filename, current_user.id)
    return result


@router.get("", response_model=List[EmployeeResponse])
def list_employees(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    return get_all_employees(db, skip, limit)


@router.get("/search", response_model=List[EmployeeResponse])
def search(q: str = Query(..., min_length=1), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return search_employees(db, q)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_employee_by_id(db, employee_id)
