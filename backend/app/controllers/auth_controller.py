from sqlalchemy.orm import Session
from app.models import User
from app.schemas import UserAuthResponse, UserSyncRequest
from app.services.user_service import sync_clerk_user

def get_current_user_profile(current_user: User) -> UserAuthResponse:
    """Controller to return authenticated user profile and session identity."""
    progress = current_user.progress
    return UserAuthResponse(
        id=current_user.id,
        clerk_id=current_user.clerk_id,
        email=current_user.email,
        display_name=current_user.display_name,
        avatar=current_user.avatar,
        role=current_user.role or "learner",
        xp_total=progress.xp_total if progress else 0,
        current_streak=progress.current_streak if progress else 0,
        longest_streak=progress.longest_streak if progress else 0
    )

def sync_user_identity(payload: UserSyncRequest, db: Session) -> UserAuthResponse:
    """Controller to explicitly sync Clerk webhook or frontend session update."""
    user = sync_clerk_user(
        db,
        clerk_id=payload.clerk_id,
        email=payload.email,
        display_name=payload.display_name,
        avatar=payload.avatar
    )
    return get_current_user_profile(user)
