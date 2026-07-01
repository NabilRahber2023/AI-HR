import pandas as pd
import numpy as np
from faker import Faker
import random
from datetime import datetime, date
import os

fake = Faker()
np.random.seed(42)
random.seed(42)

DEPARTMENTS = ["HR", "IT", "Finance", "Sales", "Marketing", "Operations", "Customer Support", "Engineering"]
GENDERS = ["Male", "Female"]

JOB_ROLES = {
    "HR": ["HR Manager", "HR Specialist", "Recruiter", "HR Analyst"],
    "IT": ["Software Engineer", "DevOps Engineer", "Data Analyst", "IT Support", "System Architect"],
    "Finance": ["Financial Analyst", "Accountant", "CFO", "Budget Analyst", "Auditor"],
    "Sales": ["Sales Manager", "Sales Representative", "Account Executive", "Business Developer"],
    "Marketing": ["Marketing Manager", "Content Strategist", "SEO Specialist", "Brand Manager"],
    "Operations": ["Operations Manager", "Supply Chain Analyst", "Logistics Coordinator", "Process Analyst"],
    "Customer Support": ["Support Specialist", "Customer Success Manager", "Help Desk Agent", "QA Analyst"],
    "Engineering": ["Mechanical Engineer", "Civil Engineer", "Electrical Engineer", "R&D Engineer"],
}

SALARY_RANGES = {
    "HR": (1200, 4500),
    "IT": (2000, 8000),
    "Finance": (1800, 7000),
    "Sales": (1500, 6000),
    "Marketing": (1400, 5000),
    "Operations": (1200, 4000),
    "Customer Support": (800, 3000),
    "Engineering": (2000, 7500),
}


def calc_performance(kpi, goal, task, feedback, attendance, late, absent):
    base = 0.30 * kpi + 0.25 * goal + 0.20 * task + 0.15 * feedback + 0.10 * attendance
    penalty = late * 0.8 + absent * 1.5
    return max(0, min(100, base - penalty))


def calc_potential(skill, leadership, training, certs, experience):
    norm_training = (training / 120) * 100
    norm_certs = (certs / 15) * 100
    norm_exp = (experience / 35) * 100
    return 0.25 * skill + 0.25 * leadership + 0.20 * norm_training + 0.15 * norm_certs + 0.15 * norm_exp


def get_performance_level(score):
    if score < 50:
        return "Low"
    elif score < 75:
        return "Medium"
    return "High"


def get_potential_level(score):
    if score < 45:
        return "Low"
    elif score <= 70:
        return "Medium"
    return "High"


def get_nine_box(perf_level, pot_level):
    mapping = {
        ("Low", "Low"): 1,
        ("Medium", "Low"): 2,
        ("High", "Low"): 3,
        ("Low", "Medium"): 4,
        ("Medium", "Medium"): 5,
        ("High", "Medium"): 6,
        ("Low", "High"): 7,
        ("Medium", "High"): 8,
        ("High", "High"): 9,
    }
    return mapping.get((perf_level, pot_level), 5)


LABEL_COLUMNS = ["performance_level", "potential_level", "nine_box"]

ENGINEERED_COLUMNS = ["perf_score", "pot_score"]


def add_engineered_scores(df: pd.DataFrame) -> pd.DataFrame:
    """Append the continuous performance & potential scores derived from raw metrics.

    These domain scores summarize the weighted signals behind each talent level,
    giving the ML model a strong, learnable basis for the threshold boundaries.
    Vectorized to stay fast on large uploads. Missing inputs are treated as 0.
    """
    df = df.copy()
    g = lambda c: pd.to_numeric(df.get(c), errors="coerce").fillna(0)

    perf = (
        0.30 * g("kpi_score") + 0.25 * g("goal_completion_percent")
        + 0.20 * g("task_completion_rate") + 0.15 * g("manager_feedback_score")
        + 0.10 * g("avg_monthly_attendance_percent")
        - (g("late_arrival_count") * 0.8 + g("absent_days_last_6_months") * 1.5)
    ).clip(0, 100)

    pot = (
        0.25 * g("skill_assessment_score") + 0.25 * g("leadership_assessment_score")
        + 0.20 * (g("training_hours") / 120 * 100)
        + 0.15 * (g("certifications_count") / 15 * 100)
        + 0.15 * (g("years_of_experience") / 35 * 100)
    )

    df["perf_score"] = perf
    df["pot_score"] = pot
    return df


def compute_labels_for_df(df: pd.DataFrame) -> pd.DataFrame:
    """Derive performance_level, potential_level and nine_box from raw metrics.

    This is the system's prediction of an employee's talent placement: it is
    applied to any dataset that does not already provide those columns (uploads
    and the synthetic CSVs no longer ship them).
    """
    df = df.copy()
    perf_levels, pot_levels, boxes = [], [], []
    for _, r in df.iterrows():
        perf_score = calc_performance(
            r.get("kpi_score", 0) or 0, r.get("goal_completion_percent", 0) or 0,
            r.get("task_completion_rate", 0) or 0, r.get("manager_feedback_score", 0) or 0,
            r.get("avg_monthly_attendance_percent", 0) or 0, r.get("late_arrival_count", 0) or 0,
            r.get("absent_days_last_6_months", 0) or 0,
        )
        pot_score = calc_potential(
            r.get("skill_assessment_score", 0) or 0, r.get("leadership_assessment_score", 0) or 0,
            r.get("training_hours", 0) or 0, r.get("certifications_count", 0) or 0,
            r.get("years_of_experience", 0) or 0,
        )
        pl = get_performance_level(perf_score)
        ql = get_potential_level(pot_score)
        perf_levels.append(pl)
        pot_levels.append(ql)
        boxes.append(get_nine_box(pl, ql))
    df["performance_level"] = perf_levels
    df["potential_level"] = pot_levels
    df["nine_box"] = boxes
    return df


def generate_dataset(n=5000):
    records = []
    used_emails = set()

    for i in range(1, n + 1):
        dept = random.choice(DEPARTMENTS)
        gender = random.choice(GENDERS)
        age = random.randint(22, 60)
        experience = min(random.randint(0, 35), age - 22)
        job_role = random.choice(JOB_ROLES[dept])
        sal_min, sal_max = SALARY_RANGES[dept]
        salary = round(random.uniform(sal_min, sal_max), 2)

        join_year = datetime.now().year - experience
        join_date = date(max(join_year, 2000), random.randint(1, 12), random.randint(1, 28))

        kpi = round(random.uniform(40, 100), 2)
        goal = round(random.uniform(30, 100), 2)
        task = round(random.uniform(30, 100), 2)
        feedback = round(random.uniform(30, 100), 2)
        attendance = round(random.uniform(70, 100), 2)
        late = random.randint(0, 15)
        absent = random.randint(0, 20)
        overtime = round(random.uniform(0, 40), 2)
        training = round(random.uniform(0, 120), 2)
        certs = random.randint(0, 15)
        skill = round(random.uniform(20, 100), 2)
        leadership = round(random.uniform(20, 100), 2)

        perf_score = calc_performance(kpi, goal, task, feedback, attendance, late, absent)
        pot_score = calc_potential(skill, leadership, training, certs, experience)
        perf_level = get_performance_level(perf_score)
        pot_level = get_potential_level(pot_score)
        nine_box = get_nine_box(perf_level, pot_level)

        # Unique email
        first = fake.first_name().lower().replace(" ", "")
        last = fake.last_name().lower().replace(" ", "")
        email = f"{first}.{last}{i}@company.com"

        name = f"{first.capitalize()} {last.capitalize()}"

        records.append({
            "worker_id": f"EMP{str(i).zfill(5)}",
            "employee_name": name,
            "employee_email": email,
            "age": age,
            "gender": gender,
            "department": dept,
            "job_role": job_role,
            "join_date": join_date.strftime("%Y-%m-%d"),
            "years_of_experience": experience,
            "monthly_salary_usd": salary,
            "avg_monthly_attendance_percent": attendance,
            "late_arrival_count": late,
            "absent_days_last_6_months": absent,
            "overtime_hours_monthly": overtime,
            "kpi_score": kpi,
            "goal_completion_percent": goal,
            "task_completion_rate": task,
            "manager_feedback_score": feedback,
            "training_hours": training,
            "certifications_count": certs,
            "skill_assessment_score": skill,
            "leadership_assessment_score": leadership,
            "performance_level": perf_level,
            "potential_level": pot_level,
            "nine_box": nine_box,
        })

    return pd.DataFrame(records)


if __name__ == "__main__":
    print("Generating 5000 employee records...")
    df = generate_dataset(5000)
    os.makedirs("data", exist_ok=True)
    output_path = "data/synthetic_employees.csv"
    # The shipped CSV omits the derived label columns — the system predicts them.
    df.drop(columns=LABEL_COLUMNS).to_csv(output_path, index=False)
    print(f"✅ Dataset saved to {output_path} (without label columns)")
    print(f"Shape: {df.drop(columns=LABEL_COLUMNS).shape}")
    print(f"\n9-Box Distribution (computed):\n{df['nine_box'].value_counts().sort_index()}")
