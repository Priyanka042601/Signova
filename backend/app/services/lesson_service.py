from datetime import datetime, date, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import (
    Lesson, LessonAttempt, Exercise, UserProgress, User,
    DailyActivity, Achievement, UserAchievement, VocabularyProgress
)
from app.schemas import AnswerSubmission

def evaluate_lesson_attempt(
    db: Session,
    user_id: int,
    lesson_id: int,
    answers: List[AnswerSubmission],
    time_spent_seconds: int = 60
) -> Dict[str, Any]:
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise ValueError(f"Lesson with id {lesson_id} not found")

    exercises_map = {ex.id: ex for ex in lesson.exercises}
    total_questions = len(lesson.exercises)

    score = 0
    feedback = []

    for ans in answers:
        ex = exercises_map.get(ans.exercise_id)
        if not ex:
            continue

        # Check correctness
        is_correct = False
        if ex.exercise_type == "learn":
            # Learning phase is introductory, any action confirms completion
            is_correct = True
        elif ex.exercise_type == "match":
            # For match pairs, check if submitted payload matches reference or is complete
            is_correct = True if ans.selected_answer in ["MATCH_PAIRS", "MATCHED", "ALL_MATCHED"] or ans.selected_answer == ex.answer_reference else False
        else:
            is_correct = (ans.selected_answer.strip().lower() == ex.answer_reference.strip().lower())

        if is_correct:
            score += 1
            # Update vocabulary progress if attached
            if ex.vocabulary_id:
                _update_vocab_streak(db, user_id, ex.vocabulary_id, is_correct=True)
        else:
            if ex.vocabulary_id:
                _update_vocab_streak(db, user_id, ex.vocabulary_id, is_correct=False)

        feedback.append({
            "exercise_id": ex.id,
            "exercise_type": ex.exercise_type,
            "is_correct": is_correct,
            "selected_answer": ans.selected_answer,
            "correct_answer": ex.answer_reference,
            "explanation": ex.explanation
        })

    accuracy_percent = (score / total_questions * 100.0) if total_questions > 0 else 0.0
    passed = accuracy_percent >= lesson.completion_threshold

    # Anti-duplicate XP rule: Check if previously completed
    previous_pass = db.query(LessonAttempt).filter(
        LessonAttempt.user_id == user_id,
        LessonAttempt.lesson_id == lesson_id,
        LessonAttempt.passed == True
    ).first()

    is_first_completion = (previous_pass is None) and passed

    xp_awarded = 0
    if passed:
        if is_first_completion:
            xp_awarded = lesson.xp_reward
        else:
            # Re-practising an already passed lesson gives a small practice bonus (5 XP)
            xp_awarded = 5

    # Record attempt
    attempt = LessonAttempt(
        user_id=user_id,
        lesson_id=lesson_id,
        score=score,
        total_questions=total_questions,
        xp_awarded=xp_awarded,
        accuracy_percent=round(accuracy_percent, 1),
        passed=passed,
        completed_at=datetime.utcnow()
    )
    db.add(attempt)

    # Update User Progress & Streaks
    user_prog = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    if not user_prog:
        user_prog = UserProgress(user_id=user_id, xp_total=0, current_streak=0, longest_streak=0)
        db.add(user_prog)

    user_prog.xp_total += xp_awarded

    # Update Streak logic with real calendar dates
    today = date.today()
    if user_prog.last_activity_date != today:
        if user_prog.last_activity_date == today - timedelta(days=1):
            # Consecutive day!
            user_prog.current_streak += 1
        elif user_prog.last_activity_date is None or user_prog.last_activity_date < today - timedelta(days=1):
            # Broken streak or first day
            user_prog.current_streak = 1

        if user_prog.current_streak > user_prog.longest_streak:
            user_prog.longest_streak = user_prog.current_streak

        user_prog.last_activity_date = today

    # Update or add DailyActivity
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

    # Check for newly unlocked achievements
    new_achievements = _check_achievements(db, user_id, user_prog)

    db.commit()

    return {
        "attempt_id": attempt.id,
        "lesson_id": lesson_id,
        "score": score,
        "total_questions": total_questions,
        "accuracy_percent": round(accuracy_percent, 1),
        "passed": passed,
        "xp_awarded": xp_awarded,
        "is_first_completion": is_first_completion,
        "new_xp_total": user_prog.xp_total,
        "current_streak": user_prog.current_streak,
        "new_achievements": new_achievements,
        "feedback": feedback
    }

def _update_vocab_streak(db: Session, user_id: int, vocab_id: int, is_correct: bool):
    v_prog = db.query(VocabularyProgress).filter(
        VocabularyProgress.user_id == user_id,
        VocabularyProgress.vocabulary_id == vocab_id
    ).first()

    now = datetime.utcnow()
    if not v_prog:
        interval = 2 if is_correct else 1
        mastery = 20.0 if is_correct else 0.0
        v_prog = VocabularyProgress(
            user_id=user_id,
            vocabulary_id=vocab_id,
            correct_count=1 if is_correct else 0,
            incorrect_count=0 if is_correct else 1,
            last_reviewed_at=now,
            next_review_at=now + timedelta(days=interval),
            review_interval_days=interval,
            mastery_score=mastery
        )
        db.add(v_prog)
    else:
        v_prog.last_reviewed_at = now
        if is_correct:
            v_prog.correct_count += 1
            v_prog.review_interval_days = min(60, max(1, v_prog.review_interval_days * 2))
            v_prog.mastery_score = min(100.0, v_prog.mastery_score + 15.0)
            v_prog.next_review_at = now + timedelta(days=v_prog.review_interval_days)
        else:
            v_prog.incorrect_count += 1
            v_prog.review_interval_days = 1
            v_prog.mastery_score = max(0.0, v_prog.mastery_score - 10.0)
            v_prog.next_review_at = now + timedelta(days=1)

def _check_achievements(db: Session, user_id: int, user_prog: UserProgress) -> List[str]:
    unlocked_names = []
    already_unlocked_ids = set(
        res[0] for res in db.query(UserAchievement.achievement_id)
        .filter(UserAchievement.user_id == user_id)
        .all()
    )

    completed_lessons_count = db.query(LessonAttempt.lesson_id).filter(
        LessonAttempt.user_id == user_id,
        LessonAttempt.passed == True
    ).distinct().count()

    achievements = db.query(Achievement).all()
    for ach in achievements:
        if ach.id in already_unlocked_ids:
            continue

        qualifies = False
        if ach.condition_type == "lessons_completed" and completed_lessons_count >= ach.condition_value:
            qualifies = True
        elif ach.condition_type == "streak_days" and user_prog.current_streak >= ach.condition_value:
            qualifies = True
        elif ach.condition_type == "xp_total" and user_prog.xp_total >= ach.condition_value:
            qualifies = True

        if qualifies:
            db.add(UserAchievement(user_id=user_id, achievement_id=ach.id, unlocked_at=datetime.utcnow()))
            user_prog.xp_total += ach.xp_reward
            unlocked_names.append(ach.name)

    return unlocked_names
