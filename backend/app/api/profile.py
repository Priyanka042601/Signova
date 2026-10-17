from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ProfileResponse, ProfileUpdate, DashboardSummary
from app.services.profile_service import (
    get_user_profile, update_user_profile, get_dashboard_summary, reset_user_progress
)
from app.models import DailyActivity

router = APIRouter(tags=["Profile & Progress"])

DEFAULT_USER_ID = 1

@router.get("/profile", response_model=ProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    return get_user_profile(db, user_id=DEFAULT_USER_ID)

@router.patch("/profile", response_model=ProfileResponse)
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db)):
    return update_user_profile(
        db,
        user_id=DEFAULT_USER_ID,
        display_name=payload.display_name,
        daily_goal_minutes=payload.daily_goal_minutes,
        avatar=payload.avatar
    )

@router.get("/dashboard", response_model=DashboardSummary)
def get_dashboard(db: Session = Depends(get_db)):
    return get_dashboard_summary(db, user_id=DEFAULT_USER_ID)

@router.post("/profile/reset")
def reset_progress(db: Session = Depends(get_db)):
    reset_user_profile(db, user_id=DEFAULT_USER_ID)
    return {"status": "success", "message": "Learner progress has been successfully reset."}

@router.get("/activity")
def get_activity_history(db: Session = Depends(get_db)):
    acts = db.query(DailyActivity).filter(
        DailyActivity.user_id == DEFAULT_USER_ID
    ).order_by(DailyActivity.activity_date.desc()).limit(14).all()

    return [
        {
            "activity_date": a.activity_date.isoformat(),
            "qualifying_activity_count": a.qualifying_activity_count,
            "minutes_spent": a.minutes_spent,
            "xp_earned": a.xp_earned
        }
        for a in acts
    ]
