from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.configuration.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models import User
from app.schemas import ProfileResponse, ProfileUpdate, DashboardSummary
from app.controllers.profile_controller import (
    get_learner_profile, update_learner_profile, get_learner_dashboard,
    reset_learner_progress, get_learner_activity_history
)

router = APIRouter(tags=["Profile & Progress"])

@router.get("/profile", response_model=ProfileResponse, summary="Get learner profile")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full learner profile, XP breakdown, streak record, and achievements."""
    return get_learner_profile(current_user, db)

@router.patch("/profile", response_model=ProfileResponse, summary="Update learner profile settings")
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update learner display name, daily goal, or avatar."""
    return update_learner_profile(payload, current_user, db)

@router.get("/dashboard", response_model=DashboardSummary, summary="Get learner dashboard overview")
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve top-level dashboard metrics, daily challenge progress, and featured sign."""
    return get_learner_dashboard(current_user, db)

@router.post("/profile/reset", summary="Reset learner progress")
def reset_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reset all completed attempts, XP, and streak for the current learner."""
    return reset_learner_progress(current_user, db)

@router.get("/activity", summary="Get recent daily activity history")
def get_activity_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve 14-day history of time spent, qualifying activities, and XP earned."""
    return get_learner_activity_history(current_user, db)
