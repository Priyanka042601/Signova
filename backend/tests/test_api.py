import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.seed import seed_database
from app.models import SignVocabulary, LessonAttempt, UserProgress

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_signova.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestingSessionLocal() as db:
        seed_database(db)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Signova" in data["service"]

def test_get_levels():
    response = client.get("/api/levels")
    assert response.status_code == 200
    levels = response.json()
    assert len(levels) == 3
    # Check level sequence & names
    assert levels[0]["code"] == "beginner"
    assert levels[0]["is_unlocked"] is True
    assert len(levels[0]["units"]) == 8

def test_get_lesson_detail():
    response = client.get("/api/lessons/1")
    assert response.status_code == 200
    lesson = response.json()
    assert lesson["id"] == 1
    assert "exercises" in lesson
    assert len(lesson["exercises"]) >= 1

def test_invalid_lesson_id():
    response = client.get("/api/lessons/99999")
    assert response.status_code == 404

def test_vocabulary_search_and_filter():
    # Search for "Namaste"
    response = client.get("/api/signs?query=Namaste")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    assert "Namaste" in items[0]["vocabulary"]

    # Search for non-existent sign
    response = client.get("/api/signs?query=xyzrandomnonexistent")
    assert response.status_code == 200
    assert len(response.json()) == 0

    # Filter categories
    cat_resp = client.get("/api/signs/categories")
    assert cat_resp.status_code == 200
    assert len(cat_resp.json()) >= 1

def test_favourite_toggle():
    # Toggle favourite for sign 1
    post_resp = client.post("/api/signs/1/favourite")
    assert post_resp.status_code == 200
    data = post_resp.json()
    assert "is_favourite" in data

def test_submit_lesson_attempt_and_xp():
    # Get exercises for lesson 1
    lesson_resp = client.get("/api/lessons/1")
    lesson = lesson_resp.json()
    exercises = lesson["exercises"]

    # Submit correct answers
    answers = []
    for ex in exercises:
        answers.append({
            "exercise_id": ex["id"],
            "selected_answer": ex["answer_reference"]
        })

    payload = {
        "answers": answers,
        "time_spent_seconds": 120
    }

    resp = client.post("/api/lessons/1/attempts", json=payload)
    assert resp.status_code == 200
    attempt_data = resp.json()
    assert attempt_data["passed"] is True
    assert attempt_data["score"] == len(exercises)
    assert attempt_data["xp_awarded"] >= 5

def test_revision_due_and_attempt():
    due_resp = client.get("/api/revision/due")
    assert due_resp.status_code == 200
    due_items = due_resp.json()
    assert isinstance(due_items, list)

    if due_items:
        first_item = due_items[0]
        rev_payload = {
            "vocabulary_id": first_item["vocabulary_id"],
            "is_correct": True
        }
        attempt_resp = client.post("/api/revision/attempts", json=rev_payload)
        assert attempt_resp.status_code == 200
        data = attempt_resp.json()
        assert data["new_interval_days"] >= 1
        assert data["xp_awarded"] > 0

def test_profile_and_dashboard():
    prof_resp = client.get("/api/profile")
    assert prof_resp.status_code == 200
    prof = prof_resp.json()
    assert "display_name" in prof
    assert "xp_total" in prof
    assert prof["completed_lessons_count"] >= 1

    dash_resp = client.get("/api/dashboard")
    assert dash_resp.status_code == 200
    dash = dash_resp.json()
    assert "user_name" in dash
    assert "daily_challenge" in dash

def test_auth_me_default_and_clerk():
    # Test default fallback user
    resp = client.get("/api/auth/me")
    assert resp.status_code == 200
    data = resp.json()
    assert "display_name" in data
    assert data["role"] in ["learner", "admin"]

    # Test Clerk user header provisioning
    clerk_resp = client.get(
        "/api/auth/me",
        headers={"X-Clerk-User-Id": "user_clerk_test_99"}
    )
    assert clerk_resp.status_code == 200
    clerk_data = clerk_resp.json()
    assert clerk_data["clerk_id"] == "user_clerk_test_99"

def test_clerk_user_sync():
    sync_payload = {
        "clerk_id": "user_clerk_sync_123",
        "email": "sync_learner@example.com",
        "display_name": "Rohan Verma",
        "avatar": "sparkle"
    }
    resp = client.post("/api/auth/sync", json=sync_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["clerk_id"] == "user_clerk_sync_123"
    assert data["display_name"] == "Rohan Verma"
    assert data["email"] == "sync_learner@example.com"

def test_conversation_lab():
    # List scenarios
    list_resp = client.get("/api/conversation/scenarios")
    assert list_resp.status_code == 200
    scenarios = list_resp.json()
    assert len(scenarios) >= 1
    assert scenarios[0]["id"] == "scenario_meet_peer"

    # Complete scenario
    complete_resp = client.post(
        "/api/conversation/scenario_meet_peer/complete",
        headers={"X-Clerk-User-Id": "user_clerk_test_99"}
    )
    assert complete_resp.status_code == 200
    comp_data = complete_resp.json()
    assert comp_data["xp_awarded"] == 30
    assert comp_data["status"] == "success"

def test_signs_crud():
    # 1. Create a sign
    new_sign = {
        "vocabulary": "Shukriya",
        "category": "Greetings",
        "explanation": "Hand to forehead and sweeping outward politely in Urdu/Hindi ISL context.",
        "handshape": "Flat hand with palm inward",
        "movement_description": "Touches forehead with fingertips, moves forward and slightly downward.",
        "non_manual_notes": "Courteous smile with respectful eye contact",
        "source": "ISL Community Corpus",
        "verification_status": "verified"
    }
    create_resp = client.post("/api/signs", json=new_sign)
    assert create_resp.status_code == 201
    created = create_resp.json()
    sign_id = created["id"]
    assert created["vocabulary"] == "Shukriya"

    # 2. Update the sign
    update_resp = client.patch(f"/api/signs/{sign_id}", json={"explanation": "Updated polite description"})
    assert update_resp.status_code == 200
    assert update_resp.json()["explanation"] == "Updated polite description"

    # 3. Delete the sign
    del_resp = client.delete(f"/api/signs/{sign_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "success"

    # 4. Confirm it's gone
    get_resp = client.get(f"/api/signs/{sign_id}")
    assert get_resp.status_code == 404
