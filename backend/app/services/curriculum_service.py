from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Level, Unit, Lesson, LessonAttempt, UserProgress

def get_levels_with_progress(db: Session, user_id: int):
    levels = db.query(Level).order_by(Level.sequence_number).all()

    # Get all completed lesson IDs for this user
    completed_lesson_ids = set(
        res[0] for res in db.query(LessonAttempt.lesson_id)
        .filter(LessonAttempt.user_id == user_id, LessonAttempt.passed == True)
        .distinct()
        .all()
    )

    result = []
    previous_level_passed = True  # Beginner starts unlocked

    for lvl in levels:
        units_data = []
        lvl_total_lessons = 0
        lvl_completed_lessons = 0

        for unit in lvl.units:
            lessons_data = []
            unit_completed = 0
            unit_total = len(unit.lessons)

            for lsn in unit.lessons:
                is_comp = lsn.id in completed_lesson_ids
                if is_comp:
                    unit_completed += 1
                lessons_data.append({
                    "id": lsn.id,
                    "unit_id": lsn.unit_id,
                    "title": lsn.title,
                    "description": lsn.description,
                    "estimated_minutes": lsn.estimated_minutes,
                    "sequence_number": lsn.sequence_number,
                    "completion_threshold": lsn.completion_threshold,
                    "published_status": lsn.published_status,
                    "xp_reward": lsn.xp_reward,
                    "is_completed": is_comp,
                    "is_locked": not previous_level_passed
                })

            lvl_total_lessons += unit_total
            lvl_completed_lessons += unit_completed

            units_data.append({
                "id": unit.id,
                "level_id": unit.level_id,
                "title": unit.title,
                "description": unit.description,
                "sequence_number": unit.sequence_number,
                "lessons": lessons_data,
                "completed_lessons_count": unit_completed,
                "total_lessons_count": unit_total
            })

        prog_percent = (lvl_completed_lessons / lvl_total_lessons * 100.0) if lvl_total_lessons > 0 else 0.0

        is_unlocked = previous_level_passed
        # Determine if this level qualifies to unlock the next level
        if prog_percent >= lvl.unlock_threshold_percent:
            previous_level_passed = True
        else:
            previous_level_passed = False

        result.append({
            "id": lvl.id,
            "name": lvl.name,
            "code": lvl.code,
            "description": lvl.description,
            "sequence_number": lvl.sequence_number,
            "unlock_threshold_percent": lvl.unlock_threshold_percent,
            "is_unlocked": is_unlocked,
            "completed_lessons_count": lvl_completed_lessons,
            "total_lessons_count": lvl_total_lessons,
            "progress_percent": round(prog_percent, 1),
            "units": units_data
        })

    return result

def get_lesson_detail(db: Session, lesson_id: int, user_id: int):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        return None

    # Check if user has completed it
    is_completed = db.query(LessonAttempt).filter(
        LessonAttempt.user_id == user_id,
        LessonAttempt.lesson_id == lesson_id,
        LessonAttempt.passed == True
    ).first() is not None

    exercises_data = []
    for ex in lesson.exercises:
        exercises_data.append({
            "id": ex.id,
            "lesson_id": ex.lesson_id,
            "vocabulary_id": ex.vocabulary_id,
            "exercise_type": ex.exercise_type,
            "question": ex.question,
            "options": ex.options,
            "answer_reference": ex.answer_reference,
            "explanation": ex.explanation,
            "sequence_number": ex.sequence_number,
            "vocabulary_item": ex.vocabulary_item
        })

    unit = lesson.unit
    level = unit.level if unit else None

    return {
        "id": lesson.id,
        "unit_id": lesson.unit_id,
        "unit_title": unit.title if unit else None,
        "level_id": level.id if level else None,
        "level_name": level.name if level else None,
        "title": lesson.title,
        "description": lesson.description,
        "estimated_minutes": lesson.estimated_minutes,
        "sequence_number": lesson.sequence_number,
        "completion_threshold": lesson.completion_threshold,
        "published_status": lesson.published_status,
        "xp_reward": lesson.xp_reward,
        "exercises": exercises_data,
        "is_completed": is_completed
    }
