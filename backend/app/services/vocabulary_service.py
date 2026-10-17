from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import SignVocabulary, Favourite

def get_signs(
    db: Session,
    user_id: int,
    query: Optional[str] = None,
    category: Optional[str] = None,
    verification_status: Optional[str] = None
):
    q = db.query(SignVocabulary)

    if query:
        search_filter = f"%{query}%"
        q = q.filter(
            or_(
                SignVocabulary.vocabulary.ilike(search_filter),
                SignVocabulary.explanation.ilike(search_filter),
                SignVocabulary.category.ilike(search_filter),
                SignVocabulary.handshape.ilike(search_filter)
            )
        )

    if category and category != "All":
        q = q.filter(SignVocabulary.category == category)

    if verification_status and verification_status != "all":
        q = q.filter(SignVocabulary.verification_status == verification_status)

    items = q.order_by(SignVocabulary.category, SignVocabulary.vocabulary).all()

    # Get favourite IDs for this user
    fav_ids = set(
        res[0] for res in db.query(Favourite.vocabulary_id)
        .filter(Favourite.user_id == user_id)
        .all()
    )

    result = []
    for item in items:
        result.append({
            "id": item.id,
            "vocabulary": item.vocabulary,
            "category": item.category,
            "explanation": item.explanation,
            "handshape": item.handshape,
            "movement_description": item.movement_description,
            "non_manual_notes": item.non_manual_notes,
            "media_url": item.media_url,
            "diagram_type": item.diagram_type,
            "source": item.source,
            "licence": item.licence,
            "verification_status": item.verification_status,
            "reviewer_reference": item.reviewer_reference,
            "last_reviewed_at": item.last_reviewed_at,
            "is_favourite": item.id in fav_ids
        })

    return result

def get_sign_by_id(db: Session, sign_id: int, user_id: int):
    item = db.query(SignVocabulary).filter(SignVocabulary.id == sign_id).first()
    if not item:
        return None

    is_fav = db.query(Favourite).filter(
        Favourite.user_id == user_id,
        Favourite.vocabulary_id == sign_id
    ).first() is not None

    return {
        "id": item.id,
        "vocabulary": item.vocabulary,
        "category": item.category,
        "explanation": item.explanation,
        "handshape": item.handshape,
        "movement_description": item.movement_description,
        "non_manual_notes": item.non_manual_notes,
        "media_url": item.media_url,
        "diagram_type": item.diagram_type,
        "source": item.source,
        "licence": item.licence,
        "verification_status": item.verification_status,
        "reviewer_reference": item.reviewer_reference,
        "last_reviewed_at": item.last_reviewed_at,
        "is_favourite": is_fav
    }

def get_categories(db: Session):
    rows = db.query(SignVocabulary.category).all()
    counts = {}
    for r in rows:
        counts[r[0]] = counts.get(r[0], 0) + 1

    return [{"category": cat, "count": count} for cat, count in sorted(counts.items())]

def toggle_favourite(db: Session, user_id: int, sign_id: int) -> bool:
    fav = db.query(Favourite).filter(
        Favourite.user_id == user_id,
        Favourite.vocabulary_id == sign_id
    ).first()

    if fav:
        db.delete(fav)
        db.commit()
        return False
    else:
        new_fav = Favourite(user_id=user_id, vocabulary_id=sign_id)
        db.add(new_fav)
        db.commit()
        return True

def create_sign(db: Session, sign_data: dict) -> SignVocabulary:
    """Create a new sign vocabulary entry (Admin/Editor CRUD)."""
    new_sign = SignVocabulary(
        vocabulary=sign_data["vocabulary"],
        category=sign_data["category"],
        explanation=sign_data["explanation"],
        handshape=sign_data.get("handshape"),
        movement_description=sign_data.get("movement_description"),
        non_manual_notes=sign_data.get("non_manual_notes"),
        media_url=sign_data.get("media_url"),
        diagram_type=sign_data.get("diagram_type", "svg_interactive"),
        source=sign_data.get("source", "ISLRTC / Signova ISL Educational Corpus"),
        licence=sign_data.get("licence", "Educational Fair Use & Open ISL Standard"),
        verification_status=sign_data.get("verification_status", "verified"),
        reviewer_reference=sign_data.get("reviewer_reference", "ISL Certified Master Trainer Review")
    )
    db.add(new_sign)
    db.commit()
    db.refresh(new_sign)
    return new_sign

def update_sign(db: Session, sign_id: int, update_data: dict) -> Optional[SignVocabulary]:
    """Update an existing sign vocabulary entry."""
    sign = db.query(SignVocabulary).filter(SignVocabulary.id == sign_id).first()
    if not sign:
        return None

    for key, value in update_data.items():
        if value is not None and hasattr(sign, key):
            setattr(sign, key, value)

    db.commit()
    db.refresh(sign)
    return sign

def delete_sign(db: Session, sign_id: int) -> bool:
    """Delete a sign vocabulary entry."""
    sign = db.query(SignVocabulary).filter(SignVocabulary.id == sign_id).first()
    if not sign:
        return False
    db.delete(sign)
    db.commit()
    return True
