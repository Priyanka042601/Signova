from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.configuration.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models import User
from app.schemas import LessonDetail, LessonAttemptCreate, LessonAttemptResponse
from app.controllers.lesson_controller import (
    get_lesson, submit_lesson_attempt, get_lesson_progress
)

router = APIRouter(tags=["Lessons"])

@router.get("/lessons/{lesson_id}", response_model=LessonDetail, summary="Get full lesson details with exercises")
def get_lesson_route(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve exercises, instructions, and vocabulary breakdown for a lesson."""
    return get_lesson(lesson_id, current_user, db)

@router.post("/lessons/{lesson_id}/attempts", response_model=LessonAttemptResponse, summary="Submit completed lesson attempt")
def submit_attempt_route(
    lesson_id: int,
    payload: LessonAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Evaluate answers, award calibrated XP, record daily activity, and trigger streak updates."""
    return submit_lesson_attempt(lesson_id, payload, current_user, db)

@router.get("/lessons/{lesson_id}/progress", summary="Get lesson attempt history")
def get_progress_route(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve attempt count, best accuracy score, and past submissions for a lesson."""
    return get_lesson_progress(lesson_id, current_user, db)
