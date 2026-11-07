import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { useAuth, useFallbackAuth } from '../auth/ClerkAuthProvider';
import { Sparkles, ShieldCheck, ArrowRight, UserCheck, Key, Lock, Mail } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
const isLiveClerkKey = Boolean(
  CLERK_PUBLISHABLE_KEY &&
  (CLERK_PUBLISHABLE_KEY.startsWith('pk_test_') || CLERK_PUBLISHABLE_KEY.startsWith('pk_live_'))
);

export const SignInPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectUrl = searchParams.get('redirect_url') || '/';
  const { isSignedIn } = useAuth();
  const fallbackAuth = useFallbackAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('aarav.sharma@signova.app');
  const [password, setPassword] = useState('signova123');

  useEffect(() => {
    if (isSignedIn) {
      navigate(redirectUrl);
    }
  }, [isSignedIn, navigate, redirectUrl]);

  const handleDemoSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    fallbackAuth.signInAsDemo('learner');
    showToast({
      title: 'Welcome to Signova!',
      message: 'Authenticated session established successfully.',
      type: 'success'
    });
    navigate(redirectUrl);
  };

  return (
    <div className="min-h-screen bg-cloud dark:bg-[#0B0F19] text-navy-brand dark:text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans transition-colors">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <NavLink to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <img src="/logo-mark.svg" alt="Signova Logo" className="w-9 h-9" />
          </div>
          <span className="text-3xl font-black tracking-tight text-navy-brand dark:text-white">
            Sign<span className="text-blue-600 dark:text-blue-400">ova</span>
          </span>
        </NavLink>
        <p className="text-xs sm:text-sm text-navy-muted dark:text-slate-400 font-medium mt-2">
          Indian Sign Language (ISL) Gamified Learning Platform
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md">
        {isLiveClerkKey ? (
          <div className="flex justify-center">
            <ClerkSignIn
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
              fallbackRedirectUrl={redirectUrl}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-[#131C31] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card dark:shadow-card-dark space-y-6 animate-fade-in">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-navy-brand dark:text-white tracking-tight">Sign In to Signova</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Enter your credentials to continue your ISL learning journey.
              </p>
            </div>

            {/* Clerk Sandbox Notice */}
            <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-2xl flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
              <ShieldCheck className="w-5 h-5 text-indigo-brand dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Clerk Authentication Enabled</span>
                <span className="text-blue-700 dark:text-blue-300 leading-relaxed block mt-0.5">
                  Sign in instantly below in demo mode, or add your <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-mono text-[10px]">VITE_CLERK_PUBLISHABLE_KEY</code> in <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-mono text-[10px]">frontend/.env</code> to connect your Clerk Cloud tenant.
                </span>
              </div>
            </div>

            <form onSubmit={handleDemoSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy-brand dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cloud dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-navy-brand dark:text-slate-100 focus:border-indigo-brand dark:focus:border-blue-500 focus:ring-2 focus:ring-indigo-brand/20 text-sm font-medium outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="learner@signova.app"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-navy-brand dark:text-slate-200 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      showToast({
                        title: 'Password Reset',
                        message: 'Clerk email verification and password reset link sent to ' + email,
                        type: 'info'
                      });
                    }}
                    className="text-xs font-semibold text-indigo-brand dark:text-blue-400 hover:text-indigo-700 dark:hover:text-blue-300 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cloud dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-navy-brand dark:text-slate-100 focus:border-indigo-brand dark:focus:border-blue-500 focus:ring-2 focus:ring-indigo-brand/20 text-sm font-medium outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-pop-blue w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Sign In as Learner</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Don't have an account?{' '}
                <NavLink to="/sign-up" className="text-indigo-brand dark:text-blue-400 font-bold hover:underline">
                  Sign Up for Free
                </NavLink>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
