"""
Faculty & Admin data management router.
Endpoints for: viewing students, entering marks, recording attendance,
adding subject results, and managing academic records.
All write operations require 'faculty' or 'admin' role.
"""
import sys
from pathlib import Path
import json, csv, io
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Ensure backend directory is in sys.path when running router directly
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from database import (
    get_db, User, StudentProfile, SubjectResult, GpaRecord,
    AttendanceRecord, Recommendation, RiskAssessment, StudyTask, Notification
)
from auth_utils import require_role, get_current_user

router = APIRouter()


# ─── Pydantic schemas ─────────────────────────────────────────────────────────

class SubjectResultIn(BaseModel):
    student_email: str
    subject: str
    code: Optional[str] = ""
    marks: float
    max_marks: float = 100
    grade: Optional[str] = None
    semester: int
    credits: int = 3
    teacher: Optional[str] = ""
    target: float = 75

class SubjectResultUpdate(BaseModel):
    subject: Optional[str] = None
    code: Optional[str] = None
    marks: Optional[float] = None
    max_marks: Optional[float] = None
    grade: Optional[str] = None
    semester: Optional[int] = None
    credits: Optional[int] = None
    teacher: Optional[str] = None
    target: Optional[float] = None

class AttendanceIn(BaseModel):
    student_email: str
    week_label: str
    pct: float
    semester: int

class AttendanceUpdate(BaseModel):
    week_label: Optional[str] = None
    pct: Optional[float] = None
    semester: Optional[int] = None

class RecommendationIn(BaseModel):
    student_email: str
    title: str
    explanation: Optional[str] = ""
    indicator: Optional[str] = ""
    action: Optional[str] = ""
    priority: str = "medium"
    category: str = "Academic"

class RecommendationUpdate(BaseModel):
    title: Optional[str] = None
    explanation: Optional[str] = None
    indicator: Optional[str] = None
    action: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    completed: Optional[bool] = None

class StudentProfileUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    student_code: Optional[str] = None

class RiskIn(BaseModel):
    student_email: str
    risk_level: str   # Low / Medium / High
    risk_score: float
    factors: Optional[dict] = {}

class NotificationIn(BaseModel):
    student_email: str
    type: str = "info"
    title: str
    message: str


# ─── Helper ───────────────────────────────────────────────────────────────────

def _get_student(email: str, db: Session) -> tuple:
    """Returns (user, profile) or raises 404."""
    user = db.query(User).filter(User.email == email, User.role == "student").first()
    if not user:
        raise HTTPException(404, f"No student account found with email: {email}")
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(404, f"Student profile not found for {email}. The account exists but has no academic profile yet.")
    return user, profile


# ─── List all students (faculty/admin) ───────────────────────────────────────

@router.get("/students")
def list_students(
    current_user: User = Depends(require_role("faculty", "admin", "advisor")),
    db: Session = Depends(get_db),
):
    """Return all student accounts with their profile info and subject count."""
    students = db.query(User).filter(User.role == "student").all()
    result = []
    for u in students:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == u.id).first()
        subject_count = 0
        avg_marks = None
        if profile:
            results = db.query(SubjectResult).filter(SubjectResult.student_id == profile.id).all()
            subject_count = len(results)
            if results:
                avg_marks = round(sum(r.marks for r in results) / len(results), 1)
        result.append({
            "id": u.id,
            "uid": u.uid,
            "name": u.name,
            "email": u.email,
            "department": u.department or "",
            "studentCode": profile.student_code if profile else None,
            "semester": profile.semester if profile else None,
            "hasProfile": profile is not None,
            "subjectCount": subject_count,
            "avgMarks": avg_marks,
        })
    return {"students": result, "total": len(result)}


@router.get("/students/{email}/records")
def get_student_records(
    email: str,
    current_user: User = Depends(require_role("faculty", "admin", "advisor")),
    db: Session = Depends(get_db),
):
    """Get full academic record for a specific student by email."""
    user, profile = _get_student(email, db)
    results = db.query(SubjectResult).filter(SubjectResult.student_id == profile.id).all()
    attendance = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == profile.id).all()
    recs = db.query(Recommendation).filter(Recommendation.student_id == profile.id).all()
    risk = db.query(RiskAssessment).filter(RiskAssessment.student_id == profile.id).first()
    
    return {
        "student": {"id": user.id, "name": user.name, "email": user.email,
                    "department": user.department, "studentCode": profile.student_code,
                    "semester": profile.semester},
        "subjectResults": [
            {"id": r.id, "subject": r.subject, "code": r.code, "marks": r.marks,
             "maxMarks": r.max_marks, "grade": r.grade, "semester": r.semester,
             "credits": r.credits, "teacher": r.teacher, "target": r.target}
            for r in results
        ],
        "attendance": [
            {"id": a.id, "week": a.week_label, "pct": a.pct, "semester": a.semester}
            for a in attendance
        ],
        "recommendations": [
            {"id": r.id, "title": r.title, "explanation": r.explanation, "action": r.action,
             "priority": r.priority, "category": r.category, "completed": r.completed}
            for r in recs
        ],
        "risk": {
            "riskLevel": risk.risk_level if risk else "Low",
            "riskScore": risk.risk_score if risk else 0.1,
            "factors": json.loads(risk.factors) if risk and risk.factors else {},
        } if risk else None,
    }


# ─── Marks entry ──────────────────────────────────────────────────────────────

@router.post("/marks", status_code=201)
def add_marks(
    body: SubjectResultIn,
    current_user: User = Depends(require_role("faculty", "admin")),
    db: Session = Depends(get_db),
):
    """Add or update a subject result for a student."""
    _, profile = _get_student(body.student_email, db)

    # Auto-assign grade if not provided
    grade = body.grade
    if not grade:
        pct = (body.marks / body.max_marks) * 100
        if pct >= 90: grade = "A+"
        elif pct >= 80: grade = "A"
        elif pct >= 70: grade = "B+"
        elif pct >= 60: grade = "B"
        elif pct >= 50: grade = "C"
        else: grade = "F"

    # Check for duplicate
    existing = db.query(SubjectResult).filter(
        SubjectResult.student_id == profile.id,
        SubjectResult.subject == body.subject,
        SubjectResult.semester == body.semester,
    ).first()

    if existing:
        # Update existing
        existing.marks = body.marks
        existing.max_marks = body.max_marks
        existing.grade = grade
        existing.credits = body.credits
        existing.teacher = body.teacher
        existing.target = body.target
        existing.code = body.code
        existing.updated_at = datetime.utcnow()
        db.commit()
        return {"message": f"Updated {body.subject} for {body.student_email}", "id": existing.id, "action": "updated"}

    result = SubjectResult(
        student_id=profile.id,
        subject=body.subject,
        code=body.code or "",
        marks=body.marks,
        max_marks=body.max_marks,
        grade=grade,
        semester=body.semester,
        credits=body.credits,
        teacher=body.teacher or "",
        target=body.target,
    )
    db.add(result)

    # Auto-recalculate GPA for this semester
    db.flush()
    _recalculate_gpa(profile.id, body.semester, db)

    # Auto-recalculate risk
    _recalculate_risk(profile.id, db)

    db.commit()
    db.refresh(result)
    return {"message": f"Added {body.subject} for {body.student_email}", "id": result.id, "action": "created"}


@router.put("/marks/{result_id}")
def update_marks(
    result_id: int,
    body: SubjectResultUpdate,
    current_user: User = Depends(require_role("faculty", "admin")),
    db: Session = Depends(get_db),
):
    """Update an existing subject result and recalculate GPA & risk."""
    result = db.query(SubjectResult).filter(SubjectResult.id == result_id).first()
    if not result:
        raise HTTPException(404, "Subject result not found")

    if body.subject is not None and body.subject.strip():
        result.subject = body.subject.strip()
    if body.code is not None:
        result.code = body.code.strip()
    if body.marks is not None:
        result.marks = body.marks
    if body.max_marks is not None and body.max_marks > 0:
        result.max_marks = body.max_marks
    if body.semester is not None:
        result.semester = body.semester
    if body.credits is not None:
        result.credits = body.credits
    if body.teacher is not None:
        result.teacher = body.teacher.strip()
    if body.target is not None:
        result.target = body.target

    # Recalculate grade
    if body.grade:
        result.grade = body.grade
    elif body.marks is not None or body.max_marks is not None:
        pct = (result.marks / result.max_marks) * 100
        if pct >= 90: result.grade = "A+"
        elif pct >= 80: result.grade = "A"
        elif pct >= 70: result.grade = "B+"
        elif pct >= 60: result.grade = "B"
        elif pct >= 50: result.grade = "C"
        else: result.grade = "F"

    result.updated_at = datetime.utcnow()
    db.flush()
    _recalculate_gpa(result.student_id, result.semester, db)
    _recalculate_risk(result.student_id, db)
    db.commit()
    db.refresh(result)
    return {
        "message": f"Updated {result.subject}",
        "id": result.id,
        "subject": result.subject,
        "marks": result.marks,
        "grade": result.grade,
        "action": "updated"
    }


@router.delete("/marks/{result_id}", status_code=204)
def delete_marks(
    result_id: int,
    current_user: User = Depends(require_role("faculty", "admin")),
    db: Session = Depends(get_db),
):
    """Delete a specific subject result."""
    result = db.query(SubjectResult).filter(SubjectResult.id == result_id).first()
    if not result:
        raise HTTPException(404, "Subject result not found")
    student_id = result.student_id
    semester = result.semester
    db.delete(result)
    db.flush()
    _recalculate_gpa(student_id, semester, db)
    _recalculate_risk(student_id, db)
    db.commit()


# ─── Attendance entry ─────────────────────────────────────────────────────────

@router.post("/attendance", status_code=201)
def add_attendance(
    body: AttendanceIn,
    current_user: User = Depends(require_role("faculty", "admin")),
    db: Session = Depends(get_db),
):
    """Add or update a weekly attendance record for a student."""
    _, profile = _get_student(body.student_email, db)

    existing = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == profile.id,
        AttendanceRecord.week_label == body.week_label,
        AttendanceRecord.semester == body.semester,
    ).first()

    if existing:
        existing.pct = body.pct
        db.flush()
        _recalculate_risk(profile.id, db)
        db.commit()
        return {"message": "Updated attendance", "id": existing.id, "action": "updated"}

    rec = AttendanceRecord(
        student_id=profile.id,
        week_label=body.week_label,
        pct=body.pct,
        semester=body.semester,
    )
    db.add(rec)
    db.flush()
    _recalculate_risk(profile.id, db)
    db.commit()
    db.refresh(rec)
    return {"message": "Attendance recorded", "id": rec.id, "action": "created"}


@router.put("/attendance/{record_id}")
def update_attendance_record(
    record_id: int,
    body: AttendanceUpdate,
    current_user: User = Depends(require_role("faculty", "admin")),
    db: Session = Depends(get_db),
):
    """Update an existing weekly attendance record."""
    rec = db.query(AttendanceRecord).filter(AttendanceRecord.id == record_id).first()
    if not rec:
        raise HTTPException(404, "Attendance record not found")

    if body.week_label is not None and body.week_label.strip():
        rec.week_label = body.week_label.strip()
    if body.pct is not None:
        rec.pct = body.pct
    if body.semester is not None:
        rec.semester = body.semester

    db.flush()
    _recalculate_risk(rec.student_id, db)
    db.commit()
    db.refresh(rec)
    return {"message": "Attendance updated", "id": rec.id, "action": "updated"}


@router.delete("/attendance/{record_id}", status_code=204)
def delete_attendance_record(
    record_id: int,
    current_user: User = Depends(require_role("faculty", "admin")),
    db: Session = Depends(get_db),
):
    """Delete an attendance record."""
    rec = db.query(AttendanceRecord).filter(AttendanceRecord.id == record_id).first()
    if not rec:
        raise HTTPException(404, "Attendance record not found")
    student_id = rec.student_id
    db.delete(rec)
    db.flush()
    _recalculate_risk(student_id, db)
    db.commit()


# ─── Recommendations entry ────────────────────────────────────────────────────

@router.post("/recommendations", status_code=201)
def add_recommendation(
    body: RecommendationIn,
    current_user: User = Depends(require_role("faculty", "admin", "advisor")),
    db: Session = Depends(get_db),
):
    """Add a recommendation for a student."""
    _, profile = _get_student(body.student_email, db)
    rec = Recommendation(
        student_id=profile.id,
        title=body.title,
        explanation=body.explanation,
        indicator=body.indicator,
        action=body.action,
        priority=body.priority,
        category=body.category,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {"message": "Recommendation added", "id": rec.id}


@router.put("/recommendations/{rec_id}")
def update_recommendation(
    rec_id: int,
    body: RecommendationUpdate,
    current_user: User = Depends(require_role("faculty", "admin", "advisor")),
    db: Session = Depends(get_db),
):
    """Update an existing recommendation."""
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(404, "Recommendation not found")
    if body.title is not None and body.title.strip():
        rec.title = body.title.strip()
    if body.explanation is not None:
        rec.explanation = body.explanation.strip()
    if body.indicator is not None:
        rec.indicator = body.indicator.strip()
    if body.action is not None:
        rec.action = body.action.strip()
    if body.priority is not None:
        rec.priority = body.priority
    if body.category is not None:
        rec.category = body.category
    if body.completed is not None:
        rec.completed = body.completed
    db.commit()
    db.refresh(rec)
    return {"message": "Recommendation updated", "id": rec.id}


@router.delete("/recommendations/{rec_id}", status_code=204)
def delete_recommendation(
    rec_id: int,
    current_user: User = Depends(require_role("faculty", "admin", "advisor")),
    db: Session = Depends(get_db),
):
    """Delete a recommendation."""
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(404, "Recommendation not found")
    db.delete(rec)
    db.commit()


# ─── Risk entry ───────────────────────────────────────────────────────────────

@router.post("/risk", status_code=201)
def set_risk(
    body: RiskIn,
    current_user: User = Depends(require_role("faculty", "admin")),
    db: Session = Depends(get_db),
):
    """Set or update risk assessment for a student."""
    _, profile = _get_student(body.student_email, db)
    existing = db.query(RiskAssessment).filter(RiskAssessment.student_id == profile.id).first()
    factors_str = json.dumps(body.factors or {})
    if existing:
        existing.risk_level = body.risk_level
        existing.risk_score = body.risk_score
        existing.factors = factors_str
        existing.updated_at = datetime.utcnow()
        db.commit()
        return {"message": "Risk updated"}
    db.add(RiskAssessment(
        student_id=profile.id, risk_level=body.risk_level,
        risk_score=body.risk_score, factors=factors_str
    ))
    db.commit()
    return {"message": "Risk created"}


# ─── Notification sender ──────────────────────────────────────────────────────

@router.post("/notify", status_code=201)
def send_notification(
    body: NotificationIn,
    current_user: User = Depends(require_role("faculty", "admin", "advisor")),
    db: Session = Depends(get_db),
):
    """Send a notification to a specific student."""
    user = db.query(User).filter(User.email == body.student_email).first()
    if not user:
        raise HTTPException(404, f"User not found: {body.student_email}")
    notif = Notification(
        user_id=user.id, type=body.type,
        title=body.title, message=body.message
    )
    db.add(notif)
    db.commit()
    return {"message": "Notification sent"}


# ─── Student Profile & Semester updater ─────────────────────────────────────

@router.put("/students/{email}/profile")
def update_student_profile(
    email: str,
    body: StudentProfileUpdate,
    current_user: User = Depends(require_role("faculty", "admin")),
    db: Session = Depends(get_db),
):
    """Update student basic profile (name, department, semester, student_code)."""
    user, profile = _get_student(email, db)
    if body.name is not None and body.name.strip():
        user.name = body.name.strip()
    if body.department is not None:
        user.department = body.department.strip()
    if body.semester is not None:
        if not (1 <= body.semester <= 8):
            raise HTTPException(400, "Semester must be between 1 and 8")
        profile.semester = body.semester
    if body.student_code is not None and body.student_code.strip():
        code = body.student_code.strip()
        existing = db.query(StudentProfile).filter(
            StudentProfile.student_code == code,
            StudentProfile.id != profile.id
        ).first()
        if existing:
            raise HTTPException(400, f"Student code '{code}' already taken by another student")
        profile.student_code = code

    db.commit()
    return {
        "message": f"Updated profile for {email}",
        "student": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "department": user.department,
            "studentCode": profile.student_code,
            "semester": profile.semester,
        }
    }


@router.patch("/students/{email}/semester")
def update_semester(
    email: str,
    body: dict,
    current_user: User = Depends(require_role("faculty", "admin")),
    db: Session = Depends(get_db),
):
    """Update a student's current semester."""
    _, profile = _get_student(email, db)
    new_sem = int(body.get("semester", profile.semester))
    if not (1 <= new_sem <= 8):
        raise HTTPException(400, "Semester must be between 1 and 8")
    profile.semester = new_sem
    db.commit()
    return {"message": f"Semester updated to {new_sem}", "semester": new_sem}


# ─── CSV bulk import ──────────────────────────────────────────────────────────

@router.post("/import/marks-csv")
async def import_marks_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("faculty", "admin")),
    db: Session = Depends(get_db),
):
    """
    Bulk import marks from CSV.
    Required columns: student_email, subject, marks, max_marks, semester
    Optional columns: code, grade, credits, teacher, target
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV files are supported")

    content = await file.read()
    text = content.decode("utf-8-sig")  # handles BOM
    reader = csv.DictReader(io.StringIO(text))
    
    required = {"student_email", "subject", "marks", "semester"}
    if not required.issubset(set(reader.fieldnames or [])):
        raise HTTPException(400, f"CSV must have columns: {required}. Found: {reader.fieldnames}")

    created, updated, errors = 0, 0, []
    for i, row in enumerate(reader, start=2):
        try:
            email = row["student_email"].strip()
            subject = row["subject"].strip()
            marks = float(row["marks"])
            semester = int(row["semester"])
            max_marks = float(row.get("max_marks", 100) or 100)
            target = float(row.get("target", 75) or 75)
            credits = int(row.get("credits", 3) or 3)
            teacher = row.get("teacher", "").strip()
            code = row.get("code", "").strip()

            user = db.query(User).filter(User.email == email, User.role == "student").first()
            if not user:
                errors.append(f"Row {i}: Student not found: {email}")
                continue
            profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
            if not profile:
                errors.append(f"Row {i}: No profile for {email}")
                continue

            pct = (marks / max_marks) * 100
            if pct >= 90: grade = "A+"
            elif pct >= 80: grade = "A"
            elif pct >= 70: grade = "B+"
            elif pct >= 60: grade = "B"
            elif pct >= 50: grade = "C"
            else: grade = "F"

            existing = db.query(SubjectResult).filter(
                SubjectResult.student_id == profile.id,
                SubjectResult.subject == subject,
                SubjectResult.semester == semester,
            ).first()
            if existing:
                existing.marks = marks
                existing.max_marks = max_marks
                existing.grade = grade
                existing.credits = credits
                existing.teacher = teacher
                existing.target = target
                updated += 1
            else:
                db.add(SubjectResult(
                    student_id=profile.id, subject=subject, code=code,
                    marks=marks, max_marks=max_marks, grade=grade,
                    semester=semester, credits=credits, teacher=teacher, target=target
                ))
                created += 1

            _recalculate_gpa(profile.id, semester, db)
            _recalculate_risk(profile.id, db)

        except Exception as e:
            errors.append(f"Row {i}: {str(e)}")
    
    db.commit()
    return {
        "message": f"Import complete: {created} created, {updated} updated, {len(errors)} errors",
        "created": created, "updated": updated, "errors": errors
    }


@router.post("/import/attendance-csv")
async def import_attendance_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("faculty", "admin")),
    db: Session = Depends(get_db),
):
    """
    Bulk import attendance from CSV.
    Required columns: student_email, week_label, pct, semester
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV files are supported")
    content = await file.read()
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    required = {"student_email", "week_label", "pct", "semester"}
    if not required.issubset(set(reader.fieldnames or [])):
        raise HTTPException(400, f"CSV must have columns: {required}")

    created, updated, errors = 0, 0, []
    for i, row in enumerate(reader, start=2):
        try:
            email = row["student_email"].strip()
            week = row["week_label"].strip()
            pct = float(row["pct"])
            semester = int(row["semester"])

            user = db.query(User).filter(User.email == email, User.role == "student").first()
            if not user:
                errors.append(f"Row {i}: Student not found: {email}")
                continue
            profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
            if not profile:
                errors.append(f"Row {i}: No profile for {email}")
                continue

            existing = db.query(AttendanceRecord).filter(
                AttendanceRecord.student_id == profile.id,
                AttendanceRecord.week_label == week,
                AttendanceRecord.semester == semester,
            ).first()
            if existing:
                existing.pct = pct
                updated += 1
            else:
                db.add(AttendanceRecord(student_id=profile.id, week_label=week, pct=pct, semester=semester))
                created += 1
        except Exception as e:
            errors.append(f"Row {i}: {str(e)}")
    
    db.commit()
    return {"message": f"Import complete: {created} created, {updated} updated, {len(errors)} errors",
            "created": created, "updated": updated, "errors": errors}


# ─── Analytics alerts ─────────────────────────────────────────────────────────

@router.get("/alerts")
def get_alerts(
    current_user: User = Depends(require_role("faculty", "admin", "advisor")),
    db: Session = Depends(get_db),
):
    """Return at-risk students based on actual DB data."""
    students = db.query(User).filter(User.role == "student").all()
    alerts = []
    for u in students:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == u.id).first()
        if not profile:
            continue
        att = db.query(AttendanceRecord).filter(
            AttendanceRecord.student_id == profile.id,
            AttendanceRecord.semester == profile.semester,
        ).all()
        avg_att = round(sum(a.pct for a in att) / len(att), 1) if att else None
        results = db.query(SubjectResult).filter(
            SubjectResult.student_id == profile.id,
            SubjectResult.semester == profile.semester,
        ).all()
        avg_marks = round(sum(r.marks for r in results) / len(results), 1) if results else None

        if avg_att is not None and avg_att < 75:
            alerts.append({"student": u.name, "email": u.email, "dept": u.department or "N/A",
                           "issue": f"Attendance {avg_att}% — below 75% threshold", "severity": "High"})
        if avg_marks is not None and avg_marks < 50:
            alerts.append({"student": u.name, "email": u.email, "dept": u.department or "N/A",
                           "issue": f"Average marks {avg_marks}/100 — academic risk", "severity": "High"})
        elif avg_marks is not None and avg_marks < 65:
            alerts.append({"student": u.name, "email": u.email, "dept": u.department or "N/A",
                           "issue": f"Average marks {avg_marks}/100 — needs improvement", "severity": "Medium"})

    return {"alerts": alerts}


@router.get("/classes")
def get_classes(current_user: User = Depends(require_role("faculty", "admin"))):
    """Return class list (static for now — can be extended to DB-backed)."""
    return {"classes": [
        {"id": 1, "name": "Data Structures",   "code": "CS301", "students": 42, "semester": 4},
        {"id": 2, "name": "Algorithms",         "code": "CS302", "students": 42, "semester": 4},
        {"id": 3, "name": "Database Systems",   "code": "CS303", "students": 38, "semester": 4},
        {"id": 4, "name": "Operating Systems",  "code": "CS304", "students": 40, "semester": 4},
        {"id": 5, "name": "Computer Networks",  "code": "CS305", "students": 35, "semester": 4},
    ]}


# ─── Private helpers ──────────────────────────────────────────────────────────

def _recalculate_gpa(student_id: int, semester: int, db: Session):
    """Recompute monthly GPA record from current semester results."""
    results = db.query(SubjectResult).filter(
        SubjectResult.student_id == student_id,
        SubjectResult.semester == semester,
    ).all()
    if not results:
        return
    avg = sum(r.marks for r in results) / len(results)
    gpa = round(avg / 10, 2)
    month = datetime.utcnow().strftime("%b %Y")
    existing = db.query(GpaRecord).filter(
        GpaRecord.student_id == student_id,
        GpaRecord.period == month,
        GpaRecord.period_type == "month",
    ).first()
    if existing:
        existing.gpa = gpa
    else:
        db.add(GpaRecord(student_id=student_id, period=month, gpa=gpa, period_type="month"))

    sem_label = f"Sem {semester}"
    sem_existing = db.query(GpaRecord).filter(
        GpaRecord.student_id == student_id,
        GpaRecord.period == sem_label,
        GpaRecord.period_type == "semester",
    ).first()
    if sem_existing:
        sem_existing.gpa = gpa
    else:
        db.add(GpaRecord(student_id=student_id, period=sem_label, gpa=gpa, period_type="semester"))


def _recalculate_risk(student_id: int, db: Session):
    """Auto-compute risk level from attendance + marks + profile."""
    profile = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not profile:
        return
    results = db.query(SubjectResult).filter(
        SubjectResult.student_id == profile.id,
        SubjectResult.semester == profile.semester,
    ).all()
    att = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == profile.id,
        AttendanceRecord.semester == profile.semester,
    ).all()
    if not results and not att:
        return

    avg_marks = sum(r.marks for r in results) / len(results) if results else 75
    avg_att = sum(a.pct for a in att) / len(att) if att else 90

    score = 0.0
    if avg_att < 75:   score += 0.4
    elif avg_att < 85: score += 0.2
    if avg_marks < 50: score += 0.4
    elif avg_marks < 65: score += 0.25
    elif avg_marks < 75: score += 0.1
    below_target = sum(1 for r in results if r.marks < r.target) if results else 0
    if results and below_target / len(results) > 0.5: score += 0.2

    score = min(round(score, 2), 1.0)
    if score >= 0.5:   level = "High"
    elif score >= 0.25: level = "Medium"
    else:               level = "Low"

    factors = {
        "attendance": f"{avg_att:.1f}% avg attendance",
        "marks": f"{avg_marks:.1f}/100 avg marks",
        "below_target": f"{below_target}/{len(results)} subjects below target" if results else "No results",
    }
    existing = db.query(RiskAssessment).filter(RiskAssessment.student_id == profile.id).first()
    if existing:
        existing.risk_level = level
        existing.risk_score = score
        existing.factors = json.dumps(factors)
        existing.updated_at = datetime.utcnow()
    else:
        db.add(RiskAssessment(student_id=profile.id, risk_level=level,
                              risk_score=score, factors=json.dumps(factors)))
