from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import User, DailyActivity
from app.schemas import ProfileResponse, ProfileUpdate, DashboardSummary
from app.services.profile_service import (
    get_user_profile, update_user_profile, get_dashboard_summary, reset_user_progress
)

def get_learner_profile(current_user: User, db: Session) -> Dict[str, Any]:
    return get_user_profile(db, user_id=current_user.id)

def update_learner_profile(payload: ProfileUpdate, current_user: User, db: Session) -> Dict[str, Any]:
    return update_user_profile(
        db,
        user_id=current_user.id,
        display_name=payload.display_name,
        daily_goal_minutes=payload.daily_goal_minutes,
        avatar=payload.avatar
    )

def get_learner_dashboard(current_user: User, db: Session) -> Dict[str, Any]:
    return get_dashboard_summary(db, user_id=current_user.id)

def reset_learner_progress(current_user: User, db: Session) -> Dict[str, str]:
    reset_user_progress(db, user_id=current_user.id)
    return {
        "status": "success",
        "message": f"Learner progress for {current_user.display_name} has been successfully reset."
    }

def get_learner_activity_history(current_user: User, db: Session) -> List[Dict[str, Any]]:
    activities = db.query(DailyActivity).filter(
        DailyActivity.user_id == current_user.id
    ).order_by(DailyActivity.activity_date.desc()).limit(14).all()

    return [
        {
            "activity_date": a.activity_date.isoformat(),
            "qualifying_activity_count": a.qualifying_activity_count,
            "minutes_spent": a.minutes_spent,
            "xp_earned": a.xp_earned
        }
        for a in activities
    ]
