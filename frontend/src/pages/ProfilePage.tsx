import React, { useEffect, useState } from 'react';
import { NavLink, useOutletContext } from 'react-router-dom';
import {
  User,
  Flame,
  Trophy,
  Award,
  BookOpen,
  Calendar,
  Settings,
  Sparkles,
  CheckCircle2,
  Lock,
  Target,
  ShieldCheck,
  Mail,
  LogOut,
  Key
} from 'lucide-react';
import { api } from '../services/apiClient';
import { ProfileResponse } from '../types/api';
import { useAuth, useUser } from '../auth/ClerkAuthProvider';
import { SkeletonCard, SkeletonBox } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

interface ContextType {
  refreshStats: () => Promise<void>;
}

export const ProfilePage: React.FC = () => {
  const { refreshStats } = useOutletContext<ContextType>();
  const { user } = useUser();
  const { signOut, isDemoMode } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await api.getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    showToast({
      title: 'Signed Out',
      message: 'You have been signed out of your Signova session.',
      type: 'info'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <SkeletonCard className="h-44" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
              <SkeletonBox className="h-3 w-20" />
              <SkeletonBox className="h-7 w-16" />
            </div>
          ))}
        </div>
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  if (!profile) return null;

  const primaryEmail = user?.primaryEmailAddress?.emailAddress || 'learner@signova.app';
  const clerkUserId = user?.id || 'demo_user_1';

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-center sm:items-start gap-6 card-interactive">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-brand via-berry-brand to-coral-brand text-white flex items-center justify-center text-4xl font-black shadow-lg shadow-indigo-600/20 flex-shrink-0">
          {profile.display_name.slice(0, 1).toUpperCase()}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex items-center justify-center sm:justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-navy-brand">
                {profile.display_name}
              </h1>
              <span className="text-xs font-semibold text-berry-brand">
                {profile.current_level_name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <NavLink
                to="/settings"
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-navy-brand hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 text-xs font-bold"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </NavLink>

              <button
                onClick={handleSignOut}
                className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors inline-flex items-center gap-1.5 text-xs font-bold"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-navy-muted">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {primaryEmail}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Clerk Verified
            </span>
            {isDemoMode && (
              <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
                Sandbox Mode
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gamification Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card card-interactive">
          <span className="text-xs font-bold text-navy-muted uppercase tracking-wider block mb-1">
            Total XP
          </span>
          <span className="text-2xl font-black text-indigo-brand flex items-center gap-2">
            <Trophy className="w-6 h-6 text-sunshine-dark flex-shrink-0" />
            <span>{profile.xp_total}</span>
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card card-interactive">
          <span className="text-xs font-bold text-navy-muted uppercase tracking-wider block mb-1">
            Day Streak
          </span>
          <span className="text-2xl font-black text-amber-700 flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500 flex-shrink-0" />
            <span>{profile.current_streak} d</span>
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card card-interactive">
          <span className="text-xs font-bold text-navy-muted uppercase tracking-wider block mb-1">
            Longest Streak
          </span>
          <span className="text-2xl font-black text-slate-700 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-slate-400 flex-shrink-0" />
            <span>{profile.longest_streak} d</span>
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card card-interactive">
          <span className="text-xs font-bold text-navy-muted uppercase tracking-wider block mb-1">
            Completed Lessons
          </span>
          <span className="text-2xl font-black text-berry-brand flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <span>{profile.completed_lessons_count}</span>
          </span>
        </div>
      </div>

      {/* Level Breakdown Progress */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-4">
        <h3 className="text-lg font-bold text-navy-brand">Curriculum Level Breakdown</h3>

        <div className="space-y-4">
          {profile.level_breakdown.map((lb) => (
            <div key={lb.id} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-navy-brand">
                <span>{lb.name}</span>
                <span>
                  {lb.completed} / {lb.total} ({lb.percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-brand h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${lb.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements Collection */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-4">
        <h3 className="text-lg font-bold text-navy-brand">Learner Achievements</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.recent_achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border transition-all ${
                ach.is_unlocked
                  ? 'bg-amber-50/50 border-amber-200 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    ach.is_unlocked ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-amber-800">+{ach.xp_reward} XP</span>
              </div>

              <h4 className="text-sm font-bold text-navy-brand mb-1">{ach.name}</h4>
              <p className="text-xs text-navy-muted leading-relaxed line-clamp-2">
                {ach.description}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-semibold text-slate-500">
                {ach.is_unlocked ? '✓ Unlocked' : 'In Progress'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
