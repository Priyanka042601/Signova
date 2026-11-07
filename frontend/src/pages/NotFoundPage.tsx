import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center font-black text-3xl shadow-sm">
        404
      </div>
      <h1 className="text-2xl font-black text-navy-brand dark:text-white">Page Not Found</h1>
      <p className="text-xs text-navy-muted dark:text-slate-400 max-w-sm leading-relaxed">
        The sign or section you're looking for doesn't exist or has moved. Return to the dashboard to continue learning.
      </p>
      <NavLink
        to="/"
        className="px-6 py-3 rounded-2xl btn-pop-blue text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </NavLink>
    </div>
  );
};
