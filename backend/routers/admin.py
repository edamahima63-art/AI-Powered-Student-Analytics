"""Admin router — institution-wide views with live DB data."""
import sys
from pathlib import Path

# Ensure backend directory is in sys.path when running router directly
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, User, StudentProfile, SubjectResult, AttendanceRecord, RiskAssessment
from auth_utils import require_role

router = APIRouter()

@router.get("/dashboard")
def admin_dashboard(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    total_students = db.query(StudentProfile).count()
    total_users = db.query(User).count()
    high_risk = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "High").count()
    medium_risk = db.query(RiskAssessment).filter(RiskAssessment.risk_level == "Medium").count()

    # Real institution GPA from subject results
    all_results = db.query(SubjectResult).all()
    inst_gpa = round(sum(r.marks for r in all_results) / len(all_results) / 10, 2) if all_results else 0

    # Real attendance average
    all_att = db.query(AttendanceRecord).all()
    inst_att = round(sum(a.pct for a in all_att) / len(all_att), 1) if all_att else 0

    dept_counts = {}
    for u in db.query(User).filter(User.role == "student").all():
        d = u.department or "Unassigned"
        dept_counts[d] = dept_counts.get(d, 0) + 1

    departments = [{"dept": d, "students": c, "avgGpa": inst_gpa, "highRisk": 0, "attendance": inst_att}
                   for d, c in dept_counts.items()]

    return {
        "totalStudents": total_students,
        "totalUsers": total_users,
        "highRiskStudents": high_risk,
        "mediumRiskStudents": medium_risk,
        "institutionGpa": inst_gpa,
        "institutionAttendance": inst_att,
        "departments": departments,
    }

@router.get("/users")
def get_users(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    users = db.query(User).all()
    return {"users": [
        {"id": u.uid, "name": u.name, "email": u.email,
         "role": u.role, "department": u.department or ""}
        for u in users
    ], "total": len(users)}
