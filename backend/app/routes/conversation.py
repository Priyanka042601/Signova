from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.configuration.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models import User
from app.controllers.conversation_controller import (
    list_scenarios, complete_scenario
)

router = APIRouter(tags=["Conversation Lab"])

@router.get("/conversation/scenarios", summary="List interactive dialogue scenarios")
def get_scenarios_route():
    """Retrieve authentic real-world ISL scenarios (e.g. Metro Directions, Cultural Meetups)."""
    return list_scenarios()

@router.post("/conversation/{scenario_id}/complete", summary="Complete dialogue scenario and award XP")
def complete_scenario_route(
    scenario_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete a conversational lab scenario, awarding XP and evaluating achievement triggers."""
    return complete_scenario(scenario_id, current_user, db)
