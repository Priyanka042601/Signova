import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, NavLink } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Trophy,
  BookOpen,
  Target,
  CheckCircle2,
  Lock,
  ChevronRight,
  Calendar,
  Award,
  Zap,
  Repeat
} from 'lucide-react';
import { api } from '../services/apiClient';
import { DashboardSummary, LevelWithUnits } from '../types/api';
import { SignDemonstration } from '../components/SignDemonstration';
import { VerificationBadge } from '../components/VerificationBadge';
import { SkeletonDashboard } from '../components/LoadingSkeleton';

interface ContextType {
  refreshStats: () => Promise<void>;
  dashboardData: DashboardSummary | null;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, refreshStats } = useOutletContext<ContextType>();
  const [levels, setLevels] = useState<LevelWithUnits[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const lvls = await api.getLevels();
        setLevels(lvls);
      } catch (err) {
        console.error("Failed to load levels on dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading && !dashboardData) {
    return <SkeletonDashboard />;
  }

  const handleContinueLearning = () => {
    if (dashboardData?.next_recommended_lesson) {
      navigate(`/lesson/${dashboardData.next_recommended_lesson.id}`);
    } else {
      navigate('/learn');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Hero Welcome & Continue Learning Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-brand to-berry-dark text-white p-6 sm:p-8 md:p-10 shadow-xl">
        {/* Decorative background shapes */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-coral-brand/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-berry-brand/30 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-coral-100 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-sunshine-brand" />
            <span>Welcome back, {dashboardData?.user_name || "Aarav"}!</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
            Ready to learn a new sign today?
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            Every sign connects you to 18 million Deaf people across India. Continue your daily journey with authentic Indian Sign Language.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleContinueLearning}
              className="px-6 py-3.5 rounded-2xl bg-white text-indigo-900 hover:bg-slate-50 font-bold text-sm sm:text-base shadow-lg shadow-black/10 flex items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-5 h-5 text-berry-brand" />
            </button>

            <NavLink
              to="/practice"
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm sm:text-base backdrop-blur-sm transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-sunshine-brand" />
              <span>Practice Signs</span>
            </NavLink>
          </div>
        </div>
      </section>

      {/* 2. Progress Summary Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Level */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-navy-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Level</span>
            <BookOpen className="w-5 h-5 text-indigo-brand" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-navy-brand truncate">
              {dashboardData?.current_level_name?.replace('Level ', 'L') || 'Level 1'}
            </div>
            <p className="text-xs text-navy-muted mt-0.5">
              {dashboardData?.overall_progress_percent || 0}% overall course progress
            </p>
          </div>
        </div>

        {/* Total XP */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-navy-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total XP</span>
            <Trophy className="w-5 h-5 text-sunshine-dark" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-indigo-brand">
              {dashboardData?.xp_total ?? 185}
            </div>
            <p className="text-xs text-navy-muted mt-0.5">
              +{dashboardData?.today_minutes_spent ? 40 : 20} earned this week
            </p>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-navy-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Streak</span>
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-700">
              {dashboardData?.current_streak ?? 3} Days
            </div>
            <p className="text-xs text-navy-muted mt-0.5">
              Best: {dashboardData?.longest_streak ?? 4} consecutive days
            </p>
          </div>
        </div>

        {/* Daily Learning Goal Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-navy-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Daily Goal</span>
            <Target className="w-5 h-5 text-berry-brand" />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xl sm:text-2xl font-black text-berry-brand">
                {dashboardData?.today_minutes_spent ?? 6}m
              </span>
              <span className="text-xs font-semibold text-navy-muted">
                / {dashboardData?.daily_goal_minutes ?? 10}m
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-berry-brand h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, dashboardData?.today_goal_percent ?? 60)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Daily Challenge & Revision Banner */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Challenge Card */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-5 sm:p-6 rounded-3xl border border-amber-200 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Daily Challenge</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                +{dashboardData?.daily_challenge?.reward_xp ?? 20} XP
              </span>
            </div>
            <h3 className="text-lg font-bold text-navy-brand mb-1">
              {dashboardData?.daily_challenge?.title || "Daily Practice Master"}
            </h3>
            <p className="text-xs text-navy-muted leading-relaxed mb-4">
              {dashboardData?.daily_challenge?.description || "Complete 2 lessons or spaced revision sessions today."}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-navy-brand mb-1.5">
              <span>Progress</span>
              <span>
                {dashboardData?.daily_challenge?.current ?? 1} / {dashboardData?.daily_challenge?.target ?? 2}
              </span>
            </div>
            <div className="w-full bg-amber-200/50 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-sunshine-dark h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    ((dashboardData?.daily_challenge?.current ?? 1) /
                      (dashboardData?.daily_challenge?.target ?? 2)) *
                      100
                  )}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Recommended Revision Card */}
        <div className="bg-gradient-to-br from-berry-500/10 via-berry-500/5 to-white p-5 sm:p-6 rounded-3xl border border-berry-200 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-berry-800 flex items-center gap-1.5">
                <Repeat className="w-4 h-4 text-berry-brand" />
                <span>Spaced Repetition</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-berry-100 text-berry-800 text-xs font-bold">
                {dashboardData?.revision_due_count ?? 3} Signs Due
              </span>
            </div>
            <h3 className="text-lg font-bold text-navy-brand mb-1">
              Lock In What You Learned
            </h3>
            <p className="text-xs text-navy-muted leading-relaxed mb-4">
              Reviewing vocabulary at scheduled intervals helps move signs from short-term memory to lifelong fluency.
            </p>
          </div>

          <NavLink
            to="/revision"
            className="w-full py-2.5 px-4 rounded-xl btn-pop-berry text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <span>Start Revision Session</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      </section>

      {/* 4. Three-Level Learning Path Preview */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-berry-brand">
              Curriculum Path
            </span>
            <h2 className="text-2xl font-black text-navy-brand tracking-tight">
              Indian Sign Language Roadmap
            </h2>
          </div>
          <NavLink
            to="/learn"
            className="text-sm font-bold text-indigo-brand hover:text-indigo-dark flex items-center gap-1"
          >
            <span>View Full Curriculum</span>
            <ChevronRight className="w-4 h-4" />
          </NavLink>
        </div>

        {/* 3 Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {levels.map((lvl) => {
            const isBeginner = lvl.code === 'beginner';
            const isIntermediate = lvl.code === 'intermediate';
            const isAdvanced = lvl.code === 'advanced';

            return (
              <div
                key={lvl.id}
                className={`relative rounded-2xl p-6 border transition-all ${
                  lvl.is_unlocked
                    ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-card-hover'
                    : 'bg-slate-50/70 border-slate-200/60 opacity-80'
                }`}
              >
                {/* Level Lock State Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isBeginner
                        ? 'bg-indigo-50 text-indigo-brand'
                        : isIntermediate
                        ? 'bg-berry-50 text-berry-brand'
                        : 'bg-rose-50 text-coral-dark'
                    }`}
                  >
                    Level {lvl.sequence_number}
                  </span>

                  {lvl.is_unlocked ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Requires {lvl.unlock_threshold_percent}% Previous</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-navy-brand mb-1">{lvl.name}</h3>
                <p className="text-xs text-navy-muted leading-relaxed mb-4 line-clamp-2">
                  {lvl.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex justify-between text-xs font-semibold text-navy-muted">
                    <span>Progress</span>
                    <span>{lvl.progress_percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        isBeginner ? 'bg-indigo-brand' : isIntermediate ? 'bg-berry-brand' : 'bg-coral-brand'
                      }`}
                      style={{ width: `${lvl.progress_percent}%` }}
                    />
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => navigate(`/learn/level/${lvl.id}`)}
                  disabled={!lvl.is_unlocked}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    lvl.is_unlocked
                      ? isBeginner
                        ? 'btn-pop-indigo cursor-pointer'
                        : 'btn-pop-berry cursor-pointer'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span>{lvl.is_unlocked ? 'Explore Units' : 'Locked'}</span>
                  {lvl.is_unlocked ? <ArrowRight className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Featured Verified Sign of the Day */}
      {dashboardData?.featured_sign_of_the_day && (
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sunshine-dark flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sunshine-dark" />
                <span>Featured ISL Sign of the Day</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-navy-brand">
                {dashboardData.featured_sign_of_the_day.vocabulary}
              </h2>
            </div>
            <VerificationBadge
              status={dashboardData.featured_sign_of_the_day.verification_status}
              reviewer={dashboardData.featured_sign_of_the_day.reviewer_reference}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <SignDemonstration
              sign={dashboardData.featured_sign_of_the_day}
              showDetails={false}
            />

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-1">
                  Cultural & Linguistic Note
                </h4>
                <p className="text-xs sm:text-sm text-navy-brand leading-relaxed">
                  {dashboardData.featured_sign_of_the_day.explanation}
                </p>
              </div>

              {dashboardData.featured_sign_of_the_day.handshape && (
                <div className="p-4 rounded-2xl bg-softrose/60 border border-coral-200">
                  <h4 className="text-xs font-bold text-berry-brand uppercase tracking-wide mb-1">
                    Manual Configuration
                  </h4>
                  <p className="text-xs sm:text-sm text-navy-brand leading-relaxed">
                    {dashboardData.featured_sign_of_the_day.handshape}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <NavLink
                  to={`/explore/${dashboardData.featured_sign_of_the_day.id}`}
                  className="py-2.5 px-4 rounded-xl btn-pop-indigo text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <span>View in Dictionary</span>
                  <ArrowRight className="w-4 h-4" />
                </NavLink>

                <NavLink
                  to="/practice"
                  className="py-2.5 px-4 rounded-xl btn-pop-outline text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <span>Practice with Camera</span>
                </NavLink>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
