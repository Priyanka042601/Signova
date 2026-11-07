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
      // Fire celebratory confetti in Signova brand colors: Royal Cobalt, Sky Blue, Cyan, Amber
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#0284C7', '#0891B2', '#F59E0B']
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white dark:bg-[#131C31] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all p-6 sm:p-8 text-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
      >
        {/* Animated Trophy Header */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 animate-bounce">
          <Trophy className="w-10 h-10 text-white" />
        </div>

        <h2 id="celebration-title" className="text-2xl font-extrabold text-navy-brand dark:text-white mb-1">
          {title}
        </h2>
        <p className="text-sm text-navy-muted dark:text-slate-400 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 rounded-2xl flex flex-col items-center">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>XP Earned</span>
            </span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">+{xpEarned}</span>
          </div>

          <div className="p-3 bg-sky-50/70 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/60 rounded-2xl flex flex-col items-center">
            <span className="text-xs font-semibold text-sky-700 dark:text-sky-300 uppercase tracking-wide flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Accuracy</span>
            </span>
            <span className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1">{accuracyPercent}%</span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 bg-amber-50/70 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60 rounded-2xl flex flex-col items-center">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Streak</span>
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{currentStreak} Days</span>
          </div>
        </div>

        {/* Unlocked Achievements list if any */}
        {newAchievements.length > 0 && (
          <div className="mb-6 p-3.5 bg-blue-50/50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-left">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>New Achievement Unlocked!</span>
            </span>
            <div className="space-y-1">
              {newAchievements.map((ach, idx) => (
                <div key={idx} className="text-sm font-semibold text-navy-brand dark:text-slate-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <span>{ach}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl btn-pop-blue font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
