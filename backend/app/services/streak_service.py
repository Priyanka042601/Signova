from datetime import date, timedelta, datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models import UserProgress, DailyActivity, UserAchievement, Achievement, LessonAttempt
from app.utils.logger import logger

def calculate_current_streak(last_activity_date: Optional[date], current_streak: int) -> int:
    """
    Evaluates whether the user's active learning streak has lapsed based on calendar days:
    - If never active (None): 0 days.
    - If active today: streak is valid and maintained (current_streak).
    - If active yesterday: streak is active from yesterday, awaiting today's practice (current_streak).
    - If last activity was before yesterday (2+ calendar days ago): streak has broken, returns 0.
    """
    if last_activity_date is None:
        return 0
    today = date.today()
    if last_activity_date == today:
        return current_streak
    elif last_activity_date == today - timedelta(days=1):
        return current_streak
    else:
        # User missed yesterday; streak has lapsed
        return 0

def evaluate_and_sync_streak(db: Session, user_prog: Optional[UserProgress]) -> int:
    """
    Passive streak integrity check:
    When a learner views their dashboard or profile, checks if their streak has lapsed.
    If the streak broke due to inactivity, persists current_streak = 0 while preserving longest_streak.
    """
    if not user_prog:
        return 0

    valid_streak = calculate_current_streak(user_prog.last_activity_date, user_prog.current_streak)
    if valid_streak != user_prog.current_streak:
        logger.info(
            f"Streak for user {user_prog.user_id} lapsed (last activity: {user_prog.last_activity_date}). "
            f"Resetting current_streak from {user_prog.current_streak} to {valid_streak}."
        )
        user_prog.current_streak = valid_streak
        db.commit()
    return user_prog.current_streak

def check_streak_and_xp_achievements(db: Session, user_id: int, user_prog: UserProgress) -> List[str]:
    """Evaluates and awards achievements triggered by streak length or total XP."""
    unlocked_names: List[str] = []
    already_unlocked_ids = set(
        res[0] for res in db.query(UserAchievement.achievement_id)
        .filter(UserAchievement.user_id == user_id)
        .all()
    )

    completed_lessons_count = db.query(LessonAttempt.lesson_id).filter(
        LessonAttempt.user_id == user_id,
        LessonAttempt.passed == True
    ).distinct().count()

    achievements = db.query(Achievement).all()
    for ach in achievements:
        if ach.id in already_unlocked_ids:
            continue

        qualifies = False
        if ach.condition_type == "lessons_completed" and completed_lessons_count >= ach.condition_value:
            qualifies = True
        elif ach.condition_type == "streak_days" and user_prog.current_streak >= ach.condition_value:
            qualifies = True
        elif ach.condition_type == "xp_total" and user_prog.xp_total >= ach.condition_value:
            qualifies = True

        if qualifies:
            db.add(UserAchievement(user_id=user_id, achievement_id=ach.id, unlocked_at=datetime.utcnow()))
            user_prog.xp_total += ach.xp_reward
            unlocked_names.append(ach.name)

    return unlocked_names

def record_activity_and_update_streak(
    db: Session,
    user_id: int,
    xp_earned: int,
    minutes_spent: int = 1
) -> Dict[str, Any]:
    """
    Centralized handler invoked whenever a learner completes any qualifying learning action
    (lesson, practice session, spaced repetition revision, or conversation lab dialogue).
    
    1. Awards XP.
    2. Correctly updates or advances streak:
       - First activity ever or after lapse: streak becomes 1.
       - Activity on consecutive day: streak increments by 1.
       - Multiple activities on same day: streak maintained, doesn't increment multiple times.
    3. Maintains longest_streak.
    4. Logs DailyActivity entry.
    5. Evaluates achievements.
    """
    user_prog = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    if not user_prog:
        user_prog = UserProgress(
            user_id=user_id,
            xp_total=0,
            current_streak=0,
            longest_streak=0,
            last_activity_date=None
        )
        db.add(user_prog)
        db.flush()

    # 1. Award XP
    user_prog.xp_total += xp_earned

    # 2. Update Streak
    today = date.today()
    if user_prog.last_activity_date != today:
        if user_prog.last_activity_date == today - timedelta(days=1):
            # Consecutive day!
            user_prog.current_streak += 1
        else:
            # First day or broken streak
            user_prog.current_streak = 1

        user_prog.last_activity_date = today
        if user_prog.current_streak > user_prog.longest_streak:
            user_prog.longest_streak = user_prog.current_streak

    # 3. Log DailyActivity
    daily_act = db.query(DailyActivity).filter(
        DailyActivity.user_id == user_id,
        DailyActivity.activity_date == today
    ).first()

    mins = max(1, minutes_spent)
    if daily_act:
        daily_act.qualifying_activity_count += 1
        daily_act.minutes_spent += mins
        daily_act.xp_earned += xp_earned
    else:
        daily_act = DailyActivity(
            user_id=user_id,
            activity_date=today,
            qualifying_activity_count=1,
            minutes_spent=mins,
            xp_earned=xp_earned
        )
        db.add(daily_act)

    # 4. Check achievements
    new_achievements = check_streak_and_xp_achievements(db, user_id, user_prog)

    db.commit()
    db.refresh(user_prog)

    return {
        "user_prog": user_prog,
        "new_xp_total": user_prog.xp_total,
        "current_streak": user_prog.current_streak,
        "longest_streak": user_prog.longest_streak,
        "new_achievements": new_achievements
    }

