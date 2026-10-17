from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import LevelWithUnits, UnitWithLessons
from app.services.curriculum_service import get_levels_with_progress
from app.models import Unit, Level

router = APIRouter(tags=["Curriculum"])

DEFAULT_USER_ID = 1

@router.get("/levels", response_model=List[LevelWithUnits])
def list_levels(db: Session = Depends(get_db)):
    return get_levels_with_progress(db, user_id=DEFAULT_USER_ID)

@router.get("/levels/{level_id}", response_model=LevelWithUnits)
def get_level(level_id: int, db: Session = Depends(get_db)):
    levels = get_levels_with_progress(db, user_id=DEFAULT_USER_ID)
    for lvl in levels:
        if lvl["id"] == level_id:
            return lvl
    raise HTTPException(status_code=404, detail="Level not found")

@router.get("/units/{unit_id}")
def get_unit(unit_id: int, db: Session = Depends(get_db)):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
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
