import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { useAuth, useFallbackAuth } from '../auth/ClerkAuthProvider';
import { Sparkles, ShieldCheck, ArrowRight, UserPlus, Mail, Lock, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
const isLiveClerkKey = Boolean(
  CLERK_PUBLISHABLE_KEY &&
  (CLERK_PUBLISHABLE_KEY.startsWith('pk_test_') || CLERK_PUBLISHABLE_KEY.startsWith('pk_live_'))
);

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const fallbackAuth = useFallbackAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('Priyanka Nair');
  const [email, setEmail] = useState('priyanka.nair@signova.app');
  const [password, setPassword] = useState('signova2026');

  useEffect(() => {
    if (isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn, navigate]);

  const handleDemoSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    fallbackAuth.signInAsDemo('learner');
    showToast({
      title: 'Registration Successful!',
      message: `Account created and verified for ${name}. Starting your ISL curriculum journey!`,
      type: 'success'
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cloud flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <NavLink to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-brand via-berry-brand to-coral-brand flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <img src="/logo-mark.svg" alt="Signova Logo" className="w-9 h-9" />
          </div>
          <span className="text-3xl font-black tracking-tight text-navy-brand">
            Sign<span className="text-berry-brand">ova</span>
          </span>
        </NavLink>
        <p className="text-xs sm:text-sm text-navy-muted font-medium mt-2">
          Join India's Most Authentic ISL Gamified Learning Community
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md">
        {isLiveClerkKey ? (
          <div className="flex justify-center">
            <ClerkSignUp
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
              fallbackRedirectUrl="/"
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-6 animate-fade-in">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-navy-brand tracking-tight">Create Learner Account</h2>
              <p className="text-xs text-slate-500 font-medium">
                Free forever for learners, educators, and the Indian Deaf community.
              </p>
            </div>

            <div className="p-3.5 bg-berry-50/80 border border-berry-100 rounded-2xl flex items-start gap-3 text-xs text-berry-900">
              <Sparkles className="w-5 h-5 text-berry-brand flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Certified Indian Sign Language</span>
                <span className="text-berry-800 leading-relaxed block mt-0.5">
                  Two-handed manual alphabet, real syntax, non-manual markers, and transparent spaced repetition reviews.
                </span>
              </div>
            </div>

            <form onSubmit={handleDemoSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy-brand uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 text-sm font-medium outline-none transition-all"
                    placeholder="Aarav Sharma"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-brand uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 text-sm font-medium outline-none transition-all"
                    placeholder="learner@signova.app"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-brand uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 text-sm font-medium outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-pop-berry w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 mt-2 shadow-pop-berry"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create & Verify Account</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Already have an account?{' '}
                <NavLink to="/sign-in" className="text-indigo-brand font-bold hover:underline">
                  Sign In
                </NavLink>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
