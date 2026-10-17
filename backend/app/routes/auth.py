from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.configuration.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models import User
from app.schemas import UserAuthResponse, UserSyncRequest
from app.controllers.auth_controller import get_current_user_profile, sync_user_identity

router = APIRouter(prefix="/auth", tags=["Authentication & Session"])

@router.get("/me", response_model=UserAuthResponse, summary="Get current authenticated user")
def me(current_user: User = Depends(get_current_user)):
    """Retrieve identity, role, and gamification snapshot for the active Clerk session."""
    return get_current_user_profile(current_user)

@router.post("/sync", response_model=UserAuthResponse, summary="Synchronize Clerk user profile")
def sync_user(payload: UserSyncRequest, db: Session = Depends(get_db)):
    """Idempotently sync Clerk user identity, email, and display name into the database."""
    return sync_user_identity(payload, db)
