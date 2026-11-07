import pytest
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import User, UserProgress, DailyActivity, Achievement, UserAchievement, LessonAttempt
from app.services.streak_service import (
    calculate_current_streak,
    evaluate_and_sync_streak,
    record_activity_and_update_streak
)

# In-memory SQLite for super-fast, isolated testing
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_calculate_current_streak_logic():
    today = date.today()
    # Never active
    assert calculate_current_streak(None, 0) == 0
    assert calculate_current_streak(None, 5) == 0

    # Active today
    assert calculate_current_streak(today, 3) == 3

    # Active yesterday (still alive pending today's activity)
    assert calculate_current_streak(today - timedelta(days=1), 4) == 4

    # Active 2 days ago (broken streak)
    assert calculate_current_streak(today - timedelta(days=2), 4) == 0

    # Active a month ago (broken streak)
    assert calculate_current_streak(today - timedelta(days=30), 10) == 0

def test_evaluate_and_sync_streak_resets_lapsed_streak_and_preserves_longest():
    db = SessionLocal()
    user = User(id=10, display_name="Test Learner")
    db.add(user)
    db.commit()

    # User who was active 5 days ago with streak 3, best 5
    prog = UserProgress(
        user_id=10,
        xp_total=100,
        current_streak=3,
        longest_streak=5,
        last_activity_date=date.today() - timedelta(days=5)
    )
    db.add(prog)
    db.commit()

    synced_streak = evaluate_and_sync_streak(db, prog)
    assert synced_streak == 0
    assert prog.current_streak == 0
    assert prog.longest_streak == 5  # Best streak is preserved!
    db.close()

def test_record_activity_first_day():
    db = SessionLocal()
    user = User(id=20, display_name="Fresh Learner")
    db.add(user)
    db.commit()

    res = record_activity_and_update_streak(db, user_id=20, xp_earned=25, minutes_spent=5)
    assert res["current_streak"] == 1
    assert res["longest_streak"] == 1
    assert res["new_xp_total"] == 25
    db.close()

def test_record_activity_same_day_does_not_inflate_streak():
    db = SessionLocal()
    user = User(id=30, display_name="Active Learner")
    db.add(user)
    db.commit()

    # First activity today
    record_activity_and_update_streak(db, user_id=30, xp_earned=20, minutes_spent=3)
    # Second activity today
    res2 = record_activity_and_update_streak(db, user_id=30, xp_earned=30, minutes_spent=5)

    assert res2["current_streak"] == 1
    assert res2["longest_streak"] == 1
    assert res2["new_xp_total"] == 50
    db.close()

def test_record_activity_consecutive_day_increments_streak():
    db = SessionLocal()
    user = User(id=40, display_name="Consistent Learner")
    db.add(user)
    # Pre-seed user active yesterday with streak 2
    yesterday = date.today() - timedelta(days=1)
    prog = UserProgress(
        user_id=40,
        xp_total=80,
        current_streak=2,
        longest_streak=2,
        last_activity_date=yesterday
    )
    db.add(prog)
    db.commit()

    res = record_activity_and_update_streak(db, user_id=40, xp_earned=25, minutes_spent=4)
    assert res["current_streak"] == 3
    assert res["longest_streak"] == 3
    assert res["new_xp_total"] == 105
    db.close()

def test_record_activity_after_lapse_restarts_at_one():
    db = SessionLocal()
    user = User(id=50, display_name="Returning Learner")
    db.add(user)
    # Pre-seed user active 3 days ago with streak 4, longest 4
    prog = UserProgress(
        user_id=50,
        xp_total=120,
        current_streak=4,
        longest_streak=4,
        last_activity_date=date.today() - timedelta(days=3)
    )
    db.add(prog)
    db.commit()

    res = record_activity_and_update_streak(db, user_id=50, xp_earned=20, minutes_spent=2)
    assert res["current_streak"] == 1
    assert res["longest_streak"] == 4  # Longest streak preserved!
    assert res["new_xp_total"] == 140
    db.close()

