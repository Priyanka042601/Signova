export interface SignVocabulary {
  id: number;
  vocabulary: string;
  category: string;
  explanation: string;
  handshape?: string;
  movement_description?: string;
  non_manual_notes?: string;
  media_url?: string;
  diagram_type?: string;
  source: string;
  licence: string;
  verification_status: 'verified' | 'pending_review' | 'placeholder';
  reviewer_reference?: string;
  last_reviewed_at?: string;
  is_favourite?: boolean;
}

export interface Exercise {
  id: number;
  lesson_id: number;
  vocabulary_id?: number;
  exercise_type: 'learn' | 'recognize' | 'match' | 'practice' | 'apply' | 'scenario';
  question: string;
  options: string[];
  answer_reference: string;
  explanation?: string;
  sequence_number: number;
  vocabulary_item?: SignVocabulary;
}

export interface LessonSummary {
  id: number;
  unit_id: number;
  title: string;
  description?: string;
  estimated_minutes: number;
  sequence_number: number;
  completion_threshold: number;
  published_status: string;
  xp_reward: number;
  is_completed: boolean;
  best_score?: number;
  is_locked: boolean;
}

export interface LessonDetail {
  id: number;
  unit_id: number;
  unit_title?: string;
  level_id?: number;
  level_name?: string;
  title: string;
  description?: string;
  estimated_minutes: number;
  sequence_number: number;
  completion_threshold: number;
  published_status: string;
  xp_reward: number;
  exercises: Exercise[];
  is_completed: boolean;
}

export interface UnitWithLessons {
  id: number;
  level_id: number;
  title: string;
  description?: string;
  sequence_number: number;
  lessons: LessonSummary[];
  completed_lessons_count: number;
  total_lessons_count: number;
}

export interface LevelWithUnits {
  id: number;
  name: string;
  code: string;
  description: string;
  sequence_number: number;
  unlock_threshold_percent: number;
  is_unlocked: boolean;
  completed_lessons_count: number;
  total_lessons_count: number;
  progress_percent: number;
  units: UnitWithLessons[];
}

export interface AnswerSubmission {
  exercise_id: number;
  selected_answer: string;
}

export interface LessonAttemptResponse {
  attempt_id: number;
  lesson_id: number;
  score: number;
  total_questions: number;
  accuracy_percent: number;
  passed: boolean;
  xp_awarded: number;
  is_first_completion: boolean;
  new_xp_total: number;
  current_streak: number;
  new_achievements: string[];
  feedback: {
    exercise_id: number;
    exercise_type: string;
    is_correct: boolean;
    selected_answer: string;
    correct_answer: string;
    explanation?: string;
  }[];
}

export interface RevisionItem {
  vocabulary_id: number;
  vocabulary: string;
  category: string;
  explanation: string;
  handshape?: string;
  movement_description?: string;
  non_manual_notes?: string;
  verification_status: string;
  media_url?: string;
  correct_count: number;
  incorrect_count: number;
  mastery_score: number;
  review_interval_days: number;
  next_review_at: string;
}

export interface RevisionAttemptResponse {
  vocabulary_id: number;
  new_interval_days: number;
  new_mastery_score: number;
  next_review_at: string;
  xp_awarded: number;
}

export interface PracticeQuestion {
  id: number;
  vocabulary_id: number;
  vocabulary: string;
  category: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  verification_status: string;
  handshape?: string;
  movement_description?: string;
}

export interface PracticeAttemptResponse {
  score: number;
  total_questions: number;
  accuracy_percent: number;
  xp_awarded: number;
  new_xp_total: number;
  recommendation: string;
}

export interface AchievementItem {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  condition_type: string;
  condition_value: number;
  xp_reward: number;
  is_unlocked: boolean;
  unlocked_at?: string;
}

export interface ProfileResponse {
  id: number;
  display_name: string;
  avatar: string;
  daily_goal_minutes: number;
  xp_total: number;
  current_streak: number;
  longest_streak: number;
  completed_lessons_count: number;
  total_lessons_count: number;
  overall_progress_percent: number;
  current_level_name: string;
  today_minutes_spent: number;
  today_xp_earned: number;
  today_goal_completed: boolean;
  recent_achievements: AchievementItem[];
  level_breakdown: {
    id: number;
    name: string;
    code: string;
    completed: number;
    total: number;
    percent: number;
  }[];
}

export interface DashboardSummary {
  user_name: string;
  current_level_name: string;
  xp_total: number;
  current_streak: number;
  longest_streak: number;
  completed_lessons_count: number;
  total_lessons_count: number;
  overall_progress_percent: number;
  daily_goal_minutes: number;
  today_minutes_spent: number;
  today_goal_percent: number;
  next_recommended_lesson?: LessonSummary;
  daily_challenge: {
    title: string;
    description: string;
    target: number;
    current: number;
    reward_xp: number;
    is_completed: boolean;
  };
  featured_sign_of_the_day?: SignVocabulary;
  revision_due_count: number;
}

export interface ConversationStep {
  speaker: string;
  dialogue: string;
  gloss?: string;
  translation?: string;
  prompt: string;
  options: {
    text: string;
    is_correct: boolean;
    feedback: string;
  }[];
}

export interface ConversationScenario {
  id: string;
  title: string;
  difficulty: string;
  estimated_minutes: number;
  location: string;
  description: string;
  learning_objective: string;
  verified_vocab: string[];
  steps: ConversationStep[];
}

export interface UserAuthResponse {
  id: number;
  clerk_id?: string;
  email?: string;
  display_name: string;
  avatar: string;
  role: string;
  xp_total: number;
  current_streak: number;
  longest_streak: number;
}
