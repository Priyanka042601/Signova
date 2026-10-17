import random
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import SignVocabulary, VocabularyProgress, UserProgress, DailyActivity
from datetime import date

def generate_practice_session(db: Session, user_id: int, mode: str, count: int = 5) -> List[Dict[str, Any]]:
    # Filter only verified signs for practice as required by the prompt
    verified_signs = db.query(SignVocabulary).filter(SignVocabulary.verification_status == "verified").all()
    if not verified_signs:
        return []

    if mode == "weak_area":
        # Find signs with mistakes or low mastery
        weak_progs = db.query(VocabularyProgress).filter(
            VocabularyProgress.user_id == user_id,
            VocabularyProgress.incorrect_count > 0
        ).order_by(VocabularyProgress.mastery_score.asc()).limit(count).all()

        if weak_progs:
            selected_signs = [p.vocabulary_item for p in weak_progs if p.vocabulary_item]
        else:
            selected_signs = random.sample(verified_signs, min(count, len(verified_signs)))
    else:
        selected_signs = random.sample(verified_signs, min(count, len(verified_signs)))

    all_vocab_names = [s.vocabulary for s in verified_signs]
    questions = []

    for idx, s in enumerate(selected_signs, start=1):
        # Generate 3 distractors
        distractors = [name for name in all_vocab_names if name != s.vocabulary]
        chosen_distractors = random.sample(distractors, min(3, len(distractors)))
        options = [s.vocabulary] + chosen_distractors
        random.shuffle(options)

        if mode == "recognition":
            prompt = f"Observe this verified ISL demonstration: '{s.handshape}'. What does this sign mean?"
        elif mode == "vocabulary":
            prompt = f"Which sign corresponds to: '{s.explanation}'?"
        else:
            prompt = f"What is the correct meaning of this ISL sign in category '{s.category}'?"

        questions.append({
            "id": idx,
            "vocabulary_id": s.id,
            "vocabulary": s.vocabulary,
            "category": s.category,
            "question": prompt,
            "options": options,
            "correct_answer": s.vocabulary,
            "explanation": f"{s.explanation} ({s.movement_description})",
            "verification_status": s.verification_status,
            "handshape": s.handshape,
            "movement_description": s.movement_description
        })

    return questions

def record_practice_attempt(
    db: Session,
    user_id: int,
    total_questions: int,
    correct_answers: int,
    mistake_vocab_ids: List[int],
    mode: str,
    time_spent_seconds: int = 60
) -> Dict[str, Any]:
    accuracy_percent = (correct_answers / total_questions * 100.0) if total_questions > 0 else 0.0
    xp_awarded = correct_answers * 4 + (10 if accuracy_percent >= 80.0 else 0)

    user_prog = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    if user_prog:
        user_prog.xp_total += xp_awarded

    # Update DailyActivity
    today = date.today()
    daily_act = db.query(DailyActivity).filter(
        DailyActivity.user_id == user_id,
        DailyActivity.activity_date == today
    ).first()

    minutes = max(1, time_spent_seconds // 60)
    if daily_act:
        daily_act.qualifying_activity_count += 1
        daily_act.minutes_spent += minutes
        daily_act.xp_earned += xp_awarded
    else:
        daily_act = DailyActivity(
            user_id=user_id,
            activity_date=today,
            qualifying_activity_count=1,
            minutes_spent=minutes,
            xp_earned=xp_awarded
        )
        db.add(daily_act)

    # Recommendations based on performance
    if accuracy_percent >= 90:
        recommendation = "Outstanding accuracy! You're ready to proceed to the next curriculum unit or test your skills in the Conversation Lab."
    elif accuracy_percent >= 60:
        recommendation = "Solid practice session! Review your flagged mistakes in Spaced Repetition Revision to lock them in long-term memory."
    else:
        recommendation = "Keep going! We recommend visiting the ISL Dictionary to review handshape and non-manual cues before attempting again."

    db.commit()

    return {
        "score": correct_answers,
        "total_questions": total_questions,
        "accuracy_percent": round(accuracy_percent, 1),
        "xp_awarded": xp_awarded,
        "new_xp_total": user_prog.xp_total if user_prog else xp_awarded,
        "recommendation": recommendation
    }
