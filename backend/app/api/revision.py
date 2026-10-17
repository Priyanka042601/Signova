from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import RevisionItem, RevisionAttemptCreate, RevisionAttemptResponse
from app.services.revision_service import get_due_revision_items, record_revision_attempt

router = APIRouter(tags=["Revision"])

DEFAULT_USER_ID = 1

@router.get("/revision/due", response_model=List[RevisionItem])
def get_due_items(db: Session = Depends(get_db)):
    return get_due_revision_items(db, user_id=DEFAULT_USER_ID)

@router.post("/revision/attempts", response_model=RevisionAttemptResponse)
def submit_revision_attempt(
    payload: RevisionAttemptCreate,
    db: Session = Depends(get_db)
):
    return record_revision_attempt(
        db=db,
        user_id=DEFAULT_USER_ID,
        vocabulary_id=payload.vocabulary_id,
        is_correct=payload.is_correct
    )
