import React, { useState, useEffect } from 'react';
import { useOutletContext, NavLink } from 'react-router-dom';
import {
  MessageSquare,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Award,
  BookOpen
} from 'lucide-react';
import { api } from '../services/apiClient';
import { ConversationScenario, ConversationStep, DashboardSummary } from '../types/api';
import { XpCelebrationModal } from '../components/XpCelebrationModal';

interface ContextType {
  refreshStats: () => Promise<void>;
  dashboardData?: DashboardSummary | null;
}

export const ConversationLabPage: React.FC = () => {
  const { refreshStats, dashboardData } = useOutletContext<ContextType>();
  const [scenarios, setScenarios] = useState<ConversationScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<ConversationScenario | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScenarios() {
      try {
        setLoading(true);
        const list = await api.getConversationScenarios();
        setScenarios(list);
        if (list.length > 0) {
          setSelectedScenario(list[0]);
        }
      } catch (err) {
        console.error("Failed to load conversation scenarios:", err);
      } finally {
        setLoading(false);
      }
    }
    loadScenarios();
  }, []);

  const resetScenario = (sc: ConversationScenario) => {
    setSelectedScenario(sc);
    setStepIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerChecked(false);
    setIsCompleted(false);
  };

  const handleCheckAnswer = () => {
    if (selectedOptionIndex === null) return;
    setIsAnswerChecked(true);
  };

  const handleNextStep = async () => {
    if (!selectedScenario) return;
    if (stepIndex + 1 < selectedScenario.steps.length) {
      setStepIndex((idx) => idx + 1);
      setSelectedOptionIndex(null);
      setIsAnswerChecked(false);
    } else {
      // Completed full dialogue scenario!
      try {
        const res = await api.completeConversationScenario(selectedScenario.id);
        setXpAwarded(res.xp_awarded);
        if ((res as any).current_streak !== undefined) {
          setCurrentStreak((res as any).current_streak);
        } else if (dashboardData?.current_streak !== undefined) {
          setCurrentStreak(dashboardData.current_streak);
        }
        setIsCompleted(true);
        setShowCelebration(true);
        await refreshStats();
      } catch (err) {
        console.error("Failed to complete conversation scenario:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentStep: ConversationStep | undefined = selectedScenario?.steps[stepIndex];
  const chosenOpt = selectedOptionIndex !== null && currentStep ? currentStep.options[selectedOptionIndex] : null;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <XpCelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        xpEarned={xpAwarded || 30}
        currentStreak={currentStreak || dashboardData?.current_streak || 1}
        title="Conversation Scenario Mastered!"
        message="You successfully navigated this authentic Indian Sign Language dialogue."
      />

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Interactive Conversation Lab</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-brand dark:text-white tracking-tight">
          Real-Life Indian Sign Language Dialogues
        </h1>
        <p className="text-sm text-navy-muted dark:text-slate-400 mt-1 max-w-2xl">
          Participate in simulated exchanges with Deaf conversation partners in realistic Indian settings: meetups, colleges, and metro stations.
        </p>
      </div>

      {/* Scenario Cards Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {scenarios.map((sc) => {
          const isSelected = selectedScenario?.id === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => resetScenario(sc)}
              className={`p-5 rounded-3xl text-left transition-all border-2 cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-[#131C31] border-blue-600 dark:border-blue-500 shadow-card-hover'
                  : 'bg-white dark:bg-[#131C31] border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60">
                  {sc.difficulty}
                </span>
                <span className="text-xs font-semibold text-navy-muted dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{sc.estimated_minutes} mins</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-navy-brand dark:text-white mb-1">{sc.title}</h3>
              <p className="text-xs text-navy-muted dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
                {sc.description}
              </p>

              <div className="text-[11px] text-navy-muted dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{sc.location}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Conversation Dialogue Arena */}
      {selectedScenario && (
        <div className="bg-white dark:bg-[#131C31] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-card dark:shadow-card-dark space-y-6">
          {/* Objective Banner */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-navy-brand dark:text-slate-200 leading-relaxed">
              <span className="font-bold block mb-0.5">Objective:</span>
              <span>{selectedScenario.learning_objective}</span>
            </div>
          </div>

          {/* Dialogue Turns */}
          {!isCompleted && currentStep ? (
            <div className="space-y-6">
              {/* Partner Dialogue Bubble */}
              <div className="flex items-start gap-3.5 max-w-xl">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                  {currentStep.speaker.slice(0, 1)}
                </div>

                <div className="p-4 rounded-3xl rounded-tl-sm bg-cloud dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-navy-brand dark:text-slate-200 space-y-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400 block text-xs">
                    {currentStep.speaker}
                  </span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {currentStep.dialogue}
                  </p>

                  {currentStep.gloss && (
                    <div className="text-[11px] font-mono font-bold text-blue-800 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
                      ISL Gloss: {currentStep.gloss}
                    </div>
                  )}

                  {currentStep.translation && (
                    <p className="text-xs text-navy-muted dark:text-slate-400 italic">
                      "{currentStep.translation}"
                    </p>
                  )}
                </div>
              </div>

              {/* Learner Prompt */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-navy-brand dark:text-white mb-3">
                  {currentStep.prompt}
                </h4>

                <div className="space-y-2.5">
                  {currentStep.options.map((opt, i) => {
                    const isSelected = selectedOptionIndex === i;
                    let style = 'bg-white dark:bg-[#0F172A] border-2 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50 text-navy-brand dark:text-slate-200';

                    if (isAnswerChecked) {
                      if (isSelected && opt.is_correct) {
                        style = 'bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                      } else if (isSelected && !opt.is_correct) {
                        style = 'bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-900 dark:text-rose-200 font-bold';
                      } else if (opt.is_correct) {
                        style = 'bg-emerald-50/50 dark:bg-emerald-950/40 border-2 border-emerald-400 text-emerald-800 dark:text-emerald-300 font-semibold';
                      }
                    } else if (isSelected) {
                      style = 'bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-200 font-bold shadow-sm';
                    }

                    return (
                      <button
                        key={i}
                        disabled={isAnswerChecked}
                        onClick={() => setSelectedOptionIndex(i)}
                        className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${style}`}
                      >
                        <span>{opt.text}</span>
                        {isAnswerChecked && opt.is_correct && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Drawer */}
              {isAnswerChecked && chosenOpt && (
                <div
                  className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                    chosenOpt.is_correct
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <span className="font-bold block mb-1">
                    {chosenOpt.is_correct ? '✓ Culturally Respectful & Accurate' : 'Feedback:'}
                  </span>
                  <p>{chosenOpt.feedback}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end pt-2">
                {!isAnswerChecked ? (
                  <button
                    onClick={handleCheckAnswer}
                    disabled={selectedOptionIndex === null}
                    className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all ${
                      selectedOptionIndex !== null
                        ? 'btn-pop-blue cursor-pointer'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                    }`}
                  >
                    Respond
                  </button>
                ) : (
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 rounded-2xl btn-pop-blue text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <span>
                      {stepIndex + 1 === selectedScenario.steps.length
                        ? 'Complete Scenario'
                        : 'Next Turn'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Finished State */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-navy-brand dark:text-white">Scenario Completed!</h3>
              <p className="text-xs text-navy-muted dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                You've successfully finished this conversation exchange. You earned <strong>+{xpAwarded || 30} XP</strong>!
              </p>
              <button
                onClick={() => resetScenario(selectedScenario)}
                className="px-6 py-3 rounded-2xl btn-pop-blue text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay Scenario</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
