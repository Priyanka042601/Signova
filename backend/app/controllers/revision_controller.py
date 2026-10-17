from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import User
from app.schemas import RevisionAttemptCreate
from app.services.revision_service import get_due_revision_items, record_revision_attempt

def get_due_revision(current_user: User, db: Session) -> List[Dict[str, Any]]:
    return get_due_revision_items(db, user_id=current_user.id)

def submit_revision_attempt(
    payload: RevisionAttemptCreate,
    current_user: User,
    db: Session
) -> Dict[str, Any]:
    return record_revision_attempt(
        db=db,
        user_id=current_user.id,
        vocabulary_id=payload.vocabulary_id,
        is_correct=payload.is_correct
    )
