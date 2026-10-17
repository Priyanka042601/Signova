import React, { useEffect, useState } from 'react';
import { useOutletContext, NavLink } from 'react-router-dom';
import {
  Repeat,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Clock,
  Award,
  BookOpen,
  Calendar
} from 'lucide-react';
import { api } from '../services/apiClient';
import { RevisionItem, RevisionAttemptResponse } from '../types/api';
import { SignDemonstration } from '../components/SignDemonstration';
import { VerificationBadge } from '../components/VerificationBadge';
import { useToast } from '../context/ToastContext';

interface ContextType {
  refreshStats: () => Promise<void>;
}

export const RevisionCentrePage: React.FC = () => {
  const { refreshStats } = useOutletContext<ContextType>();
  const { showToast } = useToast();
  const [dueItems, setDueItems] = useState<RevisionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [attemptResponse, setAttemptResponse] = useState<RevisionAttemptResponse | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDueItems();
  }, []);

  const fetchDueItems = async () => {
    try {
      setLoading(true);
      const items = await api.getDueRevision();
      setDueItems(items);
      setCurrentIndex(0);
      setIsAnswerRevealed(false);
      setSessionCompleted(false);
    } catch (err) {
      console.error("Failed to load revision items:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentItem = dueItems[currentIndex];

  const handleRecordResult = async (isCorrect: boolean) => {
    if (!currentItem) return;
    try {
      const res = await api.submitRevisionAttempt(currentItem.vocabulary_id, isCorrect);
      setAttemptResponse(res);
      setIsAnswerRevealed(true);
      await refreshStats();
      showToast({
        title: isCorrect ? 'Recall Confirmed!' : 'Review Scheduled Soon',
        message: isCorrect
          ? `+${res.xp_awarded} XP! Next review in ${res.new_interval_days} days.`
          : 'Interval shortened for spaced repetition reinforcement.',
        type: isCorrect ? 'xp' : 'info'
      });
    } catch (err) {
      console.error("Failed to record revision attempt:", err);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < dueItems.length) {
      setCurrentIndex((idx) => idx + 1);
      setIsAnswerRevealed(false);
      setAttemptResponse(null);
    } else {
      setSessionCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-berry-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-berry-50 border border-berry-100 text-xs font-semibold text-berry-brand mb-2">
          <Repeat className="w-3.5 h-3.5" />
          <span>Spaced Repetition System (SRS)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-brand tracking-tight">
          Revision Centre
        </h1>
        <p className="text-sm text-navy-muted mt-1 max-w-xl">
          Scientific spaced repetition schedules reviews right before your brain forgets. Correct reviews double the interval; tricky items return sooner.
        </p>
      </div>

      {/* Main Revision Arena */}
      {sessionCompleted ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-navy-brand">Revision Session Complete!</h2>
          <p className="text-xs text-navy-muted max-w-md mx-auto leading-relaxed">
            All due vocabulary items have been reviewed and their memory intervals updated.
          </p>

          <div className="pt-2 flex justify-center gap-3">
            <NavLink
              to="/learn"
              className="px-6 py-3 rounded-2xl btn-pop-indigo text-xs font-bold"
            >
              Continue Curriculum
            </NavLink>
            <button
              onClick={fetchDueItems}
              className="px-6 py-3 rounded-2xl btn-pop-outline text-xs font-bold"
            >
              Check for Due Signs
            </button>
          </div>
        </div>
      ) : dueItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-card text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-brand flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-navy-brand">No Signs Due for Review!</h3>
          <p className="text-xs text-navy-muted max-w-sm mx-auto leading-relaxed">
            You're all caught up on your spaced repetition schedule. Complete more curriculum lessons to add new vocabulary to your revision queue!
          </p>
          <NavLink
            to="/learn"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl btn-pop-indigo text-xs font-bold"
          >
            <span>Learn New Signs</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      ) : currentItem ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
          {/* Item Meta Bar */}
          <div className="flex items-center justify-between text-xs text-navy-muted">
            <span className="font-extrabold text-berry-brand uppercase tracking-wider">
              Item {currentIndex + 1} of {dueItems.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                Mastery: {Math.round(currentItem.mastery_score)}%
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                Interval: {currentItem.review_interval_days}d
              </span>
            </div>
          </div>

          {/* Prompt Visual & Recall Challenge */}
          <div className="space-y-4">
            <div className="text-center py-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Category: {currentItem.category}
              </span>
              <h3 className="text-2xl font-black text-navy-brand">
                Do you remember how to sign or recognize:
              </h3>
              <p className="text-3xl font-extrabold text-indigo-brand mt-2">
                "{currentItem.vocabulary}"
              </p>
            </div>

            {/* Answer Reveal Area */}
            {isAnswerRevealed ? (
              <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                    Verified ISL Demonstration
                  </span>
                  <VerificationBadge status={currentItem.verification_status} />
                </div>

                <p className="text-xs sm:text-sm text-navy-brand leading-relaxed font-medium">
                  {currentItem.explanation}
                </p>

                {currentItem.handshape && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-navy-brand">
                    <span className="font-bold text-indigo-800 block mb-0.5">Handshape:</span>
                    <span>{currentItem.handshape}</span>
                  </div>
                )}

                {attemptResponse && (
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs font-bold text-indigo-900">
                    <span>Next Review Scheduled in {attemptResponse.new_interval_days} days</span>
                    <span>+{attemptResponse.xp_awarded} XP</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 rounded-2xl btn-pop-indigo text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{currentIndex + 1 === dueItems.length ? 'Finish Session' : 'Next Item'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="text-xs text-navy-muted text-center font-medium">
                  Recall the handshape and movement in your mind or sign it with your hands, then rate your recall:
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleRecordResult(false)}
                    className="p-4 rounded-2xl border-2 border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-900 font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Hard / Forgot</span>
                    <span className="text-[10px] text-rose-700 font-normal">Review in 1 day</span>
                  </button>

                  <button
                    onClick={() => handleRecordResult(true)}
                    className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Remembered Well</span>
                    <span className="text-[10px] text-emerald-700 font-normal">Double review interval</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
