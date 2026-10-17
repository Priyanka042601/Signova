from datetime import date, datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import (
    User, UserProgress, UserAchievement, Achievement, LessonAttempt,
    Lesson, Unit, Level, DailyActivity, SignVocabulary, VocabularyProgress, Favourite
)

def get_user_profile(db: Session, user_id: int) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"User {user_id} not found")

    prog = user.progress or UserProgress(user_id=user_id, xp_total=0, current_streak=0, longest_streak=0)

    # Calculate real completed lessons count
    completed_lesson_ids = set(
        res[0] for res in db.query(LessonAttempt.lesson_id)
        .filter(LessonAttempt.user_id == user_id, LessonAttempt.passed == True)
        .distinct()
        .all()
    )
    total_lessons_count = db.query(Lesson).count()
    completed_count = len(completed_lesson_ids)
    overall_progress = (completed_count / total_lessons_count * 100.0) if total_lessons_count > 0 else 0.0

    # Today's activity
    today = date.today()
    daily_act = db.query(DailyActivity).filter(
        DailyActivity.user_id == user_id,
        DailyActivity.activity_date == today
    ).first()
    today_minutes = daily_act.minutes_spent if daily_act else 0
    today_xp = daily_act.xp_earned if daily_act else 0
    today_goal_completed = today_minutes >= user.daily_goal_minutes

    # Achievements
    user_achs = db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
    unlocked_dict = {ua.achievement_id: ua.unlocked_at for ua in user_achs}

    all_achs = db.query(Achievement).all()
    achievements_data = []
    for ach in all_achs:
        is_unlocked = ach.id in unlocked_dict
        achievements_data.append({
            "id": ach.id,
            "name": ach.name,
            "description": ach.description,
            "icon_name": ach.icon_name,
            "condition_type": ach.condition_type,
            "condition_value": ach.condition_value,
            "xp_reward": ach.xp_reward,
            "is_unlocked": is_unlocked,
            "unlocked_at": unlocked_dict.get(ach.id)
        })

    # Level breakdown
    levels = db.query(Level).order_by(Level.sequence_number).all()
    level_breakdown = []
    current_level_name = "Level 1 — Beginner"

    for lvl in levels:
        lvl_lesson_ids = set()
        for u in lvl.units:
            for l in u.lessons:
                lvl_lesson_ids.add(l.id)

        lvl_total = len(lvl_lesson_ids)
        lvl_comp = len(lvl_lesson_ids.intersection(completed_lesson_ids))
        lvl_pct = (lvl_comp / lvl_total * 100.0) if lvl_total > 0 else 0.0

        if lvl_pct < 100.0 and current_level_name == "Level 1 — Beginner" and lvl.sequence_number > 1:
            current_level_name = lvl.name

        level_breakdown.append({
            "id": lvl.id,
            "name": lvl.name,
            "code": lvl.code,
            "completed": lvl_comp,
            "total": lvl_total,
            "percent": round(lvl_pct, 1)
        })

    return {
        "id": user.id,
        "display_name": user.display_name,
        "avatar": user.avatar,
        "daily_goal_minutes": user.daily_goal_minutes,
        "xp_total": prog.xp_total,
        "current_streak": prog.current_streak,
        "longest_streak": prog.longest_streak,
        "completed_lessons_count": completed_count,
        "total_lessons_count": total_lessons_count,
        "overall_progress_percent": round(overall_progress, 1),
        "current_level_name": current_level_name,
        "today_minutes_spent": today_minutes,
        "today_xp_earned": today_xp,
        "today_goal_completed": today_goal_completed,
        "recent_achievements": achievements_data,
        "level_breakdown": level_breakdown
    }

def update_user_profile(db: Session, user_id: int, display_name: Optional[str] = None, daily_goal_minutes: Optional[int] = None, avatar: Optional[str] = None):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")

    if display_name is not None:
        user.display_name = display_name
    if daily_goal_minutes is not None:
        user.daily_goal_minutes = daily_goal_minutes
    if avatar is not None:
        user.avatar = avatar

    db.commit()
    return get_user_profile(db, user_id)

def get_dashboard_summary(db: Session, user_id: int) -> Dict[str, Any]:
    prof = get_user_profile(db, user_id)

    # Next recommended lesson
    completed_lesson_ids = set(
        res[0] for res in db.query(LessonAttempt.lesson_id)
        .filter(LessonAttempt.user_id == user_id, LessonAttempt.passed == True)
        .distinct()
        .all()
    )

    next_lesson = None
    all_lessons = db.query(Lesson).join(Unit).join(Level).order_by(Level.sequence_number, Unit.sequence_number, Lesson.sequence_number).all()
    for l in all_lessons:
        if l.id not in completed_lesson_ids:
            next_lesson = {
                "id": l.id,
                "unit_id": l.unit_id,
                "title": l.title,
                "description": l.description,
                "estimated_minutes": l.estimated_minutes,
                "sequence_number": l.sequence_number,
                "completion_threshold": l.completion_threshold,
                "published_status": l.published_status,
                "xp_reward": l.xp_reward,
                "is_completed": False,
                "is_locked": False
            }
            break

    # Featured verified ISL sign of the day
    sign_of_day = db.query(SignVocabulary).filter(
        SignVocabulary.verification_status == "verified"
    ).first()

    # Revision due count
    now = datetime.utcnow()
    rev_due = db.query(VocabularyProgress).filter(
        VocabularyProgress.user_id == user_id,
        VocabularyProgress.next_review_at <= now
    ).count()

    # Daily challenge
    today_act = db.query(DailyActivity).filter(
        DailyActivity.user_id == user_id,
        DailyActivity.activity_date == date.today()
    ).first()

    qualifying_count = today_act.qualifying_activity_count if today_act else 0
    daily_challenge = {
        "title": "Daily Practice Master",
        "description": "Complete 2 lessons or revision reviews today",
        "target": 2,
        "current": qualifying_count,
        "reward_xp": 20,
        "is_completed": qualifying_count >= 2
    }

    today_goal_percent = min(100.0, (prof["today_minutes_spent"] / prof["daily_goal_minutes"] * 100.0)) if prof["daily_goal_minutes"] > 0 else 0.0

    return {
        "user_name": prof["display_name"],
        "current_level_name": prof["current_level_name"],
        "xp_total": prof["xp_total"],
        "current_streak": prof["current_streak"],
        "longest_streak": prof["longest_streak"],
        "completed_lessons_count": prof["completed_lessons_count"],
        "total_lessons_count": prof["total_lessons_count"],
        "overall_progress_percent": prof["overall_progress_percent"],
        "daily_goal_minutes": prof["daily_goal_minutes"],
        "today_minutes_spent": prof["today_minutes_spent"],
        "today_goal_percent": round(today_goal_percent, 1),
        "next_recommended_lesson": next_lesson,
        "daily_challenge": daily_challenge,
        "featured_sign_of_the_day": sign_of_day,
        "revision_due_count": rev_due
    }

def reset_user_progress(db: Session, user_id: int):
    # Reset attempts, user progress, vocab progress, daily activities
    db.query(LessonAttempt).filter(LessonAttempt.user_id == user_id).delete()
    db.query(VocabularyProgress).filter(VocabularyProgress.user_id == user_id).delete()
    db.query(DailyActivity).filter(DailyActivity.user_id == user_id).delete()
    db.query(UserAchievement).filter(UserAchievement.user_id == user_id).delete()
    db.query(Favourite).filter(Favourite.user_id == user_id).delete()

    prog = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    if prog:
        prog.xp_total = 0
        prog.current_streak = 0
        prog.longest_streak = 0
        prog.last_activity_date = None

    db.commit()
    return get_user_profile(db, user_id)
