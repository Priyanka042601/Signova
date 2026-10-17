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
import { ConversationScenario, ConversationStep } from '../types/api';
import { XpCelebrationModal } from '../components/XpCelebrationModal';

interface ContextType {
  refreshStats: () => Promise<void>;
}

export const ConversationLabPage: React.FC = () => {
  const { refreshStats } = useOutletContext<ContextType>();
  const [scenarios, setScenarios] = useState<ConversationScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<ConversationScenario | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);
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
        currentStreak={3}
        title="Conversation Scenario Mastered!"
        message="You successfully navigated this authentic Indian Sign Language dialogue."
      />

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-berry-50 border border-berry-100 text-xs font-semibold text-berry-brand mb-2">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Interactive Conversation Lab</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-brand tracking-tight">
          Real-Life Indian Sign Language Dialogues
        </h1>
        <p className="text-sm text-navy-muted mt-1 max-w-2xl">
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
                  ? 'bg-white border-berry-brand shadow-card-hover'
                  : 'bg-white border-slate-200/80 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-brand">
                  {sc.difficulty}
                </span>
                <span className="text-xs font-semibold text-navy-muted flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{sc.estimated_minutes} mins</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-navy-brand mb-1">{sc.title}</h3>
              <p className="text-xs text-navy-muted leading-relaxed line-clamp-2 mb-3">
                {sc.description}
              </p>

              <div className="text-[11px] text-navy-muted flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-berry-brand" />
                <span>{sc.location}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Conversation Dialogue Arena */}
      {selectedScenario && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
          {/* Objective Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-brand flex-shrink-0 mt-0.5" />
            <div className="text-xs text-navy-brand leading-relaxed">
              <span className="font-bold block mb-0.5">Objective:</span>
              <span>{selectedScenario.learning_objective}</span>
            </div>
          </div>

          {/* Dialogue Turns */}
          {!isCompleted && currentStep ? (
            <div className="space-y-6">
              {/* Partner Dialogue Bubble */}
              <div className="flex items-start gap-3.5 max-w-xl">
                <div className="w-10 h-10 rounded-2xl bg-berry-brand text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                  {currentStep.speaker.slice(0, 1)}
                </div>

                <div className="p-4 rounded-3xl rounded-tl-sm bg-cloud border border-slate-200 text-xs sm:text-sm text-navy-brand space-y-2">
                  <span className="font-bold text-berry-brand block text-xs">
                    {currentStep.speaker}
                  </span>
                  <p className="font-medium text-slate-800 leading-relaxed">
                    {currentStep.dialogue}
                  </p>

                  {currentStep.gloss && (
                    <div className="text-[11px] font-mono font-bold text-indigo-800 bg-indigo-50/80 px-2.5 py-1 rounded-lg">
                      ISL Gloss: {currentStep.gloss}
                    </div>
                  )}

                  {currentStep.translation && (
                    <p className="text-xs text-navy-muted italic">
                      "{currentStep.translation}"
                    </p>
                  )}
                </div>
              </div>

              {/* Learner Prompt */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-navy-brand mb-3">
                  {currentStep.prompt}
                </h4>

                <div className="space-y-2.5">
                  {currentStep.options.map((opt, i) => {
                    const isSelected = selectedOptionIndex === i;
                    let style = 'bg-white border-2 border-slate-200 hover:border-indigo-300 text-navy-brand';

                    if (isAnswerChecked) {
                      if (isSelected && opt.is_correct) {
                        style = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 font-bold';
                      } else if (isSelected && !opt.is_correct) {
                        style = 'bg-rose-50 border-2 border-rose-500 text-rose-900 font-bold';
                      } else if (opt.is_correct) {
                        style = 'bg-emerald-50/50 border-2 border-emerald-400 text-emerald-800 font-semibold';
                      }
                    } else if (isSelected) {
                      style = 'bg-berry-50 border-2 border-berry-brand text-berry-900 font-bold';
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
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
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
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
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
                        ? 'btn-pop-berry cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Respond
                  </button>
                ) : (
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 rounded-2xl btn-pop-indigo text-xs font-bold flex items-center gap-2 cursor-pointer"
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
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-navy-brand">Scenario Completed!</h3>
              <p className="text-xs text-navy-muted max-w-md mx-auto leading-relaxed">
                You've successfully finished this conversation exchange. You earned <strong>+{xpAwarded || 30} XP</strong>!
              </p>
              <button
                onClick={() => resetScenario(selectedScenario)}
                className="px-6 py-3 rounded-2xl btn-pop-indigo text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
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
