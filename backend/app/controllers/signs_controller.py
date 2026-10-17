from typing import Optional, List, Dict, Any
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import User
from app.schemas import SignVocabularyCreate, SignVocabularyUpdate
from app.services.vocabulary_service import (
    get_signs, get_sign_by_id, get_categories, toggle_favourite,
    create_sign as svc_create_sign,
    update_sign as svc_update_sign,
    delete_sign as svc_delete_sign
)

def list_signs(
    db: Session,
    current_user: Optional[User] = None,
    query: Optional[str] = None,
    category: Optional[str] = None,
    verification_status: Optional[str] = None
) -> List[Dict[str, Any]]:
    user_id = current_user.id if current_user else 1
    return get_signs(
        db,
        user_id=user_id,
        query=query,
        category=category,
        verification_status=verification_status
    )

def get_sign(sign_id: int, db: Session, current_user: Optional[User] = None) -> Dict[str, Any]:
    user_id = current_user.id if current_user else 1
    sign = get_sign_by_id(db, sign_id=sign_id, user_id=user_id)
    if not sign:
        raise HTTPException(status_code=404, detail=f"Sign vocabulary item {sign_id} not found.")
    return sign

def list_sign_categories(db: Session) -> List[Dict[str, Any]]:
    return get_categories(db)

def toggle_sign_favourite(sign_id: int, current_user: User, db: Session) -> Dict[str, Any]:
    # Check if sign exists
    sign = get_sign_by_id(db, sign_id=sign_id, user_id=current_user.id)
    if not sign:
        raise HTTPException(status_code=404, detail=f"Sign vocabulary item {sign_id} not found.")
    is_fav = toggle_favourite(db, user_id=current_user.id, sign_id=sign_id)
    return {
        "sign_id": sign_id,
        "is_favourite": is_fav,
        "message": "Added to favourites" if is_fav else "Removed from favourites"
    }

def create_new_sign(payload: SignVocabularyCreate, current_user: User, db: Session) -> Dict[str, Any]:
    created = svc_create_sign(db, payload.model_dump())
    return get_sign_by_id(db, sign_id=created.id, user_id=current_user.id)

def update_existing_sign(
    sign_id: int,
    payload: SignVocabularyUpdate,
    current_user: User,
    db: Session
) -> Dict[str, Any]:
    updated = svc_update_sign(db, sign_id=sign_id, update_data=payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail=f"Sign vocabulary item {sign_id} not found.")
    return get_sign_by_id(db, sign_id=updated.id, user_id=current_user.id)

def delete_existing_sign(sign_id: int, current_user: User, db: Session) -> Dict[str, Any]:
    deleted = svc_delete_sign(db, sign_id=sign_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Sign vocabulary item {sign_id} not found.")
    return {
        "status": "success",
        "message": f"Sign with ID {sign_id} successfully deleted."
    }
