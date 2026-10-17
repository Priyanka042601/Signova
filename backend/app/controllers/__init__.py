from app.controllers.auth_controller import get_current_user_profile, sync_user_identity
from app.controllers.profile_controller import (
    get_learner_profile, update_learner_profile, get_learner_dashboard,
    reset_learner_progress, get_learner_activity_history
)
from app.controllers.curriculum_controller import (
    list_curriculum_levels, get_curriculum_level, get_curriculum_unit
)
from app.controllers.lesson_controller import (
    get_lesson, submit_lesson_attempt, get_lesson_progress
)
from app.controllers.signs_controller import (
    list_signs, get_sign, list_sign_categories, toggle_sign_favourite,
    create_new_sign, update_existing_sign, delete_existing_sign
)
from app.controllers.practice_controller import (
    get_practice_questions, submit_practice_attempt
)
from app.controllers.revision_controller import (
    get_due_revision, submit_revision_attempt
)
from app.controllers.conversation_controller import (
    list_scenarios, complete_scenario
)

__all__ = [
    "get_current_user_profile",
    "sync_user_identity",
    "get_learner_profile",
    "update_learner_profile",
    "get_learner_dashboard",
    "reset_learner_progress",
    "get_learner_activity_history",
    "list_curriculum_levels",
    "get_curriculum_level",
    "get_curriculum_unit",
    "get_lesson",
    "submit_lesson_attempt",
    "get_lesson_progress",
    "list_signs",
    "get_sign",
    "list_sign_categories",
    "toggle_sign_favourite",
    "create_new_sign",
    "update_existing_sign",
    "delete_existing_sign",
    "get_practice_questions",
    "submit_practice_attempt",
    "get_due_revision",
    "submit_revision_attempt",
    "list_scenarios",
    "complete_scenario"
]
