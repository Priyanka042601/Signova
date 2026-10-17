import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-brand flex items-center justify-center font-black text-3xl">
        404
      </div>
      <h1 className="text-2xl font-black text-navy-brand">Page Not Found</h1>
      <p className="text-xs text-navy-muted max-w-sm leading-relaxed">
        The sign or section you're looking for doesn't exist or has moved. Return to the dashboard to continue learning.
      </p>
      <NavLink
        to="/"
        className="px-6 py-3 rounded-2xl btn-pop-indigo text-xs font-bold inline-flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </NavLink>
    </div>
  );
};
