import urllib.request
import json
from typing import Optional, Dict, Any
from datetime import datetime, date
from sqlalchemy.orm import Session
from app.models import (
    User, UserProgress, DailyActivity, LessonAttempt,
    VocabularyProgress, Favourite, UserAchievement
)
from app.configuration.settings import settings
from app.utils.logger import logger

def fetch_clerk_user_profile(clerk_id: str) -> Optional[dict]:
    """Fetch user profile metadata directly from Clerk API using secret key."""
    if not settings.CLERK_SECRET_KEY or not clerk_id:
        return None
    try:
        url = f"https://api.clerk.com/v1/users/{clerk_id}"
        req = urllib.request.Request(
            url,
            headers={
                "Authorization": f"Bearer {settings.CLERK_SECRET_KEY}",
                "User-Agent": "Signova/1.0"
            }
        )
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status == 200:
                return json.loads(resp.read().decode())
    except Exception as e:
        logger.warning(f"Could not query Clerk API for user {clerk_id}: {e}")
    return None

def migrate_guest_progress_to_user(db: Session, target_user: User):
    """
    Preserves learner progress across sessions:
    Ensures that when a user registers or signs in with Clerk, any pre-login progress
    (XP, streaks, passed lesson attempts, bookmarked vocabulary) is permanently retained
    and attached to their Clerk account.
    """
    guest_user = db.query(User).filter(User.id == 1).first()
    if not guest_user or guest_user.id == target_user.id:
        return

    target_prog = db.query(UserProgress).filter(UserProgress.user_id == target_user.id).first()
    guest_prog = guest_user.progress

    if target_prog and guest_prog and guest_prog.xp_total > 0:
        if target_prog.xp_total == 0:
            logger.info(
                f"Retaining pre-login learner progress: migrating {guest_prog.xp_total} XP and streak to {target_user.clerk_id}"
            )
            target_prog.xp_total = guest_prog.xp_total
            target_prog.current_streak = max(target_prog.current_streak, guest_prog.current_streak)
            target_prog.longest_streak = max(target_prog.longest_streak, guest_prog.longest_streak)
            target_prog.last_activity_date = guest_prog.last_activity_date or date.today()

        # Migrate passed lesson attempts if not already passed by target user
        for attempt in guest_user.attempts:
            if attempt.passed:
                existing_passed = db.query(LessonAttempt).filter(
                    LessonAttempt.user_id == target_user.id,
                    LessonAttempt.lesson_id == attempt.lesson_id,
                    LessonAttempt.passed == True
                ).first()
                if not existing_passed:
                    db.add(LessonAttempt(
                        user_id=target_user.id,
                        lesson_id=attempt.lesson_id,
                        score=attempt.score,
                        total_questions=attempt.total_questions,
                        xp_awarded=attempt.xp_awarded,
                        accuracy_percent=attempt.accuracy_percent,
                        passed=attempt.passed,
                        completed_at=attempt.completed_at
                    ))

        # Migrate favourites
        for fav in guest_user.favourites:
            existing_fav = db.query(Favourite).filter(
                Favourite.user_id == target_user.id,
                Favourite.vocabulary_id == fav.vocabulary_id
            ).first()
            if not existing_fav:
                db.add(Favourite(user_id=target_user.id, vocabulary_id=fav.vocabulary_id))

        db.commit()
        db.refresh(target_user)

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_clerk_id(db: Session, clerk_id: str) -> Optional[User]:
    return db.query(User).filter(User.clerk_id == clerk_id).first()

def sync_clerk_user(
    db: Session,
    clerk_id: str,
    email: Optional[str] = None,
    display_name: Optional[str] = None,
    avatar: Optional[str] = None
) -> User:
    """
    Idempotent synchronization between Clerk identity and local database record.
    Finds existing user by Clerk ID (retaining all progress, streaks, and achievements),
    or creates a new user and safely preserves any pre-login progress.
    """
    # If email or display_name is missing, try enriching from Clerk API
    if (not email or not display_name or display_name == "Signova Learner") and settings.CLERK_SECRET_KEY:
        clerk_data = fetch_clerk_user_profile(clerk_id)
        if clerk_data:
            if not display_name or display_name == "Signova Learner":
                first = clerk_data.get("first_name") or ""
                last = clerk_data.get("last_name") or ""
                full = f"{first} {last}".strip()
                if full:
                    display_name = full
            if not email:
                emails = [e.get("email_address") for e in clerk_data.get("email_addresses", []) if e.get("email_address")]
                if emails:
                    email = emails[0]
            if not avatar:
                avatar = clerk_data.get("image_url")

    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if user:
        modified = False
        if display_name and display_name != "Signova Learner" and user.display_name != display_name:
            user.display_name = display_name
            modified = True
        if email and user.email != email:
            user.email = email
            modified = True
        if avatar and user.avatar != avatar:
            user.avatar = avatar
            modified = True
        if modified:
            user.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(user)

        # Ensure user progress is preserved
        migrate_guest_progress_to_user(db, user)
        return user

    # Create new learner
    logger.info(f"Provisioning new learner for Clerk ID: {clerk_id} ({email or 'no email'})")
    user = User(
        clerk_id=clerk_id,
        email=email,
        display_name=display_name or "Signova Learner",
        avatar=avatar or "smile",
        role="learner",
        daily_goal_minutes=10,
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Attach progress
    prog = UserProgress(
        user_id=user.id,
        xp_total=0,
        current_streak=1,
        longest_streak=1,
        last_activity_date=date.today()
    )
    db.add(prog)

    # Attach daily activity
    act = DailyActivity(
        user_id=user.id,
        activity_date=date.today(),
        qualifying_activity_count=0,
        minutes_spent=0,
        xp_earned=0
    )
    db.add(act)
    db.commit()
    db.refresh(user)

    # Preserve any pre-login progress
    migrate_guest_progress_to_user(db, user)

    return user

def update_user_role(db: Session, user_id: int, new_role: str) -> Optional[User]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    user.role = new_role
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user
