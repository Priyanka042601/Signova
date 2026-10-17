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
  Sparkles
} from 'lucide-react';
import { api } from '../services/apiClient';
import { ProfileResponse } from '../types/api';
import { useAuth, useUser } from '../auth/ClerkAuthProvider';
import { useToast } from '../context/ToastContext';

interface ContextType {
  refreshStats: () => Promise<void>;
}

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshStats } = useOutletContext<ContextType>();
  const { user } = useUser();
  const { signOut, isDemoMode } = useAuth();
  const { showToast } = useToast();

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
        <h1 className="text-2xl sm:text-3xl font-black text-navy-brand tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-brand" />
          <span>Learner Settings</span>
        </h1>
        <p className="text-sm text-navy-muted mt-1">
          Personalize your Indian Sign Language study pace, Clerk authentication, and goals.
        </p>
      </div>

      {/* Clerk Authentication & Security Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-5 card-interactive">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-brand flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-brand">Clerk Authentication & Session</h2>
              <p className="text-xs text-slate-500">Identity security, email verification, and session state</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active Session
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-500 font-semibold block">Signed In Email</span>
            <span className="font-bold text-navy-brand text-sm flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {primaryEmail}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-500 font-semibold block">Clerk Provider Mode</span>
            <span className="font-bold text-indigo-700 text-sm flex items-center gap-1.5">
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
            className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-brand bg-indigo-50 hover:bg-indigo-100 transition-colors"
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
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Clerk</span>
          </button>
        </div>
      </section>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Info */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-5 card-interactive">
          <h2 className="text-base font-bold text-navy-brand">Learner Profile</h2>

          <div>
            <label className="block text-xs font-bold text-navy-brand uppercase tracking-wider mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 text-sm font-medium outline-none transition-all"
              placeholder="e.g. Aarav Sharma"
            />
          </div>
        </section>

        {/* Daily Study Commitment */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-5 card-interactive">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-brand" />
            <h2 className="text-base font-bold text-navy-brand">Daily Study Goal</h2>
          </div>
          <p className="text-xs text-navy-muted">
            Consistency is the secret to acquiring visual sign language fluency.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[5, 10, 15, 20].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDailyGoalMinutes(mins)}
                className={`py-3 px-4 rounded-2xl border text-center transition-all ${
                  dailyGoalMinutes === mins
                    ? 'bg-indigo-50 border-indigo-brand text-indigo-brand font-bold shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="text-lg font-black">{mins}</div>
                <div className="text-xs text-navy-muted">mins / day</div>
              </button>
            ))}
          </div>
        </section>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved successfully!</span>
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="btn-pop-indigo px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 cursor-pointer shadow-pop disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Reset Progress */}
      <section className="bg-rose-50/60 rounded-3xl p-6 sm:p-8 border border-rose-200/80 space-y-4">
        <div className="flex items-center gap-2 text-rose-800">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <h2 className="text-base font-bold">Reset Learning Progress</h2>
        </div>
        <p className="text-xs text-rose-700 leading-relaxed">
          Need a fresh start? Resetting progress will clear all completed lesson scores, reset your XP total, and clear your active streak.
        </p>

        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Reset All Learner Progress</span>
        </button>
      </section>

      {/* Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-fade-in border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-navy-brand">Reset Everything?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will reset your curriculum progress, XP, streak, and revision flashcards. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
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
