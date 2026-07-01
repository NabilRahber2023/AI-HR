import math
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.employees.models import Employee


def _nice_width(raw: float) -> float:
    """Round a raw bin width up to a clean 1/2/2.5/5/10 * 10^n value."""
    if raw <= 0:
        return 1.0
    magnitude = 10 ** math.floor(math.log10(raw))
    for m in (1, 2, 2.5, 5, 10):
        if raw <= m * magnitude:
            return m * magnitude
    return 10 * magnitude


def _fmt_money(v: float) -> str:
    v = float(v)
    if abs(v) >= 1000:
        s = v / 1000
        return f"${s:.0f}k" if s == int(s) else f"${s:.1f}k"
    return f"${v:.0f}"


def get_summary(db: Session):
    total = db.query(func.count(Employee.id)).scalar()
    male = db.query(func.count(Employee.id)).filter(Employee.gender == "Male").scalar()
    female = db.query(func.count(Employee.id)).filter(Employee.gender == "Female").scalar()
    avg_kpi = db.query(func.avg(Employee.kpi_score)).scalar()
    avg_attendance = db.query(func.avg(Employee.avg_monthly_attendance_percent)).scalar()
    return {
        "total_employees": total,
        "male_count": male,
        "female_count": female,
        "avg_kpi": round(avg_kpi or 0, 2),
        "avg_attendance": round(avg_attendance or 0, 2),
    }


def get_salary_distribution(db: Session, bins: int = 8):
    """Adaptive salary histogram derived from the actual data range.

    Builds evenly-sized, nicely-rounded buckets between the real min and max
    salary so the chart stays meaningful for any uploaded dataset (any scale
    or currency), instead of fixed thresholds.
    """
    rows = db.query(Employee.monthly_salary_usd).filter(
        Employee.monthly_salary_usd.isnot(None),
        Employee.monthly_salary_usd > 0,
    ).all()
    values = [float(r[0]) for r in rows]
    if not values:
        return []

    lo, hi = min(values), max(values)
    if lo == hi:
        return [{"range": _fmt_money(lo), "count": len(values), "min": lo, "max": hi}]

    width = _nice_width((hi - lo) / max(bins, 1))
    start = math.floor(lo / width) * width
    n = int(math.ceil((hi - start) / width))
    edges = [start + i * width for i in range(n + 1)]

    result = []
    for i in range(len(edges) - 1):
        b_lo, b_hi = edges[i], edges[i + 1]
        # Last bucket includes the maximum value.
        if i == len(edges) - 2:
            count = sum(1 for v in values if b_lo <= v <= b_hi)
        else:
            count = sum(1 for v in values if b_lo <= v < b_hi)
        result.append({
            "range": f"{_fmt_money(b_lo)}-{_fmt_money(b_hi)}",
            "count": count,
            "min": round(b_lo, 2),
            "max": round(b_hi, 2),
        })
    return result


def get_department_performance(db: Session):
    results = db.query(
        Employee.department,
        func.avg(Employee.kpi_score).label("avg_kpi"),
        func.count(Employee.id).label("count"),
    ).filter(Employee.department.isnot(None), Employee.department != "")\
        .group_by(Employee.department).all()
    data = [
        {"department": r[0], "avg_kpi": round(r[1] or 0, 2), "count": r[2]}
        for r in results
    ]
    # Rank by average KPI so the chart reads as a leaderboard for any dataset.
    data.sort(key=lambda d: d["avg_kpi"], reverse=True)
    return data


def get_ninebox_distribution(db: Session):
    results = db.query(Employee.nine_box, func.count(Employee.id).label("count"))\
        .group_by(Employee.nine_box).all()
    return [{"box": r[0], "count": r[1]} for r in results if r[0] is not None]


def get_gender_distribution(db: Session):
    results = db.query(Employee.gender, func.count(Employee.id).label("count"))\
        .group_by(Employee.gender).all()
    return [{"gender": r[0], "count": r[1]} for r in results]


def get_performance_distribution(db: Session):
    results = db.query(Employee.performance_level, func.count(Employee.id).label("count"))\
        .group_by(Employee.performance_level).all()
    # Normalize keys (enum or str) and return in logical order, including zeros.
    counts = {}
    for level, count in results:
        key = getattr(level, "value", level)
        if key is not None:
            counts[str(key)] = counts.get(str(key), 0) + count
    order = ["Low", "Medium", "High"]
    ordered = [{"level": lvl, "count": counts.pop(lvl, 0)} for lvl in order]
    # Append any unexpected levels from custom data so nothing is hidden.
    ordered.extend({"level": lvl, "count": c} for lvl, c in counts.items())
    return ordered
