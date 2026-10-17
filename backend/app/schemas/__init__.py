from typing import List, Optional, Any, Dict
from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict

# Base & Shared
class StatusResponse(BaseModel):
    status: str
    message: Optional[str] = None

# Authentication & User Sync
class UserAuthResponse(BaseModel):
    id: int
    clerk_id: Optional[str] = None
    email: Optional[str] = None
    display_name: str
    avatar: str
    role: str = "learner"
    xp_total: int = 0
    current_streak: int = 0
    longest_streak: int = 0

    model_config = ConfigDict(from_attributes=True)

class UserSyncRequest(BaseModel):
    clerk_id: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar: Optional[str] = None

# Vocabulary
class SignVocabularyBase(BaseModel):
    id: int
    vocabulary: str
    category: str
    explanation: str
    handshape: Optional[str] = None
    movement_description: Optional[str] = None
    non_manual_notes: Optional[str] = None
    media_url: Optional[str] = None
    diagram_type: Optional[str] = "svg_interactive"
    source: str
    licence: str
    verification_status: str
    reviewer_reference: Optional[str] = None
    last_reviewed_at: Optional[datetime] = None
    is_favourite: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)

class SignCategoryCount(BaseModel):
    category: str
    count: int

class SignVocabularyCreate(BaseModel):
    vocabulary: str
    category: str
    explanation: str
    handshape: Optional[str] = None
    movement_description: Optional[str] = None
    non_manual_notes: Optional[str] = None
    media_url: Optional[str] = None
    diagram_type: Optional[str] = "svg_interactive"
    source: Optional[str] = "ISLRTC / Signova ISL Educational Corpus"
    licence: Optional[str] = "Educational Fair Use & Open ISL Standard"
    verification_status: Optional[str] = "verified"
    reviewer_reference: Optional[str] = "ISL Certified Master Trainer Review"

class SignVocabularyUpdate(BaseModel):
    vocabulary: Optional[str] = None
    category: Optional[str] = None
    explanation: Optional[str] = None
    handshape: Optional[str] = None
    movement_description: Optional[str] = None
    non_manual_notes: Optional[str] = None
    media_url: Optional[str] = None
    diagram_type: Optional[str] = None
    source: Optional[str] = None
    licence: Optional[str] = None
    verification_status: Optional[str] = None
    reviewer_reference: Optional[str] = None

# Exercises
class ExerciseSchema(BaseModel):
    id: int
    lesson_id: int
    vocabulary_id: Optional[int] = None
    exercise_type: str
    question: str
    options: List[str] = []
    answer_reference: str
    explanation: Optional[str] = None
    sequence_number: int
    vocabulary_item: Optional[SignVocabularyBase] = None

    model_config = ConfigDict(from_attributes=True)

# Lessons
class LessonSummary(BaseModel):
    id: int
    unit_id: int
    title: str
    description: Optional[str] = None
    estimated_minutes: int
    sequence_number: int
    completion_threshold: float
    published_status: str
    xp_reward: int
    is_completed: bool = False
    best_score: Optional[int] = None
    is_locked: bool = False

    model_config = ConfigDict(from_attributes=True)

class LessonDetail(BaseModel):
    id: int
    unit_id: int
    unit_title: Optional[str] = None
    level_id: Optional[int] = None
    level_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    estimated_minutes: int
    sequence_number: int
    completion_threshold: float
    published_status: str
    xp_reward: int
    exercises: List[ExerciseSchema] = []
    is_completed: bool = False

    model_config = ConfigDict(from_attributes=True)

# Units
class UnitWithLessons(BaseModel):
    id: int
    level_id: int
    title: str
    description: Optional[str] = None
    sequence_number: int
    lessons: List[LessonSummary] = []
    completed_lessons_count: int = 0
    total_lessons_count: int = 0

    model_config = ConfigDict(from_attributes=True)

# Levels
class LevelWithUnits(BaseModel):
    id: int
    name: str
    code: str
    description: str
    sequence_number: int
    unlock_threshold_percent: float
    is_unlocked: bool = True
    completed_lessons_count: int = 0
    total_lessons_count: int = 0
    progress_percent: float = 0.0
    units: List[UnitWithLessons] = []

    model_config = ConfigDict(from_attributes=True)

# Attempt Submission
class AnswerSubmission(BaseModel):
    exercise_id: int
    selected_answer: str

class LessonAttemptCreate(BaseModel):
    answers: List[AnswerSubmission]
    time_spent_seconds: Optional[int] = 60

class LessonAttemptResponse(BaseModel):
    attempt_id: int
    lesson_id: int
    score: int
    total_questions: int
    accuracy_percent: float
    passed: bool
    xp_awarded: int
    is_first_completion: bool
    new_xp_total: int
    current_streak: int
    new_achievements: List[str] = []
    feedback: List[Dict[str, Any]] = []

# Spaced Repetition / Revision
class RevisionItem(BaseModel):
    vocabulary_id: int
    vocabulary: str
    category: str
    explanation: str
    handshape: Optional[str] = None
    movement_description: Optional[str] = None
    non_manual_notes: Optional[str] = None
    verification_status: str
    media_url: Optional[str] = None
    correct_count: int
    incorrect_count: int
    mastery_score: float
    review_interval_days: int
    next_review_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RevisionAttemptCreate(BaseModel):
    vocabulary_id: int
    is_correct: bool

class RevisionAttemptResponse(BaseModel):
    vocabulary_id: int
    new_interval_days: int
    new_mastery_score: float
    next_review_at: datetime
    xp_awarded: int

# Practice
class PracticeQuestion(BaseModel):
    id: int
    vocabulary_id: int
    vocabulary: str
    category: str
    question: str
    options: List[str]
    correct_answer: str
    explanation: str
    verification_status: str
    handshape: Optional[str] = None
    movement_description: Optional[str] = None

class PracticeAttemptCreate(BaseModel):
    total_questions: int
    correct_answers: int
    mistake_vocab_ids: List[int] = []
    mode: str  # vocabulary, recognition, mixed, weak_area
    time_spent_seconds: int = 60

class PracticeAttemptResponse(BaseModel):
    score: int
    total_questions: int
    accuracy_percent: float
    xp_awarded: int
    new_xp_total: int
    recommendation: str

# Gamification & User
class AchievementSchema(BaseModel):
    id: int
    name: str
    description: str
    icon_name: str
    condition_type: str
    condition_value: int
    xp_reward: int
    is_unlocked: bool = False
    unlocked_at: Optional[datetime] = None

class DailyActivitySchema(BaseModel):
    activity_date: date
    qualifying_activity_count: int
    minutes_spent: int
    xp_earned: int

    model_config = ConfigDict(from_attributes=True)

class ProfileResponse(BaseModel):
    id: int
    display_name: str
    avatar: str
    daily_goal_minutes: int
    xp_total: int
    current_streak: int
    longest_streak: int
    completed_lessons_count: int
    total_lessons_count: int
    overall_progress_percent: float
    current_level_name: str
    today_minutes_spent: int
    today_xp_earned: int
    today_goal_completed: bool
    recent_achievements: List[AchievementSchema] = []
    level_breakdown: List[Dict[str, Any]] = []

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    daily_goal_minutes: Optional[int] = None
    avatar: Optional[str] = None

class DashboardSummary(BaseModel):
    user_name: str
    current_level_name: str
    xp_total: int
    current_streak: int
    longest_streak: int
    completed_lessons_count: int
    total_lessons_count: int
    overall_progress_percent: float
    daily_goal_minutes: int
    today_minutes_spent: int
    today_goal_percent: float
    next_recommended_lesson: Optional[LessonSummary] = None
    daily_challenge: Dict[str, Any]
    featured_sign_of_the_day: Optional[SignVocabularyBase] = None
    revision_due_count: int = 0
