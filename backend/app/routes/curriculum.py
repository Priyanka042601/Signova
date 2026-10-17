from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.configuration.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models import User
from app.schemas import LevelWithUnits
from app.controllers.curriculum_controller import (
    list_curriculum_levels, get_curriculum_level, get_curriculum_unit
)

router = APIRouter(tags=["Curriculum"])

@router.get("/levels", response_model=List[LevelWithUnits], summary="List all curriculum levels with learner progress")
def list_levels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List 3 progression levels (Beginner, Intermediate, Advanced) scoped to current learner."""
    return list_curriculum_levels(current_user, db)

@router.get("/levels/{level_id}", response_model=LevelWithUnits, summary="Get single level by ID")
def get_level(
    level_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve level details, units, and lesson completion status."""
    return get_curriculum_level(level_id, current_user, db)

@router.get("/units/{unit_id}", summary="Get unit details and lessons")
def get_unit(
    unit_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve unit information and associated lesson summaries."""
    return get_curriculum_unit(unit_id, db)
