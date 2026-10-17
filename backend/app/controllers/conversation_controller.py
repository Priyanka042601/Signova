from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import User
from app.services.conversation_service import (
    get_conversation_scenarios, complete_conversation_scenario
)

def list_scenarios() -> List[Dict[str, Any]]:
    return get_conversation_scenarios()

def complete_scenario(scenario_id: str, current_user: User, db: Session) -> Dict[str, Any]:
    return complete_conversation_scenario(db, user_id=current_user.id, scenario_id=scenario_id)
