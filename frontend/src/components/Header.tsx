import React from 'react';
import { NavLink } from 'react-router-dom';
import { Flame, Trophy, Target, LogIn, UserPlus } from 'lucide-react';
import { DashboardSummary } from '../types/api';
import { useAuth, useUser, UserButton, SignedIn, SignedOut } from '../auth/ClerkAuthProvider';

interface Props {
  dashboardData?: DashboardSummary | null;
}

export const Header: React.FC<Props> = ({ dashboardData }) => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const streak = dashboardData?.current_streak ?? 3;
  const xp = dashboardData?.xp_total ?? 185;
  const dailyGoalPercent = dashboardData?.today_goal_percent ?? 60;
  const userName = user?.fullName || dashboardData?.user_name || "Aarav Sharma";

  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 transition-all">
      {/* Mobile Branding (only on small screens) */}
      <div className="flex items-center gap-2.5 md:hidden">
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-brand to-berry-brand flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <img src="/logo-mark.svg" alt="Signova" className="w-7 h-7" />
          </div>
          <span className="text-xl font-black text-navy-brand tracking-tight">
            Sign<span className="text-berry-brand">ova</span>
          </span>
        </NavLink>
      </div>

      {/* Center tag on desktop */}
      <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-navy-muted">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Indian Sign Language (ISL) Edition</span>
      </div>

      {/* Stats and User Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4 ml-auto">
        {/* Streak Counter */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs sm:text-sm font-bold shadow-sm transition-transform hover:scale-105"
          title={`${streak} day streak`}
        >
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{streak}</span>
          <span className="hidden sm:inline font-medium text-amber-700/80 text-xs">days</span>
        </div>

        {/* XP Counter */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-800 text-xs sm:text-sm font-bold shadow-sm transition-transform hover:scale-105"
          title={`${xp} total XP earned`}
        >
          <Trophy className="w-4 h-4 text-indigo-brand fill-indigo-brand/20" />
          <span>{xp}</span>
          <span className="hidden sm:inline font-medium text-indigo-700/80 text-xs">XP</span>
        </div>

        {/* Daily Goal Gauge */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-berry-800 text-xs font-bold shadow-sm"
          title={`Daily goal: ${dailyGoalPercent}% completed`}
        >
          <Target className="w-4 h-4 text-berry-brand" />
          <div className="w-16 bg-rose-200/70 rounded-full h-2 overflow-hidden">
            <div
              className="bg-berry-brand h-2 rounded-full transition-all duration-500"
              style={{ width: `${dailyGoalPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold">{dailyGoalPercent}%</span>
        </div>

        {/* Authentication Controls */}
        <SignedIn>
          <div className="flex items-center gap-2.5 pl-1">
            <NavLink
              to="/profile"
              className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              title="View Learner Profile"
            >
              <span className="text-xs font-semibold text-navy-brand">
                {userName.split(' ')[0]}
              </span>
            </NavLink>
            <UserButton />
          </div>
        </SignedIn>

        <SignedOut>
          <div className="flex items-center gap-2 pl-1">
            <NavLink
              to="/sign-in"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-brand hover:bg-indigo-50 border border-indigo-200 transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </NavLink>
            <NavLink
              to="/sign-up"
              className="btn-pop-indigo px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all hidden sm:flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </NavLink>
          </div>
        </SignedOut>
      </div>
    </header>
  );
};
