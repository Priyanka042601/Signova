from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    PracticeQuestion, PracticeAttemptCreate, PracticeAttemptResponse
)
from app.services.practice_service import generate_practice_session, record_practice_attempt

router = APIRouter(tags=["Practice"])

DEFAULT_USER_ID = 1

@router.get("/practice/questions", response_model=List[PracticeQuestion])
def get_practice_questions(
    mode: str = Query("vocabulary", description="Mode: vocabulary, recognition, mixed, weak_area"),
    count: int = Query(5, description="Number of questions to generate"),
    db: Session = Depends(get_db)
):
    return generate_practice_session(db, user_id=DEFAULT_USER_ID, mode=mode, count=count)

@router.post("/practice/attempts", response_model=PracticeAttemptResponse)
def submit_practice_attempt(
    payload: PracticeAttemptCreate,
    db: Session = Depends(get_db)
):
    return record_practice_attempt(
        db=db,
        user_id=DEFAULT_USER_ID,
        total_questions=payload.total_questions,
        correct_answers=payload.correct_answers,
        mistake_vocab_ids=payload.mistake_vocab_ids,
        mode=payload.mode,
        time_spent_seconds=payload.time_spent_seconds
    )
