import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Flame, Sparkles, ArrowRight, Award } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  xpEarned: number;
  accuracyPercent?: number;
  currentStreak: number;
  newAchievements?: string[];
  title?: string;
  message?: string;
}

export const XpCelebrationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  xpEarned,
  accuracyPercent = 100,
  currentStreak,
  newAchievements = [],
  title = "Lesson Completed!",
  message = "Great effort! You are mastering Indian Sign Language."
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti in Signova brand colors: Royal Indigo, Berry Pink, Coral Pink, Sunshine Yellow
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4338CA', '#BE185D', '#FB7185', '#FBBF24']
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-brand/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all p-6 sm:p-8 text-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
      >
        {/* Animated Trophy Header */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-sunshine-brand to-coral-brand flex items-center justify-center shadow-lg shadow-coral-brand/20 mb-4 animate-bounce">
          <Trophy className="w-10 h-10 text-white" />
        </div>

        <h2 id="celebration-title" className="text-2xl font-extrabold text-navy-brand mb-1">
          {title}
        </h2>
        <p className="text-sm text-navy-muted mb-6 leading-relaxed">
          {message}
        </p>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex flex-col items-center">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-brand" />
              <span>XP Earned</span>
            </span>
            <span className="text-xl font-black text-indigo-brand mt-1">+{xpEarned}</span>
          </div>

          <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-2xl flex flex-col items-center">
            <span className="text-xs font-semibold text-berry-700 uppercase tracking-wide flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-berry-brand" />
              <span>Accuracy</span>
            </span>
            <span className="text-xl font-black text-berry-brand mt-1">{accuracyPercent}%</span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 bg-amber-50/70 border border-amber-100 rounded-2xl flex flex-col items-center">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Streak</span>
            </span>
            <span className="text-xl font-black text-amber-700 mt-1">{currentStreak} Days</span>
          </div>
        </div>

        {/* Unlocked Achievements list if any */}
        {newAchievements.length > 0 && (
          <div className="mb-6 p-3.5 bg-softrose/60 border border-coral-200 rounded-2xl text-left">
            <span className="text-xs font-bold text-berry-brand uppercase tracking-wider flex items-center gap-1 mb-2">
              <Award className="w-4 h-4 text-berry-brand" />
              <span>New Achievement Unlocked!</span>
            </span>
            <div className="space-y-1">
              {newAchievements.map((ach, idx) => (
                <div key={idx} className="text-sm font-semibold text-navy-brand flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-berry-brand" />
                  <span>{ach}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl btn-pop-indigo font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
