from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.configuration.database import get_db
from app.middleware.auth_middleware import get_current_user, get_optional_user, require_role
from app.models import User
from app.schemas import SignVocabularyBase, SignCategoryCount, SignVocabularyCreate, SignVocabularyUpdate
from app.controllers.signs_controller import (
    list_signs, get_sign, list_sign_categories, toggle_sign_favourite,
    create_new_sign, update_existing_sign, delete_existing_sign
)

router = APIRouter(tags=["ISL Vocabulary Dictionary"])

@router.get("/signs", response_model=List[SignVocabularyBase], summary="Explore ISL vocabulary dictionary")
def list_signs_route(
    query: Optional[str] = Query(None, description="Search keyword in English gloss, description, or handshape"),
    category: Optional[str] = Query(None, description="Filter by topic category"),
    verification_status: Optional[str] = Query(None, description="verified, pending_review, or placeholder"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Search and browse certified Indian Sign Language vocabulary entries."""
    return list_signs(
        db=db,
        current_user=current_user,
        query=query,
        category=category,
        verification_status=verification_status
    )

@router.get("/signs/categories", response_model=List[SignCategoryCount], summary="List all dictionary categories")
def list_categories_route(db: Session = Depends(get_db)):
    """Retrieve distinct categories with item counts."""
    return list_sign_categories(db)

@router.get("/signs/{sign_id}", response_model=SignVocabularyBase, summary="Get single ISL sign details")
def get_sign_route(
    sign_id: int,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Retrieve complete handshape, non-manual markers, attribution, and review notes."""
    return get_sign(sign_id=sign_id, db=db, current_user=current_user)

@router.post("/signs/{sign_id}/favourite", summary="Toggle favourite bookmark for a sign")
def toggle_favourite_route(
    sign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bookmark or unbookmark a sign in the learner's personal collection."""
    return toggle_sign_favourite(sign_id, current_user, db)

# Admin & Content Editor CRUD endpoints
@router.post("/signs", response_model=SignVocabularyBase, status_code=status.HTTP_201_CREATED, summary="Create new ISL sign entry (Editor/Admin)")
def create_sign_route(
    payload: SignVocabularyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new authentic Indian Sign Language sign dictionary entry."""
    return create_new_sign(payload, current_user, db)

@router.patch("/signs/{sign_id}", response_model=SignVocabularyBase, summary="Update an existing ISL sign (Editor/Admin)")
def update_sign_route(
    sign_id: int,
    payload: SignVocabularyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update linguistic description, reviewer reference, or handshape details."""
    return update_existing_sign(sign_id, payload, current_user, db)

@router.delete("/signs/{sign_id}", summary="Delete an ISL sign entry (Editor/Admin)")
def delete_sign_route(
    sign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a sign dictionary entry."""
    return delete_existing_sign(sign_id, current_user, db)
