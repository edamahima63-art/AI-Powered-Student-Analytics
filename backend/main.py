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

# ── Known production frontend origins — always whitelisted regardless of env vars ──
# Add any new deployment URL here so it works without touching Render/Vercel dashboards.
_HARDCODED_ORIGINS = [
    # Local development
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    # Vercel deployment
    "https://ai-powered-student-analytics.sigma.vercel.app",
    # Render frontend
    "https://ai-powered-student-analytics-duc6.onrender.com",
    # Netlify deployment
    "https://sensational-biscochitos-f48f56.netlify.app",
]

def _parse_origins() -> list:
    """Merge hardcoded origins with any extra ones set via FRONTEND_URL env var."""
    origins = list(_HARDCODED_ORIGINS)
    raw = os.environ.get("FRONTEND_URL", "")
    if raw:
        for url in raw.split(","):
            url = url.strip()
            if url and url not in origins:
                origins.append(url)
    return origins


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
