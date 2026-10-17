import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  ClerkProvider as BaseClerkProvider,
  useAuth as useClerkAuth,
  useUser as useClerkUser,
  useClerk as useClerkInstance,
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  UserButton as ClerkUserButton
} from '@clerk/clerk-react';
import { setAuthTokenGetter } from '../services/apiClient';
import { LogOut, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

// Detect if a genuine Clerk publishable key is configured
const isLiveClerkKey = Boolean(
  CLERK_PUBLISHABLE_KEY &&
  (CLERK_PUBLISHABLE_KEY.startsWith('pk_test_') || CLERK_PUBLISHABLE_KEY.startsWith('pk_live_'))
);

export interface MockUser {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
  role: string;
}

interface FallbackAuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  user: MockUser | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  signInAsDemo: (role?: string) => void;
  isDemoMode: boolean;
}

const FallbackAuthContext = createContext<FallbackAuthContextType>({
  isLoaded: true,
  isSignedIn: true,
  userId: 'user_signova_demo_1',
  user: {
    id: 'user_signova_demo_1',
    fullName: 'Aarav Sharma',
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@signova.app',
    role: 'learner'
  },
  getToken: async () => 'demo_bearer_token_signova_isl',
  signOut: async () => {},
  signInAsDemo: () => {},
  isDemoMode: true
});

/**
 * Fallback provider used when no live Clerk publishable key is present in .env
 */
const FallbackAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(() => {
    return localStorage.getItem('signova_demo_signed_in') !== 'false';
  });

  const [currentUser, setCurrentUser] = useState<MockUser>(() => ({
    id: 'user_signova_demo_1',
    fullName: 'Aarav Sharma',
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@signova.app',
    role: localStorage.getItem('signova_demo_role') || 'learner'
  }));

  useEffect(() => {
    if (isSignedIn) {
      setAuthTokenGetter(
        async () => `demo_token_${currentUser.id}`,
        currentUser.id
      );
    } else {
      setAuthTokenGetter(null, null);
    }
  }, [isSignedIn, currentUser]);

  const signOut = async () => {
    setIsSignedIn(false);
    localStorage.setItem('signova_demo_signed_in', 'false');
  };

  const signInAsDemo = (role = 'learner') => {
    setIsSignedIn(true);
    localStorage.setItem('signova_demo_signed_in', 'true');
    localStorage.setItem('signova_demo_role', role);
    setCurrentUser({
      id: 'user_signova_demo_1',
      fullName: 'Aarav Sharma',
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: 'aarav.sharma@signova.app',
      role
    });
  };

  const value = useMemo(
    () => ({
      isLoaded: true,
      isSignedIn,
      userId: isSignedIn ? currentUser.id : null,
      user: isSignedIn ? currentUser : null,
      getToken: async () => (isSignedIn ? `demo_jwt_token_${currentUser.id}` : null),
      signOut,
      signInAsDemo,
      isDemoMode: true
    }),
    [isSignedIn, currentUser]
  );

  return (
    <FallbackAuthContext.Provider value={value}>
      {children}
    </FallbackAuthContext.Provider>
  );
};

/**
 * Live Clerk Token Sync component
 */
const ClerkTokenSynchronizer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken, userId } = useClerkAuth();

  useEffect(() => {
    if (userId) {
      setAuthTokenGetter(async () => {
        try {
          return await getToken();
        } catch {
          return null;
        }
      }, userId);
    } else {
      setAuthTokenGetter(null, null);
    }
  }, [getToken, userId]);

  return <>{children}</>;
};

/**
 * Root Clerk Auth Provider
 */
export const ClerkAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isLiveClerkKey) {
    return (
      <BaseClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        appearance={{
          variables: {
            colorPrimary: '#4338CA',
            colorText: '#1E293B',
            borderRadius: '1rem',
            fontFamily: 'Inter, sans-serif'
          },
          elements: {
            card: 'shadow-card rounded-3xl border border-slate-200/80',
            formButtonPrimary: 'bg-indigo-brand hover:bg-indigo-600 text-white font-bold py-3 rounded-2xl shadow-pop',
            headerTitle: 'font-black text-navy-brand text-2xl',
            headerSubtitle: 'text-slate-500 text-sm'
          }
        }}
      >
        <ClerkTokenSynchronizer>{children}</ClerkTokenSynchronizer>
      </BaseClerkProvider>
    );
  }

  // Graceful Fallback Provider
  return <FallbackAuthProvider>{children}</FallbackAuthProvider>;
};

export interface UniversalAuth {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null | undefined;
  sessionId: string | null | undefined;
  getToken: (options?: any) => Promise<string | null>;
  signOut: (options?: any) => Promise<void>;
  isDemoMode: boolean;
}

/**
 * Universal Auth Hook (Works in both live Clerk and Demo fallback mode)
 */
export const useAuth = (): UniversalAuth => {
  if (isLiveClerkKey) {
    const clerkAuth = useClerkAuth();
    return {
      isLoaded: clerkAuth.isLoaded,
      isSignedIn: Boolean(clerkAuth.isSignedIn),
      userId: clerkAuth.userId,
      sessionId: clerkAuth.sessionId,
      getToken: clerkAuth.getToken,
      signOut: clerkAuth.signOut,
      isDemoMode: false
    };
  }
  const fallback = useContext(FallbackAuthContext);
  return {
    isLoaded: fallback.isLoaded,
    isSignedIn: fallback.isSignedIn,
    userId: fallback.userId,
    sessionId: fallback.isSignedIn ? 'session_demo_signova' : null,
    getToken: fallback.getToken,
    signOut: fallback.signOut,
    isDemoMode: true
  };
};

/**
 * Universal User Hook
 */
export const useUser = () => {
  if (isLiveClerkKey) {
    return useClerkUser();
  }
  const fallback = useContext(FallbackAuthContext);
  return {
    isLoaded: fallback.isLoaded,
    isSignedIn: fallback.isSignedIn,
    user: fallback.user
      ? {
          id: fallback.user.id,
          fullName: fallback.user.fullName,
          firstName: fallback.user.firstName,
          lastName: fallback.user.lastName,
          primaryEmailAddress: { emailAddress: fallback.user.email },
          imageUrl: undefined,
          publicMetadata: { role: fallback.user.role }
        }
      : null,
    isDemoMode: true
  };
};

/**
 * Fallback Context Accessor
 */
export const useFallbackAuth = () => useContext(FallbackAuthContext);

/**
 * Universal SignedIn
 */
export const SignedIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isLiveClerkKey) {
    return <ClerkSignedIn>{children}</ClerkSignedIn>;
  }
  const { isSignedIn } = useContext(FallbackAuthContext);
  return isSignedIn ? <>{children}</> : null;
};

/**
 * Universal SignedOut
 */
export const SignedOut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isLiveClerkKey) {
    return <ClerkSignedOut>{children}</ClerkSignedOut>;
  }
  const { isSignedIn } = useContext(FallbackAuthContext);
  return !isSignedIn ? <>{children}</> : null;
};

/**
 * Universal UserButton
 */
export const UserButton: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  if (isLiveClerkKey) {
    return <ClerkUserButton afterSignOutUrl="/sign-in" />;
  }

  const { user, signOut, isSignedIn } = useContext(FallbackAuthContext);

  if (!isSignedIn || !user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-indigo-brand"
        title="Account & Session"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-brand to-berry-brand text-white flex items-center justify-center font-bold text-xs shadow-sm">
          {user.firstName[0]}
        </div>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 px-4 z-50 animate-fade-in text-left">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-brand flex items-center justify-center font-black">
              {user.firstName[0]}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm text-navy-brand truncate">{user.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>

          <div className="py-2.5 text-xs text-slate-600 space-y-1.5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Session:
              </span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                Auth Mode:
              </span>
              <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full text-[11px]">
                Clerk Sandbox
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setMenuOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
