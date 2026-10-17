from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import LessonDetail, LessonAttemptCreate, LessonAttemptResponse
from app.services.curriculum_service import get_lesson_detail
from app.services.lesson_service import evaluate_lesson_attempt
from app.models import LessonAttempt

router = APIRouter(tags=["Lessons"])

DEFAULT_USER_ID = 1

@router.get("/lessons/{lesson_id}", response_model=LessonDetail)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    detail = get_lesson_detail(db, lesson_id, user_id=DEFAULT_USER_ID)
    if not detail:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return detail

@router.post("/lessons/{lesson_id}/attempts", response_model=LessonAttemptResponse)
def submit_lesson_attempt(
    lesson_id: int,
    payload: LessonAttemptCreate,
    db: Session = Depends(get_db)
):
    try:
        return evaluate_lesson_attempt(
            db=db,
            user_id=DEFAULT_USER_ID,
            lesson_id=lesson_id,
            answers=payload.answers,
            time_spent_seconds=payload.time_spent_seconds or 60
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/lessons/{lesson_id}/progress")
def get_lesson_progress(lesson_id: int, db: Session = Depends(get_db)):
    attempts = db.query(LessonAttempt).filter(
        LessonAttempt.user_id == DEFAULT_USER_ID,
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
