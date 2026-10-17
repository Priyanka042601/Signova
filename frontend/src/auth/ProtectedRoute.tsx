import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './ClerkAuthProvider';
import { SkeletonDashboard } from '../components/LoadingSkeleton';

interface Props {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 skeleton-shimmer" />
          <div className="h-5 w-40 bg-slate-200 rounded-lg skeleton-shimmer" />
        </div>
        <SkeletonDashboard />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Navigate
        to={`/sign-in?redirect_url=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return children ? <>{children}</> : null;
};
