from typing import Dict, Any
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import User, LessonAttempt
from app.schemas import LessonAttemptCreate
from app.services.curriculum_service import get_lesson_detail
from app.services.lesson_service import evaluate_lesson_attempt

def get_lesson(lesson_id: int, current_user: User, db: Session) -> Dict[str, Any]:
    detail = get_lesson_detail(db, lesson_id=lesson_id, user_id=current_user.id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Lesson with ID {lesson_id} not found.")
    return detail

def submit_lesson_attempt(
    lesson_id: int,
    payload: LessonAttemptCreate,
    current_user: User,
    db: Session
) -> Dict[str, Any]:
    try:
        return evaluate_lesson_attempt(
            db=db,
            user_id=current_user.id,
            lesson_id=lesson_id,
            answers=payload.answers,
            time_spent_seconds=payload.time_spent_seconds or 60
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

def get_lesson_progress(lesson_id: int, current_user: User, db: Session) -> Dict[str, Any]:
    attempts = db.query(LessonAttempt).filter(
        LessonAttempt.user_id == current_user.id,
        LessonAttempt.lesson_id == lesson_id
    ).order_by(LessonAttempt.completed_at.desc()).all()

    passed = any(a.passed for a in attempts)
    best_score = max((a.score for a in attempts), default=0)

    return {
        "lesson_id": lesson_id,
        "is_completed": passed,
        "attempts_count": len(attempts),
        "best_score": best_score,
        "attempts": [
            {
                "id": a.id,
                "score": a.score,
                "total_questions": a.total_questions,
                "accuracy_percent": a.accuracy_percent,
                "xp_awarded": a.xp_awarded,
                "passed": a.passed,
                "completed_at": a.completed_at
            }
            for a in attempts
        ]
    }
