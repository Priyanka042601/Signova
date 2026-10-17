import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkAuthProvider } from './auth/ClerkAuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LearnCurriculumPage } from './pages/LearnCurriculumPage';
import { LessonPage } from './pages/LessonPage';
import { ExploreDictionaryPage } from './pages/ExploreDictionaryPage';
import { SignDetailPage } from './pages/SignDetailPage';
import { PracticeCentrePage } from './pages/PracticeCentrePage';
import { ConversationLabPage } from './pages/ConversationLabPage';
import { RevisionCentrePage } from './pages/RevisionCentrePage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ClerkAuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Standalone Authentication Routes */}
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />

            {/* Application Shell */}
            <Route path="/" element={<AppLayout />}>
              {/* Protected Learner Progression Routes */}
              <Route
                index
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="learn"
                element={
                  <ProtectedRoute>
                    <LearnCurriculumPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="learn/level/:levelId"
                element={
                  <ProtectedRoute>
                    <LearnCurriculumPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="lesson/:lessonId"
                element={
                  <ProtectedRoute>
                    <LessonPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="practice"
                element={
                  <ProtectedRoute>
                    <PracticeCentrePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="conversation"
                element={
                  <ProtectedRoute>
                    <ConversationLabPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="revision"
                element={
                  <ProtectedRoute>
                    <RevisionCentrePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Public/Exploratory ISL Dictionary */}
              <Route path="explore" element={<ExploreDictionaryPage />} />
              <Route path="explore/:signId" element={<SignDetailPage />} />

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ClerkAuthProvider>
  );
};

export default App;
