"""
EduInsight Backend — FastAPI + SQLAlchemy + SQLite
Multi-user student analytics platform with JWT authentication.
Each student sees only their own data, persisted in SQLite.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
import os

from database import Base, engine, SessionLocal
from routers import auth, student, faculty, admin
import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables
    Base.metadata.create_all(bind=engine)
    # Seed demo data safely (idempotent - won't duplicate)
    db = SessionLocal()
    try:
        seed.seed_demo_data(db)
        seed.repair_missing_profiles(db)   # Fix any students with no profile
        seed.seed_assessments_and_quizzes(db)  # Seed subject assessments and quizzes
    finally:
        db.close()
    yield

app = FastAPI(
    title="EduInsight API",
    description="AI-Powered Student Analytics and Success Platform",
    version="2.0.0",
    lifespan=lifespan,
)

# Support comma-separated FRONTEND_URL list so multiple frontends can be whitelisted
# e.g. FRONTEND_URL=https://app.vercel.app,https://app.netlify.app
def _parse_origins() -> list:
    base = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ]
    raw = os.environ.get("FRONTEND_URL", "")
    if raw:
        extras = [u.strip() for u in raw.split(",") if u.strip()]
        base.extend(extras)
    return base

app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,    prefix="/api/auth",    tags=["Auth"])
app.include_router(student.router, prefix="/api/student", tags=["Student"])
# Faculty endpoints: both /api/faculty (original prefix) and /api/manage (new management prefix)
app.include_router(faculty.router, prefix="/api/faculty", tags=["Faculty"])
app.include_router(faculty.router, prefix="/api/manage",  tags=["Manage"])
app.include_router(admin.router,   prefix="/api/admin",   tags=["Admin"])

@app.get("/api/health")
def health():
    return {"status": "online", "version": "2.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
