import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Settings,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Eye,
  Info,
  Clock,
  ShieldCheck,
  Mail,
  KeyRound,
  LogOut,
  Sparkles,
  SunMoon,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { api } from '../services/apiClient';
import { ProfileResponse } from '../types/api';
import { useAuth, useUser } from '../auth/ClerkAuthProvider';
import { useToast } from '../context/ToastContext';
import { useTheme, Theme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';

interface ContextType {
  refreshStats: () => Promise<void>;
}

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshStats } = useOutletContext<ContextType>();
  const { user } = useUser();
  const { signOut, isDemoMode } = useAuth();
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState('');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(10);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reset progress modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const prof = await api.getProfile();
        setDisplayName(prof.display_name);
        setDailyGoalMinutes(prof.daily_goal_minutes);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updateProfile({
        display_name: displayName,
        daily_goal_minutes: dailyGoalMinutes
      });
      setSaveSuccess(true);
      await refreshStats();
      showToast({
        title: 'Settings Saved',
        message: 'Your learning preferences have been updated successfully.',
        type: 'success'
      });
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to save settings:", err);
      showToast({
        title: 'Save Failed',
        message: 'Unable to update settings. Please try again.',
        type: 'warning'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmReset = async () => {
    try {
      setIsResetting(true);
      await api.resetProgress();
      await refreshStats();
      setShowResetModal(false);
      showToast({
        title: 'Progress Reset',
        message: 'Learner curriculum attempts and XP reset to 0.',
        type: 'info'
      });
      navigate('/');
    } catch (err) {
      console.error("Failed to reset progress:", err);
      showToast({
        title: 'Reset Failed',
        message: 'Could not reset progress at this time.',
        type: 'warning'
      });
    } finally {
      setIsResetting(false);
    }
  };

  const primaryEmail = user?.primaryEmailAddress?.emailAddress || 'learner@signova.app';

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-brand dark:text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <span>Learner Settings</span>
        </h1>
        <p className="text-sm text-navy-muted dark:text-slate-400 mt-1">
          Personalize your Indian Sign Language study pace, theme appearance, and account preferences.
        </p>
      </div>

      {/* 1. Appearance & Theme Customizer */}
      <section className="bg-white dark:bg-[#131C31] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-5 card-interactive transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <SunMoon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-brand dark:text-white">Theme & Appearance</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose your preferred visual mode with blue-coded accents</p>
            </div>
          </div>
          <ThemeToggle variant="segmented" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm shadow-blue-500/10'
                : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sun className={`w-5 h-5 mb-2 ${theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            <div className="font-bold text-sm">Light Mode</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Clean azure & crisp white</div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm shadow-blue-500/10'
                : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Moon className={`w-5 h-5 mb-2 ${theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            <div className="font-bold text-sm">Dark Mode</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Midnight sapphire & deep navy</div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              theme === 'system'
                ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm shadow-blue-500/10'
                : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Laptop className={`w-5 h-5 mb-2 ${theme === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            <div className="font-bold text-sm">System Sync</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Follows device schedule</div>
          </button>
        </div>
      </section>

      {/* 2. Clerk Authentication & Security Card */}
      <section className="bg-white dark:bg-[#131C31] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-5 card-interactive transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-brand dark:text-white">Clerk Authentication & Session</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Identity security, email verification, and session state</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Active Session
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 font-semibold block">Signed In Email</span>
            <span className="font-bold text-navy-brand dark:text-white text-sm flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {primaryEmail}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 font-semibold block">Clerk Provider Mode</span>
            <span className="font-bold text-blue-700 dark:text-blue-300 text-sm flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              {isDemoMode ? 'Clerk Sandbox / Dev' : 'Clerk Cloud Production'}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              showToast({
                title: 'Password Management',
                message: `Password reset email dispatched to ${primaryEmail} via Clerk.`,
                type: 'info'
              });
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            Reset / Change Password
          </button>

          <button
            type="button"
            onClick={async () => {
              await signOut();
              showToast({
                title: 'Signed Out',
                message: 'Your Clerk session has ended.',
                type: 'info'
              });
              navigate('/sign-in');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Clerk</span>
          </button>
        </div>
      </section>

      {/* 3. Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Info */}
        <section className="bg-white dark:bg-[#131C31] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-5 card-interactive transition-colors">
          <h2 className="text-base font-bold text-navy-brand dark:text-white">Learner Profile</h2>

          <div>
            <label className="block text-xs font-bold text-navy-brand dark:text-slate-300 uppercase tracking-wider mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-600/20 text-sm font-medium outline-none transition-all"
              placeholder="e.g. Aarav Sharma"
            />
          </div>
        </section>

        {/* Daily Study Commitment */}
        <section className="bg-white dark:bg-[#131C31] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-5 card-interactive transition-colors">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-navy-brand dark:text-white">Daily Study Goal</h2>
          </div>
          <p className="text-xs text-navy-muted dark:text-slate-400">
            Consistency is the secret to acquiring visual sign language fluency.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[5, 10, 15, 20].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDailyGoalMinutes(mins)}
                className={`py-3 px-4 rounded-2xl border text-center transition-all cursor-pointer ${
                  dailyGoalMinutes === mins
                    ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-300 font-bold shadow-sm shadow-blue-500/10'
                    : 'border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="text-lg font-black">{mins}</div>
                <div className="text-xs text-navy-muted dark:text-slate-400">mins / day</div>
              </button>
            ))}
          </div>
        </section>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved successfully!</span>
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="btn-pop-blue px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 cursor-pointer shadow-pop disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Reset Progress */}
      <section className="bg-rose-50/60 dark:bg-rose-950/20 rounded-3xl p-6 sm:p-8 border border-rose-200/80 dark:border-rose-900/40 space-y-4 transition-colors">
        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <h2 className="text-base font-bold">Reset Learning Progress</h2>
        </div>
        <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
          Need a fresh start? Resetting progress will clear all completed lesson scores, reset your XP total, and clear your active streak.
        </p>

        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Reset All Learner Progress</span>
        </button>
      </section>

      {/* Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131C31] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-fade-in border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-navy-brand dark:text-white">Reset Everything?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This will reset your curriculum progress, XP, streak, and revision flashcards. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={isResetting}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Progress'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
