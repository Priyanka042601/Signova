from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import User
from app.schemas import PracticeAttemptCreate
from app.services.practice_service import generate_practice_session, record_practice_attempt

def get_practice_questions(
    mode: str,
    count: int,
    current_user: User,
    db: Session
) -> List[Dict[str, Any]]:
    return generate_practice_session(db, user_id=current_user.id, mode=mode, count=count)

def submit_practice_attempt(
    payload: PracticeAttemptCreate,
    current_user: User,
    db: Session
) -> Dict[str, Any]:
    return record_practice_attempt(
        db=db,
        user_id=current_user.id,
        total_questions=payload.total_questions,
        correct_answers=payload.correct_answers,
        mistake_vocab_ids=payload.mistake_vocab_ids,
        mode=payload.mode,
        time_spent_seconds=payload.time_spent_seconds
    )
