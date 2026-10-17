from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.configuration.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models import User
from app.schemas import RevisionItem, RevisionAttemptCreate, RevisionAttemptResponse
from app.controllers.revision_controller import (
    get_due_revision, submit_revision_attempt
)

router = APIRouter(tags=["Revision"])

@router.get("/revision/due", response_model=List[RevisionItem], summary="Get due spaced repetition revision items")
def get_due_items_route(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve vocabulary items scheduled for spaced repetition review based on Leitner intervals."""
    return get_due_revision(current_user, db)

@router.post("/revision/attempts", response_model=RevisionAttemptResponse, summary="Submit spaced repetition review attempt")
def submit_revision_attempt_route(
    payload: RevisionAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update spaced repetition interval, increase mastery score, and award XP."""
    return submit_revision_attempt(payload, current_user, db)
