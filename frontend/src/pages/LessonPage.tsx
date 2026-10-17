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
      <div className="max-w-2xl mx-auto py-8 px-4 text-center animate-fade-in">
        <XpCelebrationModal
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
          xpEarned={attemptResult.xp_awarded}
          accuracyPercent={attemptResult.accuracy_percent}
          currentStreak={attemptResult.current_streak}
          newAchievements={attemptResult.new_achievements}
        />

        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-brand to-berry-brand flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 mb-6">
          <Trophy className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-black text-navy-brand mb-2">
          {attemptResult.passed ? "Lesson Complete!" : "Keep Practicing!"}
        </h1>
        <p className="text-sm text-navy-muted mb-8">
          {attemptResult.passed
            ? "You've successfully mastered this Indian Sign Language module."
            : "Review the answers below and try again to meet the completion threshold."}
        </p>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">XP Earned</span>
            <span className="block text-2xl font-black text-indigo-brand mt-1">+{attemptResult.xp_awarded}</span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
            <span className="text-xs font-bold text-berry-700 uppercase tracking-wide">Accuracy</span>
            <span className="block text-2xl font-black text-berry-brand mt-1">{attemptResult.accuracy_percent}%</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Score</span>
            <span className="block text-2xl font-black text-amber-800 mt-1">
              {attemptResult.score}/{attemptResult.total_questions}
            </span>
          </div>
        </div>

        {/* Anti-duplicate XP feedback */}
        {!attemptResult.is_first_completion && (
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-muted text-center">
            <span>Lesson previously completed. You earned <strong>+5 XP</strong> practice bonus!</span>
          </div>
        )}

        {/* Review feedback questions */}
        <div className="space-y-3 mb-8 text-left">
          <h3 className="font-bold text-navy-brand text-sm">Question Review:</h3>
          {attemptResult.feedback.map((f, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                f.is_correct ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
              }`}
            >
              {f.is_correct ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <span className="font-bold text-navy-brand block">
                  {f.exercise_type.toUpperCase()} Question: {f.selected_answer}
                </span>
                {f.explanation && <p className="text-navy-muted mt-1">{f.explanation}</p>}
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
            className="px-6 py-3.5 rounded-2xl btn-pop-indigo font-bold text-sm cursor-pointer"
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
          className="p-2 rounded-xl text-slate-500 hover:text-navy-brand hover:bg-slate-100 transition-colors"
          title="Exit lesson"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-indigo-brand h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <span className="text-xs font-bold text-navy-muted whitespace-nowrap">
          {currentStepIndex + 1} / {lesson.exercises.length}
        </span>
      </div>

      {/* Main Exercise Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Step Type Tag */}
        <div className="mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-brand border border-indigo-100">
            Step {currentStepIndex + 1}: {currentExercise.exercise_type}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-navy-brand mb-6 leading-snug">
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
                let btnStyle = 'bg-white border-2 border-slate-200 text-navy-brand hover:border-indigo-300 hover:bg-slate-50';

                if (isAnswerSubmitted) {
                  const isAnswerCorrect = opt.trim().toLowerCase() === currentExercise.answer_reference.trim().toLowerCase();
                  if (isSelected && isAnswerCorrect) {
                    btnStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 font-bold';
                  } else if (isSelected && !isAnswerCorrect) {
                    btnStyle = 'bg-rose-50 border-2 border-rose-500 text-rose-900 font-bold';
                  } else if (isAnswerCorrect) {
                    btnStyle = 'bg-emerald-50/50 border-2 border-emerald-400 text-emerald-800 font-semibold';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-indigo-50 border-2 border-indigo-brand text-indigo-900 font-bold shadow-sm';
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
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
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
            <p className="text-xs text-navy-muted">
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
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-indigo-50 border-indigo-brand text-indigo-900 shadow-sm'
                          : 'bg-white border-slate-200 text-navy-brand hover:border-indigo-300'
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
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 cursor-not-allowed'
                          : isSelected
                          ? 'bg-berry-50 border-berry-brand text-berry-900 shadow-sm'
                          : 'bg-white border-slate-200 text-navy-brand hover:border-berry-300'
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
            ? 'bg-emerald-50/80 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 p-6 rounded-b-3xl border-emerald-200'
            : 'bg-rose-50/80 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 p-6 rounded-b-3xl border-rose-200'
          : 'bg-transparent border-slate-200'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Instant feedback text */}
          {isAnswerSubmitted ? (
            <div className="flex items-start gap-3 max-w-lg">
              {isCurrentCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <span className={`font-black text-sm block ${isCurrentCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                  {isCurrentCorrect ? "Excellent! That's correct." : "Not quite right"}
                </span>
                {currentExercise.explanation && (
                  <p className="text-xs text-navy-brand mt-0.5 leading-relaxed">
                    {currentExercise.explanation}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-navy-muted">
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
                  ? 'btn-pop-indigo cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {currentExercise.exercise_type === 'learn' ? 'Got It, Continue' : 'Check Answer'}
            </button>
          ) : (
            <button
              onClick={handleNextStep}
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 cursor-pointer ${
                isCurrentCorrect ? 'btn-pop-indigo' : 'btn-pop-berry'
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
