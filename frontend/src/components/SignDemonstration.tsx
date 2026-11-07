import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Gauge, Eye, Sparkles } from 'lucide-react';
import { SignVocabulary } from '../types/api';
import { VerificationBadge } from './VerificationBadge';

interface Props {
  sign: SignVocabulary;
  autoPlay?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const SignDemonstration: React.FC<Props> = ({
  sign,
  autoPlay = true,
  size = 'md',
  showDetails = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<0.5 | 1.0>(1.0);
  const [animationPhase, setAnimationPhase] = useState<number>(0);

  // Simple cycle animation ticker
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = (speed === 0.5 ? 1200 : 700);
    const timer = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const toggleSpeed = () => {
    setSpeed((s) => (s === 1.0 ? 0.5 : 1.0));
  };

  const handleReset = () => {
    setAnimationPhase(0);
    setIsPlaying(true);
  };

  // Render stylized authentic ISL visual representation
  const renderVisualIllustration = () => {
    const isGreeting = sign.category.toLowerCase().includes('greeting') || sign.vocabulary.includes('Namaste');
    const isAlphabet = sign.category.toLowerCase().includes('alphabet') || sign.vocabulary.includes('Letter');
    const isQuestion = sign.category.toLowerCase().includes('question') || sign.vocabulary.includes('What') || sign.vocabulary.includes('Where');
    const isThankYou = sign.vocabulary.includes('Thank You') || sign.vocabulary.includes('Dhanyavaad');

    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-50/40 via-white to-sky-50/30 dark:from-slate-900 dark:via-[#131C31] dark:to-slate-900/80 rounded-2xl overflow-hidden p-6 select-none border border-slate-100 dark:border-slate-800/80">
        {/* Visual Signing Avatar Frame */}
        <svg viewBox="0 0 280 280" className="w-full max-h-60 transition-transform duration-500 ease-in-out">
          {/* Neutral Silhouette Body / Torso */}
          <ellipse cx="140" cy="270" rx="90" ry="45" fill="currentColor" className="text-slate-200 dark:text-slate-700" />
          {/* Head & Neck */}
          <rect x="130" y="115" width="20" height="35" rx="8" fill="currentColor" className="text-slate-300 dark:text-slate-600" />
          <circle cx="140" cy="85" r="42" fill="currentColor" className="text-slate-200 dark:text-slate-700" />
          
          {/* Stylized Face Elements & Non-Manual Marker Highlights */}
          {isQuestion ? (
            <g className="transition-all duration-300">
              {/* Furrowed Eyebrows for ISL Questions */}
              <line x1="118" y1="72" x2="134" y2="76" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
              <line x1="162" y1="72" x2="146" y2="76" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
              {/* Eyes looking focused */}
              <circle cx="126" cy="84" r="4" fill="#0F172A" className="dark:fill-slate-100" />
              <circle cx="154" cy="84" r="4" fill="#0F172A" className="dark:fill-slate-100" />
              {/* Inquisitive expression */}
              <path d="M132 104 Q140 100 148 104" stroke="#0F172A" className="dark:stroke-slate-100" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              {/* Pleasant Neutral / Affirmative Face */}
              <line x1="120" y1="74" x2="134" y2="74" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
              <line x1="160" y1="74" x2="146" y2="74" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
              <circle cx="126" cy="84" r="3.5" fill="#0F172A" className="dark:fill-slate-100" />
              <circle cx="154" cy="84" r="3.5" fill="#0F172A" className="dark:fill-slate-100" />
              {/* Warm gentle smile */}
              <path d="M130 100 Q140 110 150 100" stroke="#0284C7" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </g>
          )}

          {/* Dynamic Authentic ISL Hand Configurations */}
          {isGreeting ? (
            /* Namaste - Anjali Mudra Palms Moving Inward and Gentle Nod */
            <g className="transition-all duration-500 ease-in-out" style={{ transform: `translateY(${animationPhase % 2 === 1 ? -6 : 0}px)` }}>
              {/* Left Palm */}
              <path
                d="M128 175 C125 155 130 135 138 130 C139 145 139 165 135 185 Z"
                fill="#2563EB"
                className="opacity-90"
              />
              {/* Right Palm (Dominant) */}
              <path
                d="M152 175 C155 155 150 135 142 130 C141 145 141 165 145 185 Z"
                fill="#0284C7"
                className="opacity-95"
              />
              {/* Palms pressed glow */}
              <circle cx="140" cy="150" r="14" fill="#38BDF8" opacity="0.35" />
            </g>
          ) : isThankYou ? (
            /* Shukriya / Thank You - Hand touching chin then extending forward */
            <g className="transition-all duration-500 ease-in-out" style={{ transform: `translate(${animationPhase * 12}px, ${animationPhase * 8}px)` }}>
              <path
                d="M135 110 C145 105 160 115 158 135 C150 145 138 140 135 110 Z"
                fill="#2563EB"
              />
              {/* Movement Trajectory Arrow */}
              <path
                d="M145 125 Q170 145 185 170"
                stroke="#38BDF8"
                strokeWidth="3.5"
                strokeDasharray="4 4"
                fill="none"
              />
              <polygon points="187,175 183,165 175,172" fill="#38BDF8" />
            </g>
          ) : isAlphabet ? (
            /* ISL Two-Handed Fingerspelling Frame */
            <g className="transition-all duration-500">
              {/* Left hand vertical support */}
              <rect x="115" y="145" width="12" height="60" rx="6" fill="#2563EB" />
              {/* Right hand touching / framing */}
              <circle cx="140" cy="148" r="16" fill="#0284C7" opacity="0.85" />
              <rect x="145" y="155" width="14" height="45" rx="6" fill="#0284C7" />
              {/* Touchpoint Sparkle */}
              <circle cx="127" cy="145" r="5" fill="#38BDF8" />
            </g>
          ) : (
            /* Standard Clear Central ISL Signing Space */
            <g className="transition-all duration-500" style={{ transform: `scale(${animationPhase % 2 === 0 ? 1 : 1.04}) translate(${animationPhase % 2 === 0 ? 0 : -2}px, 0)` }}>
              <circle cx="110" cy="170" r="18" fill="#2563EB" opacity="0.85" />
              <circle cx="170" cy="170" r="18" fill="#0284C7" opacity="0.85" />
              {/* Spatial Motion Arc */}
              <path d="M125 160 Q140 145 155 160" stroke="#38BDF8" strokeWidth="3" strokeDasharray="3 3" fill="none" />
            </g>
          )}

          {/* ISL Signing Space Boundary Watermark */}
          <rect x="50" y="45" width="180" height="190" rx="16" stroke="#94A3B8" strokeWidth="1" strokeDasharray="5 5" fill="none" opacity="0.4" />
          <text x="56" y="60" fill="#94A3B8" fontSize="9" fontFamily="Inter, sans-serif" fontWeight="500">ISL Signing Zone</text>
        </svg>

        {/* Real-time Motion Phase Pill */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 dark:bg-slate-850/90 backdrop-blur rounded-full text-[11px] font-medium text-navy-muted dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-800">
          <span className="w-2 h-2 rounded-full bg-indigo-brand animate-pulse" />
          <span>Step {animationPhase + 1} of 4</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-[#131C31] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card dark:shadow-card-dark overflow-hidden">
      {/* Demonstration Display Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
            {sign.category}
          </span>
          <h3 className="text-xl font-bold text-navy-brand dark:text-white">{sign.vocabulary}</h3>
        </div>
        <VerificationBadge
          status={sign.verification_status}
          reviewer={sign.reviewer_reference}
        />
      </div>

      {/* Main Demonstration Visual Canvas */}
      <div className="p-4 bg-cloud/50 dark:bg-slate-900/50">
        {renderVisualIllustration()}
      </div>

      {/* Interactive Controls Bar */}
      <div className="px-4 py-3 bg-white dark:bg-[#131C31] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
            title={isPlaying ? 'Pause demonstration' : 'Play demonstration'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-navy-brand dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Replay demonstration from start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSpeed}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              speed === 0.5
                ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-semibold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title="Toggle playback speed"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{speed}x {speed === 0.5 ? '(Slow Motion)' : ''}</span>
          </button>
        </div>

        <div className="text-xs text-navy-muted dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>ISL Standard Two-Handed</span>
        </div>
      </div>

      {/* Authentic Learning Notes & Non-Manual Marker Breakdown */}
      {showDetails && (
        <div className="p-4 sm:p-5 bg-white dark:bg-[#131C31] space-y-3 border-t border-slate-100 dark:border-slate-800 text-sm">
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
              Sign Description
            </h4>
            <p className="text-navy-brand dark:text-slate-200 leading-relaxed">{sign.explanation}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {sign.handshape && (
              <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100/80 dark:border-blue-900/60">
                <span className="block text-[11px] font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
                  Handshape & Position
                </span>
                <span className="text-xs text-navy-brand dark:text-slate-200 font-medium">{sign.handshape}</span>
              </div>
            )}

            {sign.non_manual_notes && (
              <div className="p-2.5 rounded-xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-100/80 dark:border-sky-900/60">
                <span className="block text-[11px] font-semibold text-sky-800 dark:text-sky-300 uppercase tracking-wide flex items-center gap-1">
                  <Eye className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  <span>Facial Grammar & Non-Manual Signals</span>
                </span>
                <span className="text-xs text-navy-brand dark:text-slate-200 font-medium">{sign.non_manual_notes}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
