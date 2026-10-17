from datetime import datetime, date
import json
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, DateTime, Date, ForeignKey
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String(100), unique=True, index=True, nullable=True)
    email = Column(String(255), index=True, nullable=True)
    display_name = Column(String(100), default="Aarav Sharma")
    avatar = Column(String(255), default="smile")
    role = Column(String(50), default="learner")  # learner, editor, admin
    daily_goal_minutes = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    progress = relationship("UserProgress", back_populates="user", uselist=False, cascade="all, delete-orphan")
    attempts = relationship("LessonAttempt", back_populates="user", cascade="all, delete-orphan")
    vocab_progress = relationship("VocabularyProgress", back_populates="user", cascade="all, delete-orphan")
    favourites = relationship("Favourite", back_populates="user", cascade="all, delete-orphan")
    user_achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    daily_activities = relationship("DailyActivity", back_populates="user", cascade="all, delete-orphan")


class Level(Base):
    __tablename__ = "levels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # Beginner, Intermediate, Advanced
    code = Column(String(50), unique=True, nullable=False)  # beginner, intermediate, advanced
    description = Column(Text, nullable=False)
    sequence_number = Column(Integer, nullable=False)
    unlock_threshold_percent = Column(Float, default=70.0)

    units = relationship("Unit", back_populates="level", order_by="Unit.sequence_number")


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    level_id = Column(Integer, ForeignKey("levels.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    sequence_number = Column(Integer, nullable=False)

    level = relationship("Level", back_populates="units")
    lessons = relationship("Lesson", back_populates="unit", order_by="Lesson.sequence_number")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    estimated_minutes = Column(Integer, default=5)
    sequence_number = Column(Integer, nullable=False)
    completion_threshold = Column(Float, default=70.0)
    published_status = Column(String(50), default="published")
    xp_reward = Column(Integer, default=25)

    unit = relationship("Unit", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson", order_by="Exercise.sequence_number")
    attempts = relationship("LessonAttempt", back_populates="lesson")


class SignVocabulary(Base):
    __tablename__ = "sign_vocabulary"

    id = Column(Integer, primary_key=True, index=True)
    vocabulary = Column(String(100), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    explanation = Column(Text, nullable=False)
    handshape = Column(String(200), nullable=True)  # e.g., "Flat B handshape", "Two-handed index fingers"
    movement_description = Column(Text, nullable=True)
    non_manual_notes = Column(Text, nullable=True)  # facial expression, head tilt
    media_url = Column(String(255), nullable=True)
    diagram_type = Column(String(50), default="svg_interactive")
    source = Column(String(255), default="ISLRTC / Signova ISL Educational Corpus")
    licence = Column(String(100), default="Educational Fair Use & Open ISL Standard")
    verification_status = Column(String(50), default="verified")  # verified, pending_review, placeholder
    reviewer_reference = Column(String(255), default="ISL Certified Master Trainer Review")
    last_reviewed_at = Column(DateTime, default=datetime.utcnow)

    exercises = relationship("Exercise", back_populates="vocabulary_item")
    progress_entries = relationship("VocabularyProgress", back_populates="vocabulary_item")
    favourites = relationship("Favourite", back_populates="vocabulary_item")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    vocabulary_id = Column(Integer, ForeignKey("sign_vocabulary.id"), nullable=True)
    exercise_type = Column(String(50), nullable=False)  # learn, recognize, match, apply, scenario
    question = Column(Text, nullable=False)
    options_json = Column(Text, nullable=True)  # JSON encoded list of options
    answer_reference = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=True)
    sequence_number = Column(Integer, nullable=False)

    lesson = relationship("Lesson", back_populates="exercises")
    vocabulary_item = relationship("SignVocabulary", back_populates="exercises")

    @property
    def options(self):
        if self.options_json:
            try:
                return json.loads(self.options_json)
            except Exception:
                return []
        return []

    @options.setter
    def options(self, val):
        self.options_json = json.dumps(val)


class LessonAttempt(Base):
    __tablename__ = "lesson_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    xp_awarded = Column(Integer, default=0)
    accuracy_percent = Column(Float, default=0.0)
    passed = Column(Boolean, default=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="attempts")
    lesson = relationship("Lesson", back_populates="attempts")


class VocabularyProgress(Base):
    __tablename__ = "vocabulary_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vocabulary_id = Column(Integer, ForeignKey("sign_vocabulary.id"), nullable=False)
    correct_count = Column(Integer, default=0)
    incorrect_count = Column(Integer, default=0)
    last_reviewed_at = Column(DateTime, default=datetime.utcnow)
    next_review_at = Column(DateTime, default=datetime.utcnow)
    review_interval_days = Column(Integer, default=1)
    mastery_score = Column(Float, default=0.0)  # 0.0 to 100.0

    user = relationship("User", back_populates="vocab_progress")
    vocabulary_item = relationship("SignVocabulary", back_populates="progress_entries")


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    xp_total = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(Date, nullable=True)

    user = relationship("User", back_populates="progress")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    condition_type = Column(String(50), nullable=False)  # lessons_completed, xp_total, streak_days, revision_count, conversation_done
    condition_value = Column(Integer, nullable=False)
    icon_name = Column(String(50), default="award")
    xp_reward = Column(Integer, default=50)


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="user_achievements")
    achievement = relationship("Achievement")


class Favourite(Base):
    __tablename__ = "favourites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vocabulary_id = Column(Integer, ForeignKey("sign_vocabulary.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="favourites")
    vocabulary_item = relationship("SignVocabulary", back_populates="favourites")


class DailyActivity(Base):
    __tablename__ = "daily_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_date = Column(Date, default=date.today, nullable=False)
    qualifying_activity_count = Column(Integer, default=1)
    minutes_spent = Column(Integer, default=5)
    xp_earned = Column(Integer, default=0)

    user = relationship("User", back_populates="daily_activities")
