"""Auth router — login, register, /me endpoint."""
import sys
from pathlib import Path
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Ensure backend directory is in sys.path when running router directly
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from database import get_db, User, StudentProfile
from auth_utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


# ─── Schemas ─────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "student"
    department: str = ""


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.hashed_pw):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    token = create_access_token({"sub": user.uid})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _user_dict(user),
    }


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email.lower().strip()).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    uid = f"USR-{uuid.uuid4().hex[:8].upper()}"
    user = User(
        uid=uid,
        email=req.email.lower().strip(),
        hashed_pw=hash_password(req.password),
        name=req.name,
        role=req.role,
        department=req.department,
    )
    db.add(user)
    db.flush()

    # Create student profile for student role
    if req.role == "student":
        student_code = f"STU-{uid[-6:]}"
        profile = StudentProfile(user_id=user.id, student_code=student_code, semester=1)
        db.add(profile)

    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.uid})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _user_dict(user),
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile. Used on page refresh to restore session."""
    return _user_dict(current_user)


@router.post("/logout")
def logout():
    """Frontend clears the token. This endpoint signals a clean logout."""
    return {"message": "Logged out successfully"}


# ─── Helper ──────────────────────────────────────────────────────────────────

def _user_dict(user: User) -> dict:
    d = {
        "id": user.uid,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "department": user.department,
        "avatar": user.avatar,
    }
    # Include student-specific fields
    if user.student_profile:
        d["studentId"] = user.student_profile.student_code
        d["semester"] = user.student_profile.semester
    return d
