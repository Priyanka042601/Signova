import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Volume2,
  Trophy,
  Award
} from 'lucide-react';
import { api } from '../services/apiClient';
import { LessonDetail, Exercise, AnswerSubmission, LessonAttemptResponse } from '../types/api';
import { SignDemonstration } from '../components/SignDemonstration';
import { XpCelebrationModal } from '../components/XpCelebrationModal';

interface ContextType {
  refreshStats: () => Promise<void>;
}

export const LessonPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { refreshStats } = useOutletContext<ContextType>();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // User responses
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<AnswerSubmission[]>([]);

  // Matching game state
  const [matchPairs, setMatchPairs] = useState<{ left: string; right: string }[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [completedMatches, setCompletedMatches] = useState<string[]>([]);

  // Final Results
  const [attemptResult, setAttemptResult] = useState<LessonAttemptResponse | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [startTime] = useState<number>(Date.now());

  useEffect(() => {
    async function loadLesson() {
      if (!lessonId) return;
      try {
        setLoading(true);
        const data = await api.getLesson(parseInt(lessonId));
        setLesson(data);
      } catch (err) {
        console.error("Failed to load lesson:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [lessonId]);

  // When step changes, setup exercise state
  useEffect(() => {
    setSelectedAnswer('');
    setIsAnswerSubmitted(false);
    setIsCurrentCorrect(null);
    setSelectedLeft(null);
    setSelectedRight(null);

    if (!lesson) return;
    const currentEx = lesson.exercises[currentStepIndex];
    if (currentEx && currentEx.exercise_type === 'match') {
      // Parse match pairs: "Key::Value"
      const pairs: { left: string; right: string }[] = [];
      currentEx.options.forEach((opt) => {
        const parts = opt.split('::');
        if (parts.length === 2) {
          pairs.push({ left: parts[0], right: parts[1] });
        }
      });
      setMatchPairs(pairs);
      setCompletedMatches([]);
    }
  }, [currentStepIndex, lesson]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson || !lesson.exercises || lesson.exercises.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-navy-brand">Lesson not available</h2>
        <button onClick={() => navigate('/learn')} className="mt-4 px-4 py-2 btn-pop-indigo rounded-xl text-sm font-bold">
          Return to Curriculum
        </button>
      </div>
    );
  }

  const currentExercise = lesson.exercises[currentStepIndex];
  const isFinalStep = currentStepIndex >= lesson.exercises.length;
  const progressPercent = Math.min(100, Math.round(((currentStepIndex) / lesson.exercises.length) * 100));

  // Match Pair click handler
  const handleMatchSelect = (type: 'left' | 'right', item: string) => {
    if (type === 'left') {
      setSelectedLeft(item);
      if (selectedRight) {
        checkMatch(item, selectedRight);
      }
    } else {
      setSelectedRight(item);
      if (selectedLeft) {
        checkMatch(selectedLeft, item);
      }
    }
  };

  const checkMatch = (left: string, right: string) => {
    const isPair = matchPairs.some((p) => p.left === left && p.right === right);
    if (isPair) {
      const newDone = [...completedMatches, left];
      setCompletedMatches(newDone);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (newDone.length === matchPairs.length) {
        setIsAnswerSubmitted(true);
        setIsCurrentCorrect(true);
        setSelectedAnswer('MATCH_PAIRS');
      }
    } else {
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  };

  // Submit Answer for current step
  const handleSubmitStepAnswer = () => {
    if (!currentExercise) return;

    let correct = false;
    if (currentExercise.exercise_type === 'learn') {
      correct = true;
    } else if (currentExercise.exercise_type === 'match') {
      correct = completedMatches.length === matchPairs.length;
    } else {
      correct = selectedAnswer.trim().toLowerCase() === currentExercise.answer_reference.trim().toLowerCase();
    }

    setIsCurrentCorrect(correct);
    setIsAnswerSubmitted(true);

    const submission: AnswerSubmission = {
      exercise_id: currentExercise.id,
      selected_answer: selectedAnswer || currentExercise.answer_reference
    };

    setSubmittedAnswers((prev) => [...prev, submission]);
  };

  // Proceed to next step or submit attempt
  const handleNextStep = async () => {
    if (currentStepIndex + 1 < lesson.exercises.length) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Completed all steps! Submit to backend
      try {
        const timeSpent = Math.max(20, Math.round((Date.now() - startTime) / 1000));
        const finalAnswers = [...submittedAnswers];
        // Ensure last answer is included
        if (currentExercise && !finalAnswers.some(a => a.exercise_id === currentExercise.id)) {
          finalAnswers.push({
            exercise_id: currentExercise.id,
            selected_answer: selectedAnswer || currentExercise.answer_reference
          });
        }

        const res = await api.submitLessonAttempt(lesson.id, finalAnswers, timeSpent);
        setAttemptResult(res);
        setCurrentStepIndex(lesson.exercises.length); // triggers results screen
        if (res.passed) {
          setShowCelebration(true);
        }
        await refreshStats();
      } catch (err) {
        console.error("Failed to submit lesson attempt:", err);
      }
    }
  };

  // RENDER: Results Screen (Step 6)
  if (isFinalStep && attemptResult) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center animate-fade-in bg-white dark:bg-[#131C31] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card my-8 transition-colors">
        <XpCelebrationModal
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
          xpEarned={attemptResult.xp_awarded}
          accuracyPercent={attemptResult.accuracy_percent}
          currentStreak={attemptResult.current_streak}
          newAchievements={attemptResult.new_achievements}
        />

        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-blue-600/25 mb-6">
          <Trophy className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-black text-navy-brand dark:text-white mb-2">
          {attemptResult.passed ? "Lesson Complete!" : "Keep Practicing!"}
        </h1>
        <p className="text-sm text-navy-muted dark:text-slate-400 mb-8">
          {attemptResult.passed
            ? "You've successfully mastered this Indian Sign Language module."
            : "Review the answers below and try again to meet the completion threshold."}
        </p>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">XP Earned</span>
            <span className="block text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">+{attemptResult.xp_awarded}</span>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/60">
            <span className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wide">Accuracy</span>
            <span className="block text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{attemptResult.accuracy_percent}%</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">Score</span>
            <span className="block text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">
              {attemptResult.score}/{attemptResult.total_questions}
            </span>
          </div>
        </div>

        {/* Anti-duplicate XP feedback */}
        {!attemptResult.is_first_completion && (
          <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-navy-muted dark:text-slate-400 text-center">
            <span>Lesson previously completed. You earned <strong>+5 XP</strong> practice bonus!</span>
          </div>
        )}

        {/* Review feedback questions */}
        <div className="space-y-3 mb-8 text-left">
          <h3 className="font-bold text-navy-brand dark:text-white text-sm">Question Review:</h3>
          {attemptResult.feedback.map((f, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                f.is_correct
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-rose-50/50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
              }`}
            >
              {f.is_correct ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <span className="font-bold text-navy-brand dark:text-slate-100 block">
                  {f.exercise_type.toUpperCase()} Question: {f.selected_answer}
                </span>
                {f.explanation && <p className="text-navy-muted dark:text-slate-400 mt-1">{f.explanation}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/learn')}
            className="px-6 py-3.5 rounded-2xl btn-pop-outline font-bold text-sm cursor-pointer"
          >
            Back to Curriculum
          </button>
          <button
            onClick={() => navigate('/practice')}
            className="px-6 py-3.5 rounded-2xl btn-pop-blue font-bold text-sm cursor-pointer"
          >
            Practice More Signs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6 animate-fade-in flex flex-col min-h-[80vh]">
      {/* Top Navigation & Progress Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate('/learn')}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Exit lesson"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className="bg-indigo-brand h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <span className="text-xs font-bold text-navy-muted dark:text-slate-400 whitespace-nowrap">
          {currentStepIndex + 1} / {lesson.exercises.length}
        </span>
      </div>

      {/* Main Exercise Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Step Type Tag */}
        <div className="mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            Step {currentStepIndex + 1}: {currentExercise.exercise_type}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-navy-brand dark:text-white mb-6 leading-snug">
          {currentExercise.question}
        </h2>

        {/* 1. Step 1: LEARN (Visual Sign Demonstration) */}
        {currentExercise.exercise_type === 'learn' && currentExercise.vocabulary_item && (
          <div className="space-y-4 mb-6">
            <SignDemonstration
              sign={currentExercise.vocabulary_item}
              autoPlay={true}
              showDetails={true}
            />
          </div>
        )}

        {/* 2. Step 2 & 4: RECOGNIZE & PRACTICE (Multiple Choice) */}
        {(currentExercise.exercise_type === 'recognize' ||
          currentExercise.exercise_type === 'practice' ||
          currentExercise.exercise_type === 'apply') && (
          <div className="space-y-4 mb-6">
            {/* Visual reference for sign recognition if available */}
            {currentExercise.vocabulary_item && (
              <div className="max-w-md mx-auto mb-4">
                <SignDemonstration
                  sign={currentExercise.vocabulary_item}
                  showDetails={false}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentExercise.options.map((opt, idx) => {
                const isSelected = selectedAnswer === opt;
                let btnStyle = 'bg-white dark:bg-[#131C31] border-2 border-slate-200 dark:border-slate-800 text-navy-brand dark:text-slate-200 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40';

                if (isAnswerSubmitted) {
                  const isAnswerCorrect = opt.trim().toLowerCase() === currentExercise.answer_reference.trim().toLowerCase();
                  if (isSelected && isAnswerCorrect) {
                    btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                  } else if (isSelected && !isAnswerCorrect) {
                    btnStyle = 'bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-900 dark:text-rose-200 font-bold';
                  } else if (isAnswerCorrect) {
                    btnStyle = 'bg-emerald-50/50 dark:bg-emerald-950/40 border-2 border-emerald-400 text-emerald-800 dark:text-emerald-300 font-semibold';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-200 font-bold shadow-sm';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !isAnswerSubmitted && setSelectedAnswer(opt)}
                    disabled={isAnswerSubmitted}
                    className={`p-4 rounded-2xl text-left text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswerSubmitted && opt.trim().toLowerCase() === currentExercise.answer_reference.trim().toLowerCase() && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Step 3: MATCH (Interactive Pairs Matching) */}
        {currentExercise.exercise_type === 'match' && (
          <div className="space-y-4 mb-6">
            <p className="text-xs text-navy-muted dark:text-slate-400">
              Tap a sign description on the left, then tap its matching meaning on the right:
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-2.5">
                {matchPairs.map((p, idx) => {
                  const isDone = completedMatches.includes(p.left);
                  const isSelected = selectedLeft === p.left;
                  return (
                    <button
                      key={idx}
                      disabled={isDone}
                      onClick={() => handleMatchSelect('left', p.left)}
                      className={`w-full p-3.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all border-2 cursor-pointer ${
                        isDone
                          ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm'
                          : 'bg-white dark:bg-[#131C31] border-slate-200 dark:border-slate-800 text-navy-brand dark:text-slate-200 hover:border-blue-400'
                      }`}
                    >
                      {p.left}
                    </button>
                  );
                })}
              </div>

              {/* Right Column */}
              <div className="space-y-2.5">
                {matchPairs.map((p, idx) => {
                  const isDone = completedMatches.includes(p.left);
                  const isSelected = selectedRight === p.right;
                  return (
                    <button
                      key={idx}
                      disabled={isDone}
                      onClick={() => handleMatchSelect('right', p.right)}
                      className={`w-full p-3.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all border-2 cursor-pointer ${
                        isDone
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-600 dark:border-sky-500 text-sky-900 dark:text-sky-200 shadow-sm'
                          : 'bg-white dark:bg-[#131C31] border-slate-200 dark:border-slate-800 text-navy-brand dark:text-slate-200 hover:border-sky-400'
                      }`}
                    >
                      {p.right}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Feedback & Action Drawer */}
      <div className={`mt-auto pt-4 border-t transition-all ${
        isAnswerSubmitted
          ? isCurrentCorrect
            ? 'bg-emerald-50/80 dark:bg-emerald-950/60 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 p-6 rounded-b-3xl border-emerald-200 dark:border-emerald-800/80'
            : 'bg-rose-50/80 dark:bg-rose-950/60 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 p-6 rounded-b-3xl border-rose-200 dark:border-rose-800/80'
          : 'bg-transparent border-slate-200 dark:border-slate-800'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Instant feedback text */}
          {isAnswerSubmitted ? (
            <div className="flex items-start gap-3 max-w-lg">
              {isCurrentCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <span className={`font-black text-sm block ${isCurrentCorrect ? 'text-emerald-900 dark:text-emerald-200' : 'text-rose-900 dark:text-rose-200'}`}>
                  {isCurrentCorrect ? "Excellent! That's correct." : "Not quite right"}
                </span>
                {currentExercise.explanation && (
                  <p className="text-xs text-navy-brand dark:text-slate-300 mt-0.5 leading-relaxed">
                    {currentExercise.explanation}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-navy-muted dark:text-slate-400">
              {currentExercise.exercise_type === 'learn'
                ? "Review the sign demonstration and tap Continue when ready."
                : currentExercise.exercise_type === 'match'
                ? `${completedMatches.length}/${matchPairs.length} pairs matched`
                : "Select an option to check your answer."}
            </div>
          )}

          {/* Action button */}
          {!isAnswerSubmitted ? (
            <button
              onClick={handleSubmitStepAnswer}
              disabled={
                currentExercise.exercise_type !== 'learn' &&
                (currentExercise.exercise_type === 'match'
                  ? completedMatches.length !== matchPairs.length
                  : !selectedAnswer)
              }
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                currentExercise.exercise_type === 'learn' ||
                (currentExercise.exercise_type === 'match' ? completedMatches.length === matchPairs.length : selectedAnswer)
                  ? 'btn-pop-blue cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              {currentExercise.exercise_type === 'learn' ? 'Got It, Continue' : 'Check Answer'}
            </button>
          ) : (
            <button
              onClick={handleNextStep}
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 cursor-pointer ${
                isCurrentCorrect ? 'btn-pop-blue' : 'btn-pop-sky'
              }`}
            >
              <span>{currentStepIndex + 1 === lesson.exercises.length ? 'View Results' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
