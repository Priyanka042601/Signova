from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.configuration.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models import User
from app.schemas import PracticeQuestion, PracticeAttemptCreate, PracticeAttemptResponse
from app.controllers.practice_controller import (
    get_practice_questions, submit_practice_attempt
)

router = APIRouter(tags=["Practice"])

@router.get("/practice/questions", response_model=List[PracticeQuestion], summary="Generate adaptive practice questions")
def get_practice_questions_route(
    mode: str = Query("vocabulary", description="Mode: vocabulary, recognition, mixed, weak_area"),
    count: int = Query(5, description="Number of questions to generate"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dynamically generate tailored practice questions focused on learner's active vocabulary."""
    return get_practice_questions(mode=mode, count=count, current_user=current_user, db=db)

@router.post("/practice/attempts", response_model=PracticeAttemptResponse, summary="Submit completed practice session")
def submit_practice_attempt_route(
    payload: PracticeAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record practice accuracy, update weak areas, award XP, and maintain streak."""
    return submit_practice_attempt(payload, current_user, db)
