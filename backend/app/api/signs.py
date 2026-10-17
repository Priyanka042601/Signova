from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import SignVocabularyBase, SignCategoryCount, StatusResponse
from app.services.vocabulary_service import (
    get_signs, get_sign_by_id, get_categories, toggle_favourite
)

router = APIRouter(tags=["ISL Vocabulary"])

DEFAULT_USER_ID = 1

@router.get("/signs", response_model=List[SignVocabularyBase])
def list_signs(
    query: Optional[str] = Query(None, description="Search term for meaning or category"),
    category: Optional[str] = Query(None, description="Filter by category"),
    verification_status: Optional[str] = Query(None, description="Filter by verified status"),
    db: Session = Depends(get_db)
):
    return get_signs(
        db=db,
        user_id=DEFAULT_USER_ID,
        query=query,
        category=category,
        verification_status=verification_status
    )

@router.get("/signs/categories", response_model=List[SignCategoryCount])
def list_categories(db: Session = Depends(get_db)):
    return get_categories(db)

@router.get("/signs/{sign_id}", response_model=SignVocabularyBase)
def get_sign(sign_id: int, db: Session = Depends(get_db)):
    sign = get_sign_by_id(db, sign_id, user_id=DEFAULT_USER_ID)
    if not sign:
        raise HTTPException(status_code=404, detail="Sign not found")
    return sign

@router.post("/signs/{sign_id}/favourite")
def set_favourite(sign_id: int, db: Session = Depends(get_db)):
    is_fav = toggle_favourite(db, user_id=DEFAULT_USER_ID, sign_id=sign_id)
    return {
        "sign_id": sign_id,
        "is_favourite": is_fav,
        "message": "Sign added to favourites" if is_fav else "Sign removed from favourites"
    }

@router.delete("/signs/{sign_id}/favourite")
def remove_favourite(sign_id: int, db: Session = Depends(get_db)):
    # Same toggle behavior or ensure removed
    is_fav = toggle_favourite(db, user_id=DEFAULT_USER_ID, sign_id=sign_id)
    return {
        "sign_id": sign_id,
        "is_favourite": is_fav,
        "message": "Favourite status updated"
    }
