import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { VerificationBadge } from '../components/VerificationBadge';
import { SignDemonstration } from '../components/SignDemonstration';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { SignVocabulary } from '../types/api';

vi.mock('@clerk/clerk-react', () => ({
  ClerkProvider: ({ children }: any) => <>{children}</>,
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'user_3KoOHZIlGeRAvpDPGL4OiStkAHA',
    sessionId: 'session_test_isl',
    getToken: vi.fn().mockResolvedValue('mock_jwt_token'),
    signOut: vi.fn().mockResolvedValue(undefined)
  }),
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'user_3KoOHZIlGeRAvpDPGL4OiStkAHA',
      fullName: 'Priyanka Ramkumar',
      firstName: 'Priyanka',
      lastName: 'Ramkumar',
      primaryEmailAddress: { emailAddress: 'chocolatyqueen2605@gmail.com' }
    }
  }),
  useClerk: () => ({
    signOut: vi.fn()
  }),
  SignedIn: ({ children }: any) => <>{children}</>,
  SignedOut: ({ children }: any) => null,
  UserButton: () => <div data-testid="clerk-user-button">Priyanka</div>,
  SignIn: () => <div data-testid="clerk-sign-in">Clerk Sign In Widget</div>,
  SignUp: () => <div data-testid="clerk-sign-up">Clerk Sign Up Widget</div>
}));

describe('Signova Frontend Core Components', () => {
  it('renders VerificationBadge with Verified ISL status and reviewer', () => {
    render(
      <VerificationBadge
        status="verified"
        reviewer="Certified Deaf Master Trainer"
      />
    );
    expect(screen.getByText('Verified ISL Sign')).toBeDefined();
    expect(screen.getByText('(Certified Deaf Master Trainer)')).toBeDefined();
  });

  it('renders VerificationBadge with educational pending review status', () => {
    render(<VerificationBadge status="pending_review" />);
    expect(screen.getByText('Pending ISL Review')).toBeDefined();
  });

  it('renders SignDemonstration with authentic ISL handshape and non-manual breakdown', () => {
    const mockSign: SignVocabulary = {
      id: 1,
      vocabulary: 'Namaste / Hello',
      category: 'Greetings',
      explanation: 'Two palms pressed together in Anjali Mudra at chest level.',
      handshape: 'Two hands flat palms pressed inward',
      non_manual_notes: 'Warm smile with slight respectful head nod',
      source: 'ISLRTC Official Dictionary',
      licence: 'Educational Open Standard',
      verification_status: 'verified',
      reviewer_reference: 'Senior Deaf Educator Panel'
    };

    render(<SignDemonstration sign={mockSign} autoPlay={false} showDetails={true} />);

    expect(screen.getByText('Namaste / Hello')).toBeDefined();
    expect(screen.getByText(/greetings/i)).toBeDefined();
    expect(screen.getByText('Two hands flat palms pressed inward')).toBeDefined();
    expect(screen.getByText('Warm smile with slight respectful head nod')).toBeDefined();
  });

  it('renders Desktop Sidebar with all 6 main navigation sections and brand identity', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    expect(screen.getByText('Sign')).toBeDefined();
    expect(screen.getByText('ova')).toBeDefined();
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Learn')).toBeDefined();
    expect(screen.getByText('Explore ISL')).toBeDefined();
    expect(screen.getByText('Practice')).toBeDefined();
    expect(screen.getByText('Revision')).toBeDefined();
    expect(screen.getByText('Profile')).toBeDefined();
  });

  it('renders Header with streak counter, XP total, and Indian Sign Language edition indicator', () => {
    const mockDashboard = {
      user_name: 'Priyanka Ramkumar',
      current_level_name: 'Level 1 — Beginner',
      xp_total: 240,
      current_streak: 5,
      longest_streak: 7,
      completed_lessons_count: 8,
      total_lessons_count: 48,
      overall_progress_percent: 16.7,
      daily_goal_minutes: 10,
      today_minutes_spent: 8,
      today_goal_percent: 80,
      daily_challenge: {
        title: 'Daily Practice',
        description: 'Complete 2 items',
        target: 2,
        current: 2,
        reward_xp: 20,
        is_completed: true
      },
      revision_due_count: 2
    };

    render(
      <BrowserRouter>
        <Header dashboardData={mockDashboard} />
      </BrowserRouter>
    );

    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('240')).toBeDefined();
    expect(screen.getByText('Indian Sign Language (ISL) Edition')).toBeDefined();
  });

  it('renders SignInPage with Clerk authentication options and fallback notice', async () => {
    const { SignInPage } = await import('../pages/SignInPage');
    const { ToastProvider } = await import('../context/ToastContext');
    const { ClerkAuthProvider } = await import('../auth/ClerkAuthProvider');

    render(
      <ClerkAuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <SignInPage />
          </BrowserRouter>
        </ToastProvider>
      </ClerkAuthProvider>
    );

    expect(screen.getByTestId('clerk-sign-in')).toBeDefined();
    expect(screen.getByText(/indian sign language \(isl\) gamified learning platform/i)).toBeDefined();
  });

  it('renders SignUpPage with registration form and authentic ISL mission', async () => {
    const { SignUpPage } = await import('../pages/SignUpPage');
    const { ToastProvider } = await import('../context/ToastContext');
    const { ClerkAuthProvider } = await import('../auth/ClerkAuthProvider');

    render(
      <ClerkAuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <SignUpPage />
          </BrowserRouter>
        </ToastProvider>
      </ClerkAuthProvider>
    );

    expect(screen.getByTestId('clerk-sign-up')).toBeDefined();
    expect(screen.getByText(/join india's most authentic isl gamified learning community/i)).toBeDefined();
  });
});
