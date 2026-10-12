"""
SQLAlchemy 1.4 compatible Database Models.
All academic records linked to students via foreign key.
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.types import JSON
from datetime import datetime

DATABASE_URL = "sqlite:///./eduinsight.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class User(Base):
    __tablename__ = "users"
    id         = Column(Integer, primary_key=True, index=True)
    uid        = Column(String, unique=True, index=True, nullable=False)
    email      = Column(String, unique=True, index=True, nullable=False)
    hashed_pw  = Column(String, nullable=False)
    name       = Column(String, nullable=False)
    role       = Column(String, nullable=False)
    department = Column(String, nullable=True)
    avatar     = Column(String, nullable=True)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student_profile = relationship("StudentProfile", back_populates="user",
                                   foreign_keys="StudentProfile.user_id", uselist=False)
    notifications   = relationship("Notification", back_populates="user")
    study_tasks     = relationship("StudyTask", back_populates="user")


class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id               = Column(Integer, primary_key=True)
    user_id          = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    student_code     = Column(String, unique=True, index=True)
    semester         = Column(Integer, default=1)
    linked_parent_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    user       = relationship("User", back_populates="student_profile", foreign_keys=[user_id])
    results    = relationship("SubjectResult", back_populates="student")
    attendance_records = relationship("AttendanceRecord", back_populates="student")
    recommendations    = relationship("Recommendation", back_populates="student")
    risk_assessment    = relationship("RiskAssessment", back_populates="student", uselist=False)
    gpa_records        = relationship("GpaRecord", back_populates="student")
    assessment_submissions = relationship("AssessmentSubmission", back_populates="student")
    quiz_attempts      = relationship("QuizAttempt", back_populates="student")


class SubjectResult(Base):
    __tablename__ = "subject_results"
    id         = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    subject    = Column(String, nullable=False)
    code       = Column(String, nullable=True)
    marks      = Column(Float, nullable=False)
    max_marks  = Column(Float, default=100)
    grade      = Column(String, nullable=True)
    semester   = Column(Integer, nullable=False)
    credits    = Column(Integer, default=3)
    teacher    = Column(String, nullable=True)
    target     = Column(Float, default=75)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    student    = relationship("StudentProfile", back_populates="results")


class GpaRecord(Base):
    __tablename__ = "gpa_records"
    id          = Column(Integer, primary_key=True)
    student_id  = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    period      = Column(String, nullable=False)
    gpa         = Column(Float, nullable=False)
    period_type = Column(String, default="month")
    student     = relationship("StudentProfile", back_populates="gpa_records")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    id         = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    week_label = Column(String, nullable=False)
    pct        = Column(Float, nullable=False)
    semester   = Column(Integer, nullable=False)
    student    = relationship("StudentProfile", back_populates="attendance_records")


class Recommendation(Base):
    __tablename__ = "recommendations"
    id         = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    title      = Column(String, nullable=False)
    explanation= Column(Text, nullable=True)
    indicator  = Column(String, nullable=True)
    action     = Column(Text, nullable=True)
    priority   = Column(String, default="medium")
    category   = Column(String, default="Academic")
    completed  = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    student    = relationship("StudentProfile", back_populates="recommendations")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    id         = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), unique=True, nullable=False)
    risk_level = Column(String, default="Low")
    risk_score = Column(Float, default=0.1)
    factors    = Column(Text, nullable=True)   # stored as JSON string
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    student    = relationship("StudentProfile", back_populates="risk_assessment")


class StudyTask(Base):
    __tablename__ = "study_tasks"
    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    title      = Column(String, nullable=False)
    subject    = Column(String, nullable=True)
    due_date   = Column(String, nullable=True)
    priority   = Column(String, default="medium")
    completed  = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user       = relationship("User", back_populates="study_tasks")


class Notification(Base):
    __tablename__ = "notifications"
    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    type       = Column(String, default="info")
    title      = Column(String, nullable=False)
    message    = Column(Text, nullable=True)
    read       = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user       = relationship("User", back_populates="notifications")


class Assessment(Base):
    __tablename__ = "assessments"
    id            = Column(Integer, primary_key=True)
    title         = Column(String, nullable=False)
    subject       = Column(String, nullable=False)
    code          = Column(String, nullable=True)
    type          = Column(String, default="Assignment")  # Mid-Term, Unit Test, Assignment, Lab Practical, Project
    description   = Column(Text, nullable=True)
    max_marks     = Column(Float, default=100)
    weightage_pct = Column(Float, default=15)
    semester      = Column(Integer, nullable=False)
    due_date      = Column(String, nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow)

    submissions   = relationship("AssessmentSubmission", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentSubmission(Base):
    __tablename__ = "assessment_submissions"
    id              = Column(Integer, primary_key=True)
    assessment_id   = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    student_id      = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    status          = Column(String, default="Pending")  # Pending, Submitted, Graded
    marks_obtained  = Column(Float, nullable=True)
    max_marks       = Column(Float, default=100)
    percentage      = Column(Float, nullable=True)
    grade           = Column(String, nullable=True)
    feedback        = Column(Text, nullable=True)
    submission_text = Column(Text, nullable=True)
    submitted_at    = Column(DateTime, nullable=True)
    graded_at       = Column(DateTime, nullable=True)

    assessment      = relationship("Assessment", back_populates="submissions")
    student         = relationship("StudentProfile", back_populates="assessment_submissions")


class Quiz(Base):
    __tablename__ = "quizzes"
    id               = Column(Integer, primary_key=True)
    title            = Column(String, nullable=False)
    subject          = Column(String, nullable=False)
    code             = Column(String, nullable=True)
    topic            = Column(String, nullable=True)
    description      = Column(Text, nullable=True)
    difficulty       = Column(String, default="Intermediate")  # Beginner, Intermediate, Advanced
    duration_minutes = Column(Integer, default=15)
    pass_percentage  = Column(Float, default=60.0)
    semester         = Column(Integer, nullable=False)
    created_at       = Column(DateTime, default=datetime.utcnow)

    questions        = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    attempts         = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    id             = Column(Integer, primary_key=True)
    quiz_id        = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_text  = Column(Text, nullable=False)
    option_a       = Column(Text, nullable=False)
    option_b       = Column(Text, nullable=False)
    option_c       = Column(Text, nullable=False)
    option_d       = Column(Text, nullable=False)
    correct_option = Column(String, nullable=False)  # "A", "B", "C", "D"
    explanation    = Column(Text, nullable=True)
    marks          = Column(Integer, default=1)

    quiz           = relationship("Quiz", back_populates="questions")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id                 = Column(Integer, primary_key=True)
    quiz_id            = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    student_id         = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    score              = Column(Float, nullable=False)
    max_score          = Column(Float, nullable=False)
    percentage         = Column(Float, nullable=False)
    passed             = Column(Boolean, default=False)
    total_questions    = Column(Integer, nullable=False)
    correct_answers    = Column(Integer, default=0)
    incorrect_answers  = Column(Integer, default=0)
    unanswered         = Column(Integer, default=0)
    answers_json       = Column(Text, nullable=True)  # JSON string with submitted answers & details
    time_taken_seconds = Column(Integer, default=0)
    completed_at       = Column(DateTime, default=datetime.utcnow)

    quiz               = relationship("Quiz", back_populates="attempts")
    student            = relationship("StudentProfile", back_populates="quiz_attempts")
