from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.employees.service import get_employee_by_id
from app.recommendation.prompts import BOX_RULES, build_ollama_prompt
from app.chatbot.ollama_client import call_ollama


def get_recommendations(db: Session, employee_id: int):
    emp = get_employee_by_id(db, employee_id)
    box = emp.nine_box
    if not box:
        raise HTTPException(status_code=400, detail="Employee has no 9-box classification")

    box_info = BOX_RULES.get(box, {})
    rule_recs = box_info.get("strategies", [])
    label = box_info.get("label", f"Box {box}")

    employee_data = {
        "employee_name": emp.employee_name,
        "department": emp.department,
        "job_role": emp.job_role,
        "age": emp.age,
        "years_of_experience": emp.years_of_experience,
        "kpi_score": emp.kpi_score,
        "performance_level": emp.performance_level,
        "potential_level": emp.potential_level,
        "skill_assessment_score": emp.skill_assessment_score,
        "leadership_assessment_score": emp.leadership_assessment_score,
        "training_hours": emp.training_hours,
    }

    # Try to get AI-personalized additions
    ai_recs = []
    try:
        prompt = build_ollama_prompt(employee_data, box, rule_recs)
        response = call_ollama(prompt)
        if response:
            lines = [l.strip() for l in response.split("\n") if l.strip() and l.strip()[0].isdigit()]
            ai_recs = [l.split(".", 1)[-1].strip() for l in lines[:3]]
    except Exception:
        pass

    all_recs = rule_recs + ai_recs
    return {
        "employee_id": employee_id,
        "employee_name": emp.employee_name,
        "nine_box": box,
        "label": label,
        "performance_level": emp.performance_level,
        "potential_level": emp.potential_level,
        "recommendations": all_recs[:10],
        "ai_enhanced": len(ai_recs) > 0,
    }
