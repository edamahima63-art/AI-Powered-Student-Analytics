"""
Student router — all endpoints are scoped to the authenticated student.
The backend NEVER accepts a student ID from the URL/client for private data.
It always uses the JWT-verified user identity.
"""
import sys
from pathlib import Path
import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Ensure backend directory is in sys.path when running router directly
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from database import (
    get_db, User, StudentProfile, SubjectResult, GpaRecord,
    AttendanceRecord, Recommendation, RiskAssessment, StudyTask, Notification,
    Assessment, AssessmentSubmission, Quiz, QuizQuestion, QuizAttempt
)
from auth_utils import get_current_user, require_role

router = APIRouter()


# ─── Helper: get the student's profile or 404 ────────────────────────────────

def _get_profile(user: User, db: Session) -> StudentProfile:
    """Always query the DB explicitly — never rely on lazy loading."""
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == user.id
    ).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found. Please contact your administrator to set up your academic profile."
        )
    return profile


# ─── Dashboard (aggregated) ──────────────────────────────────────────────────

@router.get("/dashboard")
def get_dashboard(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    profile = _get_profile(current_user, db)

    results = db.query(SubjectResult).filter(
        SubjectResult.student_id == profile.id,
        SubjectResult.semester == profile.semester
    ).all()

    attendance_records = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == profile.id,
        AttendanceRecord.semester == profile.semester
    ).all()

    # ── Compute stats from actual DB records ──────────────────────────────
    if not results:
        return {
            "hasData": False,
            "message": "No academic records available yet. Your dashboard will update when your academic information is added."
        }

    avg_marks = round(sum(r.marks for r in results) / len(results), 1)
    gpa = round(avg_marks / 10, 1)

    attendance_pct = (
        round(sum(a.pct for a in attendance_records) / len(attendance_records), 1)
        if attendance_records else 0
    )

    # GPA history for trend chart (monthly)
    gpa_monthly = db.query(GpaRecord).filter(
        GpaRecord.student_id == profile.id,
        GpaRecord.period_type == "month"
    ).all()

    # Actions: subjects below target
    action_items = []
    for r in sorted(results, key=lambda x: x.marks):
        if r.marks < r.target:
            action_items.append({
                "title": f"Improve {r.subject} — currently {r.marks:.0f}/{r.max_marks:.0f}",
                "reason": f"Your marks ({r.marks:.0f}) are below your target ({r.target:.0f}). Revise recent topics and attempt practice problems.",
                "priority": "high" if r.marks < (r.target - 10) else "medium"
            })

    # Study tasks (upcoming)
    tasks = db.query(StudyTask).filter(
        StudyTask.user_id == current_user.id,
        StudyTask.completed == False
    ).order_by(StudyTask.due_date).limit(5).all()

    # Risk
    risk = db.query(RiskAssessment).filter(RiskAssessment.student_id == profile.id).first()

    # GPA change (last two monthly records)
    gpa_change = 0.0
    if len(gpa_monthly) >= 2:
        gpa_change = round(gpa_monthly[-1].gpa - gpa_monthly[-2].gpa, 1)

    # Attendance trend
    attendance_trend = [{"week": a.week_label, "pct": a.pct} for a in attendance_records]

    # Subject performance for chart
    subject_perf = [
        {"subject": r.subject, "marks": r.marks, "max": r.max_marks, "grade": r.grade or ""}
        for r in results
    ]

    # GPA perf trend
    gpa_trend = [{"month": g.period, "gpa": g.gpa} for g in gpa_monthly]

    # Assignments (tasks as proxy)
    all_tasks = db.query(StudyTask).filter(StudyTask.user_id == current_user.id).all()
    completed_tasks = [t for t in all_tasks if t.completed]

    return {
        "hasData": True,
        "currentSemester": f"Semester {profile.semester}",
        "gpa": gpa,
        "gpaChange": gpa_change,
        "attendancePct": attendance_pct,
        "attendanceChange": 0,
        "assignmentsCompleted": len(completed_tasks),
        "assignmentsTotal": len(all_tasks),
        "overallProgress": round((avg_marks / 100) * 100),
        "riskLevel": risk.risk_level if risk else "Unknown",
        "riskScore": risk.risk_score if risk else 0,
        "performanceTrend": gpa_trend,
        "attendanceTrend": attendance_trend,
        "subjectPerformance": subject_perf,
        "actionItems": action_items[:5],
        "upcomingActivities": [
            {"title": t.title, "date": t.due_date or "TBD", "type": "task"}
            for t in tasks
        ],
    }


# ─── Subjects / Results ──────────────────────────────────────────────────────

@router.get("/results")
def get_results(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    profile = _get_profile(current_user, db)
    results = db.query(SubjectResult).filter(
        SubjectResult.student_id == profile.id
    ).order_by(SubjectResult.semester.desc(), SubjectResult.subject).all()

    subjects = []
    for r in results:
        subjects.append({
            "id": r.id,
            "subject": r.subject,
            "code": r.code,
            "marks": r.marks,
            "max": r.max_marks,
            "grade": r.grade,
            "credits": r.credits,
            "teacher": r.teacher,
            "target": r.target,
            "semester": r.semester,
        })
    return {"results": subjects, "semester": profile.semester}


# ─── Attendance ──────────────────────────────────────────────────────────────

@router.get("/attendance")
def get_attendance(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    profile = _get_profile(current_user, db)
    records = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == profile.id
    ).order_by(AttendanceRecord.semester).all()

    trend = [{"week": r.week_label, "pct": r.pct, "semester": r.semester} for r in records]
    avg = round(sum(r.pct for r in records) / len(records), 1) if records else 0

    return {"trend": trend, "averagePct": avg, "semester": profile.semester}


# ─── Progress (multi-semester) ───────────────────────────────────────────────

@router.get("/progress")
def get_progress(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    profile = _get_profile(current_user, db)

    gpa_by_month = db.query(GpaRecord).filter(
        GpaRecord.student_id == profile.id,
        GpaRecord.period_type == "month"
    ).all()

    gpa_by_sem = db.query(GpaRecord).filter(
        GpaRecord.student_id == profile.id,
        GpaRecord.period_type == "semester"
    ).all()

    attendance_by_sem = {}
    all_att = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == profile.id).all()
    for a in all_att:
        sem_key = f"Sem {a.semester}"
        if sem_key not in attendance_by_sem:
            attendance_by_sem[sem_key] = []
        attendance_by_sem[sem_key].append(a.pct)

    sem_data = []
    for g in gpa_by_sem:
        att = attendance_by_sem.get(g.period, [])
        sem_data.append({
            "sem": g.period,
            "gpa": g.gpa,
            "attendance": round(sum(att) / len(att), 1) if att else 0,
            "assignments": 0,  # expanded in future
        })

    # Goals
    results = db.query(SubjectResult).filter(
        SubjectResult.student_id == profile.id,
        SubjectResult.semester == profile.semester
    ).all()
    avg = sum(r.marks for r in results) / len(results) if results else 0
    current_gpa = round(avg / 10, 1)
    current_att = round(sum(a.pct for a in all_att) / len(all_att), 1) if all_att else 0
    all_tasks = db.query(StudyTask).filter(StudyTask.user_id == current_user.id).all()
    completed = sum(1 for t in all_tasks if t.completed)
    subjects_on_target = sum(1 for r in results if r.marks >= r.target)

    goals = [
        {"goal": "Achieve 8.5 GPA", "current": current_gpa, "target": 8.5, "unit": "GPA",
         "pct": min(100, round((current_gpa / 8.5) * 100))},
        {"goal": "Maintain 90% Attendance", "current": current_att, "target": 90, "unit": "%",
         "pct": min(100, round((current_att / 90) * 100))},
        {"goal": "Complete All Study Tasks", "current": completed, "target": max(len(all_tasks), 1),
         "unit": "done", "pct": min(100, round((completed / max(len(all_tasks), 1)) * 100))},
        {"goal": f"Score ≥Target in All Subjects", "current": subjects_on_target, "target": len(results),
         "unit": "subjects", "pct": min(100, round((subjects_on_target / max(len(results), 1)) * 100))},
    ]

    return {
        "semesterData": sem_data,
        "monthlyGpa": [{"month": g.period, "gpa": g.gpa} for g in gpa_by_month],
        "goals": goals,
        "currentSemester": profile.semester,
    }


# ─── Recommendations ─────────────────────────────────────────────────────────

@router.get("/recommendations")
def get_recommendations(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    profile = _get_profile(current_user, db)
    recs = db.query(Recommendation).filter(
        Recommendation.student_id == profile.id
    ).order_by(Recommendation.created_at.desc()).all()

    return {
        "recommendations": [
            {
                "id": r.id,
                "title": r.title,
                "explanation": r.explanation,
                "indicator": r.indicator,
                "action": r.action,
                "priority": r.priority,
                "category": r.category,
                "completed": r.completed,
                "createdAt": r.created_at.strftime("%Y-%m-%d"),
            }
            for r in recs
        ]
    }


@router.patch("/recommendations/{rec_id}")
def update_recommendation(
    rec_id: int,
    body: dict,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    profile = _get_profile(current_user, db)
    rec = db.query(Recommendation).filter(
        Recommendation.id == rec_id,
        Recommendation.student_id == profile.id   # ← authorization check
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found or access denied")
    if "completed" in body:
        rec.completed = body["completed"]
    db.commit()
    return {"id": rec.id, "completed": rec.completed}


# ─── Risk Assessment ─────────────────────────────────────────────────────────

@router.get("/risk")
def get_risk(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    profile = _get_profile(current_user, db)
    risk = db.query(RiskAssessment).filter(RiskAssessment.student_id == profile.id).first()
    if not risk:
        return {"riskLevel": "Unknown", "riskScore": 0, "factors": {}}
    # factors is stored as JSON string in Text column
    try:
        factors = json.loads(risk.factors) if risk.factors else {}
    except Exception:
        factors = {}
    return {
        "riskLevel": risk.risk_level,
        "riskScore": risk.risk_score,
        "factors": factors,
        "updatedAt": risk.updated_at.strftime("%Y-%m-%d") if risk.updated_at else None,
    }


# ─── Study Tasks ─────────────────────────────────────────────────────────────

@router.get("/study-tasks")
def get_tasks(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    tasks = db.query(StudyTask).filter(StudyTask.user_id == current_user.id).order_by(StudyTask.due_date).all()
    return {"tasks": [_task_dict(t) for t in tasks]}


@router.post("/study-tasks", status_code=201)
def create_task(
    body: dict,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    task = StudyTask(
        user_id=current_user.id,
        title=body.get("title", ""),
        subject=body.get("subject", ""),
        due_date=body.get("dueDate", ""),
        priority=body.get("priority", "medium"),
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return _task_dict(task)


@router.patch("/study-tasks/{task_id}")
def update_task(
    task_id: int,
    body: dict,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    task = db.query(StudyTask).filter(
        StudyTask.id == task_id,
        StudyTask.user_id == current_user.id  # ← authorization
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if "completed" in body:
        task.completed = body["completed"]
    if "title" in body:
        task.title = body["title"]
    db.commit()
    return _task_dict(task)


@router.delete("/study-tasks/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    task = db.query(StudyTask).filter(
        StudyTask.id == task_id,
        StudyTask.user_id == current_user.id  # ← authorization
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()


# ─── Notifications ───────────────────────────────────────────────────────────

@router.get("/notifications")
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    return {
        "notifications": [
            {
                "id": n.id, "type": n.type, "title": n.title,
                "message": n.message, "read": n.read,
                "time": _time_ago(n.created_at)
            }
            for n in notifs
        ],
        "unread": sum(1 for n in notifs if not n.read)
    }


@router.patch("/notifications/{notif_id}/read")
def mark_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id  # ← authorization
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read = True
    db.commit()
    return {"id": notif_id, "read": True}


@router.patch("/notifications/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.read == False
    ).update({"read": True})
    db.commit()
    return {"message": "All notifications marked read"}


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _task_dict(t: StudyTask) -> dict:
    return {
        "id": t.id, "title": t.title, "subject": t.subject,
        "dueDate": t.due_date, "priority": t.priority,
        "completed": t.completed,
        "createdAt": t.created_at.strftime("%Y-%m-%d"),
    }


def _time_ago(dt: datetime) -> str:
    diff = datetime.utcnow() - dt
    days = diff.days
    if days == 0:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours != 1 else ''} ago" if hours > 0 else "Just now"
    if days == 1:
        return "1 day ago"
    return f"{days} days ago"


# ─── Assessments Endpoints ───────────────────────────────────────────────────

@router.get("/assessments")
def get_assessments(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    profile = _get_profile(current_user, db)
    assessments = db.query(Assessment).filter(
        Assessment.semester == profile.semester
    ).order_by(Assessment.due_date.asc()).all()

    subs = {
        s.assessment_id: s for s in db.query(AssessmentSubmission).filter(
            AssessmentSubmission.student_id == profile.id
        ).all()
    }

    result_list = []
    completed_count = 0
    graded_scores = []

    for a in assessments:
        sub = subs.get(a.id)
        if sub:
            if sub.status == "Graded" and sub.percentage is not None:
                graded_scores.append(sub.percentage)
                completed_count += 1
            elif sub.status == "Submitted":
                completed_count += 1

            sub_info = {
                "id": sub.id,
                "status": sub.status,
                "marksObtained": sub.marks_obtained,
                "maxMarks": sub.max_marks or a.max_marks,
                "percentage": sub.percentage,
                "grade": sub.grade,
                "feedback": sub.feedback,
                "submissionText": sub.submission_text,
                "submittedAt": sub.submitted_at.strftime("%Y-%m-%d %H:%M") if sub.submitted_at else None,
                "gradedAt": sub.graded_at.strftime("%Y-%m-%d %H:%M") if sub.graded_at else None,
            }
        else:
            sub_info = {
                "id": None,
                "status": "Pending",
                "marksObtained": None,
                "maxMarks": a.max_marks,
                "percentage": None,
                "grade": None,
                "feedback": None,
                "submissionText": None,
                "submittedAt": None,
                "gradedAt": None,
            }

        result_list.append({
            "id": a.id,
            "title": a.title,
            "subject": a.subject,
            "code": a.code,
            "type": a.type,
            "description": a.description,
            "maxMarks": a.max_marks,
            "weightagePct": a.weightage_pct,
            "semester": a.semester,
            "dueDate": a.due_date,
            "submission": sub_info,
        })

    avg_score = round(sum(graded_scores) / len(graded_scores), 1) if graded_scores else 0

    return {
        "assessments": result_list,
        "semester": profile.semester,
        "stats": {
            "total": len(result_list),
            "completed": completed_count,
            "pending": len(result_list) - completed_count,
            "averageScore": avg_score,
            "gradedCount": len(graded_scores),
        }
    }


@router.post("/assessments/{assessment_id}/submit")
def submit_assessment(
    assessment_id: int,
    body: dict,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    profile = _get_profile(current_user, db)
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    submission_text = body.get("submissionText", "").strip()
    if not submission_text:
        raise HTTPException(status_code=400, detail="Submission text / solution cannot be empty")

    sub = db.query(AssessmentSubmission).filter(
        AssessmentSubmission.assessment_id == assessment_id,
        AssessmentSubmission.student_id == profile.id
    ).first()

    now = datetime.utcnow()
    word_count = len(submission_text.split())
    if word_count > 60:
        pct = 92.0
        grade = "A+"
        feedback = "Comprehensive solution with great technical depth and clear methodology."
    elif word_count > 30:
        pct = 84.0
        grade = "A"
        feedback = "Good submission covering key conceptual points with appropriate explanations."
    else:
        pct = 76.0
        grade = "B+"
        feedback = "Acceptable submission. Consider providing more detailed derivations and examples next time."

    marks = round((pct / 100.0) * assessment.max_marks, 1)

    if not sub:
        sub = AssessmentSubmission(
            assessment_id=assessment_id,
            student_id=profile.id,
            status="Graded",
            marks_obtained=marks,
            max_marks=assessment.max_marks,
            percentage=pct,
            grade=grade,
            feedback=feedback,
            submission_text=submission_text,
            submitted_at=now,
            graded_at=now,
        )
        db.add(sub)
    else:
        sub.status = "Graded"
        sub.marks_obtained = marks
        sub.max_marks = assessment.max_marks
        sub.percentage = pct
        sub.grade = grade
        sub.feedback = feedback
        sub.submission_text = submission_text
        sub.submitted_at = now
        sub.graded_at = now

    db.add(Notification(
        user_id=current_user.id,
        type="success",
        title=f"Assessment Graded: {assessment.title}",
        message=f"You scored {marks}/{assessment.max_marks} ({pct}%, Grade {grade}). Feedback: {feedback}"
    ))

    db.commit()
    db.refresh(sub)

    return {
        "id": sub.id,
        "assessmentId": assessment.id,
        "status": sub.status,
        "marksObtained": sub.marks_obtained,
        "maxMarks": sub.max_marks,
        "percentage": sub.percentage,
        "grade": sub.grade,
        "feedback": sub.feedback,
        "submittedAt": sub.submitted_at.strftime("%Y-%m-%d %H:%M"),
        "gradedAt": sub.graded_at.strftime("%Y-%m-%d %H:%M"),
    }


# ─── Quizzes Endpoints ───────────────────────────────────────────────────────

@router.get("/quizzes")
def get_quizzes(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    profile = _get_profile(current_user, db)
    quizzes = db.query(Quiz).filter(Quiz.semester == profile.semester).order_by(Quiz.id.asc()).all()

    attempts = db.query(QuizAttempt).filter(QuizAttempt.student_id == profile.id).all()
    attempts_by_quiz = {}
    for att in attempts:
        if att.quiz_id not in attempts_by_quiz:
            attempts_by_quiz[att.quiz_id] = []
        attempts_by_quiz[att.quiz_id].append(att)

    quiz_list = []
    passed_count = 0

    for q in quizzes:
        q_attempts = attempts_by_quiz.get(q.id, [])
        best_score = max([a.score for a in q_attempts], default=None)
        best_pct = max([a.percentage for a in q_attempts], default=None)
        last_attempt = max(q_attempts, key=lambda a: a.completed_at) if q_attempts else None
        has_passed = any(a.passed for a in q_attempts)
        if has_passed:
            passed_count += 1

        quiz_list.append({
            "id": q.id,
            "title": q.title,
            "subject": q.subject,
            "code": q.code,
            "topic": q.topic,
            "description": q.description,
            "difficulty": q.difficulty,
            "durationMinutes": q.duration_minutes,
            "passPercentage": q.pass_percentage,
            "questionCount": len(q.questions),
            "attemptsCount": len(q_attempts),
            "bestScore": best_score,
            "bestPercentage": best_pct,
            "passed": has_passed,
            "lastAttemptDate": last_attempt.completed_at.strftime("%Y-%m-%d") if last_attempt else None,
        })

    total_attempts = len(attempts)
    overall_accuracy = (
        round(sum(a.percentage for a in attempts) / total_attempts, 1)
        if total_attempts > 0 else 0
    )

    return {
        "quizzes": quiz_list,
        "stats": {
            "totalAvailable": len(quizzes),
            "quizzesAttempted": len(attempts_by_quiz),
            "totalAttempts": total_attempts,
            "passedCount": passed_count,
            "overallAccuracy": overall_accuracy,
        },
        "semester": profile.semester
    }


@router.get("/quizzes/{quiz_id}")
def get_quiz_detail(
    quiz_id: int,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    profile = _get_profile(current_user, db)
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = []
    for q in quiz.questions:
        questions.append({
            "id": q.id,
            "questionText": q.question_text,
            "options": {
                "A": q.option_a,
                "B": q.option_b,
                "C": q.option_c,
                "D": q.option_d,
            },
            "marks": q.marks,
        })

    return {
        "id": quiz.id,
        "title": quiz.title,
        "subject": quiz.subject,
        "code": quiz.code,
        "topic": quiz.topic,
        "description": quiz.description,
        "difficulty": quiz.difficulty,
        "durationMinutes": quiz.duration_minutes,
        "passPercentage": quiz.pass_percentage,
        "questions": questions,
        "totalQuestions": len(questions),
    }


@router.post("/quizzes/{quiz_id}/submit")
def submit_quiz(
    quiz_id: int,
    body: dict,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    profile = _get_profile(current_user, db)
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    user_answers = body.get("answers", {})
    time_taken = int(body.get("timeTakenSeconds", 0))

    questions = quiz.questions
    total_q = len(questions)
    correct_count = 0
    incorrect_count = 0
    unanswered_count = 0
    total_score = 0.0
    max_score = sum(q.marks for q in questions) if questions else 1.0

    breakdown = []
    for q in questions:
        selected = user_answers.get(str(q.id)) or user_answers.get(q.id)
        if not selected:
            unanswered_count += 1
            is_correct = False
        elif selected.strip().upper() == q.correct_option.strip().upper():
            correct_count += 1
            total_score += q.marks
            is_correct = True
        else:
            incorrect_count += 1
            is_correct = False

        breakdown.append({
            "questionId": q.id,
            "questionText": q.question_text,
            "options": {
                "A": q.option_a,
                "B": q.option_b,
                "C": q.option_c,
                "D": q.option_d,
            },
            "selectedOption": selected,
            "correctOption": q.correct_option,
            "isCorrect": is_correct,
            "explanation": q.explanation,
            "marks": q.marks if is_correct else 0,
            "maxMarks": q.marks,
        })

    pct = round((total_score / max_score) * 100, 1) if max_score > 0 else 0
    passed = pct >= quiz.pass_percentage

    attempt = QuizAttempt(
        quiz_id=quiz.id,
        student_id=profile.id,
        score=total_score,
        max_score=max_score,
        percentage=pct,
        passed=passed,
        total_questions=total_q,
        correct_answers=correct_count,
        incorrect_answers=incorrect_count,
        unanswered=unanswered_count,
        answers_json=json.dumps(breakdown),
        time_taken_seconds=time_taken,
        completed_at=datetime.utcnow()
    )
    db.add(attempt)

    db.add(Notification(
        user_id=current_user.id,
        type="success" if passed else "warning",
        title=f"Quiz Completed: {quiz.title}",
        message=f"You scored {total_score:.0f}/{max_score:.0f} ({pct}%) in {quiz.subject} Quiz! {'Passed with flying colors!' if passed else 'Keep practicing.'}"
    ))

    db.commit()
    db.refresh(attempt)

    return {
        "attemptId": attempt.id,
        "quizId": quiz.id,
        "quizTitle": quiz.title,
        "subject": quiz.subject,
        "code": quiz.code,
        "score": total_score,
        "maxScore": max_score,
        "percentage": pct,
        "passed": passed,
        "passPercentage": quiz.pass_percentage,
        "totalQuestions": total_q,
        "correctAnswers": correct_count,
        "incorrectAnswers": incorrect_count,
        "unanswered": unanswered_count,
        "timeTakenSeconds": time_taken,
        "completedAt": attempt.completed_at.strftime("%Y-%m-%d %H:%M"),
        "breakdown": breakdown,
    }


@router.get("/quizzes/results/history")
def get_quiz_results_history(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    profile = _get_profile(current_user, db)
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.student_id == profile.id
    ).order_by(QuizAttempt.completed_at.desc()).all()

    history = []
    for att in attempts:
        quiz = att.quiz
        history.append({
            "id": att.id,
            "quizId": att.quiz_id,
            "quizTitle": quiz.title if quiz else "Subject Quiz",
            "subject": quiz.subject if quiz else "General",
            "code": quiz.code if quiz else "",
            "score": att.score,
            "maxScore": att.max_score,
            "percentage": att.percentage,
            "passed": att.passed,
            "totalQuestions": att.total_questions,
            "correctAnswers": att.correct_answers,
            "incorrectAnswers": att.incorrect_answers,
            "timeTakenSeconds": att.time_taken_seconds,
            "completedAt": att.completed_at.strftime("%Y-%m-%d %H:%M"),
        })

    subject_map = {}
    for h in history:
        subj = h["subject"]
        if subj not in subject_map:
            subject_map[subj] = {"subject": subj, "totalAttempts": 0, "scores": [], "passedCount": 0}
        subject_map[subj]["totalAttempts"] += 1
        subject_map[subj]["scores"].append(h["percentage"])
        if h["passed"]:
            subject_map[subj]["passedCount"] += 1

    subject_stats = [
        {
            "subject": k,
            "attempts": v["totalAttempts"],
            "avgScore": round(sum(v["scores"]) / len(v["scores"]), 1),
            "passRate": round((v["passedCount"] / v["totalAttempts"]) * 100, 1),
        }
        for k, v in subject_map.items()
    ]

    return {
        "history": history,
        "subjectStats": subject_stats,
        "totalAttempts": len(history),
    }


@router.get("/quizzes/results/{attempt_id}")
def get_quiz_attempt_detail(
    attempt_id: int,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    profile = _get_profile(current_user, db)
    attempt = db.query(QuizAttempt).filter(
        QuizAttempt.id == attempt_id,
        QuizAttempt.student_id == profile.id
    ).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Quiz result not found")

    breakdown = []
    if attempt.answers_json:
        try:
            breakdown = json.loads(attempt.answers_json)
        except Exception:
            breakdown = []

    quiz = attempt.quiz
    return {
        "attemptId": attempt.id,
        "quizId": attempt.quiz_id,
        "quizTitle": quiz.title if quiz else "Subject Quiz",
        "subject": quiz.subject if quiz else "Subject",
        "code": quiz.code if quiz else "",
        "score": attempt.score,
        "maxScore": attempt.max_score,
        "percentage": attempt.percentage,
        "passed": attempt.passed,
        "passPercentage": quiz.pass_percentage if quiz else 60.0,
        "totalQuestions": attempt.total_questions,
        "correctAnswers": attempt.correct_answers,
        "incorrectAnswers": attempt.incorrect_answers,
        "unanswered": attempt.unanswered,
        "timeTakenSeconds": attempt.time_taken_seconds,
        "completedAt": attempt.completed_at.strftime("%Y-%m-%d %H:%M"),
        "breakdown": breakdown,
    }
