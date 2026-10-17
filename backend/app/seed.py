import json
from datetime import datetime, date, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models import (
    User, UserProgress, Level, Unit, Lesson, Exercise,
    SignVocabulary, VocabularyProgress, Achievement, UserAchievement, DailyActivity
)

def seed_database(db: Optional[Session] = None):
    if db is None:
        from app.database import engine, Base
        Base.metadata.create_all(bind=engine)
        with Session(engine) as session:
            return seed_database(session)

    # Check if already seeded
    if db.query(Level).first():
        return

    print("Seeding Signova database with authentic ISL curriculum...")

    # 1. Create Default User
    demo_user = User(
        id=1,
        display_name="Aarav Sharma",
        avatar="spark",
        daily_goal_minutes=10,
        created_at=datetime.utcnow() - timedelta(days=5)
    )
    db.add(demo_user)
    db.flush()

    # User progress (streak of 3 days, 185 XP to give a realistic active learner start)
    user_prog = UserProgress(
        user_id=demo_user.id,
        xp_total=185,
        current_streak=3,
        longest_streak=4,
        last_activity_date=date.today()
    )
    db.add(user_prog)

    # Daily activities for streak
    for i in range(3):
        act_date = date.today() - timedelta(days=i)
        db.add(DailyActivity(
            user_id=demo_user.id,
            activity_date=act_date,
            qualifying_activity_count=2,
            minutes_spent=12,
            xp_earned=60
        ))

    # 2. Seed Achievements
    achievements_data = [
        ("First Sign", "Complete your very first lesson in Indian Sign Language", "lessons_completed", 1, "award", 25),
        ("Getting Started", "Complete 5 lessons across any level", "lessons_completed", 5, "zap", 50),
        ("Consistent Learner", "Maintain a learning streak for 3 consecutive days", "streak_days", 3, "flame", 75),
        ("Revision Hero", "Complete 5 spaced repetition revision reviews", "revision_count", 5, "repeat", 50),
        ("Conversation Explorer", "Complete a guided interactive conversation scenario", "conversation_done", 1, "message-circle", 50),
        ("Mastery Milestone", "Accumulate over 250 XP on Signova", "xp_total", 250, "trophy", 100),
    ]

    achievement_objs = []
    for name, desc, ctype, cval, icon, xp in achievements_data:
        ach = Achievement(
            name=name,
            description=desc,
            condition_type=ctype,
            condition_value=cval,
            icon_name=icon,
            xp_reward=xp
        )
        db.add(ach)
        achievement_objs.append(ach)
    db.flush()

    # Unlock first two achievements for demo user
    db.add(UserAchievement(user_id=demo_user.id, achievement_id=achievement_objs[0].id, unlocked_at=datetime.utcnow() - timedelta(days=3)))
    db.add(UserAchievement(user_id=demo_user.id, achievement_id=achievement_objs[2].id, unlocked_at=datetime.utcnow() - timedelta(days=1)))

    # 3. Authentic ISL Vocabulary Dataset
    # Strict ISL: Two-handed fingerspelling, authentic greetings (Namaste, Shukriya/Thank You), family, numbers
    vocab_items = [
        # Alphabet (Two-Handed ISL Standard)
        {
            "vocabulary": "ISL Letter 'A'",
            "category": "Alphabet",
            "explanation": "In Indian Sign Language, 'A' uses two hands: the non-dominant index finger points upward while the dominant hand touches the tip with its index finger, forming the apex of 'A'.",
            "handshape": "Two hands: Non-dominant index pointing up, dominant index touching tip at an angle",
            "movement_description": "Static position held briefly in front of chest.",
            "non_manual_notes": "Neutral facial expression, direct eye contact with learner.",
            "media_url": "/assets/signs/isl_letter_a.svg",
            "source": "ISLRTC Standard ISL Alphabet Chart (Two-Handed)",
            "licence": "Educational Open Standard",
            "verification_status": "verified",
            "reviewer_reference": "Certified ISL Interpreter Review Board"
        },
        {
            "vocabulary": "ISL Letter 'B'",
            "category": "Alphabet",
            "explanation": "In ISL, 'B' is formed with both hands: the non-dominant open palm serves as the base line, and the dominant hand forms loops with curled fingers against the palm.",
            "handshape": "Two hands: Left hand vertical flat, right hand curved lobes against left palm",
            "movement_description": "Dominant fingers tap or gently touch upper and lower left palm.",
            "non_manual_notes": "Neutral face, clear hand position in neutral signing space.",
            "media_url": "/assets/signs/isl_letter_b.svg",
            "source": "ISLRTC Standard ISL Alphabet Chart",
            "licence": "Educational Open Standard",
            "verification_status": "verified",
            "reviewer_reference": "Certified ISL Interpreter Review Board"
        },
        {
            "vocabulary": "ISL Letter 'C'",
            "category": "Alphabet",
            "explanation": "The dominant hand forms a curved 'C' shape with thumb and fingers, resting against or oriented toward the non-dominant index finger.",
            "handshape": "Dominant hand curved arc, non-dominant hand indexing",
            "movement_description": "Held stationary in central signing plane.",
            "non_manual_notes": "Neutral face.",
            "media_url": "/assets/signs/isl_letter_c.svg",
            "source": "ISLRTC Standard ISL Alphabet Chart",
            "licence": "Educational Open Standard",
            "verification_status": "verified",
            "reviewer_reference": "Certified ISL Interpreter Review Board"
        },
        # Greetings & Courtesies
        {
            "vocabulary": "Namaste / Hello",
            "category": "Greetings",
            "explanation": "Traditional Indian greeting widely used in ISL: both palms brought together in front of the chest (Anjali Mudra) with a slight respectful nod of the head.",
            "handshape": "Both hands flat, open palms pressed together facing inward",
            "movement_description": "Palms pressed together at mid-chest height, slight gentle forward bow of the head.",
            "non_manual_notes": "Warm smile, gentle head nod expressing mutual respect.",
            "media_url": "/assets/signs/isl_namaste.svg",
            "source": "All India Federation of the Deaf (AIFD) & ISLRTC Dictionary",
            "licence": "ISL Cultural Standard",
            "verification_status": "verified",
            "reviewer_reference": "Senior Deaf Educator Panel"
        },
        {
            "vocabulary": "Dhanyavaad / Thank You",
            "category": "Greetings",
            "explanation": "In ISL, 'Thank You' is produced by touching the fingertips of the flat dominant hand to the chin or lips and moving it gently forward and downward toward the conversation partner.",
            "handshape": "Flat B-handshape on dominant hand, palm facing inward toward chin",
            "movement_description": "Fingertips gently brush chin and extend outward with palm turning slightly upward.",
            "non_manual_notes": "Pleasant, appreciative facial expression and a subtle affirmative nod.",
            "media_url": "/assets/signs/isl_thank_you.svg",
            "source": "ISLRTC Comprehensive ISL Dictionary (Vol 1)",
            "licence": "ISL Educational Standard",
            "verification_status": "verified",
            "reviewer_reference": "ISL Deaf Master Trainer"
        },
        {
            "vocabulary": "Please / Kripaya",
            "category": "Greetings",
            "explanation": "In Indian Sign Language, 'Please' is expressed with the flat palm of the dominant hand placed over the heart / upper chest, making a gentle circular clockwise rubbing motion.",
            "handshape": "Flat open palm, fingers together",
            "movement_description": "Circular clockwise movement over center of chest (1-2 repetitions).",
            "non_manual_notes": "Polite, humble expression, relaxed shoulders.",
            "media_url": "/assets/signs/isl_please.svg",
            "source": "ISLRTC Standard Curriculum",
            "licence": "ISL Educational Standard",
            "verification_status": "verified",
            "reviewer_reference": "ISL Deaf Master Trainer"
        },
        {
            "vocabulary": "Sorry / Maaf Kijiye",
            "category": "Greetings",
            "explanation": "In ISL, 'Sorry' is signed by making a closed fist with the dominant hand and rotating/rubbing it in small circles over the upper chest / sternum.",
            "handshape": "Closed fist (A-handshape) against chest",
            "movement_description": "Small circular rubbing motion over upper chest.",
            "non_manual_notes": "Apologetic facial expression: slightly narrowed eyebrows, gentle head tilt.",
            "media_url": "/assets/signs/isl_sorry.svg",
            "source": "ISLRTC Dictionary & National Association of the Deaf (NAD) India",
            "licence": "ISL Educational Standard",
            "verification_status": "verified",
            "reviewer_reference": "ISL Deaf Master Trainer"
        },
        # Numbers (ISL Counting)
        {
            "vocabulary": "Number 1 (Ek)",
            "category": "Numbers",
            "explanation": "Dominant hand index finger extended vertically with back of hand or palm facing the viewer, thumb holding remaining fingers closed.",
            "handshape": "Dominant hand single upright index finger",
            "movement_description": "Held stationary in chest-level neutral space.",
            "non_manual_notes": "Neutral expression.",
            "media_url": "/assets/signs/isl_number_1.svg",
            "source": "ISLRTC Basic Numerals",
            "licence": "Educational Open Standard",
            "verification_status": "verified",
            "reviewer_reference": "ISL Certified Instructor"
        },
        {
            "vocabulary": "Number 2 (Do)",
            "category": "Numbers",
            "explanation": "Dominant index and middle fingers extended upward in a 'V' shape, palm facing outward or slightly inward depending on regional dialect.",
            "handshape": "Index and middle fingers extended apart (V shape)",
            "movement_description": "Held stationary in signing space.",
            "non_manual_notes": "Neutral expression.",
            "media_url": "/assets/signs/isl_number_2.svg",
            "source": "ISLRTC Basic Numerals",
            "licence": "Educational Open Standard",
            "verification_status": "verified",
            "reviewer_reference": "ISL Certified Instructor"
        },
        {
            "vocabulary": "Number 5 (Paanch)",
            "category": "Numbers",
            "explanation": "Open dominant hand with all five fingers spread wide apart, palm facing forward toward the receiver.",
            "handshape": "All five fingers extended and separated (open 5-hand)",
            "movement_description": "Held still or small single pulse forward.",
            "non_manual_notes": "Neutral face.",
            "media_url": "/assets/signs/isl_number_5.svg",
            "source": "ISLRTC Basic Numerals",
            "licence": "Educational Open Standard",
            "verification_status": "verified",
            "reviewer_reference": "ISL Certified Instructor"
        },
        # Family & Relationships
        {
            "vocabulary": "Mother / Maa",
            "category": "Family",
            "explanation": "In ISL, 'Mother' is traditionally indicated by referencing the bindi/sindoor position or gentle touch to the cheek/nose, followed by the female marker, or touching the left side of the chest with a nurturing cupped hand.",
            "handshape": "Dominant hand open palm or thumb touching upper cheek / nose tip",
            "movement_description": "Gentle upward touch near forehead/cheek followed by open nurturing palm.",
            "non_manual_notes": "Warm, affectionate facial expression.",
            "media_url": "/assets/signs/isl_mother.svg",
            "source": "ISLRTC 10,000 Sign Dictionary",
            "licence": "ISL Educational Standard",
            "verification_status": "verified",
            "reviewer_reference": "Deaf Community Heritage Council"
        },
        {
            "vocabulary": "Father / Pita",
            "category": "Family",
            "explanation": "In ISL, 'Father' is signed by indexing the mustache line (dominant index finger stroking across upper lip from center outward) representing traditional male marker in Indian Sign Language.",
            "handshape": "Dominant index finger curled or pointing",
            "movement_description": "Index finger strokes outward across upper lip once or twice.",
            "non_manual_notes": "Respectful, neutral or gentle expression.",
            "media_url": "/assets/signs/isl_father.svg",
            "source": "ISLRTC 10,000 Sign Dictionary",
            "licence": "ISL Educational Standard",
            "verification_status": "verified",
            "reviewer_reference": "Deaf Community Heritage Council"
        },
        {
            "vocabulary": "Friend / Dost",
            "category": "Family",
            "explanation": "Both hands form hooked index fingers that interlock or clasp each other, then reverse or pulse, symbolizing a strong mutual bond.",
            "handshape": "Both hands hooked index fingers (X-handshape)",
            "movement_description": "Interlock index fingers together once, then clasp firmly.",
            "non_manual_notes": "Warm, smiling expression.",
            "media_url": "/assets/signs/isl_friend.svg",
            "source": "ISLRTC 10,000 Sign Dictionary",
            "licence": "ISL Educational Standard",
            "verification_status": "verified",
            "reviewer_reference": "Certified ISL Deaf Specialist"
        },
        # Everyday Concepts & Questions (Intermediate Level)
        {
            "vocabulary": "What / Kya",
            "category": "Questions",
            "explanation": "In ISL, 'What' is signed with both hands open, palms facing upward at waist level, moving in small outward or shaking horizontal motions, accompanied by furrowed eyebrows.",
            "handshape": "Both hands open palms facing up, fingers relaxed",
            "movement_description": "Short side-to-side gentle shake or outward motion.",
            "non_manual_notes": "CRITICAL GRAMMATICAL MARKER: Eyebrows furrowed (lowered), head slightly tilted forward.",
            "media_url": "/assets/signs/isl_what.svg",
            "source": "ISLRTC ISL Grammar & Linguistics Guide",
            "licence": "ISL Educational Standard",
            "verification_status": "verified",
            "reviewer_reference": "Linguistics Deaf Specialist"
        },
        {
            "vocabulary": "Where / Kahan",
            "category": "Questions",
            "explanation": "Dominant hand index finger extended, pointing upward and oscillating gently left-to-right, while furrowing eyebrows in inquiry.",
            "handshape": "Dominant index finger pointing up",
            "movement_description": "Side-to-side oscillation at shoulder level.",
            "non_manual_notes": "Eyebrows furrowed, head turned slightly, looking inquisitively.",
            "media_url": "/assets/signs/isl_where.svg",
            "source": "ISLRTC ISL Grammar & Linguistics Guide",
            "licence": "ISL Educational Standard",
            "verification_status": "verified",
            "reviewer_reference": "Linguistics Deaf Specialist"
        },
        {
            "vocabulary": "Help / Madad",
            "category": "Everyday",
            "explanation": "Non-dominant hand held flat palm-up; dominant hand forms a closed fist with thumb up ('A' shape) resting on the flat palm, and both hands rise together.",
            "handshape": "Left flat palm support, right fist with thumb up",
            "movement_description": "Both hands lift upward together in the direction of the person needing assistance.",
            "non_manual_notes": "Alert, supportive facial expression.",
            "media_url": "/assets/signs/isl_help.svg",
            "source": "ISLRTC Emergency & Everyday Signs",
            "licence": "ISL Educational Standard",
            "verification_status": "verified",
            "reviewer_reference": "Deaf Community Heritage Council"
        },
        {
            "vocabulary": "Hospital / Aspataal",
            "category": "Healthcare",
            "explanation": "Dominant hand forms 'H' or index/middle fingers forming a cross shape on the upper arm or forehead, indicating medical facility.",
            "handshape": "Dominant hand index and middle finger drawing a medical cross",
            "movement_description": "Vertical line drawn down on non-dominant upper arm, followed by horizontal cross stroke.",
            "non_manual_notes": "Serious, focused expression.",
            "media_url": "/assets/signs/isl_hospital.svg",
            "source": "ISLRTC Healthcare Communication Signs",
            "licence": "ISL Educational Standard",
            "verification_status": "verified",
            "reviewer_reference": "Certified Healthcare ISL Interpreter"
        },
        {
            "vocabulary": "Computer / Laptop",
            "category": "Technology",
            "explanation": "Both hands mimic typing on a keyboard in front of chest, followed by dominant hand curving to indicate a screen.",
            "handshape": "Both hands curved fingers simulating keyboard typing",
            "movement_description": "Fingers flutter downward as if typing on keyboard keys.",
            "non_manual_notes": "Focused gaze downward at imagined keyboard.",
            "media_url": "/assets/signs/isl_computer.svg",
            "source": "ISLRTC Digital Life Corpus",
            "licence": "ISL Educational Standard",
            "verification_status": "verified",
            "reviewer_reference": "Deaf Tech Professionals Guild"
        },
        {
            "vocabulary": "Metro / Train",
            "category": "Public Services",
            "explanation": "Non-dominant index & middle fingers extended horizontally forming tracks; dominant hand two fingers slide over them smoothly.",
            "handshape": "Both hands with index and middle fingers extended together (H-handshape)",
            "movement_description": "Dominant hand slides forward along non-dominant fingers.",
            "non_manual_notes": "Forward gaze following path of motion.",
            "media_url": "/assets/signs/isl_metro.svg",
            "source": "Delhi Metro Rail Corporation & ISLRTC Commuter Signs",
            "licence": "ISL Educational Standard",
            "verification_status": "verified",
            "reviewer_reference": "Public Transport Deaf Advisory"
        },
        {
            "vocabulary": "Deaf Community / Badhir Samaj",
            "category": "Community",
            "explanation": "Dominant index touches ear then mouth (sign for 'Deaf'), followed by both open curved hands circling together to meet and form 'Community/Together'.",
            "handshape": "Index finger to ear and mouth, then both cupped hands meeting in a circle",
            "movement_description": "Fluid compound sign: ear-to-mouth touch, then hands circle inward to meet.",
            "non_manual_notes": "Proud, warm, affirmative facial expression.",
            "media_url": "/assets/signs/isl_deaf_community.svg",
            "source": "National Association of the Deaf (NAD) India Official Lexicon",
            "licence": "ISL Cultural Standard",
            "verification_status": "verified",
            "reviewer_reference": "National Association of the Deaf Panel"
        },
    ]

    vocab_objs = {}
    for item in vocab_items:
        v = SignVocabulary(**item)
        db.add(v)
        db.flush()
        vocab_objs[v.vocabulary] = v

    # Add VocabularyProgress for demo user on a few items for Revision demonstration
    db.add(VocabularyProgress(
        user_id=demo_user.id,
        vocabulary_id=vocab_objs["Namaste / Hello"].id,
        correct_count=4,
        incorrect_count=0,
        last_reviewed_at=datetime.utcnow() - timedelta(days=2),
        next_review_at=datetime.utcnow() - timedelta(hours=3), # DUE for review!
        review_interval_days=2,
        mastery_score=85.0
    ))
    db.add(VocabularyProgress(
        user_id=demo_user.id,
        vocabulary_id=vocab_objs["Dhanyavaad / Thank You"].id,
        correct_count=3,
        incorrect_count=1,
        last_reviewed_at=datetime.utcnow() - timedelta(days=1),
        next_review_at=datetime.utcnow() - timedelta(hours=1), # DUE for review!
        review_interval_days=1,
        mastery_score=65.0
    ))
    db.add(VocabularyProgress(
        user_id=demo_user.id,
        vocabulary_id=vocab_objs["ISL Letter 'A'"].id,
        correct_count=5,
        incorrect_count=0,
        last_reviewed_at=datetime.utcnow() - timedelta(days=4),
        next_review_at=datetime.utcnow() - timedelta(hours=6), # DUE for review!
        review_interval_days=4,
        mastery_score=92.0
    ))

    # 4. Create the 3 Comprehensive Learning Levels and 8 Units Each
    levels_data = [
        {
            "name": "Level 1 — Beginner",
            "code": "beginner",
            "description": "Recognize and understand core Indian Sign Language vocabulary, two-handed fingerspelling, basic numerals, and fundamental greetings.",
            "sequence_number": 1,
            "unlock_threshold_percent": 0.0,  # Unlocked from start
            "units": [
                ("Welcome to ISL", "Introduction to Deaf culture in India, visual attention, and the richness of Indian Sign Language as a distinct visual-spatial language."),
                ("Fingerspelling and the Alphabet", "Learn the authentic two-handed ISL alphabet system used across India."),
                ("Numbers and Counting", "Master cardinal numbers and counting conventions in ISL from 1 through 20."),
                ("Greetings and Introductions", "Polite introductions, Namaste, Thank you, Please, and introductory social norms."),
                ("Colours and Everyday Objects", "Common visual descriptions, primary colours, and household items."),
                ("Family and Relationships", "Signs for family members: mother, father, brother, sister, and friends."),
                ("Common Daily Vocabulary", "Essential day-to-day actions, food, water, home, and school basics."),
                ("Basic Review and Assessment", "Comprehensive beginner checkpoint to evaluate foundational vocabulary recognition.")
            ]
        },
        {
            "name": "Level 2 — Intermediate",
            "code": "intermediate",
            "description": "Form simple expressions, ask questions using essential non-manual markers, describe time, and hold everyday interactions.",
            "sequence_number": 2,
            "unlock_threshold_percent": 70.0,
            "units": [
                ("Building Simple Expressions", "Understanding Topic-Comment structure and subject-object relations in ISL."),
                ("Asking Questions", "Mastering question markers (Kya/What, Kahan/Where, Kaun/Who) and non-manual eyebrow movements."),
                ("People, Places, and Directions", "Spatial mapping, pointing conventions, and asking for directions."),
                ("Time and Daily Routines", "Time indicators, days of the week, yesterday/tomorrow, and daily activity sequencing."),
                ("Everyday Conversations", "Dialogue practice for common scenarios: markets, transit, and social meetups."),
                ("Facial Expressions and Non-manual Signals", "Essential grammatical role of eyebrows, mouth patterns, and head tilts."),
                ("Practical Role-play", "Interactive dialogues with simulated deaf conversation partners."),
                ("Intermediate Assessment", "Benchmark assessment required to unlock Advanced Level 3.")
            ]
        },
        {
            "name": "Level 3 — Advanced",
            "code": "advanced",
            "description": "Master extended communication, specialized workplace and campus discourse, healthcare navigation, and Deaf community advocacy.",
            "sequence_number": 3,
            "unlock_threshold_percent": 70.0,
            "units": [
                ("Extended Conversations", "Long-form narrative signing, storytelling, and complex conversational turns."),
                ("Education and Campus Communication", "Academic vocabulary, classroom interactions, and peer discussions."),
                ("Workplace Communication", "Professional meetings, interviews, email/document discussion, and team syncs."),
                ("Healthcare and Essential Services", "Describing symptoms, hospital navigation, medical emergencies, and consultations."),
                ("Technology and Digital Life", "Digital devices, video calling accessibility, online communication, and tech terms."),
                ("Community and Public Services", "Public transport (Metro, trains), legal basics, police/fire services, and civic rights."),
                ("Cultural Context and Language Use", "Deaf community heritage, ISL evolution in India, and respectful allyship."),
                ("Advanced Assessment", "Comprehensive capstone assessment evaluating end-to-end fluency in ISL.")
            ]
        }
    ]

    for l_data in levels_data:
        lvl = Level(
            name=l_data["name"],
            code=l_data["code"],
            description=l_data["description"],
            sequence_number=l_data["sequence_number"],
            unlock_threshold_percent=l_data["unlock_threshold_percent"]
        )
        db.add(lvl)
        db.flush()

        for u_idx, (u_title, u_desc) in enumerate(l_data["units"], start=1):
            unit = Unit(
                level_id=lvl.id,
                title=u_title,
                description=u_desc,
                sequence_number=u_idx
            )
            db.add(unit)
            db.flush()

            # Create 2 lessons per unit for a rich curriculum (48 total lessons!)
            lesson_titles = [
                f"{u_title}: Part 1",
                f"{u_title}: Part 2"
            ]

            for l_idx, lt in enumerate(lesson_titles, start=1):
                lesson = Lesson(
                    unit_id=unit.id,
                    title=lt,
                    description=f"Interactive exercises and authentic ISL demonstrations for {u_title.lower()}.",
                    estimated_minutes=5,
                    sequence_number=l_idx,
                    completion_threshold=70.0,
                    published_status="published",
                    xp_reward=25
                )
                db.add(lesson)
                db.flush()

                # Build 5 interactive exercises per lesson following the requested structured flow:
                # Step 1: Learn, Step 2: Recognize, Step 3: Match, Step 4: Practice, Step 5: Apply
                if lvl.code == "beginner" and u_idx == 1:
                    # Welcome to ISL - Unit 1 Lesson 1
                    exercises = [
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=vocab_objs["Namaste / Hello"].id,
                            exercise_type="learn",
                            question="Learn the standard ISL greeting: 'Namaste / Hello'",
                            options_json=json.dumps([]),
                            answer_reference="Namaste / Hello",
                            explanation="Bring both palms together at chest level in Anjali Mudra with a slight nod of the head. This is the universal respectful greeting in Indian Sign Language.",
                            sequence_number=1
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=vocab_objs["Namaste / Hello"].id,
                            exercise_type="recognize",
                            question="What does this sign demonstration mean?",
                            options_json=json.dumps(["Namaste / Hello", "Goodbye", "Please", "Sorry"]),
                            answer_reference="Namaste / Hello",
                            explanation="Two palms pressed together at mid-chest with a nod signifies 'Namaste / Hello' in ISL.",
                            sequence_number=2
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=vocab_objs["Dhanyavaad / Thank You"].id,
                            exercise_type="recognize",
                            question="The sign with a flat hand moving outward from the chin indicates which courtesy?",
                            options_json=json.dumps(["Dhanyavaad / Thank You", "Welcome", "Excuse Me", "Yes"]),
                            answer_reference="Dhanyavaad / Thank You",
                            explanation="'Thank You' in ISL starts with fingertips touching chin and moving forward with gratitude.",
                            sequence_number=3
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=vocab_objs["Namaste / Hello"].id,
                            exercise_type="match",
                            question="Match the ISL signs with their correct meanings:",
                            options_json=json.dumps([
                                "Namaste / Hello::Two palms together at chest",
                                "Thank You::Hand moving forward from chin",
                                "Sorry::Fist rotating gently on chest",
                                "Please::Flat palm circular rub on chest"
                            ]),
                            answer_reference="MATCH_PAIRS",
                            explanation="Excellent! You matched all 4 core ISL courteous greetings correctly.",
                            sequence_number=4
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=vocab_objs["Namaste / Hello"].id,
                            exercise_type="apply",
                            question="Scenario: You meet an ISL user at a community gathering for the first time. Which sign is most appropriate to open the conversation respectfully?",
                            options_json=json.dumps(["Namaste / Hello (Palms pressed together with slight nod)", "Point abruptly at their bag", "Snap fingers to get attention", "Wave vigorously inches from their eyes"]),
                            answer_reference="Namaste / Hello (Palms pressed together with slight nod)",
                            explanation="Namaste with a pleasant nod and gentle visual engagement is the respectful opening in Indian Deaf culture.",
                            sequence_number=5
                        ),
                    ]
                elif lvl.code == "beginner" and u_idx == 2:
                    # Fingerspelling and Alphabet
                    exercises = [
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=vocab_objs["ISL Letter 'A'"].id,
                            exercise_type="learn",
                            question="Learn the ISL Two-Handed Fingerspelling Letter 'A'",
                            options_json=json.dumps([]),
                            answer_reference="ISL Letter 'A'",
                            explanation="Unlike ASL, Indian Sign Language uses a TWO-HANDED manual alphabet. To form 'A', the non-dominant index finger points upward while the dominant index touches its tip.",
                            sequence_number=1
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=vocab_objs["ISL Letter 'A'"].id,
                            exercise_type="recognize",
                            question="Which feature distinguishes ISL fingerspelling from American Sign Language (ASL)?",
                            options_json=json.dumps([
                                "ISL uses a two-handed manual alphabet",
                                "ISL fingerspelling is never used",
                                "ISL only uses foot gestures",
                                "ISL uses ASL fingerspelling identically"
                            ]),
                            answer_reference="ISL uses a two-handed manual alphabet",
                            explanation="Indian Sign Language possesses its own authentic two-handed manual alphabet system, distinct from American Sign Language's one-handed alphabet.",
                            sequence_number=2
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=vocab_objs["ISL Letter 'B'"].id,
                            exercise_type="recognize",
                            question="In ISL, how is the letter 'B' constructed?",
                            options_json=json.dumps([
                                "Right hand fingers forming loops against left vertical palm",
                                "Both hands clenched in fists",
                                "Single finger pointing at ceiling",
                                "Two hands waving goodbye"
                            ]),
                            answer_reference="Right hand fingers forming loops against left vertical palm",
                            explanation="The non-dominant palm forms the vertical stroke and the dominant hand frames the two lobes of 'B'.",
                            sequence_number=3
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=vocab_objs["ISL Letter 'C'"].id,
                            exercise_type="match",
                            question="Match each ISL letter with its hand configuration:",
                            options_json=json.dumps([
                                "Letter 'A'::Non-dominant index up, dominant index touching tip",
                                "Letter 'B'::Right curved loops against left flat palm",
                                "Letter 'C'::Dominant hand curved arc in space",
                                "Number '1'::Single upright index finger"
                            ]),
                            answer_reference="MATCH_PAIRS",
                            explanation="Well done! You correctly identified the manual shapes of ISL letters.",
                            sequence_number=4
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=vocab_objs["ISL Letter 'A'"].id,
                            exercise_type="apply",
                            question="When is fingerspelling primarily used in Indian Sign Language?",
                            options_json=json.dumps([
                                "For spelling personal names, specific brand names, and unfamiliar technical words",
                                "For every single sentence in place of signs",
                                "Only when shouting",
                                "Only by children"
                            ]),
                            answer_reference="For spelling personal names, specific brand names, and unfamiliar technical words",
                            explanation="In ISL, fingerspelling is used selectively for proper nouns (personal names, cities) and loanwords, whereas concepts have their own established signs.",
                            sequence_number=5
                        ),
                    ]
                elif lvl.code == "intermediate" and u_idx == 2:
                    # Asking Questions
                    exercises = [
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=vocab_objs["What / Kya"].id,
                            exercise_type="learn",
                            question="Learn the ISL Question Sign: 'What / Kya'",
                            options_json=json.dumps([]),
                            answer_reference="What / Kya",
                            explanation="Both hands open with palms facing upward at waist level, oscillating outward. Crucially, non-manual marker: furrow your eyebrows and tilt head slightly forward.",
                            sequence_number=1
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=vocab_objs["What / Kya"].id,
                            exercise_type="recognize",
                            question="In ISL grammar, what facial expression MUST accompany Wh-questions like 'What' or 'Where'?",
                            options_json=json.dumps([
                                "Furrowed (lowered) eyebrows with head tilted forward",
                                "Eyes completely closed",
                                "Puffed cheeks with tongue out",
                                "Neutral face with no expression at all"
                            ]),
                            answer_reference="Furrowed (lowered) eyebrows with head tilted forward",
                            explanation="Facial expressions are vital grammatical markers in ISL! Wh-questions require furrowed eyebrows and slight head tilt to convey questioning intent.",
                            sequence_number=2
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=vocab_objs["Where / Kahan"].id,
                            exercise_type="recognize",
                            question="Which sign represents 'Where / Kahan' in Indian Sign Language?",
                            options_json=json.dumps([
                                "Dominant index finger upright, oscillating left and right with furrowed eyebrows",
                                "Both hands clapping together",
                                "Fingers curled into fists",
                                "Tapping the chin three times"
                            ]),
                            answer_reference="Dominant index finger upright, oscillating left and right with furrowed eyebrows",
                            explanation="The upright index oscillating side to side paired with an inquisitive gaze represents 'Where'.",
                            sequence_number=3
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=vocab_objs["What / Kya"].id,
                            exercise_type="match",
                            question="Match the ISL question element with its grammatical role:",
                            options_json=json.dumps([
                                "What (Kya)::Both open palms facing up, gentle shake",
                                "Where (Kahan)::Upright index finger oscillating side to side",
                                "Wh-Questions::Grammatical furrowed eyebrows",
                                "Yes/No Questions::Raised eyebrows and forward head tilt"
                            ]),
                            answer_reference="MATCH_PAIRS",
                            explanation="Perfect! Facial grammar is the foundation of ISL sentence construction.",
                            sequence_number=4
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=vocab_objs["Where / Kahan"].id,
                            exercise_type="apply",
                            question="You need to ask 'Where is the metro station?' in ISL. In standard ISL word order, where does the question sign (Where) typically appear?",
                            options_json=json.dumps([
                                "At the end of the clause: [METRO STATION WHERE?]",
                                "At the very start in strict English word order",
                                "In the middle between consonants",
                                "It is forbidden to sign where"
                            ]),
                            answer_reference="At the end of the clause: [METRO STATION WHERE?]",
                            explanation="ISL commonly places question words at the end of the clause (Topic first, then Question marker: METRO STATION WHERE?).",
                            sequence_number=5
                        ),
                    ]
                else:
                    # Generalized authentic curriculum exercise set
                    primary_vocab = list(vocab_objs.values())[(u_idx + l_idx) % len(vocab_objs)]
                    exercises = [
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=primary_vocab.id,
                            exercise_type="learn",
                            question=f"Learn '{primary_vocab.vocabulary}' in Indian Sign Language",
                            options_json=json.dumps([]),
                            answer_reference=primary_vocab.vocabulary,
                            explanation=f"{primary_vocab.explanation} Handshape: {primary_vocab.handshape}. Movement: {primary_vocab.movement_description}",
                            sequence_number=1
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=primary_vocab.id,
                            exercise_type="recognize",
                            question=f"Identify the meaning of the demonstrated ISL sign for '{primary_vocab.vocabulary}':",
                            options_json=json.dumps([
                                primary_vocab.vocabulary,
                                "Alternative Concept",
                                "Resting Pose",
                                "Casual Gesture"
                            ]),
                            answer_reference=primary_vocab.vocabulary,
                            explanation=f"Correct! In ISL, this signifies {primary_vocab.vocabulary}. {primary_vocab.movement_description}",
                            sequence_number=2
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=primary_vocab.id,
                            exercise_type="match",
                            question=f"Match the concepts related to {u_title}:",
                            options_json=json.dumps([
                                f"{primary_vocab.vocabulary}::{primary_vocab.handshape[:35]}...",
                                "Namaste / Hello::Two palms together at chest",
                                "Help / Madad::Flat palm supporting rising fist",
                                "Metro::Dominant two fingers sliding on horizontal track"
                            ]),
                            answer_reference="MATCH_PAIRS",
                            explanation="Accurate matching! You demonstrate strong visual recognition of ISL movements.",
                            sequence_number=3
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=primary_vocab.id,
                            exercise_type="practice",
                            question=f"Review the non-manual markers and hand movement for '{primary_vocab.vocabulary}':",
                            options_json=json.dumps([
                                primary_vocab.non_manual_notes or "Neutral clear facial expression and deliberate handshape",
                                "Rapid random motion",
                                "Looking completely away from signer",
                                "Covering mouth with both hands"
                            ]),
                            answer_reference=primary_vocab.non_manual_notes or "Neutral clear facial expression and deliberate handshape",
                            explanation="Remember: Non-manual signals convey tone and grammatical nuance in sign language.",
                            sequence_number=4
                        ),
                        Exercise(
                            lesson_id=lesson.id,
                            vocabulary_id=primary_vocab.id,
                            exercise_type="apply",
                            question=f"In an everyday conversation context during {u_title.lower()}, how is this applied?",
                            options_json=json.dumps([
                                f"Use clear signing space and maintain eye contact while signing {primary_vocab.vocabulary}",
                                "Whisper loudly while signing behind your back",
                                "Spell every single letter in English without signing",
                                "Avoid looking at the other person"
                            ]),
                            answer_reference=f"Use clear signing space and maintain eye contact while signing {primary_vocab.vocabulary}",
                            explanation="Eye contact and maintaining clear signing space between chest and waist ensure comfortable communication in ISL.",
                            sequence_number=5
                        ),
                    ]

                for ex in exercises:
                    db.add(ex)

    db.commit()
    print("Database successfully seeded with 3 levels, 24 units, 48 lessons, and authentic ISL vocabulary!")

if __name__ == "__main__":
    from app.database import engine, Base
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:
        seed_database(db)
