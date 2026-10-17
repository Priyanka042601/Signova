from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import UserProgress, DailyActivity, Achievement, UserAchievement
from datetime import date, datetime

router = APIRouter(tags=["Conversation Lab"])

DEFAULT_USER_ID = 1

SCENARIOS = [
    {
        "id": "scenario_meet_peer",
        "title": "Meeting a New Friend at a Cultural Meetup",
        "difficulty": "Beginner",
        "estimated_minutes": 4,
        "location": "New Delhi Deaf Youth Conference",
        "description": "Engage in a respectful first encounter, exchange greetings, fingerspell your name in two-handed ISL, and express mutual warmth.",
        "learning_objective": "Master polite ISL greetings, two-handed manual alphabet usage for proper names, and affirmative facial expressions.",
        "verified_vocab": ["Namaste / Hello", "Dhanyavaad / Thank You", "Friend / Dost", "ISL Letter 'A'"],
        "steps": [
            {
                "speaker": "Rhea (Deaf Peer)",
                "dialogue": "[Brings both palms together in Anjali Mudra at chest, smiles warmly and nods slightly]",
                "gloss": "NAMASTE! MEET HAPPY.",
                "translation": "Hello! It's so wonderful to meet you.",
                "prompt": "How do you respond respectfully in Indian Sign Language?",
                "options": [
                    {
                        "text": "Return the greeting with both palms together at chest level (Namaste) and a warm respectful nod.",
                        "is_correct": True,
                        "feedback": "Perfect! In Indian Deaf culture, returning Namaste with mutual visual respect establishes a positive connection."
                    },
                    {
                        "text": "Stare at your phone and wave one finger dismissively.",
                        "is_correct": False,
                        "feedback": "Maintaining direct visual engagement and a sincere greeting is essential in sign communication."
                    },
                    {
                        "text": "Snap your fingers close to her eyes to say hi.",
                        "is_correct": False,
                        "feedback": "Snapping fingers close to someone's face is considered disrespectful in Deaf culture."
                    }
                ]
            },
            {
                "speaker": "Rhea (Deaf Peer)",
                "dialogue": "[Points index finger towards you, then palms up with furrowed eyebrows]",
                "gloss": "YOUR NAME WHAT?",
                "translation": "What is your name?",
                "prompt": "How do you explain your name in ISL?",
                "options": [
                    {
                        "text": "Sign [MY NAME] then use the two-handed ISL manual alphabet to fingerspell clearly.",
                        "is_correct": True,
                        "feedback": "Accurate! Proper nouns like personal names are spelled using the two-handed ISL manual alphabet."
                    },
                    {
                        "text": "Shout your name loudly in English.",
                        "is_correct": False,
                        "feedback": "ISL is a visual-spatial language. Using clear fingerspelling in signing space is effective and respectful."
                    }
                ]
            },
            {
                "speaker": "Rhea (Deaf Peer)",
                "dialogue": "[Clasps hooked index fingers together with a bright smile]",
                "gloss": "WE TWO FRIEND GOOD!",
                "translation": "We are friends now! Thank you for learning ISL.",
                "prompt": "Conclude the conversation with courtesy:",
                "options": [
                    {
                        "text": "Fingertips to chin, moving forward and outward toward Rhea [Dhanyavaad / Thank You].",
                        "is_correct": True,
                        "feedback": "Excellent! You completed the dialogue with natural, verified ISL signs."
                    },
                    {
                        "text": "Turn your back and leave without signing.",
                        "is_correct": False,
                        "feedback": "In sign language, a clear visual closing courtesy is standard etiquette."
                    }
                ]
            }
        ]
    },
    {
        "id": "scenario_metro_directions",
        "title": "Asking for Metro Directions in Bengaluru",
        "difficulty": "Intermediate",
        "estimated_minutes": 5,
        "location": "Majestic Metro Station, Bengaluru",
        "description": "Navigate a public transport hub by asking a station guide for the ticket counter using ISL question syntax and spatial pointers.",
        "learning_objective": "Apply ISL Question grammar (Topic-first, then question marker at the end) with non-manual markers.",
        "verified_vocab": ["Metro / Train", "Where / Kahan", "Help / Madad"],
        "steps": [
            {
                "speaker": "You (Learner)",
                "dialogue": "You need to ask where the Purple Line platform is located.",
                "prompt": "In standard ISL word order, how do you construct this question?",
                "options": [
                    {
                        "text": "[METRO PURPLE LINE WHERE?] with furrowed eyebrows and head tilted forward.",
                        "is_correct": True,
                        "feedback": "Spot on! ISL places the topic [METRO PURPLE LINE] first, followed by the question word [WHERE] accompanied by furrowed eyebrows."
                    },
                    {
                        "text": "Sign [WHERE] 10 times with a flat face.",
                        "is_correct": False,
                        "feedback": "Without topic context or grammatical non-manual markers, the question is ambiguous."
                    }
                ]
            },
            {
                "speaker": "Station Guide (ISL User)",
                "dialogue": "[Points two fingers sliding forward on track, then points right towards escalators]",
                "gloss": "METRO THAT-WAY ESCALATOR UP RIGHT SIDE.",
                "translation": "Take the escalator up on the right side for the metro platform.",
                "prompt": "How do you acknowledge and show comprehension?",
                "options": [
                    {
                        "text": "Nod affirmatively, repeat the directional pointer, and sign [THANK YOU].",
                        "is_correct": True,
                        "feedback": "Great communication! Confirming spatial directions with a nod and sign of appreciation is natural in ISL."
                    },
                    {
                        "text": "Look confused and shake your head sideways.",
                        "is_correct": False,
                        "feedback": "If you understood the pointer, an affirmative nod confirms understanding."
                    }
                ]
            }
        ]
    }
]

@router.get("/conversation/scenarios")
def list_scenarios():
    return SCENARIOS

@router.post("/conversation/{scenario_id}/complete")
def complete_scenario(scenario_id: str, db: Session = Depends(get_db)):
    # Award 30 XP for completing conversation scenario
    user_prog = db.query(UserProgress).filter(UserProgress.user_id == DEFAULT_USER_ID).first()
    if user_prog:
        user_prog.xp_total += 30

    # Daily activity
    today = date.today()
    daily_act = db.query(DailyActivity).filter(
        DailyActivity.user_id == DEFAULT_USER_ID,
        DailyActivity.activity_date == today
    ).first()
    if daily_act:
        daily_act.qualifying_activity_count += 1
        daily_act.minutes_spent += 5
        daily_act.xp_earned += 30
    else:
        db.add(DailyActivity(
            user_id=DEFAULT_USER_ID,
            activity_date=today,
            qualifying_activity_count=1,
            minutes_spent=5,
            xp_earned=30
        ))

    # Check "Conversation Explorer" achievement
    ach = db.query(Achievement).filter(Achievement.condition_type == "conversation_done").first()
    if ach:
        already = db.query(UserAchievement).filter(
            UserAchievement.user_id == DEFAULT_USER_ID,
            UserAchievement.achievement_id == ach.id
        ).first()
        if not already:
            db.add(UserAchievement(
                user_id=DEFAULT_USER_ID,
                achievement_id=ach.id,
                unlocked_at=datetime.utcnow()
            ))
            if user_prog:
                user_prog.xp_total += ach.xp_reward

    db.commit()

    return {
        "status": "success",
        "scenario_id": scenario_id,
        "xp_awarded": 30,
        "message": "Scenario completed successfully!"
    }
