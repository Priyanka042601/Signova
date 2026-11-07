from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import VocabularyProgress, SignVocabulary, UserProgress, UserAchievement, Achievement
from app.services.streak_service import record_activity_and_update_streak

def get_due_revision_items(db: Session, user_id: int) -> List[Dict[str, Any]]:
    now = datetime.utcnow()
    # Find items where next_review_at <= now
    items = db.query(VocabularyProgress).filter(
        VocabularyProgress.user_id == user_id,
        VocabularyProgress.next_review_at <= now
    ).order_by(VocabularyProgress.next_review_at.asc()).all()

    # If user has fewer than 3 items due, also include any items with low mastery (< 80)
    if len(items) < 3:
        existing_ids = set(it.vocabulary_id for it in items)
        low_mastery = db.query(VocabularyProgress).filter(
            VocabularyProgress.user_id == user_id,
            VocabularyProgress.mastery_score < 80.0,
            ~VocabularyProgress.vocabulary_id.in_(existing_ids)
        ).limit(3 - len(items)).all()
        items.extend(low_mastery)

    result = []
    for prog in items:
        v = prog.vocabulary_item
        if not v:
            continue
        result.append({
            "vocabulary_id": v.id,
            "vocabulary": v.vocabulary,
            "category": v.category,
            "explanation": v.explanation,
            "handshape": v.handshape,
            "movement_description": v.movement_description,
            "non_manual_notes": v.non_manual_notes,
            "verification_status": v.verification_status,
            "media_url": v.media_url,
            "correct_count": prog.correct_count,
            "incorrect_count": prog.incorrect_count,
            "mastery_score": prog.mastery_score,
            "review_interval_days": prog.review_interval_days,
            "next_review_at": prog.next_review_at
        })

    return result

def record_revision_attempt(db: Session, user_id: int, vocabulary_id: int, is_correct: bool) -> Dict[str, Any]:
    now = datetime.utcnow()
    prog = db.query(VocabularyProgress).filter(
        VocabularyProgress.user_id == user_id,
        VocabularyProgress.vocabulary_id == vocabulary_id
    ).first()

    if not prog:
        # Create new progression record if none existed
        interval = 2 if is_correct else 1
        mastery = 20.0 if is_correct else 0.0
        prog = VocabularyProgress(
            user_id=user_id,
            vocabulary_id=vocabulary_id,
            correct_count=1 if is_correct else 0,
            incorrect_count=0 if is_correct else 1,
            last_reviewed_at=now,
            next_review_at=now + timedelta(days=interval),
            review_interval_days=interval,
            mastery_score=mastery
        )
        db.add(prog)
    else:
        prog.last_reviewed_at = now
        if is_correct:
            prog.correct_count += 1
            # Interval growth progression: 1 -> 2 -> 4 -> 8 -> 16 -> 32 -> 60 days
            new_interval = max(2, prog.review_interval_days * 2)
            prog.review_interval_days = min(60, new_interval)
            prog.mastery_score = min(100.0, prog.mastery_score + 15.0)
            prog.next_review_at = now + timedelta(days=prog.review_interval_days)
        else:
            prog.incorrect_count += 1
            prog.review_interval_days = 1
            prog.mastery_score = max(0.0, prog.mastery_score - 15.0)
            prog.next_review_at = now + timedelta(days=1)

    # Award XP and update streak via centralized engine
    xp_awarded = 10 if is_correct else 3
    activity_result = record_activity_and_update_streak(
        db=db,
        user_id=user_id,
        xp_earned=xp_awarded,
        minutes_spent=1
    )
    user_prog = activity_result["user_prog"]

    # Check "Revision Hero" achievement
    total_revisions = db.query(VocabularyProgress).filter(VocabularyProgress.user_id == user_id).count()
    if total_revisions >= 5:
        ach = db.query(Achievement).filter(Achievement.condition_type == "revision_count").first()
        if ach:
            already = db.query(UserAchievement).filter(
                UserAchievement.user_id == user_id,
                UserAchievement.achievement_id == ach.id
            ).first()
            if not already:
                db.add(UserAchievement(user_id=user_id, achievement_id=ach.id, unlocked_at=now))
                if user_prog:
                    user_prog.xp_total += ach.xp_reward

    db.commit()

    return {
        "vocabulary_id": prog.vocabulary_id,
        "new_interval_days": prog.review_interval_days,
        "new_mastery_score": round(prog.mastery_score, 1),
        "next_review_at": prog.next_review_at,
        "xp_awarded": xp_awarded,
        "new_xp_total": user_prog.xp_total if user_prog else xp_awarded,
        "current_streak": activity_result["current_streak"]
    }
