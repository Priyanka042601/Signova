from typing import List, Dict, Any
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import User, Unit
from app.services.curriculum_service import get_levels_with_progress

def list_curriculum_levels(current_user: User, db: Session) -> List[Dict[str, Any]]:
    return get_levels_with_progress(db, user_id=current_user.id)

def get_curriculum_level(level_id: int, current_user: User, db: Session) -> Dict[str, Any]:
    levels = get_levels_with_progress(db, user_id=current_user.id)
    for lvl in levels:
        if lvl["id"] == level_id:
            return lvl
    raise HTTPException(status_code=404, detail=f"Curriculum level with ID {level_id} not found.")

def get_curriculum_unit(unit_id: int, db: Session) -> Dict[str, Any]:
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail=f"Unit with ID {unit_id} not found.")
    return {
        "id": unit.id,
        "level_id": unit.level_id,
        "title": unit.title,
        "description": unit.description,
        "sequence_number": unit.sequence_number,
        "lessons": [
            {
                "id": l.id,
                "unit_id": l.unit_id,
                "title": l.title,
                "description": l.description,
                "estimated_minutes": l.estimated_minutes,
                "sequence_number": l.sequence_number,
                "completion_threshold": l.completion_threshold,
                "published_status": l.published_status,
                "xp_reward": l.xp_reward
            }
            for l in unit.lessons
        ]
    }
