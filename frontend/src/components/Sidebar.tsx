import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Search,
  Target,
  Repeat,
  User,
  MessageSquare,
  Settings,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Learn', path: '/learn', icon: BookOpen },
    { label: 'Explore ISL', path: '/explore', icon: Search },
    { label: 'Practice', path: '/practice', icon: Target },
    { label: 'Revision', path: '/revision', icon: Repeat },
    { label: 'Conversation', path: '/conversation', icon: MessageSquare },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-[#0F172A]/90 border-r border-slate-200/80 dark:border-slate-800/80 px-4 py-6 select-none z-30 flex-shrink-0 transition-colors duration-150">
      {/* Brand Logo & Wordmark */}
      <NavLink to="/" className="flex items-center gap-3 px-3 mb-8 group">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
          <img src="/logo-mark.svg" alt="Signova Logo" className="w-9 h-9" />
        </div>
        <div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white block leading-none">
            Sign<span className="text-blue-600 dark:text-blue-400">ova</span>
          </span>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide block mt-1">
            A New Way to Connect
          </span>
        </div>
      </NavLink>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/80 dark:border-blue-800/70 shadow-sm shadow-blue-500/5'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-blue-600 dark:text-blue-400 stroke-[2.5]' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.path === '/revision' && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      SRS
                    </span>
                  )}
                  {item.path === '/practice' && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      AI
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ISL Heritage & Mission Callout */}
      <div className="mt-auto p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 rounded-2xl transition-colors">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
            Authentic ISL
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Teaching real Indian Sign Language with verified educators and Deaf community guidance.
        </p>
      </div>
    </aside>
  );
};
